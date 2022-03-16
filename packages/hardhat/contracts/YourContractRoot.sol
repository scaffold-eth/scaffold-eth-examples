pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@maticnetwork/fx-portal/contracts/tunnel/FxBaseRootTunnel.sol";

contract YourContractRoot is FxBaseRootTunnel {

  constructor(address _checkpointManager, address _fxRoot) FxBaseRootTunnel(_checkpointManager, _fxRoot) {
  }
  function setChildPurpose(string memory newPurpose) public {
      _sendMessageToChild(abi.encode(newPurpose));
  }
  

  function _processMessageFromChild(bytes memory data) internal override {
  }
}
