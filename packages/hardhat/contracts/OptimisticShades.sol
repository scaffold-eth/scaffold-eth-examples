//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "hardhat/console.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "base64-sol/base64.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract OptimisticShades is Ownable, ERC721Enumerable {
    struct shadeObj {
        bytes32 id;
        uint8[12] shades;
        uint256[2][4] alphas;
    }

    uint128 immutable FEE = 0.1 ether;
    uint8 immutable shadesLength = 12;
    uint8 immutable alphasLength = 4;

    uint256 counter;
    mapping(bytes32 => uint256) shadesHash;
    mapping(uint256 => shadeObj) shades;

    constructor(address admin) payable ERC721("OptimisticShades", "OpSHX") {
        transferOwnership(admin);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory uri)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string[9] memory parts;

        parts[
            0
        ] = '<svg width="2000" height="2000" viewBox="0 0 2000 2000" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="1000" height="1000" fill="';

        parts[1] = string(
            abi.encodePacked(
                "rgba(",
                Strings.toString(shades[tokenId].shades[0]),
                ",",
                Strings.toString(shades[tokenId].shades[1]),
                ",",
                Strings.toString(shades[tokenId].shades[2]),
                ",",
                Strings.toString(shades[tokenId].alphas[0][0]),
                ".",
                Strings.toString(shades[tokenId].alphas[0][1]),
                ")"
            )
        );

        parts[2] = '"/><rect x="1000" width="1000" height="1000" fill="';

        parts[3] = string(
            abi.encodePacked(
                "rgba(",
                Strings.toString(shades[tokenId].shades[3]),
                ",",
                Strings.toString(shades[tokenId].shades[4]),
                ",",
                Strings.toString(shades[tokenId].shades[5]),
                ",",
                Strings.toString(shades[tokenId].alphas[1][0]),
                ".",
                Strings.toString(shades[tokenId].alphas[0][1]),
                ")"
            )
        );

        parts[4] = '"/><rect y="1000" width="1000" height="1000" fill="';

        parts[5] = string(
            abi.encodePacked(
                "rgba(",
                Strings.toString(shades[tokenId].shades[6]),
                ",",
                Strings.toString(shades[tokenId].shades[7]),
                ",",
                Strings.toString(shades[tokenId].shades[8]),
                ",",
                Strings.toString(shades[tokenId].alphas[2][0]),
                ".",
                Strings.toString(shades[tokenId].alphas[2][1]),
                ")"
            )
        );

        parts[
            6
        ] = '"/><rect x="1000" y="1000" width="1000" height="1000" fill="';

        parts[7] = string(
            abi.encodePacked(
                "rgba(",
                Strings.toString(shades[tokenId].shades[9]),
                ",",
                Strings.toString(shades[tokenId].shades[10]),
                ",",
                Strings.toString(shades[tokenId].shades[11]),
                ",",
                Strings.toString(shades[tokenId].alphas[3][0]),
                ".",
                Strings.toString(shades[tokenId].alphas[3][1]),
                ")"
            )
        );

        parts[8] = '"/></svg>';

        string memory svgData = string(
            abi.encodePacked(
                parts[0],
                parts[1],
                parts[2],
                parts[3],
                parts[4],
                parts[5],
                parts[6],
                parts[7],
                parts[8]
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Optimistic Shade #',
                        Strings.toString(tokenId),
                        '", "description": "Your color pallette of choice on the blockchain.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svgData)),
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function mint(uint8[12] memory _shades, uint256[2][4] memory alphas)
        public
        payable
        returns (uint256)
    {
        require(msg.value >= FEE, "Not enough ETH sent for mint");
        bytes32 shadeHash = keccak256(abi.encodePacked(_shades, alphas));

        // validate hash
        require(
            shadesHash[shadeHash] == 0,
            "This shade has already being minted"
        );

        // validate the variables
        // shades
        for (uint256 i = 0; i < shadesLength; i++) {
            require(_shades[i] <= 255, "Invalid shade provided");
        }
        for (uint256 i = 0; i < alphasLength; i++) {
            require(alphas[i][0] <= 1, "Invalid alpha int provided");
        }

        counter += 1;

        // handle mint
        _mint(msg.sender, counter);
        shades[counter].id = shadeHash;
        shades[counter].shades = _shades;
        shades[counter].alphas = alphas;

        return counter;
    }

    function withdraw(address _to) public onlyOwner {
        address to = _to == address(0) ? owner() : _to;

        (bool success, ) = to.call{value: address(this).balance}("");

        require(success);
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
