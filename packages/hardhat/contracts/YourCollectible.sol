pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourCollectible is ERC721 {

  address public holder;
  string public tokenURI = "QmYC3yZRXm1yckSKqCFvpsDJAUzCZmY4238VaUSp7Je7Mp";
  //uint256 public lastPass;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() public ERC721("YourCollectible", "YCB") {
    _setBaseURI("https://ipfs.io/ipfs/");
    holder = msg.sender;
    //lastPass = block.timestamp;
  }

  function passTorch(address to)
      public
      returns (uint256)
  {
      require( msg.sender==holder, "NOT THE HOLDER");
      holder = to;
      //lastPass = block.timestamp;

      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(to, id);
      _setTokenURI(id, tokenURI);

      return id;
  }

  //function forkTorch() public {
  //  require()
  // if enough time passes let any current hold "fork" the chain and take over as the torch owner
  //}
}
