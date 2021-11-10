pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract GrabBag is Ownable {

  struct YourObject{
    bytes32 next;
    bytes32 uniqueData;
  }

  bytes32 public head;
  mapping (bytes32 => YourObject) public yourObjects;
  uint256 public length = 0;

  function addEntry(bytes32 _someData) public onlyOwner {
    YourObject memory newObject = YourObject({
      next: head,
      uniqueData: _someData
    });
    bytes32 id = keccak256(abi.encodePacked(address(this),_someData,length,block.number));
    yourObjects[id] = newObject;
    head = id;
    length++;
  }

  function addEntries(bytes32[] memory _someDataArray) public {
    for(uint256 e=0;e<_someDataArray.length;e++){
      addEntry(_someDataArray[e]);
    }
  }

  function grab(uint256 random) public onlyOwner returns (bytes32 returnData) {
    require(head!=0,"EMPTY");
    bytes32 current = head;
    bytes32 prev;
    uint256 index = random%length;

    while(index-- > 0 ){
      prev = current;
      current = yourObjects[current].next;
    }

    if(current==head){
      head = yourObjects[current].next;
    }else{
      yourObjects[prev].next = yourObjects[current].next;
    }

    returnData = yourObjects[current].uniqueData;
    delete(yourObjects[current]);
    length--;

    return returnData;
  }

}
