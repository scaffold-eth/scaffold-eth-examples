pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RetroactiveFunding is ERC20 {
    uint public constant mintAmount = 1 ether;

    constructor(string memory name, string memory symbol, uint share) ERC20(name, symbol) {
        // safe math already supported
        uint amountToMint = mintAmount - (mintAmount* share / 100);
        _mint(msg.sender, amountToMint);
        _mint(address(this), mintAmount - amountToMint);
    }

    function fundProject() external payable {
        // uniswap code to first check if the address(this)/eth pool exists and id not create it and add eth liquidity and the erc20 token liquidity stored in the contract, if yes add only eth liquidity to the pool
    }

    function sellToken() external {
        // called by token holders to swap token for eth
        // uniswap router code needs to be added here
    }

}