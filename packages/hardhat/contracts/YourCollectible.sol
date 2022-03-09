pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourCollectible is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) public tokenToPrice;
    address public constant blindnabler = 0x807a1752402D21400D555e1CD7f175566088b955;

    constructor() public ERC721("TaxNFT", "TAX") {
        _setBaseURI(
            "https://bonez.mypinata.cloud/ipfs/QmVn2RSVs5n8wJicA8zkN6QWTg88eX6H1wzqt6uPbtqwwt/"
        );
        transferOwnership(blindnabler);
    }

    function mintItem() public payable returns (uint256) {
        require(totalSupply() <= 200, "max supply reached");
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        if (totalSupply() > 0) {
            uint256 amount2send = msg.value / 2;
            uint256 amountPerHolder = amount2send / totalSupply();
            for (uint256 i = 1; i <= totalSupply(); i++) {
                address _ownerOf = ownerOf(i);
                (bool success, ) = _ownerOf.call{value: amountPerHolder}("");
                require(success, "donation to holders failed");
            }
            (bool success2, ) = blindnabler.call{value: amount2send}("");
            require(success2, "blindnabler donation not successful");
            _mint(msg.sender, id);
            tokenToPrice[id] = msg.value * 10;
            return id;
        }
        (bool success, ) = blindnabler.call{value:msg.value}("");
        require(success, 'first mint donation failed');
        _mint(msg.sender, id);
        tokenToPrice[id] = msg.value * 10;
        return id;
    }

    function buyItem(uint256 tokenId) public payable returns (uint256) {
        require(
            msg.value >= tokenToPrice[tokenId],
            "Not enough eth sent for this token!"
        );
        _approve(msg.sender, tokenId);
        uint256 amount2send = msg.value / 2;
        uint256 amountPerHolder = amount2send / totalSupply();
        for (uint256 i = 1; i <= totalSupply(); i++) {
            address _ownerOf = ownerOf(i);
            (bool success, ) = _ownerOf.call{value: amountPerHolder}("");
            require(success, "donation to holders failed");
        }
        (bool success2, ) = blindnabler.call{value: amount2send}("");
        require(success2, "blindnabler donation not successful");
        transferFrom(ownerOf(tokenId), msg.sender, tokenId);
        tokenToPrice[tokenId] = msg.value * 10;
        return tokenId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory id = uint2str(tokenId);
        string memory base = baseURI();
        return string(abi.encodePacked(base, id, ".json"));
    }

    function uint2str(uint256 _i)
        internal
        pure
        returns (string memory _uintAsString)
    {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
