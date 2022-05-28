// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./SimpleStorage.sol";

contract StorageFactory is SimpleStorage {

    SimpleStorage[] public SSArray;

    function createSSContract() public {
        // generate a contract of SimpleStorage type
        SimpleStorage genSS = new SimpleStorage();
        SSArray.push(genSS); 
    }

    function sfStore (uint256 index, uint256 age) public {
        // to get the contract that we wanna interact with
        SimpleStorage(address(SSArray[index])).store(age); 
    }

    function sfRetrieve (uint256 index) public view returns(uint256){
        // we need to access the contract once again so
        return SimpleStorage(address(SSArray[index])).retrieve();

    }
}
