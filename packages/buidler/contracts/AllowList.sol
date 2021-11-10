pragma solidity >=0.6.6 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AllowList is Ownable {

  event Update( address indexed addr, bool isAllowed );

  mapping(address => bool) public isAllowed;

  function update(address addr, bool allowed) public onlyOwner {
      require( addr!=address(0), "update: no zero address");
      isAllowed[addr] = allowed;
      emit Update(addr,isAllowed[addr]);
  }

}
