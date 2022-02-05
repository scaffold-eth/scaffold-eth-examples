pragma solidity >=0.8.11 < 0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
// import "./Verifier.sol";

interface IPoseidon3 {
    function poseidon(uint256[3] calldata) external pure returns(uint256);
}

interface IPoseidon2 {
    function poseidon(uint256[2] calldata) external pure returns(uint256);
}

contract YourContract {


    IPoseidon2 immutable Poseidon2;
    IPoseidon3 immutable Poseidon3;

    constructor(
        address _poseidon3,
        address _poseidon2
    ) {
        Poseidon2 = IPoseidon2(_poseidon2);
        Poseidon3 = IPoseidon3(_poseidon3);
    }

    function poseidon2(
        uint256 a,
        uint256 b
    ) public view returns(
        uint256 x
    ) {
        x = Poseidon2.poseidon([a, b]);
    }

    function poseidon3(
        uint256 a,
        uint256 b,
        uint256 c
    ) public view returns(
        uint256 x
    ) {
        x = Poseidon3.poseidon([a, b, c]);
    }

    function leafHash(
        uint256 _key,
        uint256 _value
    ) public view returns(
        uint256 x
    ) {
        // if (_value == 0) {
        //     return x = 0;
        // }
        return x = poseidon3(_key, _value, 1);
    }

    function nodeHash(
        uint256 l,
        uint256 r
    ) public view returns(
        uint256 x
    ) {
        unchecked {
            // if (l + r == 0) {
            //     return x = 0;
            // }
            // if (l * r == 0) {
            //     return x = l == 0 ? r : l;
            // } else {
                return x = poseidon2(l, r);
            // }
        }
    }

    function constructRoot(uint256[] calldata _data) public view returns(uint256 x) {
        uint256 levelLength = _data.length /*& 1 == 1 ? _data.length + 1 : _data.length*/;
        uint256 currentLevel;

        uint256[] memory data = new uint256[](levelLength);
        for (uint256 i; i < _data.length; i++) {
            data[i] = leafHash(i, _data[i]);
        }
        while (levelLength > 1) {
            unchecked {
                currentLevel += 1;
            }
            if ((levelLength & (levelLength - 1)) == 0) {
                for (uint256 i; i < levelLength/2; i++) {
                    data[i] = nodeHash(data[i], data[i + levelLength/2]);
                }
            } else {
                revert();
            }
            // figure out what to do with levels that cannot be devided
            // for (uint256 i; i < levelLength >> 1; i++) {
            //     uint256[] memory evens = new uint256[]( levelLength & 1 == 1 ? levelLength / 2 + 1 : levelLength / 2);
            //     uint256[] memory odds = new uint256[](levelLength / 2);
            //     if (i & 1 == 1) {
            //         odds[i-1] = i;
            //     } else {
            //         evens[i] = i;
            //     }
            // }
            levelLength >>= 1;
            // if (levelLength & 1 == 1 && levelLength != 1) {
            //     levelLength += 1;
            // }
        }

        return x = data[0];
    }


}
