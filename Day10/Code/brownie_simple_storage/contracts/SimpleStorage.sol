// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

contract SimpleStorage {
    uint256 age;

    struct Humans {
        uint256 age;
        string name;
    }

    Humans[] public boys;
    mapping(string => uint256) public nameToAge;

    function store(uint256 x) public {
        age = x;
    }

    function retrieve() public view returns (uint256) {
        return age;
    }

    function addBoy(string memory x, uint256 y) public {
        boys.push(Humans(y, x));
        nameToAge[x] = y;
    }
}
