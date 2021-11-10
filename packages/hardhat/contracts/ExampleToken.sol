pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ExampleToken is ERC20{

  constructor(address someStartingAddress) public ERC20("ExampleToken","ET") {
    _mint(someStartingAddress,100 ether);
  }

}
