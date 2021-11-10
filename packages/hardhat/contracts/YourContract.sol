pragma solidity >=0.6.0 <0.7.0;

import "hardhat/console.sol";
import "./YourLib.sol";

contract YourContract {

  using YourLib for uint256;

  uint256 public someNumber = 42;

  function checkIfLibIsWorking() public view returns (uint256) {
    return someNumber.squared();
  }
}
