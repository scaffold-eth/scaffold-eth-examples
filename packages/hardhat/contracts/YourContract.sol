pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {
    event TaskCreated(
        uint256 incentive,
        uint256 scheduledBlock,
        string functionToCall,
        string data,
        address createdBy
    );

    event TaskFulfilled(
        uint256 incentive,
        uint256 scheduledBlock,
        string functionToCall,
        string data,
        bool completed,
        address completedBy
    );

    struct Task {
        uint256 incentive;
        uint256 scheduledBlock;
        string functionToCall;
        string data;
        bool completed;
        address completedBy;
    }

    Task[] public tasks;

    constructor() payable {
        // what should we do on deploy?
    }

    // This function creates an action that can be called by anyone. The caller recieves the fee value of the action.
    function setScheduledTask(
        uint256 scheduledBlock,
        string calldata functionToCall,
        string memory data
    ) public payable {
        tasks.push(
            Task({
                incentive: msg.value,
                scheduledBlock: scheduledBlock,
                functionToCall: functionToCall,
                data: data,
                completed: false,
                completedBy: address(0)
            })
        );
        emit TaskCreated(
            msg.value,
            scheduledBlock,
            functionToCall,
            data,
            msg.sender
        );
    }

    function fulfillTask(uint256 indexOfTask) public {
        require(
            tasks[indexOfTask].completed == false,
            "Task already completed"
        );
        require(
            tasks[indexOfTask].scheduledBlock <= block.number,
            "This task cannot be fulfilled yet"
        );
        (bool success, ) = address(this).call(
            abi.encodeWithSignature(
                tasks[indexOfTask].functionToCall,
                tasks[indexOfTask].data
            )
        );
        require(success, "Task failed");
        tasks[indexOfTask].completed = true;
        tasks[indexOfTask].completedBy = msg.sender;
        (bool incentiveClaimed, ) = payable(msg.sender).call{
            value: tasks[indexOfTask].incentive
        }("");
        require(incentiveClaimed, "Failed to send incentive Ether to caller");
        emit TaskFulfilled(
            tasks[indexOfTask].incentive,
            tasks[indexOfTask].scheduledBlock,
            tasks[indexOfTask].functionToCall,
            tasks[indexOfTask].data,
            tasks[indexOfTask].completed,
            msg.sender
        );
    }

    function getTask(uint256 indexOfTask) public view returns (Task memory) {
        return tasks[indexOfTask];
    }

    function getTasks() public view returns (Task[] memory) {
        return tasks;
    }

    // Everything below is just to provide an example function and is not related to the scheduling functionality.
    event SetPurpose(address sender, string purpose);

    string public purpose = "Building Unstoppable Apps!!!";

    function setPurpose(string memory newPurpose) public {
        purpose = newPurpose;
        console.log(msg.sender, "set purpose to", purpose);
        emit SetPurpose(msg.sender, purpose);
    }

    function getcurrentBlock() public view returns (uint256) {
        return block.number;
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
