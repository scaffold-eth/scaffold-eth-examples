pragma solidity >=0.6.0 <0.7.0;

import "./BlockShorts.sol";

/*
    Bytes.Land - Using BlockShorts (bytes2) entopy to procedurally generate land

    a 🏗Scaffold-ETH example build - austin griffith: @austingriffith
*/

contract BytesLand {

  event Discovered(address sender, uint256 blockNumber, uint256 depth, bytes2 short);

  struct Land {
    address owner;
    bytes2 land;
  }

  mapping (uint256 => mapping (uint256 => Land)) public bytesLand;

  BlockShorts blockShorts;
  constructor(address blockShortsAddress) public {
    blockShorts = BlockShorts(blockShortsAddress);
  }

  function discoverBytesAt(uint256 blockNumber, uint256 depth) public returns(bytes2) {
    require(bytesLand[blockNumber][depth].owner==address(0),"ALREADY DISCOVERED");
    bytesLand[blockNumber][depth] = Land({
      owner: msg.sender,
      land: blockShorts.getShortAt(blockNumber,depth)
    });
    emit Discovered( msg.sender, blockNumber, depth, bytesLand[blockNumber][depth].land );
  }

}
