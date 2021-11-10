pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourCollectible is ERC721 {

  address public holder;
  string public tokenURI = "QmYzYbYLDbQv3LAG75bUx3NSUjffMUinHrg9UXLEzBodVY";
  //uint256 public lastPass;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() public ERC721("YourCollectible", "YCB") {
    _setBaseURI("https://ipfs.io/ipfs/");
    holder = msg.sender;
    //lastPass = block.timestamp;
  }

  mapping (address => bool) public lit;

  function passTorch(address to)
      public
      returns (uint256)
  {
      require( !lit[to], "THEY ARE ALREADY LIT, BRO");
      require( msg.sender==holder, "NOT THE HOLDER");

      holder = to;
      lit[to] = true;
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
