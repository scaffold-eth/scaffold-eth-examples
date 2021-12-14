pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

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
     *      Address:        0xDc69e482F27C4b4f43d4c35fC49b24654bc5183b
     * Job:
     *      Name:           CoinGecko ETHUSD
     *      Listing URL:    https://market.link/jobs/f05be653-b391-4acb-83cb-3f64a251d81c
     *      ID:             5037c6de51f6434f8b3b9233548d1fa3
     *      Fee:            0.1 LINK
     */
    constructor() {
        setPublicChainlinkToken();
        oracle = 0xDc69e482F27C4b4f43d4c35fC49b24654bc5183b; // oracle address
        jobId = "5037c6de51f6434f8b3b9233548d1fa3"; //job id
        fee = 0.1 * 10**18; // 0.1 LINK
    }

    /**
     * Make initial request
     */
    function requestEthereumPrice() public {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillEthereumPrice.selector
        );
        sendChainlinkRequestTo(oracle, req, fee);
    }

    /**
     * Callback function
     */
    function fulfillEthereumPrice(bytes32 _requestId, uint256 _price)
        public
        recordChainlinkFulfillment(_requestId)
    {
        ethereumPrice = _price;
    }
}
