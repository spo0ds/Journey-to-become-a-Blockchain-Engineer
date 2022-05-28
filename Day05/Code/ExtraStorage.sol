// SPDX-License-Identifier:MIT

pragma solidity ^0.6.0;

import "./SimpleStorage.sol";

contract ExtraStorage is SimpleStorage{

    function store(uint256 x) public override{
        age = x + 1;
    }

}



 

