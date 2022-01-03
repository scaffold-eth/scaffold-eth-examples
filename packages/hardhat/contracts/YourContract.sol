pragma solidity >=0.6.11 < 0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "./Verifier.sol";

contract YourContract {

  // event SetPurpose(address sender, string purpose);

  string public purpose = "Building Unstoppable Apps!!!";

  constructor() public {
    // what should we do on deploy?
  }

  function setPurpose(string memory newPurpose) public {
      purpose = newPurpose;
      console.log(msg.sender,"set purpose to",purpose);
      // emit SetPurpose(msg.sender, purpose);
  }

  function verifyInitProof(
      uint256[2] memory a,
      uint256[2][2] memory b,
      uint256[2] memory c,
      uint256[2] memory input
  ) public view returns (bool) {
      return Verifier.verifyInitProof(a, b, c, input);
  }
}
