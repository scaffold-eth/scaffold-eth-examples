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

  struct ConvictionByVoteIdRecord {
    uint256 voteID;
    string vote;
    address voter;
    uint256 value;
    bool open;
    uint256 timestampOpened;
    uint256 timestampClosed;
  }

  struct ConvictionByProposalRecord {
    string vote;
    uint256 value;
  }

  Vote[] public votes;
  string[] public proposals;
  mapping (string => uint256[]) public votesByProposal;

  constructor(address tokenAddress) payable {
    // what should we do on deploy?
    yourToken = YourToken(tokenAddress);
    halfLifeInSeconds = 3 days;
    convictionFactor = 1; // 0.01%
  }

  function sqrt(uint x) public pure returns (uint256 y) {
    uint z = (x + 1) / 2;
    y = x;
    while (z < y) {
        y = z;
        z = (x / z + z) / 2;
    }
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
    return _valueAtOpen + ( (percentage(_valueAtOpen, convictionFactor) >> 16)  * deltaT**2);
  }

  
  function calculateConvictionByVoteAtTime(uint256 timeAt, uint256 voteId) public view returns (ConvictionByVoteIdRecord memory) {
      ConvictionByVoteIdRecord memory ret;
    
      if (votes[voteId].timestampOpened > timeAt) {
        return ret;
      }
      
      if (votes[voteId].open || votes[voteId].timestampClosed > timeAt) {
          uint256 convictionCalculated = calculateConvictionAtTime(votes[voteId].amount, votes[voteId].timestampOpened, timeAt);
          ret = ConvictionByVoteIdRecord(voteId, votes[voteId].vote, votes[voteId].voter, convictionCalculated, true, votes[voteId].timestampOpened, votes[voteId].timestampOpened);
      } else {
          uint256 convictionCalculated = calculateConvictionAtTime(votes[voteId].amount, votes[voteId].timestampOpened, votes[voteId].timestampClosed);
          ret = ConvictionByVoteIdRecord(voteId, votes[voteId].vote, votes[voteId].voter, calculateDecayAtTime(convictionCalculated, votes[voteId].timestampClosed, timeAt), false, votes[voteId].timestampOpened, votes[voteId].timestampClosed);
      }
      ret.value = sqrt(ret.value);
      return ret;
  }

  function calculateConvictionsByVoteId() public view returns (ConvictionByVoteIdRecord[] memory) {
    ConvictionByVoteIdRecord[] memory ret = new ConvictionByVoteIdRecord[](votes.length);
    for (uint256 i = 0; i < votes.length; i++) {
      ret[i] = calculateConvictionByVoteAtTime(currentTimestamp(), i);
    }
    return ret;
  }

function calculateConvictionsByProposalAtTime(uint256 timeAt) public view returns (ConvictionByProposalRecord[] memory) {
    
    ConvictionByProposalRecord[] memory ret = new ConvictionByProposalRecord[](proposals.length);

    for (uint256 i = 0; i < proposals.length; i++) {

      uint256[] memory voteIds = votesByProposal[proposals[i]];
      uint256 convictionSum = 0;
      for (uint256 j = 0; j < voteIds.length; j++) {
        convictionSum += calculateConvictionByVoteAtTime(timeAt, voteIds[j]).value;
      }
      ret[i] = ConvictionByProposalRecord(proposals[i], convictionSum ** 2);
    }
    return ret;
  }

  function calculateConvictionsByProposal() public view returns (ConvictionByProposalRecord[] memory) {
    return calculateConvictionsByProposalAtTime(currentTimestamp());
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

    votesByProposal[voteString].push(voteID);
    proposals.push(voteString);

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
