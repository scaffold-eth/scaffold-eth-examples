//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract Multidrop is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 public fee;

    event tokenDropped(
        address indexed from,
        address indexed to,
        address indexed token
    );
    event ETHdropped(address indexed from, address indexed to, uint256 amount);

    modifier validList(address[] memory users, uint256[] memory values) {
        require(users.length == values.length, "Users - Invalid length");
        require(users.length > 0, "Empty calldata");
        _;
    }

    constructor() payable {}

    function sendETH(address[] memory users, uint256[] memory values)
        public
        payable
        nonReentrant
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

            emit ETHdropped(msg.sender, currentUser, values[i]);
        }

        require(
            totalETHValue >= fee,
            "Not enough NativeToken sent for platform fees"
        );
    }

    function sendToken(
        address[] memory users,
        uint256[] memory values,
        IERC20 token
    ) public payable nonReentrant validList(users, values) {
        require(
            msg.value >= fee,
            "Not enough NativeToken sent for platform fees"
        );

        // handle indexes drop
        for (uint256 i = 0; i < users.length; i++) {
            token.safeTransferFrom(msg.sender, users[i], values[i]);

            emit tokenDropped(msg.sender, users[i], address(token));
        }
    }

    function updateFee(uint256 _fee) public onlyOwner {
        fee = _fee;
    }

    function withdraw(address[] memory to, uint256[] memory amount)
        public
        onlyOwner
        validList(to, amount)
    {
        for (uint256 i = 0; i < to.length; i++) {
            (bool sent, ) = to[i].call{value: amount[i]}("");
            require(sent, "Failed to withdraw Ether");
        }
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
