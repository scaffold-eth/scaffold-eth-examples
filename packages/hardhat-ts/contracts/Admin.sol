pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Admin is Ownable, Pausable, ReentrancyGuard {
  /* ****** */
  /* EVENTS */
  /* ****** */

  // @notice This event is fired whenever the admins change the percent of
  //         interest rates earned that they charge as a fee. Note that
  //         newAdminFee can never exceed 10,000, since the fee is measured
  //         in basis points.
  // @param  newAdminFee - The new admin fee measured in basis points. This
  //         is a percent of the interest paid upon a loan's completion that
  //         go to the contract admins.
  event AdminFeeUpdated(uint256 newAdminFee);

  /* ******* */
  /* STORAGE */
  /* ******* */

  // @notice A mapping from from an ERC20 currency address to whether that
  //         currency is whitelisted to be used by this contract. Note that
  //         NFTfi only supports loans that use ERC20 currencies that are
  //         whitelisted, all other calls to beginLoan() will fail.
  mapping(address => bool) public erc20CurrencyIsWhitelisted;

  // @notice A mapping from from an NFT contract's address to whether that
  //         contract is whitelisted to be used by this contract. Note that
  //         NFTfi only supports loans that use NFT collateral from contracts
  //         that are whitelisted, all other calls to beginLoan() will fail.
  mapping(address => bool) public nftContractIsWhitelisted;

  // @notice The maximum duration of any loan started on this platform,
  //         measured in seconds. This is both a sanity-check for borrowers
  //         and an upper limit on how long admins will have to support v1 of
  //         this contract if they eventually deprecate it, as well as a check
  //         to ensure that the loan duration never exceeds the space alotted
  //         for it in the loan struct.
  uint256 public maximumLoanDuration = 53 weeks;

  // @notice The maximum number of active loans allowed on this platform.
  //         This parameter is used to limit the risk that NFTfi faces while
  //         the project is first getting started.
  uint256 public maximumNumberOfActiveLoans = 100;

  // @notice The percentage of interest earned by lenders on this platform
  //         that is taken by the contract admin's as a fee, measured in
  //         basis points (hundreths of a percent).
  uint256 public adminFeeInBasisPoints = 25;

  /* *********** */
  /* CONSTRUCTOR */
  /* *********** */

  constructor() {
    // Whitelist mainnet WETH
    erc20CurrencyIsWhitelisted[address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)] = true;

    // Whitelist mainnet DAI
    erc20CurrencyIsWhitelisted[address(0x6B175474E89094C44Da98b954EedeAC495271d0F)] = true;

    // Whitelist mainnet CryptoKitties
    nftContractIsWhitelisted[address(0x06012c8cf97BEaD5deAe237070F9587f8E7A266d)] = true;
  }

  /* ********* */
  /* FUNCTIONS */
  /* ********* */

  /**
   * @dev Gets the token name
   * @return string representing the token name
   */
  function name() external pure returns (string memory) {
    return "NFTfi Promissory Note";
  }

  /**
   * @dev Gets the token symbol
   * @return string representing the token symbol
   */
  function symbol() external pure returns (string memory) {
    return "NFTfi";
  }

  // @notice This function can be called by admins to change the whitelist
  //         status of an ERC20 currency. This includes both adding an ERC20
  //         currency to the whitelist and removing it.
  // @param  _erc20Currency - The address of the ERC20 currency whose whitelist
  //         status changed.
  // @param  _setAsWhitelisted - The new status of whether the currency is
  //         whitelisted or not.
  function whitelistERC20Currency(address _erc20Currency, bool _setAsWhitelisted) external onlyOwner {
    erc20CurrencyIsWhitelisted[_erc20Currency] = _setAsWhitelisted;
  }

  // @notice This function can be called by admins to change the whitelist
  //         status of an NFT contract. This includes both adding an NFT
  //         contract to the whitelist and removing it.
  // @param  _nftContract - The address of the NFT contract whose whitelist
  //         status changed.
  // @param  _setAsWhitelisted - The new status of whether the contract is
  //         whitelisted or not.
  function whitelistNFTContract(address _nftContract, bool _setAsWhitelisted) external onlyOwner {
    nftContractIsWhitelisted[_nftContract] = _setAsWhitelisted;
  }

  // @notice This function can be called by admins to change the
  //         maximumLoanDuration. Note that they can never change
  //         maximumLoanDuration to be greater than UINT32_MAX, since that's
  //         the maximum space alotted for the duration in the loan struct.
  // @param  _newMaximumLoanDuration - The new maximum loan duration, measured
  //         in seconds.
  function updateMaximumLoanDuration(uint256 _newMaximumLoanDuration) external onlyOwner {
    require(_newMaximumLoanDuration <= uint256(~uint32(0)), "loan duration cannot exceed space alotted in struct");
    maximumLoanDuration = _newMaximumLoanDuration;
  }

  // @notice This function can be called by admins to change the
  //         maximumNumberOfActiveLoans.
  // @param  _newMaximumNumberOfActiveLoans - The new maximum number of
  //         active loans, used to limit the risk that NFTfi faces while the
  //         project is first getting started.
  function updateMaximumNumberOfActiveLoans(uint256 _newMaximumNumberOfActiveLoans) external onlyOwner {
    maximumNumberOfActiveLoans = _newMaximumNumberOfActiveLoans;
  }

  // @notice This function can be called by admins to change the percent of
  //         interest rates earned that they charge as a fee. Note that
  //         newAdminFee can never exceed 10,000, since the fee is measured
  //         in basis points.
  // @param  _newAdminFeeInBasisPoints - The new admin fee measured in basis points. This
  //         is a percent of the interest paid upon a loan's completion that
  //         go to the contract admins.
  function updateAdminFee(uint256 _newAdminFeeInBasisPoints) external onlyOwner {
    require(_newAdminFeeInBasisPoints <= 10000, "By definition, basis points cannot exceed 10000");
    adminFeeInBasisPoints = _newAdminFeeInBasisPoints;
    emit AdminFeeUpdated(_newAdminFeeInBasisPoints);
  }
}
