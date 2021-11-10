pragma solidity >=0.6.0 <0.7.0;

contract Registry {

  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  function transferOwnership(address newOwner) public {
    require( msg.sender == owner , "NOT ALLOWED");
    owner = newOwner;
  }

  mapping (bytes32 => address) public assets;

  function updateAsset(bytes32 asset, address update) public {
    require( msg.sender == owner , "NOT ALLOWED");
    assets[asset] = update;
  }


}
