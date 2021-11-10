pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AnyERC20 is ERC20, Ownable {

  constructor() ERC20("anycoin", "ANY") public {
  }

  function mint(address recipient, uint256 amount) public onlyOwner {
    _mint(recipient, amount);
  }
}
