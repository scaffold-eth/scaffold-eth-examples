pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";

contract Attestor {

  mapping (address => string) public attestations;

  function attest(string memory hash) public {
    console.log(msg.sender,"attests to",hash);
    emit Attest(msg.sender,hash);
    attestations[msg.sender] = hash;
  }
  event Attest(address sender, string hash);

}
