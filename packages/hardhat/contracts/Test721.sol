//SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Test721 is ERC721Enumerable {


    constructor() ERC721("Test721", "TSO") {}

    function mint() public returns(uint256) {
        uint256 tokenId = totalSupply();
        _mint(msg.sender, tokenId);
        return tokenId;
    }

}
