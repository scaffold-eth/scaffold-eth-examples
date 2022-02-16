pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Admin.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./SigningUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract is Admin, SigningUtils {
  using SafeMath for uint256;

  struct Loan {
    uint256 loanId;
    uint256 loanPrincipalAmount;
    uint256 maximumRepaymentAmount;
    uint256 nftCollateralId;
    uint64 loanStartTime;
    uint32 loanDuration;
    uint32 loanInterestRateForDurationInBasisPoints;
    uint32 loanAdminFeeInBasisPoints;
    address nftCollateralContract;
    address loanERC20Denomination;
    address borrower;
    // A boolean value determining whether the interest will be pro-rated
    // if the loan is repaid early, or whether the borrower will simply
    // pay maximumRepaymentAmount.
    bool interestIsProRated;
  }

  /* ****** */
  /* EVENTS */
  /* ****** */

  event LoanStarted(
    uint256 loanId,
    address borrower,
    address lender,
    uint256 loanPrincipalAmount,
    uint256 maximumRepaymentAmount,
    uint256 nftCollateralId,
    uint256 loanStartTime,
    uint256 loanDuration,
    uint256 loanInterestRateForDurationInBasisPoints,
    address nftCollateralContract,
    address loanERC20Denomination,
    bool interestIsProRated
  );

  event LoanRepaid(
    uint256 loanId,
    address borrower,
    address lender,
    uint256 loanPrincipalAmount,
    uint256 nftCollateralId,
    uint256 amountPaidToLender,
    uint256 adminFee,
    address nftCollateralContract,
    address loanERC20Denomination
  );

  event LoanLiquidated(
    uint256 loanId,
    address borrower,
    address lender,
    uint256 loanPrincipalAmount,
    uint256 nftCollateralId,
    uint256 loanMaturityDate,
    uint256 loanLiquidationDate,
    address nftCollateralContract
  );

  /* ******* */
  /* STORAGE */
  /* ******* */

  // @notice A continuously increasing counter that simultaneously allows
  //         every loan to have a unique ID and provides a running count of
  //         how many loans have been started by this contract.
  uint256 public totalNumLoans = 0;

  // @notice A counter of the number of currently outstanding loans.
  uint256 public totalActiveLoans = 0;

  // @notice A mapping from a loan's identifier to the loan's details,
  //         represted by the loan struct. To fetch the lender, call
  //         NFTfi.ownerOf(loanId).
  mapping(uint256 => Loan) public loanIdToLoan;

  // @notice A mapping tracking whether a loan has either been repaid or
  //         liquidated. This prevents an attacker trying to repay or
  //         liquidate the same loan twice.
  mapping(uint256 => bool) public loanRepaidOrLiquidated;

  mapping(address => mapping(uint256 => bool)) private _nonceHasBeenUsedForUser;

  /* *********** */
  /* CONSTRUCTOR */
  /* *********** */

  constructor() public {}

  /* ********* */
  /* FUNCTIONS */
  /* ********* */

  function beginLoan(
    uint256 _loanPrincipalAmount,
    uint256 _maximumRepaymentAmount,
    uint256 _nftCollateralId,
    uint256 _loanDuration,
    uint256 _loanInterestRateForDurationInBasisPoints,
    uint256 _adminFeeInBasisPoints,
    uint256[2] memory _borrowerAndLenderNonces,
    address _nftCollateralContract,
    address _loanERC20Denomination,
    address _lender,
    bytes memory _borrowerSignature,
    bytes memory _lenderSignature
  ) public whenNotPaused nonReentrant {
    // Save loan details to a struct in memory first, to save on gas if any
    // of the below checks fail, and to avoid the "Stack Too Deep" error by
    // clumping the parameters together into one struct held in memory.
    Loan memory loan = Loan({
      loanId: totalNumLoans, //currentLoanId,
      loanPrincipalAmount: _loanPrincipalAmount,
      maximumRepaymentAmount: _maximumRepaymentAmount,
      nftCollateralId: _nftCollateralId,
      loanStartTime: uint64(block.timestamp), //_loanStartTime
      loanDuration: uint32(_loanDuration),
      loanInterestRateForDurationInBasisPoints: uint32(_loanInterestRateForDurationInBasisPoints),
      loanAdminFeeInBasisPoints: uint32(_adminFeeInBasisPoints),
      nftCollateralContract: _nftCollateralContract,
      loanERC20Denomination: _loanERC20Denomination,
      borrower: msg.sender, //borrower
      interestIsProRated: (_loanInterestRateForDurationInBasisPoints != ~(uint32(0)))
    });

    // Sanity check loan values.
    require(loan.maximumRepaymentAmount >= loan.loanPrincipalAmount, "Negative interest rate loans are not allowed.");
    require(uint256(loan.loanDuration) <= maximumLoanDuration, "Loan duration exceeds maximum loan duration");
    require(uint256(loan.loanDuration) != 0, "Loan duration cannot be zero");
    require(uint256(loan.loanAdminFeeInBasisPoints) == adminFeeInBasisPoints, "The admin fee has changed since this order was signed.");

    // Check that both the collateral and the principal come from supported
    // contracts.
    require(erc20CurrencyIsWhitelisted[loan.loanERC20Denomination], "Currency denomination is not whitelisted to be used by this contract");
    require(nftContractIsWhitelisted[loan.nftCollateralContract], "NFT collateral contract is not whitelisted to be used by this contract");

    // Check loan nonces. These are different from Ethereum account nonces.
    // Here, these are uint256 numbers that should uniquely identify
    // each signature for each user (i.e. each user should only create one
    // off-chain signature for each nonce, with a nonce being any arbitrary
    // uint256 value that they have not used yet for an off-chain NFTfi
    // signature).
    require(
      !_nonceHasBeenUsedForUser[msg.sender][_borrowerAndLenderNonces[0]],
      "Borrower nonce invalid, borrower has either cancelled/begun this loan, or reused this nonce when signing"
    );
    _nonceHasBeenUsedForUser[msg.sender][_borrowerAndLenderNonces[0]] = true;
    require(
      !_nonceHasBeenUsedForUser[_lender][_borrowerAndLenderNonces[1]],
      "Lender nonce invalid, lender has either cancelled/begun this loan, or reused this nonce when signing"
    );
    _nonceHasBeenUsedForUser[_lender][_borrowerAndLenderNonces[1]] = true;

    // Check that both signatures are valid.
    require(
      isValidBorrowerSignature(
        loan.nftCollateralId,
        _borrowerAndLenderNonces[0], //_borrowerNonce,
        loan.nftCollateralContract,
        msg.sender, //borrower,
        _borrowerSignature
      ),
      "Borrower signature is invalid"
    );
    require(
      isValidLenderSignature(
        loan.loanPrincipalAmount,
        loan.maximumRepaymentAmount,
        loan.nftCollateralId,
        loan.loanDuration,
        loan.loanInterestRateForDurationInBasisPoints,
        loan.loanAdminFeeInBasisPoints,
        _borrowerAndLenderNonces[1], //_lenderNonce,
        loan.nftCollateralContract,
        loan.loanERC20Denomination,
        _lender,
        loan.interestIsProRated,
        _lenderSignature
      ),
      "Lender signature is invalid"
    );

    // Add the loan to storage before moving collateral/principal to follow
    // the Checks-Effects-Interactions pattern.
    loanIdToLoan[totalNumLoans] = loan;
    totalNumLoans = totalNumLoans.add(1);

    // Update number of active loans.
    totalActiveLoans = totalActiveLoans.add(1);
    require(totalActiveLoans <= maximumNumberOfActiveLoans, "Contract has reached the maximum number of active loans allowed by admins");

    // Transfer collateral from borrower to this contract to be held until
    // loan completion.
    IERC721(loan.nftCollateralContract).transferFrom(msg.sender, address(this), loan.nftCollateralId);

    // Transfer principal from lender to borrower.
    IERC20(loan.loanERC20Denomination).transferFrom(_lender, msg.sender, loan.loanPrincipalAmount);

    // Issue an ERC721 promissory note to the lender that gives them the
    // right to either the principal-plus-interest or the collateral.
    // _mint(_lender, loan.loanId);

    // Emit an event with all relevant details from this transaction.
    emit LoanStarted(
      loan.loanId,
      msg.sender, //borrower,
      _lender,
      loan.loanPrincipalAmount,
      loan.maximumRepaymentAmount,
      loan.nftCollateralId,
      block.timestamp, //_loanStartTime
      loan.loanDuration,
      loan.loanInterestRateForDurationInBasisPoints,
      loan.nftCollateralContract,
      loan.loanERC20Denomination,
      loan.interestIsProRated
    );
  }

  function payBackLoan(uint256 _loanId) external nonReentrant {
    // Sanity check that payBackLoan() and liquidateOverdueLoan() have
    // never been called on this loanId. Depending on how the rest of the
    // code turns out, this check may be unnecessary.
    require(!loanRepaidOrLiquidated[_loanId], "Loan has already been repaid or liquidated");

    // Fetch loan details from storage, but store them in memory for the
    // sake of saving gas.
    Loan memory loan = loanIdToLoan[_loanId];

    // Check that the borrower is the caller, only the borrower is entitled
    // to the collateral.
    require(msg.sender == loan.borrower, "Only the borrower can pay back a loan and reclaim the underlying NFT");

    // Fetch current owner of loan promissory note.
    address lender = address(0); //ownerOf(_loanId);

    // Calculate amounts to send to lender and admins
    uint256 interestDue = (loan.maximumRepaymentAmount).sub(loan.loanPrincipalAmount);
    if (loan.interestIsProRated == true) {
      interestDue = _computeInterestDue(
        loan.loanPrincipalAmount,
        loan.maximumRepaymentAmount,
        block.timestamp.sub(uint256(loan.loanStartTime)),
        uint256(loan.loanDuration),
        uint256(loan.loanInterestRateForDurationInBasisPoints)
      );
    }
    uint256 adminFee = _computeAdminFee(interestDue, uint256(loan.loanAdminFeeInBasisPoints));
    uint256 payoffAmount = ((loan.loanPrincipalAmount).add(interestDue)).sub(adminFee);

    // Mark loan as repaid before doing any external transfers to follow
    // the Checks-Effects-Interactions design pattern.
    loanRepaidOrLiquidated[_loanId] = true;

    // Update number of active loans.
    totalActiveLoans = totalActiveLoans.sub(1);

    // Transfer principal-plus-interest-minus-fees from borrower to lender
    IERC20(loan.loanERC20Denomination).transferFrom(loan.borrower, lender, payoffAmount);

    // Transfer fees from borrower to admins
    IERC20(loan.loanERC20Denomination).transferFrom(loan.borrower, owner(), adminFee);

    // Transfer collateral from this contract to borrower.
    require(_transferNftToAddress(loan.nftCollateralContract, loan.nftCollateralId, loan.borrower), "NFT was not successfully transferred");

    // Destroy the lender's promissory note.
    // _burn(_loanId);

    // Emit an event with all relevant details from this transaction.
    emit LoanRepaid(
      _loanId,
      loan.borrower,
      lender,
      loan.loanPrincipalAmount,
      loan.nftCollateralId,
      payoffAmount,
      adminFee,
      loan.nftCollateralContract,
      loan.loanERC20Denomination
    );

    // Delete the loan from storage in order to achieve a substantial gas
    // savings and to lessen the burden of storage on Ethereum nodes, since
    // we will never access this loan's details again, and the details are
    // still available through event data.
    delete loanIdToLoan[_loanId];
  }

  function liquidateOverdueLoan(uint256 _loanId) external nonReentrant {
    // Sanity check that payBackLoan() and liquidateOverdueLoan() have
    // never been called on this loanId. Depending on how the rest of the
    // code turns out, this check may be unnecessary.
    require(!loanRepaidOrLiquidated[_loanId], "Loan has already been repaid or liquidated");

    // Fetch loan details from storage, but store them in memory for the
    // sake of saving gas.
    Loan memory loan = loanIdToLoan[_loanId];

    // Ensure that the loan is indeed overdue, since we can only liquidate
    // overdue loans.
    uint256 loanMaturityDate = (uint256(loan.loanStartTime)).add(uint256(loan.loanDuration));
    require(block.timestamp > loanMaturityDate, "Loan is not overdue yet");

    // Fetch the current lender of the promissory note corresponding to
    // this overdue loan.
    address lender = address(0); //ownerOf(_loanId);

    // Mark loan as liquidated before doing any external transfers to
    // follow the Checks-Effects-Interactions design pattern.
    loanRepaidOrLiquidated[_loanId] = true;

    // Update number of active loans.
    totalActiveLoans = totalActiveLoans.sub(1);

    // Transfer collateral from this contract to the lender, since the
    // lender is seizing collateral for an overdue loan.
    require(_transferNftToAddress(loan.nftCollateralContract, loan.nftCollateralId, lender), "NFT was not successfully transferred");

    // Destroy the lender's promissory note for this loan, since by seizing
    // the collateral, the lender has forfeit the rights to the loan
    // principal-plus-interest.
    // _burn(_loanId);

    // Emit an event with all relevant details from this transaction.
    emit LoanLiquidated(
      _loanId,
      loan.borrower,
      lender,
      loan.loanPrincipalAmount,
      loan.nftCollateralId,
      loanMaturityDate,
      block.timestamp,
      loan.nftCollateralContract
    );

    // Delete the loan from storage in order to achieve a substantial gas
    // savings and to lessen the burden of storage on Ethereum nodes, since
    // we will never access this loan's details again, and the details are
    // still available through event data.
    delete loanIdToLoan[_loanId];
  }

  function cancelLoanCommitmentBeforeLoanHasBegun(uint256 _nonce) external {
    require(!_nonceHasBeenUsedForUser[msg.sender][_nonce], "Nonce invalid, user has either cancelled/begun this loan, or reused a nonce when signing");
    _nonceHasBeenUsedForUser[msg.sender][_nonce] = true;
  }

  /* ******************* */
  /* READ-ONLY FUNCTIONS */
  /* ******************* */

  function getPayoffAmount(uint256 _loanId) public view returns (uint256) {
    Loan storage loan = loanIdToLoan[_loanId];
    if (loan.interestIsProRated == false) {
      return loan.maximumRepaymentAmount;
    } else {
      uint256 loanDurationSoFarInSeconds = block.timestamp.sub(uint256(loan.loanStartTime));
      uint256 interestDue = _computeInterestDue(
        loan.loanPrincipalAmount,
        loan.maximumRepaymentAmount,
        loanDurationSoFarInSeconds,
        uint256(loan.loanDuration),
        uint256(loan.loanInterestRateForDurationInBasisPoints)
      );
      return (loan.loanPrincipalAmount).add(interestDue);
    }
  }

  function getWhetherNonceHasBeenUsedForUser(address _user, uint256 _nonce) public view returns (bool) {
    return _nonceHasBeenUsedForUser[_user][_nonce];
  }

  /* ****************** */
  /* INTERNAL FUNCTIONS */
  /* ****************** */

  function _computeInterestDue(
    uint256 _loanPrincipalAmount,
    uint256 _maximumRepaymentAmount,
    uint256 _loanDurationSoFarInSeconds,
    uint256 _loanTotalDurationAgreedTo,
    uint256 _loanInterestRateForDurationInBasisPoints
  ) internal pure returns (uint256) {
    uint256 interestDueAfterEntireDuration = (_loanPrincipalAmount.mul(_loanInterestRateForDurationInBasisPoints)).div(uint256(10000));
    uint256 interestDueAfterElapsedDuration = (interestDueAfterEntireDuration.mul(_loanDurationSoFarInSeconds)).div(_loanTotalDurationAgreedTo);
    if (_loanPrincipalAmount.add(interestDueAfterElapsedDuration) > _maximumRepaymentAmount) {
      return _maximumRepaymentAmount.sub(_loanPrincipalAmount);
    } else {
      return interestDueAfterElapsedDuration;
    }
  }

  function _computeAdminFee(uint256 _interestDue, uint256 _adminFeeInBasisPoints) internal pure returns (uint256) {
    return (_interestDue.mul(_adminFeeInBasisPoints)).div(10000);
  }

  function _transferNftToAddress(
    address _nftContract,
    uint256 _nftId,
    address _recipient
  ) internal returns (bool) {
    // Try to call transferFrom()
    bool transferFromSucceeded = _attemptTransferFrom(_nftContract, _nftId, _recipient);
    if (transferFromSucceeded) {
      return true;
    } else {
      // Try to call transfer()
      bool transferSucceeded = _attemptTransfer(_nftContract, _nftId, _recipient);
      return transferSucceeded;
    }
  }

  function _attemptTransferFrom(
    address _nftContract,
    uint256 _nftId,
    address _recipient
  ) internal returns (bool) {
    // @notice Some NFT contracts will not allow you to approve an NFT that
    //         you own, so we cannot simply call approve() here, we have to
    //         try to call it in a manner that allows the call to fail.
    _nftContract.call(abi.encodeWithSelector(IERC721(_nftContract).approve.selector, address(this), _nftId));

    // @notice Some NFT contracts will not allow you to call transferFrom()
    //         for an NFT that you own but that is not approved, so we
    //         cannot simply call transferFrom() here, we have to try to
    //         call it in a manner that allows the call to fail.
    (bool success, ) = _nftContract.call(abi.encodeWithSelector(IERC721(_nftContract).transferFrom.selector, address(this), _recipient, _nftId));
    return success;
  }

  function _attemptTransfer(
    address _nftContract,
    uint256 _nftId,
    address _recipient
  ) internal returns (bool) {
    // @notice Some NFT contracts do not implement transfer(), since it is
    //         not a part of the official ERC721 standard, but many
    //         prominent NFT projects do implement it (such as
    //         Cryptokitties), so we cannot simply call transfer() here, we
    //         have to try to call it in a manner that allows the call to
    //         fail.
    (bool success, ) = _nftContract.call(abi.encodeWithSelector(ICryptoKittiesCore(_nftContract).transfer.selector, _recipient, _nftId));
    return success;
  }

  /* ***************** */
  /* FALLBACK FUNCTION */
  /* ***************** */

  fallback() external payable {
    revert();
  }
}

abstract contract ICryptoKittiesCore {
  function transfer(address _to, uint256 _tokenId) external virtual;
}
