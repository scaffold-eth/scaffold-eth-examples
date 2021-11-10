pragma solidity >=0.6.6 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Supporters.sol";

contract MVPCLR is Ownable {
  using SafeMath for uint256;

  Supporters public supporters;

  struct Recipient {
    address payable addr;
    // could be name or hash of other useful information
    bytes32 data;
    //track donors so we can iterate through mapping
    address[] donors;
    uint256[] amounts;
    // matchingWeight = sumOfSqrtDonation * sumOfSqrtDonation
    // matching = matchingPool * matchingWeight / totalMatchingWeight
    uint256 matchingWeight;
    bool withdrawn;
  }
  mapping ( uint256 => mapping ( address => uint256 ) ) public donations;

  Recipient[] public recipients;

  uint256 public matchingPool;

  uint256 public roundStart;
  uint256 public roundDuration;
  // used to calculate matching
  uint256 public calculatedToIndex;
  uint256 public totalMatchingWeight;

  event RoundStarted(uint256 roundStart, uint256 roundDuration);
  event RecipientAdded(address addr, bytes32 data, uint256 index);
  event Donate(address sender, uint256 value, uint256 index);
  event MatchingPoolDonation(address sender, uint256 value, uint256 total);
  event MatchingCalculated();
  event Withdraw(address to, uint256 index, uint256 matched, uint256 total);

  modifier beforeRoundOpen() {
    require(roundStart == 0, "Round already opened");
    _;
  }

  modifier isRoundOpen() {
    require(
      getBlockTimestamp() < roundStart.add(roundDuration),
      "Round is not open"
    );
    _;
  }

  modifier isRoundClosed() {
    require(
      roundStart != 0 &&
      getBlockTimestamp() >= roundStart.add(roundDuration),
      "Round is not closed"
    );
    _;
  }

  constructor(address _supporters, uint256 _roundDuration) public {
    supporters = Supporters(_supporters);
    roundDuration = _roundDuration;
  }

  function startRound()
  public
  onlyOwner
  beforeRoundOpen
  {
    roundStart = getBlockTimestamp();
    emit RoundStarted(roundStart, roundDuration);
  }

  function getBlockTimestamp() public view returns (uint256) {
    return block.timestamp;
  }

  function addRecipient(address payable addr, bytes32 data)
  public
  onlyOwner
  beforeRoundOpen
  returns (uint256)
  {
    address[] memory emptyDonors;
    uint256[] memory emptyAmounts;

    Recipient memory recipient = Recipient({
      addr: addr,
      data: data,
      donors: emptyDonors,
      amounts: emptyAmounts,
      matchingWeight: 0,
      withdrawn: false
    });
    recipients.push(recipient);

    uint256 index = recipients.length - 1;
    emit RecipientAdded(addr, data, index);
    return index;
  }

  function sumOfSqrtDonation(uint256 index) public view returns (uint256){
    uint256 sum;
    for(uint256 i=0;i<recipients[index].amounts.length;i++){
      sum = sum.add(sqrt(recipients[index].amounts[i]));
    }
    return sum;
  }

  function totalDonations(uint256 index) public view returns (uint256){
    uint256 sum;
    for(uint256 i=0;i<recipients[index].amounts.length;i++){
      sum = sum.add(recipients[index].amounts[i]);
    }
    return sum;
  }

  function donate(uint256 index) public payable isRoundOpen {
    if (!supporters.isSupporter(_msgSender())) revert("You are not allowed to donate.");

    uint256 previousDonor = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    for(uint256 i=0;i<recipients[index].donors.length;i++){
      if(_msgSender()==recipients[index].donors[i]){
        previousDonor = i;
        break;
      }
    }

    if(previousDonor != 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff){
      recipients[index].amounts[previousDonor] += msg.value;
    }else{
      recipients[index].donors.push(msg.sender);
      recipients[index].amounts.push(msg.value);
    }

    emit Donate(_msgSender(), msg.value, index);
  }

  // this function could be run in multiple steps paying attention to msg.gas (remaining gas)
  function calculateMatching(uint256 toIndex) public isRoundClosed {
    require(
      calculatedToIndex < recipients.length,
      "CLR:calculate already finished calculating"
    );

    if (toIndex > recipients.length) {
      toIndex = recipients.length;
    }

    for (uint256 i = calculatedToIndex; i < toIndex; i++) {
      uint256 thisSumOfSqrtDonation = sumOfSqrtDonation(i);
      recipients[i].matchingWeight = thisSumOfSqrtDonation.mul(thisSumOfSqrtDonation);
      totalMatchingWeight = totalMatchingWeight.add(recipients[i].matchingWeight);
    }

    calculatedToIndex = toIndex;
    if (calculatedToIndex >= recipients.length) {
      emit MatchingCalculated();
    }
  }

  function matching(uint256 index) public view returns (uint256) {
    return (matchingPool * recipients[index].matchingWeight) / totalMatchingWeight;
  }

  function recipientWithdraw(uint256 index)
  public
  isRoundClosed
  returns (uint256)
  {
    require(
      calculatedToIndex >= recipients.length,
      "CLR:withdraw not finished calculating yet"
    );
    require(!recipients[index].withdrawn, "CLR:withdraw already withdrawn");

    recipients[index].withdrawn = true;

    // TODO: I'm not sure this adds up to the contract's balance
    uint256 matched = matching(index);
    uint256 total = totalDonations(index).add(matched);
    if(total>0){
      recipients[index].addr.transfer(total);
    }
    emit Withdraw( recipients[index].addr, index, matched, total );
    return total;
  }

  function distributeWithdrawal() external {
    for(uint256 i=0;i<recipients.length;i++){
      recipientWithdraw(i);
    }
  }

  // receive donation for the matching pool
  receive() external payable {
    require(roundStart == 0 || getBlockTimestamp() < roundStart.add(roundDuration), "CLR:receive closed");
    matchingPool = matchingPool.add(msg.value);
    emit MatchingPoolDonation(_msgSender(), msg.value, address(this).balance);
  }


  function sqrt(uint256 x) internal pure returns (uint256) {
    uint256 z = (x + 1) / 2;
    uint256 y = x;
    while (z < y) {
      y = z;
      z = (x / z + z) / 2;
    }
    return y;
  }
}
