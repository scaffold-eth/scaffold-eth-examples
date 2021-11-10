pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract GTGSCollectible is ERC721, Ownable {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() public ERC721("GTGSCollectible", "GTGS") {
    _setBaseURI("http://gtgs.io/t/");
  }

  //mapping (uint256 => bytes32) public bytes32TokenURI;

  function mint()
      public
      returns (uint256)
  {
      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(msg.sender, id);
      //bytes32TokenURI[id] = keccak256(abi.encodePacked(blockhash(block.number-1),msg.sender,id));
      _setTokenURI(id,string(abi.encodePacked(id)));

      return id;
  }


}
