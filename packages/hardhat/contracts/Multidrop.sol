//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Multidrop is Ownable {
    using SafeERC20 for IERC20;

    constructor() payable {}

    modifier validList(address[] memory users, uint256[] memory values) {
        require(users.length == values.length, "Users - Invalid length");
        require(users.length > 0, "Empty calldata");
        _;
    }

    function sendETH(address[] memory users, uint256[] memory values)
        public
        payable
        validList(users, values)
    {
        uint256 totalETHValue = msg.value;

        // handle indexes drop
        for (uint256 i = 0; i < users.length; i++) {
            address currentUser = users[i];
            require(
                totalETHValue > 0,
                "Not enough ETH to complete this transaction"
            );
            require(currentUser != address(0), "No burning ETH");
            totalETHValue -= values[i];
            (bool sent, ) = currentUser.call{value: values[i]}("");
            require(sent, "Failed to send Ether");
        }
    }

    function sendToken(
        address[] memory users,
        uint256[] memory values,
        IERC20 token
    ) public validList(users, values) {
        uint256 totalTokens = 0;

        for (uint256 i = 0; i < values.length; i++) {
            totalTokens += values[i];
        }

        require(
            token.balanceOf(msg.sender) >= totalTokens,
            "Not enough token balance"
        );
        require(
            token.allowance(msg.sender, address(this)) >= totalTokens,
            "Not enough token allowance"
        );

        // handle indexes drop
        for (uint256 i = 0; i < users.length; i++) {
            token.safeTransferFrom(msg.sender, users[i], values[i]);
        }
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
