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

    mapping(uint256 => bool) public voteLogged;
    mapping(uint256 => int256) public voteResult;
    mapping(uint256 => uint256) public voteDeadline;

    constructor() public {
    // what should we do on deploy?
    }

    function createVote(uint256 voteId, uint256 deadline) external {
        require(voteDeadline[voteId] != 0);
        require(deadline != 0);
        voteDeadline[voteId] = deadline;
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
        uint[3] memory input,
        bool slant
    ) external returns (bool r) {
        require(voteLogged[input[0]] != true, "proveMembership: Vote Logged");
        require(voteDeadline[input[2]] > block.timestamp, "proveMembership: Deadline Passed");
        require(input[1] == root, "proveMembership: Invalid Root");

        r = verifyProveInTreeProof(a, b, c, input);
        require(r == true, "proveMembership: Invalid Proof");

        voteLogged[input[0]] = true;
        slant == true ? voteResult[input[0]]++ : voteResult[input[0]]--;
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
        uint[3] memory input
    ) public view returns (bool) {
        return Verifier.verifyProveInTreeProof(a, b, c, input);
    }

}
