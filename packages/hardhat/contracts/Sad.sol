pragma solidity ^0.6.12;

import "./ContinuousToken.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Sad is ContinuousToken {
    using SafeMath for uint256;
    uint256 internal reserve;

    mapping(address => uint256) public userLockedBalance;

    constructor()
        public
        payable
        ContinuousToken("Sad", "😔", 100 ether, 300000)
    {
        reserve = msg.value;
        userLockedBalance[msg.sender] = userLockedBalance[msg.sender].add(
            msg.value
        );
    }

    fallback() external payable {
        mint();
    }

    receive() external payable {}

    function mint() public payable {
        uint256 purchaseAmount = msg.value;
        userLockedBalance[msg.sender] = userLockedBalance[msg.sender].add(
            msg.value
        );
        _continuousMint(purchaseAmount);
        reserve = reserve.add(purchaseAmount);
    }

    function burn(uint256 _amount) public {
        uint256 refundAmount = _continuousBurn(_amount);
        userLockedBalance[msg.sender] = userLockedBalance[msg.sender].sub(
            refundAmount
        );
        reserve = reserve.sub(refundAmount);
        msg.sender.transfer(refundAmount);
    }

    function reserveBalance() public view override returns (uint256) {
        return reserve;
    }

    function getPrice() external view returns (uint256) {
        return getQuantity();
    }
}
