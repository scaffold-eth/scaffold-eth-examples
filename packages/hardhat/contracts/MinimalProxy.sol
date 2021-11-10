pragma solidity >=0.6.0 <0.7.0;


// INTERNAL
import "./ProxyFactory.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProxyStorage {
    // wallet owner address
    address public owner;
}

contract MinimalProxy is
    ProxyStorage
{
    // Transaction Executed event
    event Executed(bool status);

    modifier onlyProxyOwner {
        require(msg.sender == owner, "MinimalProxy: Not Owner");
        _;
    }

    function authorize(
        address _factory,
        address _owner
    ) external {
        require(
            ProxyFactory(_factory).registry(_owner) == address(this),
            "Unauthorized Execution"
        );
        owner = _owner;
    }


    function isContract(address _target) internal view returns(bool) {
      uint32 size;
      assembly {
        size := extcodesize(_target)
      }
      return (size > 0);
    }

    function execute(address _target, bytes memory _data)
        public
        payable
        returns (bytes32 response)
    {
        require(_target != address(0), "Invalid Address");
        require(msg.sender == owner, "Unauthorized Execution");
        require(isContract(_target), "Target is not a Contract");
        // call contract in current context
        assembly {
            let succeeded := delegatecall(
                sub(gas(), 5000),
                _target,
                add(_data, 0x20),
                mload(_data),
                0,
                32
            )
            response := mload(0) // load delegatecall output
            switch iszero(succeeded)
                case 1 {
                    // throw if delegatecall failed
                    revert(0, 0)
                }
        }
        // if delegation successful
        emit Executed(true);
    }

    function transferFunds(ERC20 _token) public onlyProxyOwner{
       _token.transfer(owner, _token.balanceOf(address(this)));
        (bool success, ) = owner.call.value(address(this).balance)("");
        require(success, "Transfer failed.");
    }
}
