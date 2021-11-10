pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IGovernor.sol";

contract Governor is IGovernor, Ownable{

  event AllocationSet( address[] recipients, uint8[] ratios );

  uint256 public override denominator;
  address[] public recipients;
  uint8[] public ratios;

  constructor(address newOwner, address[] memory _recipients,uint8[] memory _ratios) public {
    setAllocation( _recipients, _ratios );
    transferOwnership( newOwner );
  }

  function getRatios() public view override returns(uint8[] memory) {
    return ratios;
  }

  function getRecipients() public view override returns(address[] memory) {
    return recipients;
  }

  function setAllocation( address[] memory _recipients, uint8[] memory _ratios ) public onlyOwner {
    require( _recipients.length > 0 ,"Not enough wallets");
    require( _recipients.length < 256 ,"Too many wallets");
    require( _recipients.length == _ratios.length ,"Wallet and Ratio length not equal");
    recipients = _recipients;
    ratios = _ratios;
    uint256 localDenominator = 0;
    for(uint256 i = 0; i < _recipients.length; i++){
      require(_recipients[i]!=address(this),"Contract cant be recipient");
      localDenominator+=_ratios[i];
    }
    denominator = localDenominator;
    emit AllocationSet(_recipients,_ratios);
  }

  function recipientsLength() public view override returns(uint8 count) {
      return uint8(recipients.length);
  }

}
