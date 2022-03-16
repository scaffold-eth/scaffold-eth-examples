pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@maticnetwork/fx-portal/contracts/tunnel/FxBaseChildTunnel.sol";

contract YourContractChild is FxBaseChildTunnel {

    uint256 public latestStateId;
    address public latestRootMessageSender;
    bytes public latestData;

    string public purpose;

  constructor(address _fxChild) FxBaseChildTunnel(_fxChild) {
  }

  function _processMessageFromRoot(
    uint256 stateId,
    address sender,
    bytes memory data
) internal override validateSender(sender) {
    latestStateId = stateId;
    latestRootMessageSender = sender;
    latestData = data;
    purpose = abi.decode(data, (string));
}

function sendMessageToRoot(bytes memory message) public {
    _sendMessageToRoot(message);
}
}
