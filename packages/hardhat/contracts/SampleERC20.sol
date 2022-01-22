// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SampleERC20 is ERC20 {
    constructor() ERC20("SampleERC20", "sERC") {
        _mint(msg.sender, 100 * 10**18);
    }

    function mintSome() public {
        _mint(msg.sender, 1000 * 10**18);
    }
}
