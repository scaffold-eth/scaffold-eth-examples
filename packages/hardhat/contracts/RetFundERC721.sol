// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RetFundERC721 is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public admin;
    uint256 public currentSupply = 0;
    uint256 public curve;
    uint256 public price;
    string[] private uris;

    uint256 public limit;
    string private _userURI;

    constructor(
        address _admin,
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _basePrice,
        uint256 _curve,
        string memory base,
        string[] memory _uris
    ) ERC721(name, symbol) {
        //
        admin = _admin;
        limit = _maxSupply;
        curve = _curve;
        price = _basePrice;
        _userURI = base;
        uris = _uris;
    }

    function _baseURI() internal view override returns (string memory) {
        return _userURI;
    }

    function mintItem(address to) public payable returns (uint256) {
        require(_tokenIds.current() < limit, "DONE MINTING");
        require(msg.value >= price, "NOT ENOUGH");

        price = (price * curve) / 1000;
        currentSupply++;

        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _mint(to, id);

        (bool success, ) = admin.call{value: msg.value}("");
        require(success, "could not send");

        return id;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        require(tokenId <= limit, "Nonexistent token");

        return
            bytes(_userURI).length > 0
                ? string(abi.encodePacked(_userURI, uris[tokenId - 1]))
                : "";
    }

    /**
     * @notice Returns current floor value
     */
    function floor() public view returns (uint256) {
        if (currentSupply == 0) {
            return address(this).balance;
        }
        return address(this).balance / currentSupply;
    }

    function currentToken() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @notice Executes a sale and updates the floor price
     * @param _id nft id
     */
    function redeem(uint256 _id) external {
        require(ownerOf(_id) == msg.sender, "Not Owner");
        uint256 currentFloor = floor();
        require(
            currentFloor > 0,
            "sale cannot be made until floor is established"
        );
        currentSupply--;
        super._burn(_id);
        (bool success, ) = msg.sender.call{value: currentFloor}("");
        require(success, "sending floor price failed");
    }

    /**
     * @notice Fallback
     */
    receive() external payable {}
}
