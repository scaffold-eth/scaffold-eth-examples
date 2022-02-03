//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Multidrop is ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public fee = 0.05 ether;

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

        splitFee();
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

        splitFee();
    }

    function splitFee() internal {
        if (msg.value > 0) {
            uint256 ghostSplit = (address(this).balance * 20) / 100;
            uint256 MCSplit = (address(this).balance * 80) / 100;

            (bool ghostSend, ) = 0xbF7877303B90297E7489AA1C067106331DfF7288
                .call{value: ghostSplit}("");
            require(ghostSend, "Failed to withdraw Ether");

            (bool MCSend, ) = 0x230Fc981F7CaE90cFC4ed4c18F7C178B239e5F9F.call{
                value: MCSplit
            }("");
            require(MCSend, "Failed to withdraw Ether");
        }
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
