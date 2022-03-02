//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract OptimisticShades is Ownable, ERC721Enumerable {
    struct shadeObj {
        bytes32 id;
        uint8[9] shades;
        uint8 degree;
        uint256[3] alphas;
    }

    uint256 immutable FEE = 0.1 ether;

    uint256 counter;
    mapping(bytes32 => uint256) shadesHash;
    mapping(uint256 => shadeObj) mintedShades;

    constructor(address admin) payable ERC721("OptimisticShades", "OpSHX") {
        transferOwnership(admin);
    }

    function mint(
        uint8[9] memory _shades,
        uint8 degree,
        uint256[3] memory alphas
    ) public payable returns (uint256) {
        require(msg.value >= FEE, "Not enough ETH sent for mint");
        bytes32 shadeHash = keccak256(
            abi.encodePacked(_shades, degree, alphas)
        );

        // validate hash
        require(
            shadesHash[shadeHash] == 0,
            "This shade has already being minted"
        );

        // validate the variables
        // degree
        require(degree <= 360, "Invalid degree");
        // shades
        for (uint256 i = 0; i < _shades.length; i++) {
            require(_shades[i] <= 255, "Invalid shade provided");
        }
        for (uint256 i = 0; i < alphas.length; i++) {
            require(alphas[i] / 1 ether <= 1, "Invalid alpha provided");
        }

        counter += 1;

        // handle mint
        _mint(msg.sender, counter);
        mintedShades[counter].id = shadeHash;
        mintedShades[counter].shades = _shades;
        mintedShades[counter].degree = degree;
        mintedShades[counter].alphas = alphas;

        return counter;
    }

    function withdraw(address _to) public onlyOwner {
        address to = _to == address(0) ? owner() : _to;

        (bool success, ) = to.call{value: address(this).balance}("");

        require(success);
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
