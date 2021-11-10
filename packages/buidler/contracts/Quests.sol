// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@nomiclabs/buidler/console.sol";
import "./Projects.sol";
import "./Builders.sol";

contract Quests {

    Projects public projects;
    Builders public builders;

    constructor( address projectsAddress, address buildersAddress ) public {
        projects = Projects(projectsAddress);
        builders = Builders(buildersAddress);
    }

    event QuestUpdate( bytes32 indexed id, bytes32 indexed project, string title, string desc, string link, address author);
    event QuestSupport( bytes32 indexed id, address sender, uint256 support, uint256 total);
    event QuestFinished( bytes32 indexed id, address recipient, uint256 amount, address sender);

    event QuestWork( bytes32 indexed id, address builder, string link);
    event QuestLook( bytes32 indexed id, address builder);

    mapping (bytes32 => uint256) public support;
    mapping (bytes32 => bool) public complete;

    function questId( bytes32 project, string memory title ) public pure returns (bytes32) {
      // purposly don't include address(this)/chainid here so we can keep IDs through deployments?
      return keccak256(abi.encodePacked(project,title));
    }

    function updateQuest(bytes32 project, string memory title, string memory desc, string memory link) public {
        require( msg.sender == projects.projectOwner(project) || msg.sender == projects.owner() , "updateQuest: NOT OWNER");
        bytes32 id = questId( project, title );
        emit QuestUpdate( id, project, title, desc, link, msg.sender);
    }

    function supportQuest( bytes32 id ) public payable {
      require( !complete[id], "supportQuest: already complete");
      support[id] += msg.value;
      emit QuestSupport( id, msg.sender, msg.value, support[id]);
    }

    function lookingAt( bytes32 id ) public payable {
      require( builders.isBuilder(msg.sender), "supportQuest: msg.sender is not a builder");
      require( !complete[id], "supportQuest: already complete");
      emit QuestLook( id, msg.sender);
    }

    function submitWork( bytes32 id, string memory link ) public payable {
      require( builders.isBuilder(msg.sender), "supportQuest: msg.sender is not a builder");
      require( !complete[id], "supportQuest: already complete");
      //EVENTUALLY LIMIT THIS OR AT LEAST SORT IT BY WHITELISTED BUILDERS
      emit QuestWork( id, msg.sender, link);
    }

    function finishQuest( bytes32 project, string memory title, address payable recipient ) public {
      require( msg.sender == projects.projectOwner(project), "updateQuest: NOT OWNER");
      bytes32 id = questId( project, title );
      require( !complete[id], "supportQuest: already complete");
      complete[id] = true;
      uint256 amount = support[id];
      support[id]=0;
      recipient.transfer(amount);
      emit QuestFinished( id, recipient, amount , msg.sender);
    }

}
