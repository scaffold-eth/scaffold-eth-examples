pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract YourCollectible is ERC721, Ownable {

  address payable public constant buidlguidl = 0x97843608a00e2bbc75ab0C1911387E002565DEDE;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() public ERC721("YourCollectible", "YCB") {
    _setBaseURI("https://ipfs.io/ipfs/");
  }

  uint256 public constant limit = 5;
  uint256 public requested;

  function mintItem(address to, string memory tokenURI)
      public
      onlyOwner
      returns (uint256)
  {
      require( _tokenIds.current() < limit , "DONE MINTING");
      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(to, id);
      _setTokenURI(id, tokenURI);

      return id;
  }

  event Request(address to, uint256 value);

  function requestMint()
      public
      payable
  {
    require( requested++ < limit , "DONE MINTING");
    require( msg.value >= 0.001 ether, "NOT ENOUGH");
    (bool success,) = buidlguidl.call{value:msg.value}("");
    require( success, "could not send");
    emit Request(msg.sender, msg.value);
  }
}
