pragma solidity >=0.6.0 <0.7.0;

contract Broadcastor {

  event Send(address sender, string message);

  mapping (address => bool) public isAnOwner;

  constructor(address _owner) public {
    isAnOwner[_owner] = true;
  }

  function addOwner(address _owner) public {
    require(isAnOwner[msg.sender],"NOT OWNER");
    isAnOwner[_owner] = true;
  }

  function removeOwner(address _owner) public {
    require(isAnOwner[msg.sender],"NOT OWNER");
    isAnOwner[_owner] = false;
  }

  function broadcast(string memory message) public {
    require(isAnOwner[msg.sender],"NOT OWNER");
    emit Send(msg.sender,message);
  }

  function skuttle() public {
    require(isAnOwner[msg.sender],"NOT OWNER");
    selfdestruct(msg.sender);
  }



}
