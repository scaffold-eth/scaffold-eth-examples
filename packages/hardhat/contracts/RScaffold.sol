pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {ReentrancyGuard} from "./ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAllocationStrategy} from "./IAllocationStrategy.sol";


contract RScaffold is
    Ownable,
    ReentrancyGuard {
    using SafeMath for uint256;

    /**
     * @notice Create rToken linked with cToken at `cToken_`
     */
     constructor(
        IAllocationStrategy allocationStrategy,
        string memory name_,
        string memory symbol_,
        uint256 decimals_) public {
        require(!initialized, "The library has already been initialized.");
        initialized = true;
        _owner = msg.sender;
        _guardCounter = 1;
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
        savingAssetConversionRate = INITIAL_SAVING_ASSET_CONVERSION_RATE;
        ias = allocationStrategy;
        token = IERC20(ias.underlying());

        // special hat aka. zero hat : hatID = 0
        hats.push(Hat(new address[](0), new uint32[](0)));

        // everyone is using it by default!
        hatStats[0].useCount = MAX_UINT256;

    }

    function balanceOf(address owner) external view returns (uint256) {
        return accounts[owner].rAmount;
    }

    function allowance(address owner, address spender)
        external
        view
        returns (uint256)
    {
        return transferAllowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        address src = msg.sender;
        transferAllowances[src][spender] = amount;
        return true;
    }

    function transfer(address dst, uint256 amount)
        external
        nonReentrant
        returns (bool)
    {
        address src = msg.sender;
        payInterestInternal(src);
        transferInternal(src, src, dst, amount);
        payInterestInternal(dst);
        return true;
    }

    function transferAll(address dst) external nonReentrant returns (bool) {
        address src = msg.sender;
        payInterestInternal(src);
        transferInternal(src, src, dst, accounts[src].rAmount);
        payInterestInternal(dst);
        return true;
    }

    /// @dev IRToken.transferAllFrom implementation
    function transferAllFrom(address src, address dst)
        external
        nonReentrant
        returns (bool)
    {
        payInterestInternal(src);
        transferInternal(msg.sender, src, dst, accounts[src].rAmount);
        payInterestInternal(dst);
        return true;
    }

    /**
     * @notice Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a `Transfer` event.
     */
    function transferFrom(address src, address dst, uint256 amount)
        external
        nonReentrant
        returns (bool)
    {
        payInterestInternal(src);
        transferInternal(msg.sender, src, dst, amount);
        payInterestInternal(dst);
        return true;
    }

    //
    // rToken interface
    //

    /// @dev IRToken.mint implementation
    function mint(uint256 mintAmount) external nonReentrant returns (bool) {
        mintInternal(mintAmount);
        payInterestInternal(msg.sender);
        return true;
    }

    /// @dev IRToken.mintWithSelectedHat implementation
    function mintWithSelectedHat(uint256 mintAmount, uint256 hatID)
        external
        nonReentrant
        returns (bool)
    {
        changeHatInternal(msg.sender, hatID);
        mintInternal(mintAmount);
        payInterestInternal(msg.sender);
        return true;
    }

    // 0x97843608a00e2bbc75ab0c1911387e002565dede

    function mintWithNewHatForBuidlGuidl(
        uint256 mintAmount,
        uint32 proportion
    ) external nonReentrant returns (bool) {
        address[] memory recipients = new address[](2);
        recipients[0] = address(msg.sender);
        recipients[1] = 0x97843608a00e2bbc75ab0C1911387E002565DEDE;
        uint32[] memory proportions = new uint32[](2);
        proportions[0] = 100 - proportion;
        proportions[1] = proportion;
        uint256 hatID = createHatInternal(recipients, proportions);
        changeHatInternal(msg.sender, hatID);
        mintInternal(mintAmount);
        payInterestInternal(msg.sender);
        return true;
    }


    /**
     * @dev IRToken.mintWithNewHat implementation
     */
    function mintWithNewHat(
        uint256 mintAmount,
        address[] calldata recipients,
        uint32[] calldata proportions
    ) external nonReentrant returns (bool) {
        uint256 hatID = createHatInternal(recipients, proportions);
        changeHatInternal(msg.sender, hatID);
        mintInternal(mintAmount);
        payInterestInternal(msg.sender);
        return true;
    }

    /**
     * @dev IRToken.redeem implementation
     *      It withdraws equal amount of initially supplied underlying assets
     */
    function redeem(uint256 redeemTokens) external nonReentrant returns (bool) {
        address src = msg.sender;
        payInterestInternal(src);
        redeemInternal(src, redeemTokens);
        return true;
    }

    event redeemTest(address _owner, uint256 amountRedeemed);

    /// @dev IRToken.redeemAll implementation
    function redeemAll() external nonReentrant returns (bool) {
        address src = msg.sender;
        payInterestInternal(src);
        emit redeemTest(msg.sender, accounts[src].rAmount);
        redeemInternal(src, accounts[src].rAmount);
        return true;
    }

    /// @dev IRToken.redeemAndTransfer implementation
    function redeemAndTransfer(address redeemTo, uint256 redeemTokens)
        external
        nonReentrant
        returns (bool)
    {
        address src = msg.sender;
        payInterestInternal(src);
        redeemInternal(redeemTo, redeemTokens);
        return true;
    }

    /// @dev IRToken.redeemAndTransferAll implementation
    function redeemAndTransferAll(address redeemTo)
        external
        nonReentrant
        returns (bool)
    {
        address src = msg.sender;
        payInterestInternal(src);
        redeemInternal(redeemTo, accounts[src].rAmount);
        return true;
    }

    /// @dev IRToken.createHat implementation
    function createHat(
        address[] calldata recipients,
        uint32[] calldata proportions,
        bool doChangeHat
    ) external nonReentrant returns (uint256 hatID) {
        hatID = createHatInternal(recipients, proportions);
        if (doChangeHat) {
            changeHatInternal(msg.sender, hatID);
        }
    }

    /// @dev IRToken.changeHat implementation
    function changeHat(uint256 hatID) external nonReentrant returns (bool) {
        changeHatInternal(msg.sender, hatID);
        payInterestInternal(msg.sender);
        return true;
    }

    /// @dev IRToken.getMaximumHatID implementation
    function getMaximumHatID() external view returns (uint256 hatID) {
        return hats.length - 1;
    }

    /// @dev IRToken.getHatByAddress implementation
    function getHatByAddress(address owner)
        external
        view
        returns (
            uint256 hatID,
            address[] memory recipients,
            uint32[] memory proportions
        )
    {
        hatID = accounts[owner].hatID;
        (recipients, proportions) = _getHatByID(hatID);
    }

    /// @dev IRToken.getHatByID implementation
    function getHatByID(uint256 hatID)
        external
        view
        returns (address[] memory recipients, uint32[] memory proportions) {
        (recipients, proportions) = _getHatByID(hatID);
    }

    function _getHatByID(uint256 hatID)
        private
        view
        returns (address[] memory recipients, uint32[] memory proportions) {
        if (hatID != 0 && hatID != SELF_HAT_ID) {
            Hat memory hat = hats[hatID];
            recipients = hat.recipients;
            proportions = hat.proportions;
        } else {
            recipients = new address[](0);
            proportions = new uint32[](0);
        }
    }

    /// @dev IRToken.receivedSavingsOf implementation
    function receivedSavingsOf(address owner)
        external
        view
        returns (uint256 amount)
    {
        Account storage account = accounts[owner];
        uint256 rGross = sInternalToR(account.sInternalAmount);
        return rGross;
    }

    /// @dev IRToken.receivedLoanOf implementation
    function receivedLoanOf(address owner)
        external
        view
        returns (uint256 amount)
    {
        Account storage account = accounts[owner];
        return account.lDebt;
    }

    /// @dev IRToken.interestPayableOf implementation
    function interestPayableOf(address owner)
        external
        view
        returns (uint256 amount)
    {
        Account storage account = accounts[owner];
        return getInterestPayableOf(account);
    }

    /// @dev IRToken.payInterest implementation
    function payInterest(address owner) external nonReentrant returns (bool) {
        payInterestInternal(owner);
        return true;
    }


    /// @dev IRToken.changeHatFor implementation
    function changeHatFor(address contractAddress, uint256 hatID) external onlyOwner {
        require(_isContract(contractAddress), "Admin can only change hat for contract address");
        changeHatInternal(contractAddress, hatID);
    }

    /**
     * @dev Transfer `tokens` tokens from `src` to `dst` by `spender`
            Called by both `transfer` and `transferFrom` internally
     * @param spender The address of the account performing the transfer
     * @param src The address of the source account
     * @param dst The address of the destination account
     * @param tokens The number of tokens to transfer
     */
    function transferInternal(
        address spender,
        address src,
        address dst,
        uint256 tokens
    ) internal {
        require(src != dst, "src should not equal dst");

        require(
            accounts[src].rAmount >= tokens,
            "Not enough balance to transfer"
        );

        /* Get the allowance, infinite for the account owner */
        uint256 startingAllowance = 0;
        if (spender == src) {
            startingAllowance = MAX_UINT256;
        } else {
            startingAllowance = transferAllowances[src][spender];
        }
        require(
            startingAllowance >= tokens,
            "Not enough allowance for transfer"
        );

        /* Do the calculations, checking for {under,over}flow */
        uint256 allowanceNew = startingAllowance.sub(tokens);
        uint256 srcTokensNew = accounts[src].rAmount.sub(tokens);
        uint256 dstTokensNew = accounts[dst].rAmount.add(tokens);

        /* Eat some of the allowance (if necessary) */
        if (startingAllowance != MAX_UINT256) {
            transferAllowances[src][spender] = allowanceNew;
        }

        // lRecipients adjustments
        uint256 sInternalEstimated = estimateAndRecollectLoans(src, tokens);
        distributeLoans(dst, tokens, sInternalEstimated);

        // update token balances
        accounts[src].rAmount = srcTokensNew;
        accounts[dst].rAmount = dstTokensNew;

        // apply hat inheritance rule
        if ((accounts[src].hatID != 0 &&
            accounts[dst].hatID == 0 &&
            accounts[src].hatID != SELF_HAT_ID)) {
            changeHatInternal(dst, accounts[src].hatID);
        }

        /* We emit a Transfer event */
    }

    event mintInternalTest(address _owner, address sender, uint256 amountApproved, uint256 amountWanted);

    function mintInternal(uint256 mintAmount) internal {
        emit mintInternalTest(_owner, msg.sender, transferAllowances[_owner][msg.sender], mintAmount);

        require(
            token.allowance(msg.sender, address(this)) >= mintAmount,
            "Not enough allowance"
        );

        Account storage account = accounts[msg.sender];

        // create saving assets
        require(token.transferFrom(msg.sender, address(this), mintAmount), "token transfer failed");
        require(token.approve(address(ias), mintAmount), "token approve failed");
        uint256 sOriginalCreated = ias.investUnderlying(mintAmount);

        // update global and account r balances
        totalSupply = totalSupply.add(mintAmount);
        account.rAmount = account.rAmount.add(mintAmount);

        // update global stats
        savingAssetOrignalAmount = savingAssetOrignalAmount.add(sOriginalCreated);

        // distribute saving assets as loans to recipients
        uint256 sInternalCreated = sOriginalToSInternal(sOriginalCreated);
        distributeLoans(msg.sender, mintAmount, sInternalCreated);

    }


    function redeemInternal(address redeemTo, uint256 redeemAmount) internal {
        Account storage account = accounts[msg.sender];
        require(redeemAmount > 0, "Redeem amount cannot be zero");
        require(
            redeemAmount <= account.rAmount,
            "Not enough balance to redeem"
        );

        redeemAndRecollectLoans(msg.sender, redeemAmount);

        // update Account r balances and global statistics
        account.rAmount = account.rAmount.sub(redeemAmount);
        totalSupply = totalSupply.sub(redeemAmount);

        // transfer the token back
        require(token.transfer(redeemTo, redeemAmount), "token transfer failed");

    }


    function createHatInternal(
        address[] memory recipients,
        uint32[] memory proportions
    ) internal returns (uint256 hatID) {
        uint256 i;

        require(recipients.length > 0, "Invalid hat: at least one recipient");
        require(recipients.length <= MAX_NUM_HAT_RECIPIENTS, "Invalild hat: maximum number of recipients reached");
        require(
            recipients.length == proportions.length,
            "Invalid hat: length not matching"
        );

        // normalize the proportions
        // safemath is not used here, because:
        // proportions are uint32, there is no overflow concern
        uint256 totalProportions = 0;
        for (i = 0; i < recipients.length; ++i) {
            require(
                proportions[i] > 0,
                "Invalid hat: proportion should be larger than 0"
            );
            require(recipients[i] != address(0), "Invalid hat: recipient should not be 0x0");
            // don't panic, no safemath, look above comment
            totalProportions += uint256(proportions[i]);
        }
        for (i = 0; i < proportions.length; ++i) {
            proportions[i] = uint32(
                // don't panic, no safemath, look above comment
                (uint256(proportions[i]) * uint256(PROPORTION_BASE)) /
                    totalProportions
            );
        }

       hats.push(Hat(recipients, proportions));
       hatID = hats.length - 1;
    }

    function changeHatInternal(address owner, uint256 hatID) internal {
        require(hatID == SELF_HAT_ID || hatID < hats.length, "Invalid hat ID");
        Account storage account = accounts[owner];
        uint256 oldHatID = account.hatID;
        HatStatsStored storage oldHatStats = hatStats[oldHatID];
        HatStatsStored storage newHatStats = hatStats[hatID];
        if (account.rAmount > 0) {
            uint256 sInternalEstimated = estimateAndRecollectLoans(owner, account.rAmount);
            account.hatID = hatID;
            distributeLoans(owner, account.rAmount, sInternalEstimated);
        } else {
            account.hatID = hatID;
        }
        oldHatStats.useCount -= 1;
        newHatStats.useCount += 1;
    }

    function getInterestPayableOf(Account storage account)
        internal
        view
        returns (uint256)
    {
        uint256 rGross = sInternalToR(account.sInternalAmount);
        if (rGross > (account.lDebt.add(account.rInterest))) {
            // don't panic, the condition guarantees that safemath is not needed
            return rGross - account.lDebt;
        } else {
            // no interest accumulated yet or even negative interest rate!?
            return 0;
        }
    }


    function distributeLoans(
        address owner,
        uint256 rAmount,
        uint256 sInternalAmount
    ) internal {
        Account storage account = accounts[owner];
        Hat storage hat = hats[account.hatID == SELF_HAT_ID
            ? 0
            : account.hatID];
        uint256 i;
        if (hat.recipients.length > 0) {
            uint256 rLeft = rAmount;
            uint256 sInternalLeft = sInternalAmount;
            for (i = 0; i < hat.proportions.length; ++i) {
                Account storage recipientAccount = accounts[hat.recipients[i]];
                bool isLastRecipient = i == (hat.proportions.length - 1);

                // calculate the loan amount of the recipient
                uint256 lDebtRecipient = isLastRecipient
                    ? rLeft
                    : (rAmount.mul(hat.proportions[i])) / PROPORTION_BASE;
                // distribute the loan to the recipient
                account.lRecipients[hat.recipients[i]] = account.lRecipients[hat.recipients[i]]
                    .add(lDebtRecipient);
                recipientAccount.lDebt = recipientAccount.lDebt
                    .add(lDebtRecipient);
                // remaining value adjustments
                rLeft = gentleSub(rLeft, lDebtRecipient);

                // calculate the savings holdings of the recipient
                uint256 sInternalAmountRecipient = isLastRecipient
                    ? sInternalLeft
                    : (sInternalAmount.mul(hat.proportions[i])) / PROPORTION_BASE;
                recipientAccount.sInternalAmount = recipientAccount.sInternalAmount
                    .add(sInternalAmountRecipient);
                // remaining value adjustments
                sInternalLeft = gentleSub(sInternalLeft, sInternalAmountRecipient);

                _updateLoanStats(owner, hat.recipients[i], account.hatID, true, lDebtRecipient, sInternalAmountRecipient);
            }
        } else {
            // Account uses the zero/self hat, give all interest to the owner
            account.lDebt = account.lDebt.add(rAmount);
            account.sInternalAmount = account.sInternalAmount
                .add(sInternalAmount);

            _updateLoanStats(owner, owner, account.hatID, true, rAmount, sInternalAmount);
        }
    }

 
    function estimateAndRecollectLoans(address owner, uint256 rAmount)
        internal returns (uint256 sInternalEstimated)
    {
        // accrue interest so estimate is up to date
        require(ias.accrueInterest(), "accrueInterest failed");
        sInternalEstimated = rToSInternal(rAmount);
        recollectLoans(owner, rAmount);
    }

   
    function redeemAndRecollectLoans(address owner, uint256 rAmount)
        internal
    {
        uint256 sOriginalBurned = ias.redeemUnderlying(rAmount);
        sOriginalToSInternal(sOriginalBurned);
        recollectLoans(owner, rAmount);

        // update global stats
        if (savingAssetOrignalAmount > sOriginalBurned) {
            savingAssetOrignalAmount -= sOriginalBurned;
        } else {
            savingAssetOrignalAmount = 0;
        }
    }

    /**
     * @dev Recollect loan from the recipients
     * @param owner   Owner address
     * @param rAmount rToken amount of debt to be collected from the recipients
     */
    function recollectLoans(
        address owner,
        uint256 rAmount
    ) internal {
        Account storage account = accounts[owner];
        Hat storage hat = hats[account.hatID == SELF_HAT_ID
            ? 0
            : account.hatID];
        // interest part of the balance is not debt
        // hence maximum amount debt to be collected is:
        uint256 debtToCollect = gentleSub(account.rAmount, account.rInterest);
        // only a portion of debt needs to be collected
        if (debtToCollect > rAmount) {
            debtToCollect = rAmount;
        }
        uint256 sInternalToCollect = rToSInternal(debtToCollect);
        if (hat.recipients.length > 0) {
            uint256 rLeft = 0;
            uint256 sInternalLeft = 0;
            uint256 i;
            // adjust recipients' debt and savings
            rLeft = debtToCollect;
            sInternalLeft = sInternalToCollect;
            for (i = 0; i < hat.proportions.length; ++i) {
                Account storage recipientAccount = accounts[hat.recipients[i]];
                bool isLastRecipient = i == (hat.proportions.length - 1);

                // calulate loans to be collected from the recipient
                uint256 lDebtRecipient = isLastRecipient
                    ? rLeft
                    : (debtToCollect.mul(hat.proportions[i])) / PROPORTION_BASE;
                recipientAccount.lDebt = gentleSub(
                    recipientAccount.lDebt,
                    lDebtRecipient);
                account.lRecipients[hat.recipients[i]] = gentleSub(
                    account.lRecipients[hat.recipients[i]],
                    lDebtRecipient);
                // loans leftover adjustments
                rLeft = gentleSub(rLeft, lDebtRecipient);

                // calculate savings to be collected from the recipient
                uint256 sInternalAmountRecipient = isLastRecipient
                    ? sInternalLeft
                    : (sInternalToCollect.mul(hat.proportions[i])) / PROPORTION_BASE;
                recipientAccount.sInternalAmount = gentleSub(
                    recipientAccount.sInternalAmount,
                    sInternalAmountRecipient);
                // savings leftover adjustments
                sInternalLeft = gentleSub(sInternalLeft, sInternalAmountRecipient);

                adjustRInterest(recipientAccount);

                _updateLoanStats(owner, hat.recipients[i], account.hatID, false, lDebtRecipient, sInternalAmountRecipient);
            }
        } else {
            // Account uses the zero hat, recollect interests from the owner

            // collect debt from self hat
            account.lDebt = gentleSub(account.lDebt, debtToCollect);

            // collect savings
            account.sInternalAmount = gentleSub(account.sInternalAmount, sInternalToCollect);

            adjustRInterest(account);

            _updateLoanStats(owner, owner, account.hatID, false, debtToCollect, sInternalToCollect);
        }

        // debt-free portion of internal savings needs to be collected too
        if (rAmount > debtToCollect) {
            sInternalToCollect = rToSInternal(rAmount - debtToCollect);
            account.sInternalAmount = gentleSub(account.sInternalAmount, sInternalToCollect);
            adjustRInterest(account);
        }
    }

    /**
     * @dev pay interest to the owner
     * @param owner Account owner address
     */
    function payInterestInternal(address owner) internal {
        Account storage account = accounts[owner];
        AccountStatsStored storage stats = accountStats[owner];

        require(ias.accrueInterest(), "accrueInterest failed");
        uint256 interestAmount = getInterestPayableOf(account);

        if (interestAmount > 0) {
            stats.cumulativeInterest = stats
                .cumulativeInterest
                .add(interestAmount);
            account.rInterest = account.rInterest.add(interestAmount);
            account.rAmount = account.rAmount.add(interestAmount);
            totalSupply = totalSupply.add(interestAmount);
        }
    }

    function _updateLoanStats(
        address owner,
        address recipient,
        uint256 hatID,
        bool isDistribution,
        uint256 redeemableAmount,
        uint256 sInternalAmount) private {
        HatStatsStored storage hatStats = hatStats[hatID];


        if (isDistribution) {
            hatStats.totalLoans = hatStats.totalLoans.add(redeemableAmount);
            hatStats.totalInternalSavings = hatStats.totalInternalSavings
                .add(sInternalAmount);
        } else {
            hatStats.totalLoans = gentleSub(hatStats.totalLoans, redeemableAmount);
            hatStats.totalInternalSavings = gentleSub(
                hatStats.totalInternalSavings,
                sInternalAmount);
        }
    }

    function _isContract(address addr) private view returns (bool) {
      uint size;
      assembly { size := extcodesize(addr) }
      return size > 0;
    }

    /**
     * @dev Gently subtract b from a without revert
     *
     * Due to the use of integer arithmatic, imprecision may cause a tiny
     * amount to be off when substracting the otherwise precise proportions.
     */
    function gentleSub(uint256 a, uint256 b) private pure returns (uint256) {
        if (a < b) return 0;
        else return a - b;
    }

    /// @dev convert internal savings amount to redeemable amount
    function sInternalToR(uint256 sInternalAmount)
        private view
        returns (uint256 rAmount) {
        // - rGross is in underlying(redeemable) asset unit
        // - Both ias.exchangeRateStored and savingAssetConversionRate are scaled by 1e18
        //   they should cancel out
        // - Formula:
        //   savingsOriginalAmount = sInternalAmount / savingAssetConversionRate
        //   rGross = savingAssetOrignalAmount * ias.exchangeRateStored
        //   =>
        return sInternalAmount
            .mul(ias.exchangeRateStored())
            .div(savingAssetConversionRate);
    }

    /// @dev convert redeemable amount to internal savings amount
    function rToSInternal(uint256 rAmount)
        private view
        returns (uint256 sInternalAmount) {
        return rAmount
            .mul(savingAssetConversionRate)
            .div(ias.exchangeRateStored());
    }

    /// @dev convert original savings amount to redeemable amount
    function sOriginalToR(uint sOriginalAmount)
        private view
        returns (uint256 sInternalAmount) {
        return sOriginalAmount
            .mul(ias.exchangeRateStored())
            .div(ALLOCATION_STRATEGY_EXCHANGE_RATE_SCALE);
    }

    // @dev convert from original savings amount to internal savings amount
    function sOriginalToSInternal(uint sOriginalAmount)
        private view
        returns (uint256 sInternalAmount) {
        // savingAssetConversionRate is scaled by 1e18
        return sOriginalAmount
            .mul(savingAssetConversionRate)
            .div(ALLOCATION_STRATEGY_EXCHANGE_RATE_SCALE);
    }

    // @dev convert from internal savings amount to original savings amount
    function sInternalToSOriginal(uint sInternalAmount)
        private view
        returns (uint256 sOriginalAmount) {
        // savingAssetConversionRate is scaled by 1e18
        return sInternalAmount
            .mul(ALLOCATION_STRATEGY_EXCHANGE_RATE_SCALE)
            .div(savingAssetConversionRate);
    }

    // @dev adjust rInterest value
    //      if savings are transferred, rInterest should be also adjusted
    function adjustRInterest(Account storage account) private {
        uint256 rGross = sInternalToR(account.sInternalAmount);
        if (account.rInterest > rGross - account.lDebt) {
            account.rInterest = rGross - account.lDebt;
        }
    }

    struct GlobalStats {
        uint256 totalSupply;
        /// @notice Total saving assets in redeemable amount
        uint256 totalSavingsAmount;
    }

    /**
     * @notice Account stats stored
     */
    struct AccountStatsView {
        /// @notice Current hat ID
        uint256 hatID;
        /// @notice Current redeemable amount
        uint256 rAmount;
        /// @notice Interest portion of the rAmount
        uint256 rInterest;
        /// @notice Current loaned debt amount
        uint256 lDebt;
        /// @notice Current internal savings amount
        uint256 sInternalAmount;
        /// @notice Interest payable
        uint256 rInterestPayable;
        /// @notice Cumulative interest generated for the account
        uint256 cumulativeInterest;
        /// @notice Loans lent to the recipients
        uint256 lRecipientsSum;
    }

    /**
     * @notice Account stats stored
     */
    struct AccountStatsStored {
        /// @notice Cumulative interest generated for the account
        uint256 cumulativeInterest;
    }

    /**
     * @notice Hat stats view
     */
    struct HatStatsView {
        /// @notice Number of addresses has the hat
        uint256 useCount;
        /// @notice Total net loans distributed through the hat
        uint256 totalLoans;
        /// @notice Total net savings distributed through the hat
        uint256 totalSavings;
    }

    /**
     * @notice Hat stats stored
     */
    struct HatStatsStored {
        /// @notice Number of addresses has the hat
        uint256 useCount;
        /// @notice Total net loans distributed through the hat
        uint256 totalLoans;
        /// @notice Total net savings distributed through the hat
        uint256 totalInternalSavings;
    }

    /**
     * @notice Hat structure describes who are the recipients of the interest
     *
     * To be a valid hat structure:
     *   - at least one recipient
     *   - recipients.length == proportions.length
     *   - each value in proportions should be greater than 0
     */
    struct Hat {
        address[] recipients;
        uint32[] proportions;
    }

    /// @dev Account structure
    struct Account {
        /// @notice Current selected hat ID of the account
        uint256 hatID;
        /// @notice Current balance of the account (non realtime)
        uint256 rAmount;
        /// @notice Interest rate portion of the rAmount
        uint256 rInterest;
        /// @notice Debt in redeemable amount lent to recipients
        //          In case of self-hat, external debt is optimized to not to
        //          be stored in lRecipients
        mapping(address => uint256) lRecipients;
        /// @notice Received loan.
        ///         Debt in redeemable amount owed to the lenders distributed
        ///         through one or more hats.
        uint256 lDebt;
        /// @notice Savings internal accounting amount.
        ///         Debt is sold to buy savings
        uint256 sInternalAmount;
    }

    address public _owner;
    bool public initialized;
    /// @dev counter to allow mutex lock with only one SSTORE operation
    uint256 public _guardCounter;
    /**
     * @notice EIP-20 token name for this token
     */
    string public name;
    /**
     * @notice EIP-20 token symbol for this token
     */
    string public symbol;
    /**
     * @notice EIP-20 token decimals for this token
     */
    uint256 public decimals;
    /**
     * @notice Total number of tokens in circulation
     */
    uint256 public totalSupply;
    /// @dev Current saving strategy
    IAllocationStrategy public ias;
    /// @dev Underlying token
    IERC20 public token;
    /// @dev Saving assets original amount
    /// This amount is in the same unit used in allocation strategy
    uint256 public savingAssetOrignalAmount;
    /// @dev Saving asset original to internal amount conversion rate
    uint256 public savingAssetConversionRate;
    /// @dev Approved token transfer amounts on behalf of others
    mapping(address => mapping(address => uint256)) public transferAllowances;
    /// @dev Hat list
    Hat[] internal hats;
    /// @dev Account mapping
    mapping(address => Account) public accounts;
    /// @dev AccountStats mapping
    mapping(address => AccountStatsStored) public accountStats;
    /// @dev HatStats mapping
    mapping(uint256 => HatStatsStored) public hatStats;


    uint256 private constant ALLOCATION_STRATEGY_EXCHANGE_RATE_SCALE = 1e18;
    uint256 private constant INITIAL_SAVING_ASSET_CONVERSION_RATE = 1e18;
    uint256 private constant MAX_UINT256 = uint256(int256(-1));
    uint256 private constant SELF_HAT_ID = MAX_UINT256;
    uint32  private constant PROPORTION_BASE = 0xFFFFFFFF;
    uint256 private constant MAX_NUM_HAT_RECIPIENTS = 50;
}
