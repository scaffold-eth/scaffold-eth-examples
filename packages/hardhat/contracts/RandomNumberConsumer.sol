pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

import "@chainlink/contracts/v0.6/VRFConsumerBase.sol";

contract RandomNumberConsumer is VRFConsumerBase {
    
    bytes32 internal keyHash;
    uint256 internal fee;
    
    uint256 public randomResult;

    event Roll (uint8 roll1, uint8 roll2, uint8 roll3, uint8 roll4, uint8 roll5, uint8 roll6);
    
    /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor() 
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token
        ) public
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }
    
    /** 
     * Requests randomness from a user-provided seed
     */
    function getRandomRoll(uint256 userProvidedSeed) public returns (bytes32 requestId) {
        
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");

        bytes32 requestId = requestRandomness(keyHash, fee, userProvidedSeed);

        emit Roll(
            uint8(requestId[0]) % 6, 
            uint8(requestId[1]) % 6, 
            uint8(requestId[2]) % 6, 
            uint8(requestId[3]) % 6, 
            uint8(requestId[4]) % 6, 
            uint8(requestId[5]) % 6
        );
        
        return requestId;
    }

    /** 
     * Requests randomness 
     */
    // function getRandomNumber() public returns (bytes32 requestId) {
    //     require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
    //     return requestRandomness(keyHash, fee);
    // }


    // It's possible to get multiple numbers from a single VRF response:
    function expand(uint256 randomValue, uint256 n) public pure returns (uint256[] memory expandedValues) {
        expandedValues = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
        }
    return expandedValues;
}


    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }


    function withdrawLink() external {} //- Implement a withdraw function to avoid locking your LINK in the contract
}