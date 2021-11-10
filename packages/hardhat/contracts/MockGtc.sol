pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockGtc is ERC20 {
    constructor() public ERC20("GTC", "GTC") {
        _mint(0x8593561a4742D799535390BC5C7B992867e50A09, 100 ether);
    }
}
