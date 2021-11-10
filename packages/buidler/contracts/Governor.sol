pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";
import "./Registry.sol";

contract Governor {

  Registry public registry;

  constructor(address registryAddress,address[] memory initialSigners) public {
    registry = Registry(registryAddress);
    signers=initialSigners;
  }

  function updateAsset(bytes32 asset, address update) public {
    require( isPassingVote( asset, update), "NOT PASSING" );
    registry.updateAsset(asset, update);
  }




  address[] public signers;

  function addSigner(address newSigner) public {
    require( !isSigner(newSigner) , "ALREADY A SIGNER");
    require( isPassingVote( "addSigner", newSigner), "NOT PASSING" );
    signers.push(newSigner);
  }

  function electGovernor(address newGovernor) public {
    require( isPassingVote( "electGovernor", newGovernor), "NOT PASSING" );
    registry.transferOwnership(newGovernor);
  }

  function isSigner(address signer) public view returns (bool) {
    for(uint8 s=0;s<signers.length;s++){
      if(signers[s]==signer){
        return true;
      }
    }
    return false;
  }




  uint8 quorumNumerator = 2;
  uint8 quorumDenominator = 3;

  struct Vote {
    bytes32 asset;
    address update;
  }

  mapping ( address => Vote ) public votes;

  function vote(bytes32 asset, address update) public {
    require( isSigner(msg.sender) , "NOT A SIGNER");
    votes[msg.sender] = Vote(asset, update);
  }

  function totalSigners() public view returns (uint256) {
    return signers.length;
  }

  function signersNeeded() public view returns (uint8) {
    return uint8((signers.length * quorumNumerator) / quorumDenominator);
  }

  function isPassingVote(bytes32 asset, address update) public view returns (bool) {
    uint8 passing;
    for(uint8 s=0;s<signers.length;s++){
      if(asset == votes[signers[s]].asset && update == votes[signers[s]].update){
        passing++;
      }
    }
    return (passing >= signersNeeded());
  }

}
