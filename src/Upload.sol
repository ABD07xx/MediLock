// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Upload {

  struct Access {
    address user;
    bool access; // true or false
  }

  mapping(address => string[]) private value;
  mapping(address => mapping(address => bool)) private ownership;
  mapping(address => Access[]) private accessList;
  mapping(address => mapping(address => bool)) private previousData;
  mapping(address => mapping(string => bool)) private sharedImages; // New mapping for shared images

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
  }

  function disallow(address user) external {
    ownership[msg.sender][user] = false;
    for (uint256 i = 0; i < accessList[msg.sender].length; i++) {
      if (accessList[msg.sender][i].user == user) {
        accessList[msg.sender][i].access = false;
      }
    }
  }

  function display(address _user) external view returns (string[] memory) {
    require(_user == msg.sender || ownership[_user][msg.sender], "You don't have access");
    return value[_user];
  }

  function shareAccess() external view returns (Access[] memory) {
    return accessList[msg.sender];
  }

function shareImage(address _user, string memory url) external returns(bool) {
    require(ownership[msg.sender][_user], "You don't have access to share");
    sharedImages[_user][url] = true;
    value[_user].push(url); // Add the shared image URL to the user's images
    return true;
}
}
