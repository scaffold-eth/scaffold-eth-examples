pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/*
---------------------------------
CHAINLINK-POLYGON NETWORK DETAILS
---------------------------------
name: "mumbai",
linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
keyHash:
    "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
vrfCoordinator: "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255",
oracle: "0x58bbdbfb6fca3129b91f0dbe372098123b38b5e9",
jobId: "da20aae0e4c843f6949e5cb3f7cfe8c4",

name: "polygon",
linkToken: "0xb0897686c545045afc77cf20ec7a532e3120e0f1",
ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
keyHash:
    "0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da",
vrfCoordinator: "0x3d2341ADb2D31f1c5530cDC622016af293177AE0",
oracle: "0x0a31078cd57d23bf9e8e8f1ba78356ca2090569e",
jobId: "12b86114fa9e46bab3ca436f88e1a912",
*/

/*******
 * Author: Shravan Sunder
 * Date: 2022-02
 * Description: This contract uses chainlink to get the floor price of a NFT from opensea api using Chainlink
 * Notes:
  - This is callback based, you need to call getFloorPrice
  - it will make two api calls. (1) get the slug, (2) to get price
  - it will try to save on link by saving address:slug map 
  - it may reuse address:price map based on the timestamp (1 day, see updateFrequency)
 ****** */
