pragma solidity 0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PGF is ERC20 {
    constructor() ERC20("PGF", "PGF") {
       _mint(msg.sender, 100 * 10**18);
    }
}