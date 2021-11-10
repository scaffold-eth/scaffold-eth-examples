pragma solidity >=0.6.0 <0.7.0;

contract HoneyPot {
  function log(address _caller, uint _amount, string memory _action) public {
    if (equal(_action, "Withdraw")) {
      revert("It's a trap");
    }
  }

  function equal(string memory _a, string memory _b) public pure returns (bool) {
    return keccak256(abi.encode(_a)) == keccak256(abi.encode(_b));
  }
}