pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";

contract Reenterancy {

  constructor() public { }

  mapping(address => uint256) public balance;

  receive() external payable { deposit(); }

  function deposit() public payable {
    balance[msg.sender] += msg.value;
  }

  function withdraw() public {
    //look at how we make an external call _before_ we update the balance to 0
    msg.sender.call.value(balance[msg.sender])("");
    // vulnerability
    balance[msg.sender] = 0;
  }

  function withdraw_safe() public {
    //the correct way to write this:
    // (update your local state first and then make external calls)
    uint256 amount = balance[msg.sender];
    balance[msg.sender] = 0;
    msg.sender.value(amount)("");
  }
}
