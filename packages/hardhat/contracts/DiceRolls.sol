pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Utilities.sol";

/**
 * Demonstrates how to consume a random number.
 *
 * For each random number received from the Chainlink VRF contract,
 * a set of six dice rolls is performed.
 * The result is both emitted in an event and stored in the contract.
 *
 * Each dice roll overwrites the previous result.
 */
contract DiceRolls is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomResult;
    // not strictly necessary as contract state, but kept for reference

    uint8[] public rollSet;

    // You may need these events
    // event RequestedRandomness(bytes32 requestId);
    // event ReveivedRandomness(uint256 indexed randomNumber);

    event Rolled(
        uint8 roll1,
        uint8 roll2,
        uint8 roll3,
        uint8 roll4,
        uint8 roll5,
        uint8 roll6
    );

    /**
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor()
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088 // LINK Token
        )
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10**18; // 0.1 LINK
    }

    /**
     * Requests randomness
     */
    function requestRandomRoll() public {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        requestRandomness(keyHash, fee);
        // If you need an event for this
        // emit RequestedRandomness(lastRequestId);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32, uint256 randomness) internal override {
        randomResult = randomness;

        // The following solution to obtain 6 random numbers between 1 and 6
        // is much more expensive than it has to be.
        // We leave it like this for demonstration purposes, to show:

        // how to obtain several random numbers from one vrf response
        uint256[] memory sixRandomNumbers = Utilities.expand(randomness, 6);
        rollSet = [
            uint8(sixRandomNumbers[0] % 6) + 1,
            uint8(sixRandomNumbers[1] % 6) + 1,
            uint8(sixRandomNumbers[2] % 6) + 1,
            uint8(sixRandomNumbers[3] % 6) + 1,
            uint8(sixRandomNumbers[4] % 6) + 1,
            uint8(sixRandomNumbers[5] % 6) + 1
        ];
        emit Rolled(
            rollSet[0],
            rollSet[1],
            rollSet[2],
            rollSet[3],
            rollSet[4],
            rollSet[5]
        );
    }

    function rollResult()
        public
        view
        returns (
            uint8,
            uint8,
            uint8,
            uint8,
            uint8,
            uint8
        )
    {
        return (
            rollSet[0],
            rollSet[1],
            rollSet[2],
            rollSet[3],
            rollSet[4],
            rollSet[5]
        );
    }

    function withdrawLink() external {} //- Implement a withdraw function to avoid locking your LINK in the contract
}
