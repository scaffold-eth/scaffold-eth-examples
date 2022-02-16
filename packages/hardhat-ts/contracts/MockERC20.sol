pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
  constructor() ERC20("DAI", "DAI") {}

  /// @dev For the mock contract we don't really care for access control (i.e., make sure msg.sender has "onlyMinter" role)
  function mint(address account, uint256 amount) public returns (bool) {
    _mint(account, amount);
    return true;
  }
}
