pragma solidity >=0.6.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "./interfaces/ILendingPool.sol";
import "./interfaces/ILendingPoolAddressesProvider.sol";
import "./interfaces/IProtocolDataProvider.sol";
import "./interfaces/IUniswapV2Router02.sol";

contract AavEth {

  constructor() public {
    lendingPoolAddressProvider = ILendingPoolAddressesProvider(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);
    uniswapRouter = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    wethAddress = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
  }

  ILendingPoolAddressesProvider public lendingPoolAddressProvider;
  IUniswapV2Router02 public uniswapRouter;
  address public wethAddress;

  bytes32 dataProviderLookup = 0x0100000000000000000000000000000000000000000000000000000000000000;

  event Deposit(address sender, address asset, uint256 EthAmount, uint256 assetAmount);
  event Withdraw(address sender, address asset, uint256 EthAmount, uint256 assetAmount);

  function depositEthForAToken(uint amountOutMin, address[] calldata path, address to, uint deadline) public payable returns (uint amountAsset) {

      address _fromAsset = path[0];
      address _toAsset = path[path.length - 1];

      require(wethAddress == _fromAsset, "from asset must be WETH");
      require(wethAddress != _toAsset, "to asset must not be WETH");

      uint[] memory amounts = uniswapRouter.swapExactETHForTokens{value: msg.value}(amountOutMin, path, address(this), deadline);

      uint _amount = amounts[amounts.length - 1];
      IERC20 _asset = IERC20(_toAsset);

      address _lendingPoolAddress = lendingPoolAddressProvider.getLendingPool();

      _asset.approve(_lendingPoolAddress, _amount);

      ILendingPool _lendingPool = ILendingPool(_lendingPoolAddress);

      _lendingPool.deposit(
        _toAsset,
        _amount,
        to,
        0
      );

      emit Deposit(to, _toAsset, msg.value, _amount);

      return _amount;
  }

  function getProtocolDataProvider() external view returns (address)  {
    return lendingPoolAddressProvider.getAddress(dataProviderLookup);
  }

}
