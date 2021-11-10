// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.8.0;
pragma experimental ABIEncoderV2;

/* Interface Imports */
import { OVM_ERC721Gateway } from "./optimism/OVM_ERC721Gateway.sol";

contract ERC721Gateway is OVM_ERC721Gateway {

    constructor(
        address _ERC721,
        address _depositedERC721,
        address _messenger
    )
        OVM_ERC721Gateway(
            _ERC721,
            _depositedERC721,
            _messenger
        )
    {
    }

}
