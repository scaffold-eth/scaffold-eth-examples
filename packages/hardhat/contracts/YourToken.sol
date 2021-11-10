pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract YourToken is ERC20 {

    using SafeMath for uint256;
    using SafeMath for uint;

    uint256 startBlock;
    uint256 tokensPerBlock = 10000000000000000000;

    constructor() ERC20("8bitToken", "8BIT") public {
      _mint(0xE09750abE36beA8B2236E48C84BB9da7Ef5aA07c, 10000000000000000000);
      startBlock = block.number;
    }

    function mintTokens() public {
      _mint(msg.sender, 10000000000000000000);
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
