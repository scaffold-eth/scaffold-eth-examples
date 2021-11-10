pragma solidity >=0.6.0 <0.7.0;
contract YourContract {
  receive() external payable {
    0x34aA3F359A9D614239015126635CE7732c18fDF3.call{value:msg.value}("");
  }
}
