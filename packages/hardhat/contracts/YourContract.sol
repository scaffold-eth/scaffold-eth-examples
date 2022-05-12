//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract YourContract is ERC721, Ownable {
    uint256 currentlyMinted;
    uint256 totalMint = 10000;

    uint256 public immutable price = 0.01 ether;

    constructor() payable ERC721("Some Event Ticket", "SET") {}

    // buy ticket
    function buyTicket() public payable returns (uint256 tokenId) {
        require(msg.value >= price, "Not enough ETH sent");
        require(balanceOf(msg.sender) < 1, "1 ticket allowed per address");
        require(currentlyMinted < totalMint, "Tickets are sold out");

        currentlyMinted += 1;
        tokenId = currentlyMinted;

        _mint(msg.sender, tokenId);
    }

    function withdraw(address _to) public onlyOwner {
        address to = (_to == address(0)) ? owner() : _to;
        (bool success, ) = to.call{value: address(this).balance}("");

        require(success, "Balance withdrawal failed");
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
