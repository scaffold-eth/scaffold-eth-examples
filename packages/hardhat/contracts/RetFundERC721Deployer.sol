//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./RetFundERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract RetFundERC721Deployer is Ownable {
    event tokenDeployed(
        address indexed token,
        address indexed creator,
        string name,
        uint256 timestamp
    );

    function deploy(
        address admin,
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 basePrice,
        uint256 curve,
        string memory base,
        string[] memory uris
    ) public {
        // deploy new token
        RetFundERC721 token = new RetFundERC721(
            admin,
            name,
            symbol,
            maxSupply,
            basePrice,
            curve,
            base,
            uris
        );

        // transfer token to owner
        token.transferOwnership(admin);

        // emit event
        emit tokenDeployed(address(token), msg.sender, name, block.timestamp);
    }
}
