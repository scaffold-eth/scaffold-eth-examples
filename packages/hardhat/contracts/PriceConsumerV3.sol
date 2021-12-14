pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;

    string public purpose = "Building dApps with on-chain price feeds!!!";

    string public constant feedName = "ETH/USD price";

    /**
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    constructor() {
        priceFeed = AggregatorV3Interface(
            0x9326BFA02ADD2366b30bacB125260Af641031331
        );
    }

    /**
     * Returns the latest price
     */
    function getThePrice() public view returns (int256) {
        // all values but price can be left out if we don't use them
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function setPurpose(string memory newPurpose) public {
        purpose = newPurpose;
    }
}
