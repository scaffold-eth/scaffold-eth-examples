pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";

contract VulnerableAuction {
  address public highestBidder;
  uint public highestBid;

  function bid() payable external {
    require(msg.value >= highestBid);

    if (highestBidder != address(0)) {
      (bool success, ) = highestBidder.call.value(highestBid)("");
      require(success); 
    }

    highestBidder = msg.sender;
    highestBid = msg.value;
  }
}