contract PriceOracleNFT is ChainlinkClient {
  using Chainlink for Chainlink.Request;
  string public testStatus = "init";

  // 1 day
  uint256 updateFrequency = 60 * 60 * 24;

  struct Callback {
    address callbackAddress;
    bytes4 callbackFunctionSignature;
  }

  // the collection data used by state
  struct CollectionPrice {
    uint256 floorPrice;
    uint256 timestamp;
    bytes32 requestId;
  }

  // structure to keep track of floor price chainlink requests
  struct FloorPriceRequests {
    uint256 timestamp;
    address collectionAddress;
  }

  // structure to keep track of current calls
  struct CallInfo {
    bytes32 slugRequestId;
    bytes32 floorPriceRequestId;
    Callback callback;
  }

  // state variables
  /* map of floor price by collection name */
  mapping(address => CollectionPrice) public floorPriceMap;
  /* map of address to collection name */
  mapping(address => string) public addressToCollectionSlugMap;
  mapping(address => CallInfo) public addressToCallInfoMap;
  mapping(bytes32 => address) public requestToAddressMap;
  /* map of requests by collection name */
  //mapping(string => bytes32) public floorPriceRequestsByName;
  /* map of requests by requestId */
  mapping(bytes32 => FloorPriceRequests) public floorPriceRequestsById;

  uint256 private callId = 0;
  // oracle data
  address private oracle;
  bytes32 private u256JobId;
  bytes32 private bytes32JobId;
  uint256 private fee;

  // events
  event OpenSeaFloorPriceRequested(address collectionAddress, string collectionSlug, bytes32 requestId, string url, uint256 timestamp);
  event OpenSeaFloorPriceUpdated(address collectionAddress, bytes32 requestId, uint256 floorPrice, uint256 timestamp);
  event OpeaFloorSlugRequested(address collectionAddress, bytes32 requestId);
  event OpeaFloorSlugUpdated(address collectionAddress, string collectionSlug, bytes32 requestId);

  constructor() {
    setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
    oracle = 0x58BBDbfb6fca3129b91f0DBE372098123B38B5e9;
    u256JobId = "da20aae0e4c843f6949e5cb3f7cfe8c4";
    bytes32JobId = "a7330d0b4b964c05abc66a26307047c0";
    fee = 0.01 * 10**18;
  }

  function testCallback(uint256 _price) public {}

  function test(address _collectionAddress) public {
    testStatus = "test";
    Callback memory c = Callback(address(this), this.testCallback.selector);
    getFloorPrice(_collectionAddress, c);
  }

  /**
   * This is the function to call to get the floor price of a NFT from opensea api using Chainlink
   * @param _collectionAddress address of the collection
   * @param _callback callback for the function, it should be of the form: function(uint256 floorPrice)
   */
  function getFloorPrice(address _collectionAddress, Callback memory _callback) public returns (bytes20) {
    callId++;
    bytes16 guid = bytes16(keccak256(abi.encodePacked(callId)));
    testStatus = "getFloorPrice";

    // if (ERC20Interface(oracle).balanceOf(address(this)) == 0) {
    //   revert NoLinkTokenInContract();
    // }

    if (bytes(addressToCollectionSlugMap[_collectionAddress]).length == 0) {
      testStatus = "getFloorPrice: no slug";
      // we don't have slug for this collection contract
      addressToCallInfoMap[_collectionAddress] = CallInfo(0, 0, _callback);
      bytes32 result = requestOpenSeaCollectionSlug(_collectionAddress);
      addressToCallInfoMap[_collectionAddress].slugRequestId = result;
    } else {
      testStatus = "getFloorPrice: floor price";
      // we have slug for this collection contract
      addressToCallInfoMap[_collectionAddress] = CallInfo(0, 0, _callback);
      bytes32 result = requestOpenSeaFloorPrice(_collectionAddress, addressToCollectionSlugMap[_collectionAddress]);
      addressToCallInfoMap[_collectionAddress].floorPriceRequestId = result;
    }

    return guid;
  }

  /**
   * This will call an api via chainlink to get the floor price of a collection
   * @param _collectionAddress address of contract
   */
  function requestOpenSeaCollectionSlug(address _collectionAddress) internal returns (bytes32 requestId) {
    testStatus = "requestOpenSeaCollectionSlug";

    // create a new request
    Chainlink.Request memory request = buildChainlinkRequest(bytes32JobId, address(this), this.fulfillCollectionSlug.selector);

    // Set the URL to perform the GET request on
    string memory url = getContractUrl(toString(_collectionAddress));
    request.add("get", url);
    request.add("path", "collection.slug");

    // send the request
    bytes32 result = sendChainlinkRequestTo(oracle, request, fee);

    // emit event and save id
    emit OpeaFloorSlugRequested(_collectionAddress, result);
    return result;
  }

  /**
   *  Callback function to retrieve the response from the Chainlink request.
   */
  function fulfillCollectionSlug(bytes32 _requestId, string memory _slug) public recordChainlinkFulfillment(_requestId) {
    string memory collectionSlug = _slug;
    emit OpeaFloorSlugUpdated(requestToAddressMap[_requestId], collectionSlug, _requestId);
    addressToCollectionSlugMap[requestToAddressMap[_requestId]] = _slug;

    // call the next step
    address collectionAddress = requestToAddressMap[_requestId];
    bytes32 result = requestOpenSeaFloorPrice(collectionAddress, _slug);
    addressToCallInfoMap[collectionAddress].floorPriceRequestId = result;
  }

  /**
   * This will call an api via chainlink to get the floor price of a collection
   * @param _collectionSlug the slug for the collection in openSea
   */
  function requestOpenSeaFloorPrice(address _collectionAddress, string memory _collectionSlug) internal returns (bytes32 requestId) {
    testStatus = "requestOpenSeaFloorPrice";

    // check if there is already a result that's recent
    if (floorPriceMap[_collectionAddress].timestamp != 0) {
      if (block.timestamp - floorPriceMap[_collectionAddress].timestamp < updateFrequency) {
        return floorPriceMap[_collectionAddress].requestId;
      }
    }
    bytes32 floorPriceRequestId = addressToCallInfoMap[_collectionAddress].floorPriceRequestId;

    testStatus = "requestOpenSeaFloorPrice: check existing";

    // check if a request is in progress that's valid
    if (floorPriceRequestId != 0 && floorPriceRequestsById[floorPriceRequestId].timestamp != 0) {
      if (block.timestamp - floorPriceRequestsById[floorPriceRequestId].timestamp < updateFrequency) {
        return floorPriceRequestId;
      }

      // if there any current request and its too old, delete it and refetch
      delete floorPriceRequestsById[floorPriceRequestId];
    }

    testStatus = "requestOpenSeaFloorPrice: create request";

    // create a new request
    Chainlink.Request memory request = buildChainlinkRequest(u256JobId, address(this), this.fulfillFloorPrice.selector);

    // Set the URL to perform the GET request on
    string memory url = getStatsUrl(_collectionSlug);
    request.add("get", url);
    request.add("path", "stats.floor_price");

    // multiple by 10^18 to remove decimal places
    int256 timesAmount = 10**18;
    request.addInt("times", timesAmount);

    testStatus = "requesting";
    // send the request
    bytes32 result = sendChainlinkRequestTo(oracle, request, fee);

    // save the request data
    floorPriceRequestsById[result] = FloorPriceRequests(block.timestamp, _collectionAddress);

    // emit event and save id
    emit OpenSeaFloorPriceRequested(_collectionAddress, _collectionSlug, result, url, block.timestamp);
    return result;
  }

  /**
   *  Callback function to retrieve the response from the Chainlink request.
   */
  function fulfillFloorPrice(bytes32 _requestId, uint256 _price) public recordChainlinkFulfillment(_requestId) {
    testStatus = "fulfillFloorPrice";

    address collectionAddress = floorPriceRequestsById[_requestId].collectionAddress;
    floorPriceMap[collectionAddress] = CollectionPrice(_price, block.timestamp, _requestId);

    emit OpenSeaFloorPriceUpdated(collectionAddress, _requestId, _price, block.timestamp);

    // delete floor price request that is completed
    delete floorPriceRequestsById[_requestId];

    // invoke callback
    Callback memory callback = addressToCallInfoMap[collectionAddress].callback;
    (bool success, ) = callback.callbackAddress.call(abi.encodeWithSelector(callback.callbackFunctionSignature, _price));
    delete addressToCallInfoMap[collectionAddress];
  }

  /**
   * Concatenate the URL for getting status such as floor price
   */
  function getStatsUrl(string memory slug) public pure returns (string memory) {
    return string(abi.encodePacked("https://api.opensea.io/api/v1/collection/", slug, "/stats"));
  }

  /**
   * Concatenate the URL for getting slug
   */
  function getContractUrl(string memory contractAddress) public pure returns (string memory) {
    return string(abi.encodePacked("https://api.opensea.io/api/v1/asset_contract/", contractAddress));
  }

  // /////////
  // HELPERS
  // /////////

  function toString(address account) public pure returns (string memory) {
    return toString(abi.encodePacked(account));
  }

  function toString(uint256 value) internal pure returns (string memory) {
    return toString(abi.encodePacked(value));
  }

  function toString(bytes32 value) internal pure returns (string memory) {
    return toString(abi.encodePacked(value));
  }

  function toString(bytes memory data) internal pure returns (string memory) {
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(2 + data.length * 2);
    str[0] = "0";
    str[1] = "x";
    for (uint256 i = 0; i < data.length; i++) {
      str[2 + i * 2] = alphabet[uint256(uint8(data[i] >> 4))];
      str[3 + i * 2] = alphabet[uint256(uint8(data[i] & 0x0f))];
    }
    return string(str);
  }

  function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
    uint8 i = 0;
    while (i < 32 && _bytes32[i] != 0) {
      i++;
    }
    bytes memory bytesArray = new bytes(i);
    for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
      bytesArray[i] = _bytes32[i];
    }
    return string(bytesArray);
  }

  function stringToBytes32(string memory source) public pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly {
      // solhint-disable-line no-inline-assembly
      result := mload(add(source, 32))
    }
  }
}
