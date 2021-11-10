pragma solidity >=0.6.0 <0.7.0;

// converted from ethereum/contracts/compound/abi/CErc20.json
interface CErc20Interface {

    function name() external view returns (
        string memory
    );

    function approve(
        address spender,
        uint256 amount
    ) external returns (
        bool
    );

    function repayBorrow(
        uint256 repayAmount
    ) external returns (
        uint256
    );

    function reserveFactorMantissa() external view returns (
        uint256
    );

    function borrowBalanceCurrent(
        address account
    ) external returns (
        uint256
    );

    function totalSupply() external view returns (
        uint256
    );

    function exchangeRateStored() external view returns (
        uint256
    );

    function transferFrom(
        address src,
        address dst,
        uint256 amount
    ) external returns (
        bool
    );

    function repayBorrowBehalf(
        address borrower,
        uint256 repayAmount
    ) external returns (
        uint256
    );

    function pendingAdmin() external view returns (
        address
    );

    function decimals() external view returns (
        uint256
    );

    function balanceOfUnderlying(
        address owner
    ) external returns (
        uint256
    );

    function getCash() external view returns (
        uint256
    );

    function _setComptroller(
        address newComptroller
    ) external returns (
        uint256
    );

    function totalBorrows() external view returns (
        uint256
    );

    function comptroller() external view returns (
        address
    );

    function _reduceReserves(
        uint256 reduceAmount
    ) external returns (
        uint256
    );

    function initialExchangeRateMantissa() external view returns (
        uint256
    );

    function accrualBlockNumber() external view returns (
        uint256
    );

    function underlying() external view returns (
        address
    );

    function balanceOf(
        address owner
    ) external view returns (
        uint256
    );

    function totalBorrowsCurrent() external returns (
        uint256
    );

    function redeemUnderlying(
        uint256 redeemAmount
    ) external returns (
        uint256
    );

    function totalReserves() external view returns (
        uint256
    );

    function symbol() external view returns (
        string memory
    );

    function borrowBalanceStored(
        address account
    ) external view returns (
        uint256
    );

    function mint(
        uint256 mintAmount
    ) external returns (
        uint256
    );

    function accrueInterest() external returns (
        uint256
    );

    function transfer(
        address dst,
        uint256 amount
    ) external returns (
        bool
    );

    function borrowIndex() external view returns (
        uint256
    );

    function supplyRatePerBlock() external view returns (
        uint256
    );

    function seize(
        address liquidator,
        address borrower,
        uint256 seizeTokens
    ) external returns (
        uint256
    );

    function _setPendingAdmin(
        address newPendingAdmin
    ) external returns (
        uint256
    );

    function exchangeRateCurrent() external returns (
        uint256
    );

    function getAccountSnapshot(
        address account
    ) external view returns (
        uint256,
        uint256,
        uint256,
        uint256
    );

    function borrow(
        uint256 borrowAmount
    ) external returns (
        uint256
    );

    function redeem(
        uint256 redeemTokens
    ) external returns (
        uint256
    );

    function allowance(
        address owner,
        address spender
    ) external view returns (
        uint256
    );

    function _acceptAdmin() external returns (
        uint256
    );

    function _setInterestRateModel(
        address newInterestRateModel
    ) external returns (
        uint256
    );

    function interestRateModel() external view returns (
        address
    );

    function liquidateBorrow(
        address borrower,
        uint256 repayAmount,
        address cTokenCollateral
    ) external returns (
        uint256
    );

    function admin() external view returns (
        address
    );

    function borrowRatePerBlock() external view returns (
        uint256
    );

    function _setReserveFactor(
        uint256 newReserveFactorMantissa
    ) external returns (
        uint256
    );

    function isCToken() external view returns (
        bool
    );

    /*
    constructor(
        address underlying_,
        address comptroller_,
        address interestRateModel_,
        uint256 initialExchangeRateMantissa_,
        string  calldata name_,
        string  calldata symbol_,
        uint256 decimals_
    );
    */

    event AccrueInterest(
        uint256 interestAccumulated,
        uint256 borrowIndex,
        uint256 totalBorrows
    );

    event Mint(
        address minter,
        uint256 mintAmount,
        uint256 mintTokens
    );

    event Redeem(
        address redeemer,
        uint256 redeemAmount,
        uint256 redeemTokens
    );

    event Borrow(
        address borrower,
        uint256 borrowAmount,
        uint256 accountBorrows,
        uint256 totalBorrows
    );

    event RepayBorrow(
        address payer,
        address borrower,
        uint256 repayAmount,
        uint256 accountBorrows,
        uint256 totalBorrows
    );

    event LiquidateBorrow(
        address liquidator,
        address borrower,
        uint256 repayAmount,
        address cTokenCollateral,
        uint256 seizeTokens
    );

    event NewPendingAdmin(
        address oldPendingAdmin,
        address newPendingAdmin
    );

    event NewAdmin(
        address oldAdmin,
        address newAdmin
    );

    event NewComptroller(
        address oldComptroller,
        address newComptroller
    );

    event NewMarketInterestRateModel(
        address oldInterestRateModel,
        address newInterestRateModel
    );

    event NewReserveFactor(
        uint256 oldReserveFactorMantissa,
        uint256 newReserveFactorMantissa
    );

    event ReservesReduced(
        address admin,
        uint256 reduceAmount,
        uint256 newTotalReserves
    );

    event Failure(
        uint256 error,
        uint256 info,
        uint256 detail
    );

    event Transfer(
        address from,
        address to,
        uint256 amount
    );

    event Approval(
        address owner,
        address spender,
        uint256 amount
    );

}
