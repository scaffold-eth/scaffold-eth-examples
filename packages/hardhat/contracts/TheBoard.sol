pragma solidity >=0.6.11 < 0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "./Verifier.sol";

contract TheBoard {

    struct Position {
        uint128 x;
        uint128 y;
    }

    uint8 constant X_MAX = 12;
    uint8 constant Y_MAX = 12;

    mapping(address => bool) public isPlayer;
    mapping(address => uint256) public positionHash;
    mapping(address => Position) public playerPosition;

    constructor() public {
    // what should we do on deploy?
    }

    function verifyConcealMoveProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) public view returns (bool) {
        return Verifier.verifyConcealMoveProof(a, b, c, input);
    }

    function verifyHiddenMoveProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public view returns (bool) {
        return Verifier.verifyHiddenMoveProof(a, b, c, input);
    }

    function verifyRevealMoveProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) public view returns (bool) {
        return Verifier.verifyRevealMoveProof(a, b, c, input);
    }
}
