pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

// giga nft 

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract GigaNFT is ERC721Enumerable {

    address payable public constant recipient =
        payable(0x01104e244C118F8E63455e49055f0A7034d4Cf3C);

    uint256 public constant limit = 15;
    uint256 public constant curve = 1002307;
    uint256 public price = 0.1 ether;

    uint256 public currentSupply = 0;

    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    string[] public uris;

    constructor() ERC721("GigaNFT", "GIGA") {
      //
    }

    function mintItem(address to) public payable returns (uint256) {
        require(_tokenIds.current() < limit, "DONE MINTING");

        uint256 currentPrice = price;

        require(msg.value >= currentPrice, "sorry, price has increased");

        price = (price * curve) / 1000000;
        currentSupply++;

        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _mint(to, id);

        (bool success, ) = recipient.call{value: currentPrice}("");
        require(success, "could not send");

        uint256 refund = msg.value - currentPrice;
        if (refund > 0) {
            (bool refundSent, ) = msg.sender.call{value: refund}("");
            require(refundSent, "Refund could not be sent");
        }

        return id;
    }

    /**
     * Custom stuff to have a flexible baseURI for ipfs reveal that we can eventually close by changeUriOwner(0)
     */

    string public flexibleBaseURI = "https://giganftassetreveal.s3.amazonaws.com/";

    function _baseURI() internal view virtual override returns (string memory) {
        return flexibleBaseURI;
    }

    address public baseURIOwner = 0x34aA3F359A9D614239015126635CE7732c18fDF3;

    function setBaseURI(string memory newURI) public {
      require(msg.sender==baseURIOwner,"must be baseURIOwner");
      flexibleBaseURI=newURI;
    }

    function changeUriOwner(address newOwner) public {
      require(msg.sender==baseURIOwner,"must be baseURIOwner");
      baseURIOwner=newOwner;
    }

    function addURIs(string memory uriButEventutallyMakyArray) public {
      require(msg.sender==baseURIOwner,"must be baseURIOwner");
      uris.push(uriButEventutallyMakyArray);
    }


    /**
     * @notice Returns the token uri containing the metadata
     * @param tokenId nft id
     */
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
        require(tokenId < limit, "Nonexistent token");

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, uint2str(tokenId), ".json"))
                : "";
    }


    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
      if (_i == 0) {
          return "0";
      }
      uint j = _i;
      uint len;
      while (j != 0) {
          len++;
          j /= 10;
      }
      bytes memory bstr = new bytes(len);
      uint k = len;
      while (_i != 0) {
          k = k-1;
          uint8 temp = (48 + uint8(_i - _i / 10 * 10));
          bytes1 b1 = bytes1(temp);
          bstr[k] = b1;
          _i /= 10;
      }
      return string(bstr);
    }

    function contractURI() public pure returns (string memory) {
       return "https://ipfs.io/ipfs/QmRhxN2hoxyCbvbwVQqAVWRJCBeZxeTXxVtEJPLvGVQNTs";
    }
}
