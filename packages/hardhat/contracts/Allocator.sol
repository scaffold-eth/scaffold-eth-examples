pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WETH9.sol";

/*

  Credibly Neutral Token Allocator

  1) On deploy an allocations array is created.

  2) Tokens are sent to the contract.

  3) Anyone can call `distribute( tokenAddress )` to split funds within the
    contract by the allocation ratio and send them to each wallet.


    //KNOWN 'GOTCHAS' SO FAR

    the allocation wallet could be crafted to "lock" transfers by failing
      (withdraw pattern might be better?)

    limit is 256 allocation wallets
      (easily adjusted)

    allocations are locked and can't be adjusted
      (could add owner but then you might want locked 'periods' too?)
*/

contract Allocator is ReentrancyGuard, Ownable{

  event Distribute( address indexed token, address indexed wallet, uint256 amount );
  event AllocationAdded( address wallet, uint8 ratio );

  struct Allocation {
    address wallet;
    uint8 ratio;
  }

  Allocation[] public allocations;
  uint8 public denominator = 0;
  address payable public WETH;

  //accepts eth
  receive() external payable {
    WETH9 wethContract = WETH9(WETH);
    wethContract.deposit{value:msg.value}();
  }

  function setAllocation( address[] memory wallets, uint8[] memory ratios ) public onlyOwner {
    require( wallets.length > 0 ,"Not enough wallets");
    require( wallets.length < 256 ,"Too many wallets");
    require( wallets.length == ratios.length ,"Wallet and Ratio length not equal");
    for(uint8 r=0;r<ratios.length;r++){
      denominator += ratios[r];
      emit AllocationAdded(wallets[r],ratios[r]);
      allocations.push(Allocation({
          wallet: wallets[r],
          ratio: ratios[r]
      }));
    }
  }

  function setWETHAddress(address payable _WETH) public onlyOwner {
    WETH = _WETH;
  }

  function distribute(address tokenAddress) public nonReentrant {
    IERC20 tokenContract = IERC20(tokenAddress);
    uint256 balance = tokenContract.balanceOf(address(this));
    for(uint8 a=0;a<allocations.length;a++){
      uint256 amount = balance * allocations[a].ratio / denominator;
      tokenContract.transfer( allocations[a].wallet, amount );
      emit Distribute( tokenAddress, allocations[a].wallet, amount );
    }
  }

  function allocationsLength() public view returns(uint8 count) {
      return uint8(allocations.length);
  }
}
