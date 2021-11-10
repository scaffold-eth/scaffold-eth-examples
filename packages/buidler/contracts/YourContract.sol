pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";
import "./TestDai.sol";

contract YourContract {

  string public purpose = "🛠 Programming Unstoppable Money";

  function setPurpose(string memory newPurpose) public {
    purpose = newPurpose;
    console.log(msg.sender,"set purpose to",purpose);
  }

  function doIt(address token,address sender, address recipient, uint256 amount) public {
    TestDai tokey = TestDai(token);
    tokey.transferFrom(sender,recipient,amount);
  }

}
