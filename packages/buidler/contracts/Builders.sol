// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Builders is Ownable {

    event BuilderUpdate( address indexed builder, bool isBuilder );

    mapping(address => bool) public isBuilder;

    function builderUpdate(address builder, bool update) public onlyOwner {
        require( builder!=address(0), "updateBuilder: zero address");
        isBuilder[builder] = update;
        emit BuilderUpdate(builder,isBuilder[builder]);
    }

}
