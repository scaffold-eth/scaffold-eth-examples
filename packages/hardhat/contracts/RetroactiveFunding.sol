pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "./interfaces/INonfungiblePositionManager.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract RetroactiveFunding is ERC20 {
    uint256 public constant mintAmount = 100 ether;
    uint256 public tokenId;
    address public constant weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    // 1% fee
    uint24 public constant fee = 10000;
    // initial price used to initialize pool is project token / eth
    uint160 public constant initialPrice = 64;
    IUniswapV3Factory public immutable factory;
    INonfungiblePositionManager public immutable positionManager;
    ISwapRouter public immutable swapRouter;

    constructor(
        string memory name,
        string memory symbol,
        IUniswapV3Factory _factory,
        INonfungiblePositionManager _positionManager,
        ISwapRouter _swapRouter
    ) ERC20(name, symbol) {
        _mint(msg.sender, mintAmount);
        factory = _factory;
        positionManager = _positionManager;
        swapRouter = _swapRouter;
    }

    /**
     * @notice Gets pool address
     */
    function getPool() public view returns (address) {
        return factory.getPool(address(this), weth, fee);
    }

    /**
     * @notice Gets sq root of a number
     * @param x no to get the sq root of
     */
    function sqrt(uint160 x) internal pure returns (uint160 y) {
        uint160 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /**
     * @notice Called by a whale who adds liquidity, the same amount of lp tokens are minted to the contract & added tot he pool
     */
    function fundProject() external payable {
        address pool = getPool();
        // create & initialize the pool if it doesn not exist
        if (pool == address(0)) {
            // create new pool
            pool = factory.createPool(address(this), weth, fee);
            // initialize pool
            uint160 sqrtPriceX96 = (sqrt(initialPrice) * 2)**96;
            IUniswapV3Pool(pool).initialize(sqrtPriceX96);
        }
        _mint(address(this), msg.value);
        TransferHelper.safeApprove(address(this), address(positionManager),  msg.value);

        // add eth liquidity from whale and token liquidity from contract
        // checks if the position has been minted, if not mint it else adds more liquidity
        if (positionManager.balanceOf(address(this)) > 0) {
            // increase liquidity
            INonfungiblePositionManager.IncreaseLiquidityParams memory params =
            INonfungiblePositionManager.IncreaseLiquidityParams({
                    tokenId: tokenId,
                    amount0Desired: msg.value,
                    amount1Desired: msg.value,
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp + 1000
            });
            positionManager.increaseLiquidity(params);
        } else {
            // mint a new position
            INonfungiblePositionManager.MintParams memory params =
            INonfungiblePositionManager.MintParams({
                    token0: address(this),
                    token1: weth,
                    fee: fee,
                    // full range of ticks is considered currently
                    tickLower: -887272,
                    tickUpper: 887272,
                    amount0Desired: msg.value,
                    amount1Desired: msg.value,
                    amount0Min: 0,
                    amount1Min: 0,
                    recipient: address(this),
                    deadline: block.timestamp + 1000
            });
            (uint mintedId, , , ) = positionManager.mint(params);
            tokenId = mintedId;
        }
    }

    /**
     * @notice Called by token holder to swap token for eth 
     */
    function sellToken(uint _amount) external {
        // called by token holders to swap token for eth
        // uniswap router code needs to be added here
        TransferHelper.safeTransferFrom(address(this), msg.sender, address(this), _amount);
        // Approve the router to spend DAI.
        TransferHelper.safeApprove(address(this), address(swapRouter), _amount);
            ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(this),
                tokenOut: weth,
                fee: fee,
                recipient: msg.sender,
                deadline: block.timestamp + 1000,
                amountIn: _amount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        swapRouter.exactInputSingle(params);
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "sending eth failed");
    }
}
