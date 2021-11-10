pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract MoodToken is ERC20("moodCoin", "MOOD") {

  constructor () public {
      _mint(_msgSender(), 1000);
  }

  function mintTokens(address minter, uint amount) public {
    _mint(minter, amount);
  }

}
