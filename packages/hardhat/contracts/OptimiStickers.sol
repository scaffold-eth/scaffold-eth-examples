// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract OptimiStickers is ERC721 {

    using Counters for Counters.Counter;

    constructor(uint _pixels) ERC721("OptimiStickers", "OPTI") {
      pixels = _pixels;
      currentSticker.increment();
    }

    Counters.Counter public currentSticker;
    Counters.Counter public pixelCount;

    uint public pixels;

    mapping(uint => Counters.Counter) public pixelCounter;

    function claimPixel(uint pixel, uint count) public {
      require(pixel < pixels, 'pixel out of range!');
      require(count == currentSticker.current(), 'must be for the current sticker');
      require(count == pixelCounter[pixel].current() + 1, 'incorrect pixel count');

      pixelCounter[pixel].increment();
      pixelCount.increment();

      if(SafeMath.mod(pixelCount.current(), pixels) == 0) {
          _mint(msg.sender, currentSticker.current());
          currentSticker.increment();
      }

    }
}
