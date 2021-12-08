pragma solidity ^0.8.4;

//SPDX-License-Identifier: MIT

library Utilities {
    // It's possible to get multiple numbers from a single VRF response:
    function expand(uint256 randomValue, uint256 n)
        internal
        pure
        returns (uint256[] memory expandedValues)
    {
        expandedValues = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            expandedValues[i] = uint256(keccak256(abi.encode(randomValue, i)));
        }
        return expandedValues;
    }

    /**
     * TODO: side quest - implement this function and use it in
     * DiceRolls / MultiDiceRolls instead of expand().
     *
     */
    // function generateSixRolls(uint256 randomValue)
    //     internal
    //     pure
    //     returns (uint8[] memory rolls)
    // {
    //     return new uint8[](6);
    // }
}
