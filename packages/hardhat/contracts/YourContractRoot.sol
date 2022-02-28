pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@maticnetwork/fx-portal/contracts/tunnel/FxBaseRootTunnel.sol";

contract YourContractRoot is FxBaseRootTunnel {

  string public purpose = "Building Unstoppable Apps!!!";

  constructor(address _checkpointManager, address _fxRoot) FxBaseRootTunnel(_checkpointManager, _fxRoot) {
  }

  // Waddap

  function setChildPurpose(string memory newPurpose) public {
      sendMessageToChild(abi.encode(newPurpose));
  }
  

  function _processMessageFromChild(bytes memory data) internal override {
  }

  function sendMessageToChild(bytes memory message) public {
      _sendMessageToChild(message);
  }
}
