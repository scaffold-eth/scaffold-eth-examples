pragma solidity >=0.6.0 <0.7.0;

// EXTERNAL
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";

// INTERNAL
import "./MinimalProxy.sol";

contract ProxyFactory {
    event ProxyCreated(address minimalProxy);

    mapping(address => address) public registry;

    function computeAddress(uint256 salt, address implementation)
        public
        view
        returns (address)
    {
        return
            Create2.computeAddress(
                keccak256(abi.encodePacked(salt)),
                keccak256(getContractCreationCode(implementation)),
                address(this)
            );
    }

    function deploy(
        uint256 salt,
        address implementation
    ) public {
        address minimalProxy = Create2.deploy(
            0,
            keccak256(abi.encodePacked(salt)),
            getContractCreationCode(implementation)
        );
        registry[msg.sender] = minimalProxy;
        require(address(this) != address(0), "invalid address");
        address payable wallet = address(uint160(minimalProxy));
        MinimalProxy(wallet).authorize(
            address(this),
            msg.sender
        );
        emit ProxyCreated(minimalProxy);
    }

    function getContractCreationCode(address logic)
        internal
        pure
        returns (bytes memory)
    {
        bytes10 creation = 0x3d602d80600a3d3981f3;
        bytes10 prefix = 0x363d3d373d3d3d363d73;
        bytes20 targetBytes = bytes20(logic);
        bytes15 suffix = 0x5af43d82803e903d91602b57fd5bf3;
        return abi.encodePacked(creation, prefix, targetBytes, suffix);
    }
}