pragma solidity >=0.6.0 <0.9.0;

import "./MoodToken.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable
{
	using SafeMath for uint256;

	/* EVENTS  */
	event voteCasted(address voter, uint256 pollID, bool vote, uint256 weight);
	event pollCreated(address creator, uint256 pollID, string description, uint256 votingLength);
	event pollStatusUpdate(uint256 pollID, PollStatus status);

	/* Determine the current state of a poll */
	enum PollStatus { IN_PROGRESS, PASSED, REJECTED }

	/* POLL */
	struct Poll
	{
		uint256 yeaVotes;
		uint256 nayVotes;
		uint256 expirationTimeInDays;
		string description;
		string leftEmoji;
		string rightEmoji;
		PollStatus status;
		address creator;
		address[] voters;
		mapping(address => Voter) voterInfo;
	}

	/* VOTER */
	struct Voter
	{
		bool hasVoted;
		bool vote;
		uint256 weight;
	}

	/* TOKEN MANAGER */
	struct TokenManager
	{
		uint256 tokenBalance;
		uint256[] participatedPolls;
		mapping(uint256 => uint256) lockedTokens;
	}

	uint256 public pollCount;
	mapping(uint256 => Poll) public polls;
	mapping(address => TokenManager) public bank;
	MoodToken public token;

	constructor(address _token) public
	{
		require(_token != address(0) );
		token = MoodToken(_token);

	}

	/* POLL OPERATIONS */

	/*
	 * Creates a new poll.
	 */
	function createPoll(string calldata _description, uint256 _voteDurationInDays, string calldata leftEmoji, string calldata rightEmoji) external onlyOwner returns (uint256)
	{
		require(_voteDurationInDays > 0, "The voting period cannot be 0.");
		pollCount++;

		Poll storage curPoll = polls[pollCount];
		curPoll.creator = owner();
		curPoll.status = PollStatus.IN_PROGRESS;
		curPoll.expirationTimeInDays = now + _voteDurationInDays * 1 days;
		curPoll.description = _description;
		curPoll.leftEmoji = leftEmoji;
		curPoll.rightEmoji = rightEmoji;

		emit pollCreated(owner(), pollCount, _description, _voteDurationInDays);
		return pollCount;
	}

	/*
	 * Ends a poll. Only the creator of a given poll can end that poll.
	 */
	function endPoll(uint256 _pollID) external onlyOwner validPoll(_pollID)
	{
		require(polls[_pollID].status == PollStatus.IN_PROGRESS, "Poll has already ended.");
		require(now >= getPollExpirationTime(_pollID), "Voting period has not expired");

		if (polls[_pollID].yeaVotes > polls[_pollID].nayVotes)
		{
			polls[_pollID].status = PollStatus.PASSED;
		}
		else
		{
			polls[_pollID].status = PollStatus.REJECTED;
		}

		updateTokenBank(_pollID);
		emit pollStatusUpdate(_pollID, polls[_pollID].status);
	}

	/* GETTERS */
	function getPollDisplayData(uint256 _pollID) public view validPoll(_pollID) returns (string memory, string memory, string memory, uint, uint) {
		return (polls[_pollID].description, polls[_pollID].leftEmoji, polls[_pollID].rightEmoji, polls[_pollID].yeaVotes, polls[_pollID].nayVotes );
	}

	/*
	 * Gets the status of a poll.
	 */
	function getPollStatus(uint256 _pollID) public view validPoll(_pollID) returns (PollStatus)
	{
		return polls[_pollID].status;
	}

	/*
	 * Gets the expiration date of a poll.
	 */
	function getPollExpirationTime(uint256 _pollID) public view validPoll(_pollID) returns (uint256)
	{
		return polls[_pollID].expirationTimeInDays;
	}

	/*
	 * Gets the complete list of polls a user has voted in.
	 */
	function getPollHistory(address _voter) public view returns(uint256[] memory)
	{
		return bank[_voter].participatedPolls;
	}

	/*
	 * Gets a voter's vote and weight for a given expired poll.
	 */
	function getPollInfoForVoter(uint256 _pollID, address _voter) public view validPoll(_pollID) returns (bool, uint256)
	{
		require(getPollStatus(_pollID) != PollStatus.IN_PROGRESS);
		require(getIfUserHasVoted(_pollID, _voter));
		Poll storage curPoll = polls[_pollID];
		bool vote = curPoll.voterInfo[_voter].vote;
		uint256 weight = curPoll.voterInfo[_voter].weight;
		return (vote, weight);
	}

	/*
	 * Gets all the voters of a poll.
	 */
	function getVotersForPoll(uint256 _pollID) public view validPoll(_pollID) returns (address[] memory)
	{
		require(getPollStatus(_pollID) != PollStatus.IN_PROGRESS);
		return polls[_pollID].voters;
	}

		/*
	 * Gets the amount of Voting Tokens that are locked for a given voter.
	 */

	function getLockedAmount(address _voter) public view returns (uint256)
	{
		TokenManager storage manager = bank[_voter];
		uint256 largest;
		for (uint256 i = 0; i < manager.participatedPolls.length; i++)
		{
			uint256 curPollID = manager.participatedPolls[i];
			if (manager.lockedTokens[curPollID] > largest)
				largest = manager.lockedTokens[curPollID];
		}
		return largest;
	}

	/*
	 * Gets the amount of Voting Credits for a given voter.
	 */
	function getTokenStake(address _voter) public view returns(uint256)
	{
		return bank[_voter].tokenBalance;
	}

	/*
	 * Checks if a user has voted for a specific poll.
	 */
	function getIfUserHasVoted(uint256 _pollID, address _user) public view validPoll(_pollID) returns (bool)
	{
		return (polls[_pollID].voterInfo[_user].hasVoted);
	}

	/*
	 * Modifier that checks for a valid poll ID.
	 */
	modifier validPoll(uint256 _pollID)
	{
		require(_pollID > 0 && _pollID <= pollCount, "Not a valid poll Id.");
		_;
	}

	/* VOTE OPERATIONS */

	/*
	 * Casts a vote for a given poll.
	 * NOTE: _weight is denominated in *wei*.
	 */
	function castVote(uint256 _pollID, bool _vote, uint256 _weight) external validPoll(_pollID)
	{
		require(getPollStatus(_pollID) == PollStatus.IN_PROGRESS, "Poll has expired.");
		require(!getIfUserHasVoted(_pollID, msg.sender), "User has already voted.");
		require(getPollExpirationTime(_pollID) > now);
		require(getTokenStake(msg.sender) >= _weight, "User does not have enough staked tokens.");

		// update token bank
		bank[msg.sender].lockedTokens[_pollID] = _weight;
		bank[msg.sender].participatedPolls.push(_pollID);

		Poll storage curPoll = polls[_pollID];

		curPoll.voterInfo[msg.sender] = Voter({
				hasVoted: true,
				vote: _vote,
				weight: _weight
		});

		if(_vote)
		{
			curPoll.yeaVotes += _weight;
		}
		else
		{
			curPoll.nayVotes += _weight;
		}
		curPoll.voters.push(msg.sender);
		emit voteCasted(msg.sender, _pollID, _vote, _weight);
	}

	/* TOKEN OPERATIONS */

	/*
	 * Stakes tokens for a given voter in return for voting credits.
	 * NOTE:
	 *  User must approve transfer of tokens.
	 *  _numTokens is denominated in *wei*.
	 */
	function stakeVotingTokens(uint256 _numTokens) external
	{
		require(token.balanceOf(msg.sender) >= _numTokens, "User does not have enough tokens");
		require(token.transferFrom(msg.sender, address(this), _numTokens), "User did not approve token transfer.");
		bank[msg.sender].tokenBalance += _numTokens;
	}

	/*
	 * Allows a voter to withdraw voting tokens after a poll has ended.
	 * NOTE: _numTokens is denominated in *wei*.
	 */
	function withdrawTokens(uint256 _numTokens) external
	{
		uint256 largest = getLockedAmount(msg.sender);
		require(getTokenStake(msg.sender) - largest >= _numTokens, "User is trying to withdraw too many tokens.");
		bank[msg.sender].tokenBalance -= _numTokens;
		require(token.transfer(msg.sender, _numTokens));
	}

	/*
	 * Helper function that updates active token balances after a poll has ended.
	 */
	function updateTokenBank(uint256 _pollID) internal
	{
		Poll memory curPoll = polls[_pollID];
		for (uint256 i = 0; i < curPoll.voters.length; i++)
		{
			address voter = curPoll.voters[i];
			bank[voter].lockedTokens[_pollID] = 0;
		}
	}
}