// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// One shouldn't use any values from inside the blockchain as randomness
// Use something like Chainlink VRF for verifiable randomness
// https://docs.chain.link/docs/get-a-random-number/

contract BadRNG {
    address payable[] private s_players;

    function enterRaffle() external payable {
        require(msg.value >= 10000000000000000000);
        s_players.push(payable(msg.sender));
    }

    function pickWinner() external {
        uint256 randomWinnerIndex = uint256(
            keccak256(abi.encodePacked(block.difficulty, msg.sender))
        );
        address winner = s_players[randomWinnerIndex % s_players.length];
        (bool success, ) = winner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}

// How could you make a contract that exploits this?
