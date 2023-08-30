// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

contract Upload {

  struct Access {
    address user;
    bool access; // true or false
  }

  mapping(address => string[]) private value; //URL storage
  mapping(address => mapping(address => bool)) private ownership;
  mapping(address => Access[]) private accessList;
  mapping(address => mapping(address => bool)) private previousData;
  mapping(address => mapping(string => bool)) private sharedImages; // New mapping for shared images
  mapping(address => string) public accountToSHA;

 

  
  function add(address _user, string memory url) external {
    value[_user].push(url);
  }

  function allow(address user) external {
    ownership[msg.sender][user] = true;
    if (previousData[msg.sender][user]) {
        for (uint256 i = 0; i < accessList[msg.sender].length; i++) {
            if (accessList[msg.sender][i].user == user) {
                accessList[msg.sender][i].access = true;
            }
        }
    } else {
        accessList[msg.sender].push(Access(user, true));
        previousData[msg.sender][user] = true;
    }
    
    // Update the sharedImages mapping for all images
    for (uint256 i = 0; i < value[msg.sender].length; i++) {
        sharedImages[user][value[msg.sender][i]] = true;
    }
}

  function disallow(address user) external {
    ownership[msg.sender][user] = false;
    for (uint256 i = 0; i < accessList[msg.sender].length; i++) {
        if (accessList[msg.sender][i].user == user) {
            accessList[msg.sender][i].access = false;
        }
    }
    
    // Update the sharedImages mapping for all images
    for (uint256 i = 0; i < value[msg.sender].length; i++) {
        sharedImages[user][value[msg.sender][i]] = false;
    }
}
  function display(address _user) external view returns (string[] memory) {
    require(_user == msg.sender || ownership[_user][msg.sender], "You don't have access");

    if (_user == msg.sender) {
        // Return all images for the sender
        return value[_user];
    } else {
        // Return only shared images for other users
        string[] memory sharedImageHashes = new string[](value[_user].length);
        uint256 sharedImageCount = 0;

        for (uint256 i = 0; i < value[_user].length; i++) {
            if (sharedImages[msg.sender][value[_user][i]]) {
                sharedImageHashes[sharedImageCount] = value[_user][i];
                sharedImageCount++;
            }
        }

        // Create a new array with the correct length and copy the shared images
        string[] memory result = new string[](sharedImageCount);
        for (uint256 i = 0; i < sharedImageCount; i++) {
            result[i] = sharedImageHashes[i];
        }

        return result;
    }
}
  function shareAccess() external view returns (Access[] memory) {
    return accessList[msg.sender];
  }
  function shareImage(address _user, string memory url) external {
    ownership[msg.sender][_user] = true;
    sharedImages[_user][url] = true;
}

function saveSHA(string memory _sha) public {
    accountToSHA[msg.sender] = _sha;
}
// Function to check if a SHA hash already exists for an account
function doesSHAExist(address _account) public view returns (bool) {
    return bytes(accountToSHA[_account]).length > 0;
}
}
