  
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./YourContract.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract YourContractFactory {
    address public immutable yourContractImplementation;
    address[] public yourContractClones;
    int public clonesCount;

    constructor() public {
        yourContractImplementation = address(new YourContract());
    }

    function createYourContract(string calldata purpose) external returns (address) {
        address clone = Clones.clone(yourContractImplementation);
        YourContract(clone).setPurpose(purpose);
        yourContractClones.push(clone);
        clonesCount++;
        return clone;
    }
}