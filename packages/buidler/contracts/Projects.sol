// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Projects is Ownable {

    event ProjectUpdate( bytes32 id, string title, string desc, string repo, address projectOwner );

    mapping (bytes32 => address) public projectOwner;

    function projectId( string memory title ) public pure returns (bytes32) {
      // purposly don't include address(this)/chainid here so we can keep IDs through deployments?
      return keccak256(abi.encodePacked(title));
    }

    function updateProject(
        string memory title,
        string memory desc,
        string memory repo,
        address _projectOwner
    ) public {
        bytes32 id = projectId(title);
        if( projectOwner[id] == address(0) ){
          require( msg.sender == owner(), "updateProject: not owner");
        }else{
          require( msg.sender == projectOwner[id] || msg.sender == owner(), "updateProject: not owner or projectOwner");
        }
        if( projectOwner[id] != _projectOwner){
          projectOwner[id] = _projectOwner;
        }
        emit ProjectUpdate(id, title, desc, repo, _projectOwner);
    }

}
