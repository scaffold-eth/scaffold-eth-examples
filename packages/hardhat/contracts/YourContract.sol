pragma solidity >=0.6.0 <0.7.0;

//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {

  event SetOwners(address sender, address[] owners);

  address[] public owners;

  constructor() public {
    // what should we do on deploy?
    owners.push(msg.sender);
  }

  function addOwners(address[] memory moreOwners) public {
    for(uint8 i=0;i<moreOwners.length;i++){
      owners.push(moreOwners[i]);
    }
    emit SetOwners(msg.sender, owners);
  }

}
