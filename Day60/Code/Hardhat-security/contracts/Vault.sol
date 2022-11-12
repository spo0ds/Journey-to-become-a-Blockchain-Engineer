// SPDX-License-Identifier: MIT

// All data on-chain can be read! Don't store sensitive information
// Even if you make it private
// Level from Ethernaut: https://ethernaut.openzeppelin.com/level/0xf94b476063B6379A3c8b6C836efB8B3e10eDe188
// Slighly modified

pragma solidity ^0.8.0;

contract Vault {
    bool public s_locked;
    bytes32 private s_password;

    constructor(bytes32 password) {
        s_locked = true;
        s_password = password;
    }

    function unlock(bytes32 password) external {
        if (s_password == password) {
            s_locked = false;
        }
    }
}

// What would you do to exploit this?
