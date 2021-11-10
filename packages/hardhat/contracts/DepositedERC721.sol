// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.8.0;
pragma experimental ABIEncoderV2;

/* Library Imports */
import { OVM_DepositedERC721 } from "./optimism/OVM_DepositedERC721.sol";

contract DepositedERC721 is OVM_DepositedERC721 {

    constructor(
        address _messenger,
        string memory _name,
        string memory _symbol
    )
        OVM_DepositedERC721(_messenger, _name, _symbol)
    {}

}
