pragma solidity >=0.6.11 < 0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "./Add2TreeVerifier.sol";

contract YourContract is Verifier {

  //event SetPurpose(address sender, string purpose);
  event AddLeaf(
    uint256 indexed key,
    uint256 indexed value,
    uint256 indexed oldRoot
  );

  uint256 public root;
  uint256[] public leafValues;
  uint256 public nextKey;

  constructor() public {
    // what should we do on deploy?
  }

  function addLeaf(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[4] memory input
  ) external {
    require(input[1] == root, "addLeaf: Invalid Root");
    require(input[2] == nextKey, "addLeaf: Invalid Key");
    require(verifyProof(a, b, c, input) == true, "addLeaf: Invalid Proof");

    leafValues.push(input[3]);
    nextKey = leafValues.length;
    root = input[0];

    emit AddLeaf(input[2], input[3], input[1]);
  }

}
