pragma solidity >=0.6.0 <0.7.0;

/*

    BlockShorts - Ephemeral shorts of on-chain entopy-ish that is more
                  expensive the deeper you go into any given block

    get a short (bytes2) of entropy-ish (blockhashes can be f'ed with) from
    mined Ethereum blocks for procedurally generating something?

    You can only look back 256 blocks on-chain to get the blockhash and
    then it turns back to 0x0

    You have to generate consecutive hashes to go deeper and deeper
    into a specific blockhash for more entropy so it costs more gas!

    by austin griffith: @austingriffith

*/


contract BlockShorts {

  function getShortAt(uint256 blockNumber, uint256 depth) public view returns(bytes2) {
    bytes32 hashAtDepth = blockHashAtDepth( blockNumber, depth/16 );
    uint256 indexOffset = depth%16*2;
    return bytes2(hashAtDepth[indexOffset]) | ( bytes2(hashAtDepth[indexOffset+1]) >> 8 );
  }

  function blockHashAtDepth(uint256 blockNumber, uint256 depth) public view returns(bytes32) {
    bytes32 blockHash = blockhash(blockNumber);
    require(blockHash!=0x0000000000000000000000000000000000000000000000000000000000000000,"BLOCKHASH EMPTY");
    uint256 hashesDeep = depth;
    while(hashesDeep>0){
      blockHash = keccak256(abi.encodePacked(blockHash));
      hashesDeep--;
    }
    return blockHash;
  }

}
