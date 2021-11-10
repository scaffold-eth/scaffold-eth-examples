// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";

contract MultiSigWallet {

    using EnumerableSet for EnumerableSet.AddressSet;

    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);
    event Owner(address indexed owner, bool added);

    EnumerableSet.AddressSet owners;
    uint public numConfirmationsRequired;

    struct Transaction {
        address to;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    // mapping from tx index => owner => bool
    mapping(uint => mapping(address => bool)) public isConfirmed;

    Transaction[] transactions;

    modifier onlyOwner() {
        require(owners.contains(msg.sender), "not owner");
        _;
    }

    modifier onlySelfOrSingleSigner() {
        require(msg.sender == address(this) || (owners.contains(msg.sender) && numConfirmationsRequired == 1), "not self");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(owners.add(owner), "owner not unique");

        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    function addOwner(address newOwner) public onlySelfOrSingleSigner {
        require(newOwner!=address(0), "zero address");
        require(owners.add(newOwner), "already an owner");
        emit Owner(newOwner,true);
    }

    function removeOwner(address oldOwner) public onlySelfOrSingleSigner {
        require(owners.remove(oldOwner), "removeSigner: not owner");
        require(owners.length() > numConfirmationsRequired, "owners must be greater than the number of confirmations");
        emit Owner(oldOwner,false);
    }

    function updateConfirmationsRequired(uint256 newConfirmationsRequired) public onlySelfOrSingleSigner {
        require(newConfirmationsRequired > 0, "must be greater than zero");
        require(newConfirmationsRequired <= owners.length(), "must be less than or equal to the number of owners");
        numConfirmationsRequired = newConfirmationsRequired;
    }

    function submitTransaction(address _to, bytes memory _data)
        public
        onlyOwner
    {
        uint txIndex = transactions.length;

        transactions.push(Transaction({
            to: _to,
            data: _data,
            executed: false,
            numConfirmations: 0
        }));

        emit SubmitTransaction(msg.sender, txIndex, _to, _data);
    }

    function confirmTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );

        transaction.executed = true;

        (bool success, ) = transaction.to.call(transaction.data);
        require(success, "tx failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint _txIndex)
        public
        view
        returns (address to, bytes memory data, bool executed, uint numConfirmations)
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }

    function getOwnerCount() public view returns (uint) {
        return owners.length();
    }

    function getOwnerAt(uint _ownerIndex) public view returns (address) {
        return owners.at(_ownerIndex);
    }
}
