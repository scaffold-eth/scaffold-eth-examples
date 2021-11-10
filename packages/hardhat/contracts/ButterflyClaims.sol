/*

 /$$$$$$$              /$$     /$$                          /$$$$$$  /$$                  /$$$$$$  /$$           /$$
| $$__  $$            | $$    | $$                         /$$__  $$| $$                 /$$__  $$| $$          |__/
| $$  \ $$ /$$   /$$ /$$$$$$ /$$$$$$    /$$$$$$   /$$$$$$ | $$  \__/| $$ /$$   /$$      | $$  \__/| $$  /$$$$$$  /$$ /$$$$$$/$$$$   /$$$$$$$
| $$$$$$$ | $$  | $$|_  $$_/|_  $$_/   /$$__  $$ /$$__  $$| $$$$    | $$| $$  | $$      | $$      | $$ |____  $$| $$| $$_  $$_  $$ /$$_____/
| $$__  $$| $$  | $$  | $$    | $$    | $$$$$$$$| $$  \__/| $$_/    | $$| $$  | $$      | $$      | $$  /$$$$$$$| $$| $$ \ $$ \ $$|  $$$$$$
| $$  \ $$| $$  | $$  | $$ /$$| $$ /$$| $$_____/| $$      | $$      | $$| $$  | $$      | $$    $$| $$ /$$__  $$| $$| $$ | $$ | $$ \____  $$
| $$$$$$$/|  $$$$$$/  |  $$$$/|  $$$$/|  $$$$$$$| $$      | $$      | $$|  $$$$$$$      |  $$$$$$/| $$|  $$$$$$$| $$| $$ | $$ | $$ /$$$$$$$/
|_______/  \______/    \___/   \___/   \_______/|__/      |__/      |__/ \____  $$       \______/ |__/ \_______/|__/|__/ |__/ |__/|_______/
                                                                         /$$  | $$
                                                                        |  $$$$$$/
                                                                         \______/

  https://github.com/austintgriffith/scaffold-eth/tree/butterfly-claims

  BuidlGuidl.com

*/
pragma solidity >=0.6.0 <0.7.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

contract ButterflyClaims is ERC721  {

  string[] public phases = [
    "QmbccRYPd2M6XKop2HiNHZWwbXUErsyFwN8HTEcwQi2ohJ",
    "QmargAoKGcqS5AGSrAkTDnaHEtJo47F1tt2cS8icmnnWcM",
    "QmcWw66wumDMGvTGUqRshu7xPrV9qCRfVUdorabYoVknjd",
    "QmP1cSxkd4dAyFy5imwP6P5NGjhcGkSoeyXcHu8tMkmxGH",
    "QmTm54sPYNc3vJWbGoMfpe5hRov94DPgG5tBcBq3jvz4Cf",
    "QmaimX2Smov2uBXQDXci5m9GzehiXUZdUbiYCE9nPxxMxG"
  ];

  mapping (uint256 => uint256) public birth;
  mapping (uint256 => bool) public rare;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() public ERC721("ButterflyClaims", "BTFLYC") {
    _setBaseURI("https://ipfs.io/ipfs/");
  }

  address payable constant public buidlguidl = payable(0x97843608a00e2bbc75ab0C1911387E002565DEDE);

  uint256 public price = 0.0005 ether;

  function claim()
      public
      payable
      returns (uint256)
  {
      require(msg.value>=price,"AMT OF ETH WRONG");
      (bool sent, ) = buidlguidl.call{value: msg.value}("");
      require(sent, "ETH TO BG FAILED");

      price = ( price * 103 ) / 100;

      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(msg.sender, id);

      birth[id] = block.timestamp;

      //fake random from previous block, you can game this ofc
      if(uint256(keccak256(abi.encodePacked(address(this),id,blockhash(block.number-1))))%12==1){
        rare[id] = true;
      }

      return id;
  }


  function tokenURI(uint256 tokenId) public view override returns (string memory) {
      require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

      string memory _tokenURI;

      uint256 age = block.timestamp - birth[tokenId];

      string memory base = baseURI();

      if(age<86400){
        _tokenURI = phases[0];
      }else if(age<172800){
        _tokenURI = phases[1];
      }else if(age<259200){
        _tokenURI = phases[2];
      }else if(age<345600){
        _tokenURI = phases[3];
      }else{
        if(rare[tokenId]){
          _tokenURI = phases[5];
        }else{
          _tokenURI = phases[4];
        }
      }

      return string(abi.encodePacked(base, _tokenURI));
  }

}
