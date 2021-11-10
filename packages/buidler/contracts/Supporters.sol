// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Supporters is Ownable {

    event SupporterUpdate( address indexed supporter, bool isSupporter );

    mapping(address => bool) public isSupporter;

    function supporterUpdate(address supporter, bool update) public onlyOwner {
        require( supporter!=address(0), "supporterUpdate: zero address");
        isSupporter[supporter] = update;
        emit SupporterUpdate(supporter,isSupporter[supporter]);
    }

}
