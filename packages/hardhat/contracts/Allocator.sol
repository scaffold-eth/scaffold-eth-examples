pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IWETH9.sol";
import "./IGovernor.sol";

contract Allocator is ReentrancyGuard {

  using SafeERC20 for IERC20;

  event Distribute( address indexed token, address indexed wallet, uint256 amount );

  IWETH9 public immutable wethContract;
  IGovernor public immutable governorContract;

  constructor(address governor, address payable weth) public {
    require( governor != address(0), "governor cant be 0x0");
    require( weth != address(0), "weth cant be 0x0");
    governorContract = IGovernor(governor);
    wethContract = IWETH9(weth);
  }

  receive() external payable {
    wethContract.deposit{value:msg.value}();
  }

  function distribute(address tokenAddress) public nonReentrant {
    IERC20 tokenContract = IERC20(tokenAddress);
    uint256 balance = tokenContract.balanceOf(address(this));

    uint256 denominator = governorContract.denominator();
    address[] memory recipients = governorContract.getRecipients();
    uint8[] memory ratios = governorContract.getRatios();

    for(uint256 i = 0;i < ratios.length; i++){
      uint256 next = balance * ratios[i];
      require( next >= balance, "overflow");
      uint256 amount = next / denominator;
      tokenContract.safeTransfer( recipients[i], amount );
      emit Distribute( tokenAddress, recipients[i], amount );
    }
  }
}
