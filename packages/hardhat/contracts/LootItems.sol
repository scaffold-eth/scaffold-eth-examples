pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./ILootComponents.sol";
import 'base64-sol/base64.sol';
import "@openzeppelin/contracts/utils/Strings.sol";

/*

    uint256[5] =>
        [0] = Item ID
        [1] = Suffix ID (0 for none)
        [2] = Name Prefix ID (0 for none)
        [3] = Name Suffix ID (0 for none)
        [4] = Augmentation (0 = false, 1 = true)

    See the item and attribute tables below for corresponding IDs.

*/

contract LootItems is ERC1155 {

    ILootComponents lootComponents;
    IERC721 loot;

    enum LootType { Weapon, Chest, Head, Waist, Foot, Hand, Neck, Ring }

    string[] lootTypeArray = ['weapon','chest','head','waist','foot','hand','neck','ring'];
    uint256[] amounts = new uint256[](8);

    constructor(address _loot, address _lootComponents) ERC1155('LootItems') {

      for (uint i=0; i<8; i++) {
        amounts[i] = 1;
      }

      lootComponents = ILootComponents(_lootComponents);
      loot = IERC721(_loot);
    }

    struct itemParams {
      string readableBaseFee;
      string ownerOrBurniest;

    }

    mapping(uint256 => LootType) public lootTypeLookup;
    mapping(uint256 => uint256) public originalLootLookup;

    function getBatch(uint256 _tokenId) public returns (uint256[] memory) {

      uint256[] memory tokenIds = new uint256[](8);

      tokenIds[0] = getID(lootComponents.weaponComponents(_tokenId), LootType.Weapon);
      tokenIds[1] = getID(lootComponents.chestComponents(_tokenId), LootType.Chest);
      tokenIds[2] = getID(lootComponents.headComponents(_tokenId), LootType.Head);
      tokenIds[3] = getID(lootComponents.waistComponents(_tokenId), LootType.Waist);
      tokenIds[4] = getID(lootComponents.footComponents(_tokenId), LootType.Foot);
      tokenIds[5] = getID(lootComponents.handComponents(_tokenId), LootType.Hand);
      tokenIds[6] = getID(lootComponents.neckComponents(_tokenId), LootType.Neck);
      tokenIds[7] = getID(lootComponents.ringComponents(_tokenId), LootType.Ring);

      return tokenIds;
    }

    function unbundleLoot(uint256 _tokenId) public {

      loot.transferFrom(msg.sender, address(this), _tokenId);

      uint256[] memory tokenIds = getBatch(_tokenId);

      for (uint i=0; i<8; i++) {
        if(originalLootLookup[tokenIds[i]] == 0){
          originalLootLookup[tokenIds[i]] = _tokenId;
          lootTypeLookup[tokenIds[i]] = LootType(i);
      }
      }

      _mintBatch(msg.sender, tokenIds, amounts, "0x0");

    }

    function rebundleLoot(uint256 _tokenId) public returns (uint256[8]  memory) {

      uint256[] memory tokenIds = getBatch(_tokenId);

      _burnBatch(msg.sender, tokenIds, amounts);
      loot.transferFrom(address(this), msg.sender, _tokenId);

    }

    function getID(uint256[5] memory _components, LootType _type) internal view returns (uint256) {
      return uint(keccak256(abi.encodePacked(_components, _type)));
    }

    function getChest(uint256 _tokenId) public view returns ( uint256[5]  memory ) {
      return lootComponents.chestComponents(_tokenId);
    }

    string[] private weapons = [
        "Warhammer",            // 0
        "Quarterstaff",         // 1
        "Maul",                 // 2
        "Mace",                 // 3
        "Club",                 // 4
        "Katana",               // 5
        "Falchion",             // 6
        "Scimitar",             // 7
        "Long Sword",           // 8
        "Short Sword",          // 9
        "Ghost Wand",           // 10
        "Grave Wand",           // 11
        "Bone Wand",            // 12
        "Wand",                 // 13
        "Grimoire",             // 14
        "Chronicle",            // 15
        "Tome",                 // 16
        "Book"                  // 17
    ];

    string[] private chestArmor = [
        "Divine Robe",          // 0
        "Silk Robe",            // 1
        "Linen Robe",           // 2
        "Robe",                 // 3
        "Shirt",                // 4
        "Demon Husk",           // 5
        "Dragonskin Armor",     // 6
        "Studded Leather Armor",// 7
        "Hard Leather Armor",   // 8
        "Leather Armor",        // 9
        "Holy Chestplate",      // 10
        "Ornate Chestplate",    // 11
        "Plate Mail",           // 12
        "Chain Mail",           // 13
        "Ring Mail"             // 14
    ];

    string[] private headArmor = [
        "Ancient Helm",         // 0
        "Ornate Helm",          // 1
        "Great Helm",           // 2
        "Full Helm",            // 3
        "Helm",                 // 4
        "Demon Crown",          // 5
        "Dragon's Crown",       // 6
        "War Cap",              // 7
        "Leather Cap",          // 8
        "Cap",                  // 9
        "Crown",                // 10
        "Divine Hood",          // 11
        "Silk Hood",            // 12
        "Linen Hood",           // 13
        "Hood"                  // 14
    ];

    string[] private waistArmor = [
        "Ornate Belt",          // 0
        "War Belt",             // 1
        "Plated Belt",          // 2
        "Mesh Belt",            // 3
        "Heavy Belt",           // 4
        "Demonhide Belt",       // 5
        "Dragonskin Belt",      // 6
        "Studded Leather Belt", // 7
        "Hard Leather Belt",    // 8
        "Leather Belt",         // 9
        "Brightsilk Sash",      // 10
        "Silk Sash",            // 11
        "Wool Sash",            // 12
        "Linen Sash",           // 13
        "Sash"                  // 14
    ];

    string[] private footArmor = [
        "Holy Greaves",         // 0
        "Ornate Greaves",       // 1
        "Greaves",              // 2
        "Chain Boots",          // 3
        "Heavy Boots",          // 4
        "Demonhide Boots",      // 5
        "Dragonskin Boots",     // 6
        "Studded Leather Boots",// 7
        "Hard Leather Boots",   // 8
        "Leather Boots",        // 9
        "Divine Slippers",      // 10
        "Silk Slippers",        // 11
        "Wool Shoes",           // 12
        "Linen Shoes",          // 13
        "Shoes"                 // 14
    ];

    string[] private handArmor = [
        "Holy Gauntlets",       // 0
        "Ornate Gauntlets",     // 1
        "Gauntlets",            // 2
        "Chain Gloves",         // 3
        "Heavy Gloves",         // 4
        "Demon's Hands",        // 5
        "Dragonskin Gloves",    // 6
        "Studded Leather Gloves",// 7
        "Hard Leather Gloves",  // 8
        "Leather Gloves",       // 9
        "Divine Gloves",        // 10
        "Silk Gloves",          // 11
        "Wool Gloves",          // 12
        "Linen Gloves",         // 13
        "Gloves"                // 14
    ];

    string[] private necklaces = [
        "Necklace",             // 0
        "Amulet",               // 1
        "Pendant"               // 2
    ];

    string[] private rings = [
        "Gold Ring",            // 0
        "Silver Ring",          // 1
        "Bronze Ring",          // 2
        "Platinum Ring",        // 3
        "Titanium Ring"         // 4
    ];

    string[] private suffixes = [
        // <no suffix>          // 0
        "of Power",             // 1
        "of Giants",            // 2
        "of Titans",            // 3
        "of Skill",             // 4
        "of Perfection",        // 5
        "of Brilliance",        // 6
        "of Enlightenment",     // 7
        "of Protection",        // 8
        "of Anger",             // 9
        "of Rage",              // 10
        "of Fury",              // 11
        "of Vitriol",           // 12
        "of the Fox",           // 13
        "of Detection",         // 14
        "of Reflection",        // 15
        "of the Twins"          // 16
    ];

    string[] private namePrefixes = [
        // <no name>            // 0
        "Agony",                // 1
        "Apocalypse",           // 2
        "Armageddon",           // 3
        "Beast",                // 4
        "Behemoth",             // 5
        "Blight",               // 6
        "Blood",                // 7
        "Bramble",              // 8
        "Brimstone",            // 9
        "Brood",                // 10
        "Carrion",              // 11
        "Cataclysm",            // 12
        "Chimeric",             // 13
        "Corpse",               // 14
        "Corruption",           // 15
        "Damnation",            // 16
        "Death",                // 17
        "Demon",                // 18
        "Dire",                 // 19
        "Dragon",               // 20
        "Dread",                // 21
        "Doom",                 // 22
        "Dusk",                 // 23
        "Eagle",                // 24
        "Empyrean",             // 25
        "Fate",                 // 26
        "Foe",                  // 27
        "Gale",                 // 28
        "Ghoul",                // 29
        "Gloom",                // 30
        "Glyph",                // 31
        "Golem",                // 32
        "Grim",                 // 33
        "Hate",                 // 34
        "Havoc",                // 35
        "Honour",               // 36
        "Horror",               // 37
        "Hypnotic",             // 38
        "Kraken",               // 39
        "Loath",                // 40
        "Maelstrom",            // 41
        "Mind",                 // 42
        "Miracle",              // 43
        "Morbid",               // 44
        "Oblivion",             // 45
        "Onslaught",            // 46
        "Pain",                 // 47
        "Pandemonium",          // 48
        "Phoenix",              // 49
        "Plague",               // 50
        "Rage",                 // 51
        "Rapture",              // 52
        "Rune",                 // 53
        "Skull",                // 54
        "Sol",                  // 55
        "Soul",                 // 56
        "Sorrow",               // 57
        "Spirit",               // 58
        "Storm",                // 59
        "Tempest",              // 60
        "Torment",              // 61
        "Vengeance",            // 62
        "Victory",              // 63
        "Viper",                // 64
        "Vortex",               // 65
        "Woe",                  // 66
        "Wrath",                // 67
        "Light's",              // 68
        "Shimmering"            // 69
    ];

    string[] private nameSuffixes = [
        // <no name>            // 0
        "Bane",                 // 1
        "Root",                 // 2
        "Bite",                 // 3
        "Song",                 // 4
        "Roar",                 // 5
        "Grasp",                // 6
        "Instrument",           // 7
        "Glow",                 // 8
        "Bender",               // 9
        "Shadow",               // 10
        "Whisper",              // 11
        "Shout",                // 12
        "Growl",                // 13
        "Tear",                 // 14
        "Peak",                 // 15
        "Form",                 // 16
        "Sun",                  // 17
        "Moon"                  // 18
    ];

    function uri(uint256 _tokenId) override public view returns (string memory) {

        require(originalLootLookup[_tokenId] > 0,'not loot');

        LootType lootType = lootTypeLookup[_tokenId];
        uint256 originalToken = originalLootLookup[_tokenId];

        uint256[5] memory tokenComponents;
        string memory base;

        if(lootType == LootType.Weapon) {
          tokenComponents = lootComponents.weaponComponents(originalToken);
          base = weapons[tokenComponents[0]];
          } else if(lootType == LootType.Chest) {
          tokenComponents = lootComponents.chestComponents(originalToken);
          base = chestArmor[tokenComponents[0]];
          } else if(lootType == LootType.Head) {
          tokenComponents = lootComponents.headComponents(originalToken);
          base = headArmor[tokenComponents[0]];
          } else if(lootType == LootType.Waist) {
          tokenComponents = lootComponents.waistComponents(originalToken);
          base = waistArmor[tokenComponents[0]];
          } else if(lootType == LootType.Foot) {
          tokenComponents = lootComponents.footComponents(originalToken);
          base = footArmor[tokenComponents[0]];
          } else if(lootType == LootType.Hand) {
          tokenComponents = lootComponents.handComponents(originalToken);
          base = handArmor[tokenComponents[0]];
          } else if(lootType == LootType.Neck) {
          tokenComponents = lootComponents.neckComponents(originalToken);
          base = necklaces[tokenComponents[0]];
          } else if(lootType == LootType.Ring) {
          tokenComponents = lootComponents.ringComponents(originalToken);
          base = rings[tokenComponents[0]];
          }

        string memory description = base;
        string memory suffix;
        string memory name;
        string memory augmentation = '';

        if(tokenComponents[1] > 0) {
          suffix = suffixes[tokenComponents[1] - 1];
          description = string(abi.encodePacked(description, " ", suffix));
        }

        if(tokenComponents[2] > 0) {
        name = string(abi.encodePacked(namePrefixes[tokenComponents[2] - 1], ' ', nameSuffixes[tokenComponents[3] - 1]));
        if (tokenComponents[4] > 0) {
          description = string(abi.encodePacked(name, ' ', description, " +1"));
          augmentation = "+1";
        } else {
          description = string(abi.encodePacked(name, ' ', description));
        }
      }

        string[3] memory parts;

        parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><style>.base { fill: white; font-family: serif; font-size: 14px; }</style><rect width="100%" height="100%" fill="orange" /><text x="10" y="20" class="base">';

        parts[1] = description;

        parts[2] = '</text></svg>';

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2]));
        output = string(abi.encodePacked(output));

        string memory json = string(abi.encodePacked('{"name": "', description, '", "description": "Unbundled loot items, from Loot.sol", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)),
        '", "attributes": ',
                            getAttributes(base, suffix, lootType, name, augmentation),
                            '}'));

        string memory encodedJson = Base64.encode(bytes(json));
        output = string(abi.encodePacked('data:application/json;base64,', encodedJson));

        return output;
    }

    function getTrait(string memory _traitType, string memory _value) internal view returns (string memory) {

      string memory empty = "";

      if(keccak256(bytes(_value)) == keccak256(bytes(''))) {
        return '';
      } else {
        return string(abi.encodePacked(',{"trait_type": "',
        _traitType,
        '", "value": "',
        _value,
        '"}'));
      }
    }

    function getAttributes(string memory base, string memory suffix, LootType lootType, string memory name, string memory augmentation) internal view returns (string memory) {

      return string(abi.encodePacked('[{"trait_type": "item", "value": "',
                            base,
                            '"}',
                            getTrait('suffix',suffix),
                            getTrait('lootType',lootTypeArray[uint(lootType)]),
                            getTrait('name',name),
                            getTrait('augmentation',augmentation),
                            ']'));
    }

    function contractURI() public view returns (string memory) {

      string memory json = '{"name": "LootItems", "description": "Unbundled loot items, from Loot.sol"}';
      string memory encodedJson = Base64.encode(bytes(json));
      string memory output = string(abi.encodePacked('data:application/json;base64,', encodedJson));

      return output;
    }
}
