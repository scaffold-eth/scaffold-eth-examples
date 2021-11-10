pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

contract YourContract {

  event SetPurpose(address sender, string purpose, uint256 timestamp);

  string public purpose = "Scaling Optimistically!";
  uint256 public timestamp;

  constructor() {
    // what should we do on deploy?
  }

  function setPurpose(string memory newPurpose) public {
    purpose = newPurpose;
    timestamp = block.timestamp;
    emit SetPurpose(msg.sender, purpose, block.timestamp);
  }

  function getOptimisticTime() public view returns(uint256) {
    return block.timestamp;
  }

}
