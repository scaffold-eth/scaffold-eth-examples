pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {

  event Update(address clicker, uint256 x, uint256 y, uint8 square);

  uint256 public constant SIZE = 16;
  uint8[SIZE][SIZE] public squares;

  function click(uint256 x,uint256 y,bytes32 randomness) public {

    uint8 newSquare = uint8(randomness[0]);
    squares[x][y] = newSquare;

    emit Update(msg.sender, x, y, newSquare);
  }

}
