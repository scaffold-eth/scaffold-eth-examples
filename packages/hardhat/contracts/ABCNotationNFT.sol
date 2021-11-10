pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT
/*
    ___    ____  _______   __      __        __  _             _   ______________
   /   |  / __ )/ ____/ | / /___  / /_____ _/ /_(_)___  ____  / | / / ____/_  __/
  / /| | / __  / /   /  |/ / __ \/ __/ __ `/ __/ / __ \/ __ \/  |/ / /_    / /
 / ___ |/ /_/ / /___/ /|  / /_/ / /_/ /_/ / /_/ / /_/ / / / / /|  / __/   / /
/_/  |_/_____/\____/_/ |_/\____/\__/\__,_/\__/_/\____/_/ /_/_/ |_/_/     /_/

*/
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ABCNotationNFT is ERC721 {

  address public immutable artist;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor(address _artist) public ERC721("ABCNotationNFT", "ABCNFT") {
    _setBaseURI("https://ipfs.io/ipfs/");
    artist = _artist;
  }

  mapping (uint256 => string) public notation;

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

      notation[id] = _notation;

      return id;
  }

}
