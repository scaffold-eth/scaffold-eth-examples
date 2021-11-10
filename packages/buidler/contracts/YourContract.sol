pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@nomiclabs/buidler/console.sol";

//example from: https://docs.openzeppelin.com/contracts/3.x/erc721
contract YourContract is ERC721{
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  uint256 startingPrice = 0.01 ether;
  uint256 num = 105;
  uint256 den = 100;
  mapping( string => uint256 ) public prices;

  event Mint(uint256 id, address to, string tokenURI);

  constructor() ERC721("YourNFT", "yNFT") public   {
    // what should we do on deploy?
  }

  function price(string memory tokenURI) public view returns(uint256){
    if( prices[tokenURI] <=startingPrice) return startingPrice;
    return prices[tokenURI];
  }
  function nextPrice(string memory tokenURI) public view returns(uint256){
    uint256 next = ((prices[tokenURI]*num)/den);
    if(next<=startingPrice) return startingPrice;
    return next;
  }

  function anyoneCanMint(address to, string memory tokenURI)
        public
        payable
        returns (uint256)
    {
        uint256 priceToMint = nextPrice(tokenURI);
        console.log(msg.value,priceToMint);
        require(msg.value == priceToMint,"NOT ENOUGH");
        prices[tokenURI] = nextPrice(tokenURI);

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit Mint(newItemId, to, tokenURI);
        return newItemId;
    }


    //TODO ADD burn where you get
    // _burn(itemId)
    // figure out price
    // msg.sender.transfer ( price)
    //  prices[tokenURI] = prevPrice(tokenURI);
}
