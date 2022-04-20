pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./YourToken.sol";

contract YourContract is Ownable {
  using SafeMath for uint256;

  uint256 public halfLifeInSeconds;
  uint256 public convictionFactor;
  uint256 public constant TEN_THOUSAND = 10000;

  event MakeVote(uint256 voteID, address voter, uint256 amount, string vote, uint256 timestamp);

  YourToken yourToken;

  struct Vote {
    string vote;
    address voter;
    uint256 amount;
    uint256 timestampOpened;
    uint256 timestampClosed;
    bool open;
  }

  struct ConvictionRecord {
    uint256 voteID;
    string vote;
    address voter;
    uint256 value;
    bool open;
    uint256 timestampOpened;
    uint256 timestampClosed;
  }

  Vote[] public votes;

  constructor(address tokenAddress) payable {
    // what should we do on deploy?
    yourToken = YourToken(tokenAddress);
    halfLifeInSeconds = 3 days;
    convictionFactor = 1; // 0.01%
  }

  function percentage(uint _amount, uint256 _basisPoints) public pure returns (uint256) {
    require ((_amount / TEN_THOUSAND) * TEN_THOUSAND == _amount, "Amount mst be greater than 10k");
    return (_amount * _basisPoints) / TEN_THOUSAND;
  }

  function setHalfLife(uint256 _halfLifeInSeconds) external onlyOwner {
    halfLifeInSeconds = _halfLifeInSeconds;
  }

  function setConvictionFactor(uint256 _convictionFactor) external onlyOwner {
    convictionFactor = _convictionFactor;
  }

  function currentTimestamp() public view returns (uint256) {
    return block.timestamp;
  }

  function voteStatus(uint256 voteID) public view returns (bool) {
    return votes[voteID].open;
  }

  function calculateDecayAtTime(uint256 _valueAtClosing, uint256 _timestampClosed, uint256 _timestampAt) public view returns (uint256) {
    if (_timestampClosed > _timestampAt) {
      return _valueAtClosing;
    }
    uint256 deltaT = _timestampAt - _timestampClosed;
    _valueAtClosing >>= (deltaT / halfLifeInSeconds); 
    deltaT %= halfLifeInSeconds;
    return _valueAtClosing - _valueAtClosing * deltaT / halfLifeInSeconds / 2;
  }

  function calculateConvictionAtTime(uint256 _valueAtOpen, uint256 _timestampOpened, uint256 _timestampAt) public view returns (uint256) {
    uint256 deltaT = _timestampAt - _timestampOpened;
    return _valueAtOpen + (( (percentage(_valueAtOpen, convictionFactor) >> 16)  * deltaT**2) >> 2);
  }

  
  function calculateConvictionsAtTime(uint256 timeAt) public view returns (ConvictionRecord[] memory) {
      ConvictionRecord[] memory ret = new ConvictionRecord[](votes.length);
      uint256 returned = 0;
      for (uint256 i = 0; i < votes.length; i++) {
        if (votes[i].timestampOpened > timeAt) {
          continue;
        }
        
        if (votes[i].open || votes[i].timestampClosed > timeAt) {
            uint256 convictionCalculated = calculateConvictionAtTime(votes[i].amount, votes[i].timestampOpened, timeAt);
            ret[returned] = ConvictionRecord(i, votes[i].vote, votes[i].voter, convictionCalculated, true, votes[i].timestampOpened, votes[i].timestampOpened);
        } else {
            uint256 convictionCalculated = calculateConvictionAtTime(votes[i].amount, votes[i].timestampOpened, votes[i].timestampClosed);
            ret[returned] = ConvictionRecord(i, votes[i].vote, votes[i].voter, calculateDecayAtTime(convictionCalculated, votes[i].timestampClosed, timeAt), false, votes[i].timestampOpened, votes[i].timestampClosed);
        }
        returned++;
      }
      return ret;
  }

  function calculateConvictions() public view returns (ConvictionRecord[] memory) {
    return calculateConvictionsAtTime(currentTimestamp());
  }


  function vote(string memory voteString, uint256 amount) public {
    yourToken.transferFrom(msg.sender, address(this), amount);

    uint256 voteID = votes.length;
    votes.push(Vote({
      vote: voteString,
      voter: msg.sender,
      amount: amount,
      timestampOpened: block.timestamp,
      timestampClosed: block.timestamp, // will be updated when closed
      open: true
    }));

    console.log(msg.sender,voteString);
    emit MakeVote(voteID, msg.sender, amount, voteString, block.timestamp);
  }

  function withdraw(uint256 voteID) public {
    require(votes[voteID].voter == msg.sender, "not your vote");
    require(votes[voteID].open, "not open");
    
    votes[voteID].open = false;
    votes[voteID].timestampClosed = block.timestamp;

    yourToken.transfer(msg.sender, votes[voteID].amount);
  }

}
