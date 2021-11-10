pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/AccessControl.sol";

contract NsfwTracker is AccessControl {

  // Create a new role identifier for the monitor role
  bytes32 public constant MONITOR_ROLE = keccak256("MONITOR_ROLE");

  event Nsfw(address sender, address entityContract, string entity, bool status);

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, 0x60Ca282757BA67f3aDbF21F3ba2eBe4Ab3eb01fc);
    // This default admin can then call grantRole and revokeRole
  }

  function setNsfw(address entityContract, string calldata entity, bool status) public {
      require(hasRole(MONITOR_ROLE, msg.sender));
      emit Nsfw(msg.sender, entityContract, entity, status);
  }

}
