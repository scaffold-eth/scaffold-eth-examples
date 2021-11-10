pragma solidity 0.8.0;
//SPDX-License-Identifier: MIT
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "hardhat/console.sol";

contract MVPC {

  constructor() public { }

  mapping (address => uint256) public nonce;

  enum Status {
    Null,
    Open,
    Closed
  }

  struct Session {
      Status status;
      address owner;
      address signer;
      address payable destination;
      uint256 timeout;
      uint256 stake;
  }

  mapping (bytes32 => Session) public sessions;

  function getStatus(bytes32 id) external view returns (Status) {
    return sessions[id].status;
  }
  //keep track of leftover funds

  function getSession(bytes32 id) public view returns (Session memory) {
    Session memory session = sessions[id];
    return session;
  }

  //signer can open a session by sending some ETH
  function open(address signer, address payable destination, uint256 timeout) public payable {
    //generate a unique id for the stake
    bytes32 id = keccak256(abi.encodePacked(address(this),signer,destination,timeout,nonce[signer]++));
    //make sure this stake doesn't already exist
    require(sessions[id].status==Status.Null,"MVPC::open: Session already exists");
    //you can use remainder funds from previous sessions
    uint256 value = msg.value;
    //create session and open it
    sessions[id] = Session({
      status: Status.Open,
      owner: msg.sender,
      signer: signer,
      destination: destination,
      timeout: block.timestamp+timeout,
      stake: value
    });
    //emit event to let the frontend know
    emit Open(id,msg.sender,signer,destination,timeout,value);
  }
  event Open(bytes32 id, address indexed owner, address indexed signer, address payable indexed destination, uint256 timeout, uint256 amount);

  //offchain function to get the hash to make less work in the frontend
  function getHash(bytes32 id, uint256 value) public view returns (bytes32) {
    return keccak256(abi.encodePacked(address(this),id,value));
  }

  //the receiver can sign the signed message and submit it to collect and close
  function close(bytes32 id, uint256 value, bytes memory signature, bytes memory receiverSignature) public {
    //make sure the session exists, and is open
    require(sessions[id].status==Status.Open,"MVPC::close: Session is not open");
    //make sure the block number is after the timeout (actually, not needed right? only for withdrawl)
    //require(sessions[id].timeout<=block.number,"MVPC::close: Block number is greater than timeout (session is not done yet)");
    //get the hash, signer, receiverSigner
    bytes32 sessionHash = getHash(id,value);
    address signer = getSigner(sessionHash,signature);
    address receiverSigner = getSigner(sessionHash,receiverSignature);
    //make sure the signer is correct
    require(sessions[id].signer==signer,"MVPC::close: Signer is not correct");
    //make sure the receiver sig is correct
    require(sessions[id].destination==receiverSigner,"MVPC::close: receiver Signer is not correct");
    //close the session to avoid reentrance etc
    sessions[id].status = Status.Closed;
    //never send more than the max amount entered
    uint256 smallestValue = sessions[id].stake;
    sessions[id].destination.transfer(value);
    payable(sessions[id].owner).transfer(smallestValue - value);
    //emit event to let the frontend know
    emit Close(id,sessions[id].owner,sessions[id].signer,sessions[id].destination,smallestValue);
  }
  event Close(bytes32 id, address indexed owner, address indexed signer, address indexed destination, uint256 amount);


  //provide a method for receiver to check the sigs as they come in
  function isSignatureValid(bytes32 id, uint256 value, bytes memory signature) external view returns (bool) {
    //make sure session is open
    if(sessions[id].status!=Status.Open) return false;
    //make sure signature of hash is valid
    bytes32 sessionHash = getHash(id,value);
    address signer = getSigner(sessionHash,signature);
    if(sessions[id].signer!=signer) return false;
    //make sure there is enough value staked
    if(sessions[id].stake<value) return false;
    return true;
  }

  //let the signer withdraw remainders (and optionally close timed out sessions)
  function withdraw(bytes32 optionalId) public {
    require(sessions[optionalId].status == Status.Open, "Session is closed already");
    require(msg.sender == sessions[optionalId].owner, "Only owner can withdraw");
    sessions[optionalId].status = Status.Closed;
    emit Close(optionalId,sessions[optionalId].owner,sessions[optionalId].signer,sessions[optionalId].destination,0);
    //then send amount totoAddress
    payable(msg.sender).transfer(sessions[optionalId].stake);
    //emit event to let the frontend know
    emit Withdraw(sessions[optionalId].stake,optionalId);
  }
  event Withdraw(uint256 amount,bytes32 optionalId);


  function getSigner(bytes32 _hash, bytes memory _signature) internal pure returns (address){
    bytes32 r;
    bytes32 s;
    uint8 v;
    if (_signature.length != 65) {
      return address(0);
    }
    assembly {
      r := mload(add(_signature, 32))
      s := mload(add(_signature, 64))
      v := byte(0, mload(add(_signature, 96)))
    }
    if (v < 27) {
      v += 27;
    }
    if (v != 27 && v != 28) {
      return address(0);
    } else {
      return ecrecover(keccak256(
        abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
      ), v, r, s);
    }
  }


}

