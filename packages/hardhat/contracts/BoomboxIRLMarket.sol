pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
//import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract BoomboxIRLMarket {

  address payable public immutable artist;
  ERC721 public boomboxIRLNFT;

  constructor(address payable _artist, address _NFTaddress) public {
    //_setBaseURI("https://ipfs.io/ipfs/");
    artist = _artist;
    boomboxIRLNFT = ERC721(_NFTaddress);
  }

  mapping (uint256 => uint256) public price;

  function sell(uint256 _tokenId, uint256 _price)
      public
      returns (uint256)
  {
      require( msg.sender == artist, "NOT THE ARTIST");
      require( _price > 0, "MUST HAVE A PRICE");

      boomboxIRLNFT.transferFrom(msg.sender,address(this),_tokenId);

      price[_tokenId] = _price;

  }

  function buy(uint256 _tokenId)
      public
      payable
      returns (uint256)
  {
      require( price[_tokenId] > 0, "NOT FOR SALE HERE");
      require( msg.value >= price[_tokenId], "NOT THE RIGHT AMOUNT");

      boomboxIRLNFT.transferFrom(address(this),msg.sender,_tokenId);

      artist.transfer(msg.value);

      price[_tokenId] = 0;
  }


}
