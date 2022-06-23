// SPDX-License-Identifier: MIT

// Off-chain signature multisig wallet, used in Growic Solidity Project
// Based in 🏗️ scaffold-eth - meta-multi-sig-wallet example https://github.com/scaffold-eth/scaffold-eth-examples/tree/streaming-meta-multi-sig

pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol"; //Eliptic curve cryptography OpenZeppelin library
import "hardhat/console.sol";

contract MetaMultiSigWallet {
    using ECDSA for bytes32;

    //Events definition
    event Deposit(address indexed sender, uint amount, uint balance); //to register deposits done in the contract
    event ExecuteTransaction(address indexed owner, address payable to, uint256 value, bytes data, uint256 nonce, bytes32 hash, bytes result ); //to register executed transaction
    event Owner(address indexed owner, bool added); //to register addition or removal of owners

    //storage structure
    mapping(address => bool) public isOwner; //contains enable or disable owners
    uint256 public signaturesRequired; //number of signatures that is necesary to be valid to execute Tx
    uint256 public nonce; //to make evey transaction unique and non reusable
    uint256 public chainId; //to make transactions only valid in the current chain

    //modifiers
    modifier onlySelf() {
        require(msg.sender == address(this), "Not Self");
        _;
    }

    constructor(uint256 _chainId, address[] memory _owners, uint256 _signaturesRequired ) {
        require(_signaturesRequired > 0, "Constructor: must be non-zero sigs required");
        signaturesRequired = _signaturesRequired;

        uint256 _ownerslength = _owners.length; //gas optimitzation short circuit

        //iteration to register every owner
        for (uint256 i = 0; i < _ownerslength; ) {
            address owner = _owners[i]; //gas opptimitzation caching array elements
            require( owner != address(0), "Constructor: address zero cannot be owner");
            require(!isOwner[owner], "Constructor: new owner is owner already");
            isOwner[owner] = true;
            emit Owner(owner, isOwner[owner]);
            unchecked {
                //gas optimitzation, do not check under/overflow
                ++i;
            }
        }
        chainId = _chainId;
    }
    /*
    //uncomment this block to enable ownership control functions.
    function addSigner(address newSigner, uint256 newSignaturesRequired) public onlySelf {
        require(newSigner != address(0), "addSigner: zero address");
        require(!isOwner[newSigner], "addSigner: owner not unique");
        require(newSignaturesRequired > 0, "addSigner: must be non-zero sigs required");
        isOwner[newSigner] = true;
        signaturesRequired = newSignaturesRequired;
        emit Owner(newSigner, isOwner[newSigner]);
    }

    function removeSigner(address oldSigner, uint256 newSignaturesRequired)
        public
        onlySelf
    {
        require(isOwner[oldSigner], "removeSigner: not owner");
        require(newSignaturesRequired > 0, "removeSigner: must be non-zero sigs required");
        isOwner[oldSigner] = false;
        signaturesRequired = newSignaturesRequired;
        emit Owner(oldSigner, isOwner[oldSigner]);
    }

    function updateSignaturesRequired(uint256 newSignaturesRequired)
        public
        onlySelf
    {
        require(newSignaturesRequired > 0, "updateSignaturesRequired: must be non-zero sigs required");
        signaturesRequired = newSignaturesRequired;
    }
    */
    function executeTransaction(address payable to, uint256 value, bytes memory data, bytes[] memory signatures ) public returns (bytes memory) {
        require(isOwner[msg.sender], "executeTransaction: only owners can execute");
        bytes32 _hash = getTransactionHash(nonce, to, value, data);
        nonce++;
        uint256 validSignatures;
        address duplicateGuard;
        for (uint i = 0; i < signatures.length; i++) {
            address recovered = recover(_hash, signatures[i]);
            require(recovered > duplicateGuard,"executeTransaction: duplicate or unordered signatures"
            );
            duplicateGuard = recovered;
            if (isOwner[recovered]) {
                validSignatures++;
            }
        }

        require( validSignatures >= signaturesRequired, "executeTransaction: not enough valid signatures");

        (bool success, bytes memory result) = to.call{value: value}(data);
        require(success, "executeTransaction: tx failed");

        emit ExecuteTransaction(msg.sender, to, value, data, nonce - 1, _hash, result);
        return result;
    }

    //Function used to calculate the transaction hash
    function getTransactionHash( uint256 _nonce, address to, uint256 value, bytes memory data ) public view returns (bytes32) {
        return keccak256( abi.encodePacked( address(this), chainId, _nonce, to, value, data));
    }

    //Function to recover signer
    function recover(bytes32 _hash, bytes memory _signature) public pure returns (address) {
        return _hash.toEthSignedMessageHash().recover(_signature);
    }

    //functions receive and fallback used to fund the multisig
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    fallback() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
}
