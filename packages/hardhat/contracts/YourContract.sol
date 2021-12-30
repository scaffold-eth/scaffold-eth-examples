pragma solidity 0.6.11;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "./Verifier.sol";
// import "./Add2TreeVerifier.sol";
// import "./ProveInTreeVerifier.sol";

contract YourContract {

  //event SetPurpose(address sender, string purpose);
    event AddLeaf(
        uint256 indexed key,
        uint256 indexed value,
        uint256 indexed oldRoot
    );

    uint256 public root;
    uint256[] public leafValues;
    uint256 public nextKey;

    mapping(address => bool) public isMember;

    constructor() public {
    // what should we do on deploy?
    }

    function addLeaf(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[6] memory input
    ) external {
        require(input[1] == root, "addLeaf: Invalid Root");
        require(input[2] == nextKey, "addLeaf: Invalid Key");

        // add membership requirements here

        require(verifyAdd2TreeProof(a, b, c, input) == true, "addLeaf: Invalid Proof");

        leafValues.push(input[3]);
        nextKey = leafValues.length;
        root = input[0];

        emit AddLeaf(input[2], input[3], input[1]);
    }

    function proveMembership(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external returns (bool r) {
        require(input[0] == root, "proveMembership: Invalid Root");
        r = verifyProveInTreeProof(a, b, c, input);
        require(r == true, "proveMembership: Invalid Proof");

        // this is dumb, do something more cool and interesting here instead!
        isMember[msg.sender] = true;
    }

    function verifyAdd2TreeProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[6] memory input
    ) public view returns (bool) {
        return Verifier.verifyAdd2TreeProof(a, b, c, input);
    }

    function verifyProveInTreeProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) public view returns (bool) {
        return Verifier.verifyProveInTreeProof(a, b, c, input);
    }

}
