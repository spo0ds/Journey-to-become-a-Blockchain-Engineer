// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PriceConverter.sol";

error nowOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant minUSD = 50 * 10**18;

    mapping(address => uint256) public addressFundedAmount;
    address[] public funders;
    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender; // sender of the message is us
        // one that deploys the smart contract
    }

    function fund() public payable {
        // require(convert(msg.value) >= minUSD, "You need to spend more ETH!");
        require(msg.value.convert() >= minUSD, "You need to spend more ETH!");
        addressFundedAmount[msg.sender] += msg.value;

        funders.push(msg.sender); // storing fundres address into array
    }

    modifier admin() {
        //require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner)
        {
            revert nowOwner();
        }
        _;
    }

    function withDraw() public admin {
        // to reset the amount
        for (uint256 index = 0; index < funders.length; index++) {
            address funderAddress = funders[index];
            addressFundedAmount[funderAddress] = 0;
        }
        funders = new address[](0); // resetting array

        // transfer
        // payable(msg.sender).transfer(address(this).balance); // this refers to whole contract

        // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed!");

        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed!");
    }

    receive() external payable{
        fund();
    }

    fallback() external payable{
        fund();
    }
}

