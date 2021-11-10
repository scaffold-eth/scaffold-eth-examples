pragma solidity >=0.6.0 <0.7.0;

import "./HoneyPot.sol";

contract Bank {
  mapping (address => uint) public balances;
  HoneyPot honeyPot;

  constructor(HoneyPot _honeyPot) public {
    honeyPot = HoneyPot(_honeyPot);
  }

  function deposit() public payable {
    balances[msg.sender] += msg.value;
    honeyPot.log(msg.sender, msg.value, "Deposit");
  }

  function withdraw(uint _amount) public {
    require(_amount <= balances[msg.sender], "Insufficient funds");

    (bool sent, ) = msg.sender.call{value: _amount}("");
    require(sent, "Failed to send Ether");

    balances[msg.sender] -= _amount;

//    honeyPot.log(msg.sender, _amount, "Withdraw");
  }
}