pragma solidity >=0.6.0 <0.7.0;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract YourToken is ERC20 {

  constructor(address toAddress,string memory tokenName, string memory tokenSymbol) public ERC20(tokenName, tokenSymbol) {
    _mint(toAddress, 100 ether);
  }

}
