pragma solidity >=0.6.6 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MVPCLR is Ownable {

  uint256 public roundStart;
  uint256 public immutable roundDuration;
  uint256 public recipientCount = 0;

  event RoundStarted(uint256 roundStart, uint256 roundDuration);
  event RecipientAdded(address addr, bytes32 data, string link, uint256 index);
  event Donate(address origin, address sender, uint256 value, uint256 index);
  event MatchingPoolDonation(address sender, uint256 value);
  event Distribute(address to, uint256 index, uint256 amount);

  modifier beforeRoundOpen() {
    require(roundStart == 0, "MVPCLR:beforeRoundOpen - Round already opened");
    _;
  }

  modifier isRoundOpen() {
    require(
      getBlockTimestamp() < (roundStart + roundDuration),
      "MVPCLR:isRoundOpen - Round is not open"
    );
    _;
  }

  modifier isRoundClosed() {
    require(
      roundStart != 0 &&
      getBlockTimestamp() >= (roundStart + roundDuration),
      "MVPCLR:isRoundClosed Round is not closed"
    );
    _;
  }

  constructor(uint256 _roundDuration) public {
    require(_roundDuration < 31536000,"MVPCLR: round duration too long");
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

  function addRecipient(address payable addr, bytes32 data, string memory link)
  public
  onlyOwner
  beforeRoundOpen
  {
    emit RecipientAdded(addr, data, link, recipientCount++);
  }

  function donate(uint256 index) public payable isRoundOpen {
    require(index<recipientCount, "CLR:donate - Not a valid recipient");
    emit Donate(tx.origin, _msgSender(), msg.value, index);
  }

  function distribute(address payable to, uint256 index, uint256 amount)
  external
  onlyOwner
  isRoundClosed
  {
    to.transfer(amount);
    emit Distribute(to,index,amount);
  }


  // receive donation for the matching pool
  receive() external payable {
    require(roundStart == 0 || getBlockTimestamp() < roundStart + roundDuration, "CLR:receive closed");
    emit MatchingPoolDonation(_msgSender(), msg.value);
  }

}
