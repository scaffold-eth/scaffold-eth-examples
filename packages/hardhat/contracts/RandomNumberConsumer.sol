pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

// import "hardhat/console.sol"
// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

/**
 * Demonstrates how to consume a random number by simply storing it.
 *
 * Every request for a new random number resets the randomResult to 0.
 *
 * On the response from Chainlink with a new random number we store that
 * number as our randomResult.
 */
contract RandomNumberConsumer is VRFConsumerBase {
    // event SetPurpose(address sender, string purpose);
    string public purpose = "Building dApps with random numbers!!!";

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    bytes32 public lastRequestId;

    // You may need these events
    // event RequestedRandomness(bytes32 requestId);
    // event ReveivedRandomness(uint256 indexed randomNumber);

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

    function setPurpose(string memory newPurpose) public {
        purpose = newPurpose;
        // emit SetPurpose(msg.sender, purpose);
    }

    /**
     * Requests randomness
     */
    function requestRandomNumber() public {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        randomResult = 0;
        lastRequestId = requestRandomness(keyHash, fee);

        // If you need an event for this
        // emit RequestedRandomness(lastRequestId);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32, uint256 randomness) internal override {
        randomResult = randomness;
    }

    function withdrawLink() external {} //- Implement a withdraw function to avoid locking your LINK in the contract
}
