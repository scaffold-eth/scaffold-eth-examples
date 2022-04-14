pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PGF is ERC20 {
    constructor() ERC20("Public Goods Funding", "PGF") {
       _mint(msg.sender, 100 * 10**18);
    }
}