pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Utilities.sol";

/**
 * Demonstrates how to consume random number in a more complex scenario.
 *
 * Any user can be a dice roller.
 * They may perform exactly one set of 6 dice rolls, with a single request.
 *
 * All dice rolls are stored and can be retrieved by the roller address.
 * Roll results are also emitted via events.
 *
 */
contract MultiDiceRolls is VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;

    struct RollResult {
        bool hasRequested;
        uint256[] rollSet;
    }

    mapping(bytes32 => address) public requests;
    mapping(address => RollResult) public rollResults;

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
        require(
            !rollResults[msg.sender].hasRequested,
            "this account has already requested a roll"
        );

        bytes32 reqId = requestRandomness(keyHash, fee);
        requests[reqId] = msg.sender;
        rollResults[msg.sender].hasRequested = true;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        uint256[] memory _rollSet = Utilities.expand(randomness, 6);
        rollResults[requests[requestId]].rollSet = _rollSet;
        emit Rolled(
            uint8(_rollSet[0]),
            uint8(_rollSet[1]),
            uint8(_rollSet[2]),
            uint8(_rollSet[3]),
            uint8(_rollSet[4]),
            uint8(_rollSet[5])
        );
    }

    function withdrawLink() external {} //- Implement a withdraw function to avoid locking your LINK in the contract
}
