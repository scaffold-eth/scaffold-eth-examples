pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';

contract RetroactiveFunding is ERC20 {
    uint public constant mintAmount = 10000 ether;
    address public constant weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    // 1% fee
    uint24 public constant fee = 10000;
    IUniswapV3Factory public immutable factory;

    constructor(string memory name, string memory symbol, uint share, IUniswapV3Factory _factory) ERC20(name, symbol) {
        // safe math already supported
        uint amountToMint = mintAmount - (mintAmount* share / 100);
        // mint apt. amount based on share percentage to the project owner and contract
        _mint(msg.sender, amountToMint);
        // funds to be used for adding liquidity
        _mint(address(this), mintAmount - amountToMint);
        factory = _factory;
    }

    function fundProject() external payable {
        address pool = factory.getPool(address(this), weth, fee);
        if (pool == address(0)) {
            // create new pool
        }
        // add eth liquidity from whale and token liquidity from contract
    }

    function sellToken() external {
        // called by token holders to swap token for eth
        // uniswap router code needs to be added here
    }

}