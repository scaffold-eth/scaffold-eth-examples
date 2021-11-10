pragma solidity >=0.6.6 <0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DonorManager is Ownable {
    mapping(address => bool) public donorAllowList;

    event DonorAllowed(address donor, bool allowed);

    function allowDonor(address donor) public onlyOwner {
        donorAllowList[donor] = true;
        emit DonorAllowed(donor,donorAllowList[donor]);
    }

    function blockDonor(address donor) public onlyOwner {
        delete donorAllowList[donor];
        emit DonorAllowed(donor,donorAllowList[donor]);
    }

    function canDonate(address donor) external view returns (bool) {
        return donorAllowList[donor];
    }
}
