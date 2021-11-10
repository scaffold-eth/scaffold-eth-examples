pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";
import "./AllowList.sol";

contract YourContract {

  event SetPurpose(address sender, string purpose);

  string public purpose = "🛠 Programming Unstoppable Money";

  AllowList allowList;

  constructor(address allowListAddress) public {
    allowList = AllowList(allowListAddress);
  }

  function setPurpose(string memory newPurpose) public {
    require( allowList.isAllowed(msg.sender), "now allowed" );
    purpose = newPurpose;
    console.log(msg.sender,"set purpose to",purpose);
    emit SetPurpose(msg.sender, purpose);
  }

}
