pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

abstract contract SigningUtils {
  /* *********** */
  /* CONSTRUCTOR */
  /* *********** */

  constructor() {}

  /* ********* */
  /* FUNCTIONS */
  /* ********* */

  using ECDSA for bytes32;

  // @notice This function gets the current chain ID.
  function getChainID() public view returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return id;
  }

  function isValidBorrowerSignature(
    uint256 _nftCollateralId,
    uint256 _borrowerNonce,
    address _nftCollateralContract,
    address _borrower,
    bytes memory _borrowerSignature
  ) public view returns (bool) {
    if (_borrower == address(0)) {
      return false;
    } else {
      uint256 chainId;
      chainId = getChainID();
      bytes32 message = keccak256(abi.encodePacked(_nftCollateralId, _borrowerNonce, _nftCollateralContract, _borrower, chainId));

      bytes32 messageWithEthSignPrefix = message.toEthSignedMessageHash();

      return (messageWithEthSignPrefix.recover(_borrowerSignature) == _borrower);
    }
  }

  function isValidLenderSignature(
    uint256 _loanPrincipalAmount,
    uint256 _maximumRepaymentAmount,
    uint256 _nftCollateralId,
    uint256 _loanDuration,
    uint256 _loanInterestRateForDurationInBasisPoints,
    uint256 _adminFeeInBasisPoints,
    uint256 _lenderNonce,
    address _nftCollateralContract,
    address _loanERC20Denomination,
    address _lender,
    bool _interestIsProRated,
    bytes memory _lenderSignature
  ) public view returns (bool) {
    if (_lender == address(0)) {
      return false;
    } else {
      uint256 chainId;
      chainId = getChainID();
      bytes32 message = keccak256(
        abi.encodePacked(
          _loanPrincipalAmount,
          _maximumRepaymentAmount,
          _nftCollateralId,
          _loanDuration,
          _loanInterestRateForDurationInBasisPoints,
          _adminFeeInBasisPoints,
          _lenderNonce,
          _nftCollateralContract,
          _loanERC20Denomination,
          _lender,
          _interestIsProRated,
          chainId
        )
      );

      bytes32 messageWithEthSignPrefix = message.toEthSignedMessageHash();

      return (messageWithEthSignPrefix.recover(_lenderSignature) == _lender);
    }
  }
}
