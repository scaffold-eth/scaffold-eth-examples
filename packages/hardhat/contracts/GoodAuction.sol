pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";

contract GoodAuction {
  address public highestBidder;
  uint public highestBid;
  mapping(address => uint) public refunds;

  function bid() payable external {
    require(msg.value >= highestBid);

    if (highestBidder != address(0)) {
      refunds[highestBidder] += highestBid;
    }

    highestBidder = msg.sender;
    highestBid = msg.value;
  }

  function withdrawRefund() external {
    uint refund = refunds[msg.sender];
    refunds[msg.sender] = 0;
    (bool success, ) = msg.sender.call.value(refund)("");
    require(success);
  }
}
