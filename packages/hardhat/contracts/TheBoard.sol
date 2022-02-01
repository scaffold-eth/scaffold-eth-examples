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

    address public player0;
    address public player1;
    address public playerTurn;

    mapping(uint256 => uint256) public piecePositionHash;
    mapping(uint256 => Position) public piecePosition;

    mapping(uint256 => mapping(uint256 => uint256)) public positionOccupant;

    constructor() public {
    // what should we do on deploy?
    }

    function initPlayer() external {
        require(player0 == address(0) || player1 == address(0), "initPlayer: Players Initialized");
        if (player0 == address(0)) {
            player0 = msg.sender;
            for (uint128 i = 0; i < 3; i++) {
                piecePosition[i+1].x = 3+3*i;
                piecePosition[i+1].y = 0;
                positionOccupant[3+3*i][0] = i+1;
            }
        } else if (player1 == address(0)) {
            require(msg.sender != player0, "initPlayer: Already Initialized");
            player1 = msg.sender;
            for (uint128 i = 0; i < 3; i++) {
                piecePosition[i+4].x = 3+3*i;
                piecePosition[i+4].y = Y_MAX;
                positionOccupant[3+3*i][Y_MAX] = i+4;
            }
            playerTurn = player0;
        }
    }

    function move(uint256 piece, uint128 x2, uint128 y2) external {
        require(msg.sender == playerTurn, "move: !Player Turn");
        require(piece < 6, "move: Invalid Piece");
        require((playerTurn == player0) && (piece > 0) ? (piece < 4) : (piece >= 4), "move: Invalid Piece");
        require(
            x2 <= piecePosition[piece].x + (piecePosition[piece].x > X_MAX - 2 ? (piecePosition[piece].x > X_MAX-1 ? 0 : 1) : 2) &&
            x2 >= piecePosition[piece].x - (piecePosition[piece].x < 2 ? (piecePosition[piece].x < 1 ? 0 : 1) : 2) &&
            y2 <= piecePosition[piece].y + (piecePosition[piece].y > Y_MAX - 2 ? (piecePosition[piece].y > Y_MAX - 1 ? 0 : 1) : 2) &&
            y2 >= piecePosition[piece].y - (piecePosition[piece].y < 2 ? (piecePosition[piece].y < 1 ? 0 : 1) : 2),
            "move: Invalid Position"
        );

        playerTurn = playerTurn == player0 ? player1 : player0;
        piecePosition[piece].x = x2;
        piecePosition[piece].y = y2;
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
