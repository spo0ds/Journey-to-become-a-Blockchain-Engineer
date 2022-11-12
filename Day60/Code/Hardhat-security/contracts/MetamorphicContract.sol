// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract MetamorphicContract is Initializable {
    address payable owner;

    function kill() external {
        require(msg.sender == owner);
        selfdestruct(owner);
    }
}
