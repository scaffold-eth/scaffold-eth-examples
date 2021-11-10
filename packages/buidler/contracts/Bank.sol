// SPDX-License-Identifier: MIT
// started from https://solidity-by-example.org/0.6/app/multi-sig-wallet/ and cleaned out a bunch of stuff
// grabbed recover stuff from bouncer-proxy: https://github.com/austintgriffith/bouncer-proxy/blob/master/BouncerProxy/BouncerProxy.sol
// after building this I found https://github.com/christianlundkvist/simple-multisig/blob/master/contracts/SimpleMultiSig.sol which is amazing and he even has the duplicate guard the same (Scott B schooled me on that!)
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

contract Bank {

    event Deposit(address indexed sender, uint amount, uint balance);
    event ExecuteTransaction( address indexed owner, address payable to, uint256 value, bytes data, uint256 nonce, bytes32 hash, bytes result);
    event Owner( address indexed owner, bool added);

    mapping(address => bool) public isOwner;
    uint public signaturesRequired;
    uint public nonce;

    event OpenStream( address indexed to, uint256 amount, uint256 frequency );
    event CloseStream( address indexed to );
    event Withdraw( address indexed to, uint256 amount );

    struct Stream {
        uint256 amount;
        uint256 frequency;
        uint256 last;
    }
    mapping(address => Stream) public streams;

    function streamWithdraw() public {
        require(streams[msg.sender].amount>0,"withdraw: no open stream");
        _streamWithdraw(msg.sender);
    }

    function _streamWithdraw(address payable to) private {
        uint256 totalAmountCanWithdraw = streamBalance(to);
        streams[to].last = block.timestamp;
        to.transfer(totalAmountCanWithdraw);
    }

    function streamBalance(address to) public view returns (uint256){
      return (streams[to].amount * (block.timestamp-streams[to].last)) / streams[to].frequency;
    }

    constructor(address[] memory _owners, uint _signaturesRequired) public {
        require(_signaturesRequired>0,"constructor: must be non-zero sigs required");
        signaturesRequired = _signaturesRequired;
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner!=address(0), "constructor: zero address");
            require(!isOwner[owner], "constructor: owner not unique");
            isOwner[owner] = true;
            emit Owner(owner,isOwner[owner]);
        }
    }

    modifier onlySelf() {
        require(msg.sender == address(this), "Not Self");
        _;
    }

    function addSigner(address newSigner, uint256 newSignaturesRequired) public onlySelf {
        require(newSigner!=address(0), "addSigner: zero address");
        require(!isOwner[newSigner], "addSigner: owner not unique");
        require(newSignaturesRequired>0,"addSigner: must be non-zero sigs required");
        isOwner[newSigner] = true;
        signaturesRequired = newSignaturesRequired;
        emit Owner(newSigner,isOwner[newSigner]);
    }

    function removeSigner(address oldSigner, uint256 newSignaturesRequired) public onlySelf {
        require(isOwner[oldSigner], "removeSigner: not owner");
        require(newSignaturesRequired>0,"removeSigner: must be non-zero sigs required");
        isOwner[oldSigner] = false;
        signaturesRequired = newSignaturesRequired;
        emit Owner(oldSigner,isOwner[oldSigner]);
    }

    function openStream(address to, uint256 amount, uint256 frequency) public onlySelf {
        require(streams[to].amount==0,"openStream: stream already open");
        require(amount>0,"openStream: no amount");
        require(frequency>0,"openStream: no frequency");

        streams[to].amount = amount;
        streams[to].frequency = frequency;
        streams[to].last = block.timestamp;

        emit OpenStream( to, amount, frequency );
    }

    function closeStream(address to) public onlySelf {
        require(streams[to].amount>0,"closeStream: stream already closed");
        _streamWithdraw(address(uint160(to)));
        delete streams[to];
        emit CloseStream( to );
    }

    function updateSignaturesRequired(uint256 newSignaturesRequired) public onlySelf {
        require(newSignaturesRequired>0,"updateSignaturesRequired: must be non-zero sigs required");
        signaturesRequired = newSignaturesRequired;
    }

    function getTransactionHash( uint256 _nonce, address to, uint256 value, bytes memory data ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this),_nonce,to,value,data));
    }

    function executeTransaction( address payable to, uint256 value, bytes memory data, bytes[] memory signatures)
        public
        returns (bytes memory)
    {
        require(isOwner[msg.sender], "executeTransaction: only owners can execute");
        bytes32 _hash =  getTransactionHash(nonce, to, value, data);
        nonce++;
        uint256 validSignatures;
        address duplicateGuard;
        for (uint i = 0; i < signatures.length; i++) {
            address recovered = recover(_hash,signatures[i]);
            require(recovered>duplicateGuard, "executeTransaction: duplicate or unordered signatures");
            duplicateGuard = recovered;
            if(isOwner[recovered]){
              validSignatures++;
            }
        }

        require(validSignatures>=signaturesRequired, "executeTransaction: not enough valid signatures");

        (bool success, bytes memory result) = to.call{value: value}(data);
        require(success, "executeTransaction: tx failed");

        emit ExecuteTransaction(msg.sender, to, value, data, nonce-1, _hash, result);
        return result;
    }

    function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        // Divide the signature in r, s and v variables (spends extra gas, you could split off-chain)
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        return ecrecover(keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
        ), v, r, s);
    }

    receive() payable external {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

}
