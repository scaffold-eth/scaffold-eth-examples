
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// learn more: https://docs.openzeppelin.com/contracts/3.x/erc20

contract GTGSCoin is ERC20 {

  address gtgsCollectibleAddress;

  constructor(address _gtgsCollectibleAddress) public ERC20("GTGSCoin", "GTGS") {
    _mint(msg.sender, 1000000 ether);
    gtgsCollectibleAddress = _gtgsCollectibleAddress;
  }

  function move(address from, address to, uint256 amount) public returns (bool) {
    require(msg.sender==gtgsCollectibleAddress, "ERC20: not gtgsCollectibleAddress");
    _transfer(from, to, amount);
    return true;
  }
}
