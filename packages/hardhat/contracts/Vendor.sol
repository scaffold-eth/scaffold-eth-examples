pragma solidity >=0.6.0 <0.7.0;

import "./YourToken.sol";

contract Vendor  {

  constructor() public {

  }
/*
  function buyTokens() public payable {
    myToken.transfer(msg.sender, msg.value);
  }

  function sellTokens(uint256 amount) public {
    require( myToken.transferFrom(msg.sender, address(this), amount), "nonstandard erc20 fail");
    msg.sender.transfer(amount);
  }
*/

  event NewMarket(address tokenAddress,address minter, string tokenName, string tokenSymbol);

  function newMarket(/* 721 token and id,*/string memory tokenName, string memory tokenSymbol) public {
    //transfer in 721 to prove we own it

    // make sure msg.sender IS the owner of the token

    YourToken newToken = new YourToken(msg.sender,tokenName,tokenSymbol);

    emit NewMarket( address(newToken), msg.sender, tokenName, tokenSymbol);
  }

}
