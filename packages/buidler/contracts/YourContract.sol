pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";

contract YourContract {

  event Owner( address indexed owner, bool added);

  function addOwner(address newOwner) public {
      emit Owner(newOwner,true);
  }

  function removeOwner(address oldOwner) public {
      emit Owner(oldOwner,false);
  }

}
