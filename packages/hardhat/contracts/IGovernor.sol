pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

interface IGovernor {
  function denominator() external view returns(uint256);
  function recipientsLength() external view returns(uint8 count);
  function getRatios() external view returns(uint8[] memory);
  function getRecipients() external view returns(address[] memory);
}
