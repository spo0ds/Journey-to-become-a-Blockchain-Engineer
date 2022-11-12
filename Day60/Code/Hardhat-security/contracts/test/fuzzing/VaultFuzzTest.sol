// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../Vault.sol";

contract VaultFuzzTest is Vault {
    constructor() Vault("123asd123") {}

    function echidna_test_find_password() public view returns (bool) {
        return s_locked == true;
    }
}
