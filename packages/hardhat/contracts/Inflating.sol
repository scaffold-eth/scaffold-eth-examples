pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Inflating is ERC20 {

    using SafeMath for uint256;
    using SafeMath for uint;

    uint256 startBlock;
    uint256 tokensPerBlock;

    constructor() ERC20("INFLATING", "INFL") public {
      startBlock = block.number;
      tokensPerBlock = 10000000000000000000;
    }

    function setTokensPerBlock(uint256 _tokensPerBlock) public {
      tokensPerBlock = _tokensPerBlock;
    }

    function outstandingTokens() public view returns(uint256) {
      uint elapsedBlocks = block.number.sub(startBlock);
      uint256 tokenLimit = elapsedBlocks.mul(tokensPerBlock);
      if(tokenLimit <= totalSupply()) {
        return 0;
      }
      return tokenLimit.sub(totalSupply());
    }

    function mintOutstandingTokens() public {
      uint256 available = outstandingTokens();
      require(available > 0, "No tokens available");
      _mint(msg.sender, available);
    }
}
