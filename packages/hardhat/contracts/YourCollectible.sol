pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//
interface Counter {
  function counter() external returns (uint256);
}

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.6/interfaces/KeeperCompatibleInterface.sol";

//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourCollectible is ERC721, Ownable {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() public ERC721("YourCollectible", "YCB") {
    _setBaseURI("https://ipfs.io/ipfs/");
    interval = 2 minutes;
    lastTimeStamp = block.timestamp;
  }

  uint public immutable interval;
  uint public lastTimeStamp;
  uint public counter = 0;

  function mintItem(address to, string memory tokenURI)
      public
      returns (uint256)
  {
      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(to, id);
      _setTokenURI(id, tokenURI);

      return id;
  }

  function checkUpkeep(bytes calldata checkData) external returns (bool upkeepNeeded, bytes memory performData) {
       upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;

       // We don't use the checkData in this example
       // checkData was defined when the Upkeep was registered
       performData = checkData;
   }

   function performUpkeep(bytes calldata performData) external {
     counter = Counter(0x9839408CE6434bE0E4C7c1BF9992F427Fa515F85).counter();
   }

}
