pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

import "@chainlink/contracts/v0.6/ChainlinkClient.sol";

contract CoinGeckoConsumer is ChainlinkClient {
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    uint256 public ethereumPrice;
    
    /**
     * Network: Kovan
     * Oracle: 
     *      Name:           AlphaChain Kovan
     *      Listing URL:    https://market.link/nodes/ef076e87-49f4-486b-9878-c4806781c7a0?start=1601380594&end=1601985394
     *      Address:        0xAA1DC356dc4B18f30C347798FD5379F3D77ABC5b
     * Job: 
     *      Name:           ETH-USD CoinGecko
     *      Listing URL:    https://market.link/jobs/78868caf-4a75-4dbf-a4cf-52538a283409
     *      ID:             9cc0c77e8e6e4f348ef5ba03c636f1f7
     *      Fee:            0.1 LINK
     */
    constructor() public {
        setPublicChainlinkToken();
        oracle = 0xAA1DC356dc4B18f30C347798FD5379F3D77ABC5b; // oracle address
        jobId = "9cc0c77e8e6e4f348ef5ba03c636f1f7"; //job id
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }
    
    /**
     * Make initial request
     */
    function requestEthereumPrice() public {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillEthereumPrice.selector);
        sendChainlinkRequestTo(oracle, req, fee);
    }
    
    /**
     * Callback function
     */
    function fulfillEthereumPrice(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId) {
        ethereumPrice = _price;
    }
}