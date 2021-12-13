pragma solidity >=0.8.0 <0.9.0;

// giga nft "PatchworkKingdoms" - https://github.com/scaffold-eth/scaffold-eth-examples/tree/Giga-NFT-project

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721
// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract GigaNFT is ERC721Enumerable {

    address payable public constant recipient =
        payable(0x34aA3F359A9D614239015126635CE7732c18fDF3); // we still need to edit this // it needs to be a multisig where funds stream

    uint256 public constant limit = 15; // this also goes to 1000 for mainnet
    uint256 public constant curve = 1002307;
    uint256 public price = 0.1 ether;

    uint256 public currentSupply = 0;

    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    constructor() ERC721("PatchworkKingdoms", "GIGANFT") {
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
            require(refundSent, "could not refund");
        }

        return id;
    }

    /*
    // 🧪 tinkering with putting all the URIs on chain...
    // 🧫 with gas at ⛽️ 85 gwei I think it costs about $10 per entry "QmRhxN2hoxyCbvbwVQqAVWRJCBeZxeTXxVtEJPLvGVQNTs"

    string[] public uris;

    function addURIs(string memory uriButEventutallyMakyArray) public {
      require(msg.sender==baseURIOwner,"must be baseURIOwner");
      uris.push(uriButEventutallyMakyArray);
    }

    function addURIBatch(string[] memory uriArray) public {
      require(msg.sender==baseURIOwner,"must be baseURIOwner");
      for(uint i=0;i<uriArray.length;i++){
        uris.push(uriArray[i]);
      }
    }

    // 🚙 switching gears to using an IPFS "folder"
    // 🏷 it's content addressable (immutable) and we'll track a flexibleBaseURI:

    */

    string public flexibleBaseURI = "https://giganftassetreveal.s3.amazonaws.com/";

    function _baseURI() internal view virtual override returns (string memory) {
        return flexibleBaseURI;
    }

    // 👮‍♀️ a single account can update the flexibleBaseURI

    address public baseURIOwner = 0x34aA3F359A9D614239015126635CE7732c18fDF3; //austingriffith.eth

    function setBaseURI(string memory newURI) public {
      require(msg.sender==baseURIOwner,"must be baseURIOwner");
      flexibleBaseURI=newURI;
    }

    // 🔥 after you setBaseURI() to the IPFS folder, changeUriOwner() to the 0 address to lock

    function changeUriOwner(address newOwner) public {
      require(msg.sender==baseURIOwner,"must be baseURIOwner");
      baseURIOwner=newOwner;
    }

    // 🖼 so all the pictures have to go up to get the final address
    // 🧑‍🏭 instead we will use S3 and a script to reveal them...


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
       return "https://ipfs.io/ipfs/QmU5WVx6q3znEqYXecBKUpHFJPayL4EPHA7LX8MiTby2Hg";
    }
}
