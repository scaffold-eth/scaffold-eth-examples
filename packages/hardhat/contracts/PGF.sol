pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PGF is ERC20 {
    constructor() ERC20("Public Goods Funding", "PGF") {}

    function mint(uint256 _amount) public {
        _mint(msg.sender, _amount);
    }
}