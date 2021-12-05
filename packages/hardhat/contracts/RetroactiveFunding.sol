pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
// import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "./interfaces/INonfungiblePositionManager.sol";

contract RetroactiveFunding is ERC20 {
    uint256 public constant mintAmount = 1000 ether;
    uint256 public tokenId;
    address public constant weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    // 1% fee
    uint24 public constant fee = 10000;
    uint160 public constant initialPrice = 64;
    IUniswapV3Factory public immutable factory;
    INonfungiblePositionManager public immutable positionManager;

    constructor(
        string memory name,
        string memory symbol,
        IUniswapV3Factory _factory,
        INonfungiblePositionManager _positionManager
    ) ERC20(name, symbol) {
        _mint(msg.sender, mintAmount);
        factory = _factory;
        positionManager = _positionManager;
    }

    function getPool() public view returns (address) {
        return factory.getPool(address(this), weth, fee);
    }

    function sqrt(uint160 x) internal pure returns (uint160 y) {
        uint160 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function fundProject() external payable {
        address pool = getPool();
        if (pool == address(0)) {
            // create new pool
            pool = factory.createPool(address(this), weth, fee);
            // initialize pool
            uint160 sqrtPriceX96 = (sqrt(initialPrice) * 2)**96;
            IUniswapV3Pool(pool).initialize(sqrtPriceX96);
        }
        _mint(address(this), msg.value);
        IERC20(address(this)).approve(address(positionManager), msg.value);
        // add eth liquidity from whale and token liquidity from contract
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

    function sellToken() external {
        // called by token holders to swap token for eth
        // uniswap router code needs to be added here
    }
}
