// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DocumentVerification {
    // Define a struct to represent a skill or qualification
    struct Skill {
        string name;
        uint256 level;
        bytes32 fileHash;
        address owner;
    }
    
    // Define an array to store all skills
    Skill[] public skills;
    
    // Define a mapping to keep track of skills owned by each address
    mapping (address => uint[]) public ownedSkills;
    
    // Define an event to emit when a new skill is added
    event SkillAdded(uint skillId, string name, uint256 level, bytes32 fileHash, address owner);
    
    // Define a function to add a new skill
    function addSkill(string memory name, uint256 level, string memory fileHash) public {
    // Convert file hash to bytes32 using keccak256 hash function
    bytes32 fileHashBytes = keccak256(bytes(fileHash));
    
    // Create a new Skill struct with the given parameters
    Skill memory newSkill = Skill(name, level, fileHashBytes, msg.sender);
    
    // Add the new skill to the skills array and get its ID
    uint skillId = skills.length;
    skills.push(newSkill);
    
    // Add the new skill ID to the ownedSkills mapping for the owner's address
    ownedSkills[msg.sender].push(skillId);
    
    // Emit a SkillAdded event with the new skill's details
    emit SkillAdded(skillId, name, level, fileHashBytes, msg.sender);
}

    // function addSkill(string memory name, uint256 level, bytes32 fileHash) public {
    //     // Create a new Skill struct with the given parameters
    //     Skill memory newSkill = Skill(name, level, fileHash, msg.sender);
        
    //     // Add the new skill to the skills array and get its ID
    //     uint skillId = skills.length;
    //     skills.push(newSkill);
        
    //     // Add the new skill ID to the ownedSkills mapping for the owner's address
    //     ownedSkills[msg.sender].push(skillId);
        
    //     // Emit a SkillAdded event with the new skill's details
    //     emit SkillAdded(skillId, name, level, fileHash, msg.sender);
    // }
    
    // Define a function to get the details of a skill by ID
    function getSkill(uint skillId) public view returns (string memory, uint256, bytes32, address) {
        // Return the name, level, file hash, and owner of the skill with the given ID
        return (skills[skillId].name, skills[skillId].level, skills[skillId].fileHash, skills[skillId].owner);
    }
    
    // Define a function to get the IDs of all skills owned by an address
    function getOwnedSkills(address owner) public view returns (uint[] memory) {
        // Return the array of skill IDs owned by the given address
        return ownedSkills[owner];
    }
    
    // Define a function to verify a skill by file hash
    function verifySkill(string memory fileHash, string memory name, uint256 level) public view returns (bool) {
    bytes32 fileHashHash = keccak256(bytes(fileHash));
    bytes32 nameHash = keccak256(bytes(name));
    for (uint i = 0; i < skills.length; i++) {
        if (skills[i].fileHash == fileHashHash && keccak256(bytes(skills[i].name)) == nameHash && skills[i].level == level) {
            return true;
        }
    }
    return false;
}

    // function verifySkill(string memory fileHash, string memory name, uint256 level) public view returns (bool) {
    //     bytes32 fileHashHash = keccak256(bytes(fileHash));
    //     for (uint i = 0; i < skills.length; i++) {
    //         if (skills[i].fileHash == fileHashHash && skills[i].name == name && skills[i].level == level) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
}
