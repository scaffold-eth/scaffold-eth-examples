pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract BoomboxIRLNFT is ERC721 {

  address public immutable artist;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor(address _artist) public ERC721("BoomboxIRLNFT", "BOOMBOX") {
    //_setBaseURI("https://ipfs.io/ipfs/");
    artist = _artist;
  }

  mapping (bytes32 => string) public notation;
  mapping (bytes32 => bool) public ghosted;

  //this lets you look up a token by the uri (assuming there is only one of each uri for now)
  mapping (bytes32 => uint256) public uriToTokenId;

  function mintItem(string memory tokenURI, string memory _notation)
      public
      returns (uint256)
  {
      require( msg.sender == artist, "NOT THE ARTIST");

      bytes32 uriHash = keccak256(abi.encodePacked(tokenURI));

      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(msg.sender, id);
      _setTokenURI(id, tokenURI);

      uriToTokenId[uriHash] = id;

      notation[uriHash] = _notation;

      return id;
  }

}
