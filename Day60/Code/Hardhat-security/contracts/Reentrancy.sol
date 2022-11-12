// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// This is the age-old reentrancy attack that should make you squirm when you see it
// https://solidity-by-example.org/hacks/re-entrancy/ for full example
// Follow https://twitter.com/programmersmart

contract EtherStore {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 balance = balances[msg.sender];
        require(balance > 0);
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Failed to send Ether");
        balances[msg.sender] = 0;
    }

    // Helper function to check the balance of this contract
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

// How could you make a contract that exploits this?
