/**
 *Submitted for verification at Etherscan.io on 2020-05-21
*/

pragma solidity ^0.7.1;


interface AaveInterface {
     // Deposit 
     function deposit(address _reserve, uint256 _amount, uint16 _referralCode) external payable;
     // Borrow
     function borrow(address _reserve, uint256 _amount, uint256 _interestRateMode, uint16 _referralCode) external;
     // User Details
     function getUserAccountData(address _user) external view returns ( 
            uint256 totalLiquidityETH,
            uint256 totalCollateralETH,
            uint256 totalBorrowsETH,
            uint256 totalFeesETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
}

interface UniswapInterface {
    // Provide Liquidity
    function addLiquidity(uint256 min_liquidity, uint256 max_tokens, uint256 deadline) external payable returns (uint256);
    
    // ETH-TOKEN SWAP
    function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline) external payable returns (uint256  tokens_bought);
    
    // TOKEN-ETH SWAP
    function tokenToEthSwapInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline) external returns (uint256  eth_bought);
    
    // Approve UNI tokens
    function approve(address _spender, uint256 _value) external returns (bool);
}

library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

contract Helper {
     /**
     * @dev get Lending Pool uniswap market ropsten address
     */
    function getLendingPool() public pure returns (address lendingpool) {
        lendingpool = 0xA03105cc79128D7d67f36401c8518695C08C7d0C;
    }
    /**
     * @dev get Lending Pool Core uniswap market ropsten address
     */
    function getLendingPoolCore() public pure returns (address lendingpoolcore) {
        lendingpoolcore = 0x07Cdaf84340410ca8dB93bDDf77783C61032B75d;
    }
    /**
     * @dev get aave dai uniswap market ropsten address 
     */
    function getDai() public pure returns (address dai) {
        dai = 0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108;
    }
    /**
     * @dev get uni dai-eth uniswap market ropsten address 
     */
    function getExchange() public pure returns (address exchange) {
        exchange = 0xC245A7d35E652Cae438A1FdB13E474DF53DBB81D;
    }
}


interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract DeFiFacet is Helper{
    event UniLeveraged(
        address indexed liquidityProvider,
        uint256 collateral,
        uint256 indexed healthFactor);
    
    using SafeMath for uint256;

    /**
     * @dev Levrage 2x Long on your ETH/DAI Pool in Uniswap
     * @param maxAmount - amount calulated at web3 level to save a mathmatical operation here(A very high value)
     */
    function zappify(uint256 maxAmount) public payable returns(bool)
        {
            // Swapping 50 % ETH for DAI
            uint256 ethToSwap = (msg.value).div(2);
            
            // Calculating Min Liquidity Cannot be 0, Min Token & Min Eth also cannot be 0 so taking a very small amount % of eth
            uint256 minAmt = (msg.value).div(5000000);
            
            // Approving The exchange and lending pool to spent dai
            IERC20(getDai()).approve(getExchange(), maxAmount);
            
            // ETH To Token Swap
            uint256 daiAmt = UniswapInterface(getExchange()).ethToTokenSwapInput{value: ethToSwap}(minAmt, block.timestamp + 300);
            
            // Adding Liquidity
            uint256 uniDai = UniswapInterface(getExchange()).addLiquidity{value: ethToSwap}(minAmt, daiAmt, block.timestamp + 300);
            
            // Depositing UNI Token into AAVE
            // Exchange Address is the UNI Token Address
            UniswapInterface(getExchange()).approve(getLendingPoolCore(), maxAmount);

            AaveInterface(getLendingPool()).deposit{value: 0}(getExchange(), uniDai, 0);
            
            // Loan To Value Ratio for borrowing dai is 75 % so for safety keeping it as 70 %
            uint256 daiToBorrow = (uniDai.mul(70)).div(100);
            
            //Borrowing Safe Amount of DAI
            AaveInterface(getLendingPool()).borrow(getDai(), daiToBorrow, 1, 0);
            
            // Swapping 50 % DAI for ETH
            uint256 daiToSwap = daiToBorrow.div(2);
            
            // Token to ETH Swap
            uint256 ethAmount = UniswapInterface(getExchange()).tokenToEthSwapInput(daiToSwap, 10, block.timestamp + 300);
            
            // Adding Liquidity
            uniDai =  UniswapInterface(getExchange()).addLiquidity{value:ethAmount}(minAmt, daiToSwap, block.timestamp + 300);
            
            // Depositing Again for Levergaing
            UniswapInterface(getExchange()).approve(getLendingPoolCore(), maxAmount);

            AaveInterface(getLendingPool()).deposit{value: 0}(getExchange(), uniDai, 0);
            
            // Getting User's Details
            (, uint collateral, , , , , , uint healthFactor) = AaveInterface(getLendingPool()).getUserAccountData(msg.sender);

            // Emmiting the Leveraged Event on Success
            emit UniLeveraged(msg.sender, collateral, healthFactor);

            return true;
        }

        // Fallback Functions for calldata and reciever for handling only ether transfer
        fallback() external payable {}
        receive() external payable {}
}