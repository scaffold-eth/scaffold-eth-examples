// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'base64-sol/base64.sol';
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Notepad is ERC1155, Ownable {

    uint256 public constant NOTEPAD = 0;
    mapping(address => mapping(uint256 => string[])) public notes;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() public ERC1155("") {}

    function mintItem(address to) public returns(uint256) {
        uint256 id = _tokenIds.current();
        notes[to][id] = [""];
        _tokenIds.increment();
        _mint(to, NOTEPAD, 1, "");

        return id;
    }

    function addToNote(uint256 tokenId, string memory add) public {
        require(notes[msg.sender][tokenId].length > 0, "No note to add to");
        notes[msg.sender][tokenId].push(add);
    }

    function tokenURI(address owner, uint256 tokenId) public view returns (string memory) {
        string memory image = Base64.encode(bytes(generateSVGofTokenById(owner, tokenId)));

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Notepad #',
                        Strings.toString(tokenId),
                        '", "description": "A notepad on the blockchain.", "image": "data:image/svg+xml;base64,',
                        image,
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function generateSVGofTokenById(address owner, uint256 tokenId) public view returns (string memory) {
        string memory svg = string(abi.encodePacked(
        '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
            '<rect fill="#ffaa00" width="400" height="400"/>',
            '<g fill-opacity="1">',
            '<path fill="#ffb100"  d="M486 705.8c-109.3-21.8-223.4-32.2-335.3-19.4C99.5 692.1 49 703 0 719.8V800h843.8c-115.9-33.2-230.8-68.1-347.6-92.2C492.8 707.1 489.4 706.5 486 705.8z"/>',
                '<path fill="#ffb800"  d="M1600 0H0v719.8c49-16.8 99.5-27.8 150.7-33.5c111.9-12.7 226-2.4 335.3 19.4c3.4 0.7 6.8 1.4 10.2 2c116.8 24 231.7 59 347.6 92.2H1600V0z"/>',
                '<path fill="#ffbe00"  d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"/>',
                '<path fill="#ffc500"  d="M0 0v429.4c55.6-18.4 113.5-27.3 171.4-27.7c102.8-0.8 203.2 22.7 299.3 54.5c3 1 5.9 2 8.9 3c183.6 62 365.7 146.1 562.4 192.1c186.7 43.7 376.3 34.4 557.9-12.6V0H0z"/>',
                '<path fill="#ffcc00"  d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"/>',
                '<path fill="#ffd914"  d="M1600 0H0v136.3c62.3-20.9 127.7-27.5 192.2-19.2c93.6 12.1 180.5 47.7 263.3 89.6c2.6 1.3 5.1 2.6 7.7 3.9c158.4 81.1 319.7 170.9 500.3 223.2c210.5 61 430.8 49 636.6-16.6V0z"/>',
                '<path fill="#ffe529"  d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"/>',
            '</g>',
            '<text x="0" y="0" class="small">',
                noteAsSVGText(owner, tokenId),
            '</text>'
        '</svg>'
        ));

        return svg;
    }

    function noteAsSVGText(address owner, uint256 tokenId) public view returns (string memory) {
        string memory text = "";
        string[] memory note = notes[owner][tokenId];
        for (uint256 i = 0; i < note.length; i++) {
            text = string(abi.encodePacked(
                text,
                '<tspan x="10" dy="1.2em">',
                note[i],
                '</tspan>'
            ));
        }
        return text;
    }
}
