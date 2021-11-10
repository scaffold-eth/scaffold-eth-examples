pragma solidity 0.7.5;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721


contract AnyERC1155 is ERC1155 {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() public ERC1155("https://URIBase") {
  }

  function mintItem(address to, uint256 id, uint256 amount)
      public
      returns (uint256)
  {
      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(to, id, amount, '');

      return id;
  }
}
