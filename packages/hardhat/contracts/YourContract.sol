pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract is Ownable{

  receive() external payable { }

  function drop(address payable[] memory  wallets, uint256 amount) public payable onlyOwner {
    for(uint16 i = 0;i<wallets.length;i++){
      wallets[i].transfer(amount);
    }
  }

  function withdraw() public onlyOwner {
    msg.sender.transfer(address(this).balance);
  }

}
