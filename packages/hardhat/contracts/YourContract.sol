pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {

  event Vote(address votingAddress, string name, address wallet, uint256 amount);

  event AddEntry(address admin, string name, address wallet);

  /*
  struct Entry {
      string name;
      address wallet;
  }

  Entry[] public entries;
  */

  mapping (address => uint256) public votes;

  mapping (address => bool) public isAdmin;

  constructor(address startingAdmin) {
    // what should we do on deploy?
    isAdmin[startingAdmin] = true;
  }

  modifier onlyAdmin() {
    require( isAdmin[msg.sender], "NOT ADMIN");
    _;
  }

  function vote(string memory name, address wallet, uint256 amount) public {
    require( votes[msg.sender] >= amount, "Not enough votes left");
    votes[msg.sender] -= amount;
    emit Vote(msg.sender, name, wallet, amount);
  }


  function admin(address wallet, bool value) public onlyAdmin {
    isAdmin[wallet] = value;
  }

  function giveVotes(address wallet, uint256 amount) public onlyAdmin {
    votes[wallet] += amount;
  }

  function addEntry(string memory name, address wallet) public onlyAdmin {

      /*entries.push(Entry({
          name: name,
          wallet: wallet
      }));*/

      emit AddEntry(msg.sender, name, wallet);

  }


}
