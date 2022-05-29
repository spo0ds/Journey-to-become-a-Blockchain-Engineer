// SPDX-License-Identifier: MIT

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";

pragma solidity >=0.6.6 <0.9.0;

contract FundMe {

    using SafeMathChainlink for uint256;

    mapping(address => uint256) public addressFundedAmount;
    address[] public funders;
    address owner;

    constructor() public {
        owner = msg.sender; // sender of the message is us
                            // one that deploys the smart contract
    }

    function fund() public payable{
        uint256 minUSD = 50 * 10 ** 18 ;

        require(convert(msg.value) >= minUSD, "You need to spend more ETH!");
        addressFundedAmount[msg.sender] += msg.value;

        funders.push(msg.sender);  // storing fundres address into array

    }

    function getVersion() public view returns(uint256){
        AggregatorV3Interface rate = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        return rate.version();
    }

    function getPrice() public view returns(uint256){
        AggregatorV3Interface rate = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        (,int256 answer,,,) = rate.latestRoundData();

        return uint256(answer);
    } 

    function convert(uint256 fundedAmount) public view returns(uint256){
        uint256 ethPrice = getPrice();
        uint256 inUSD = (ethPrice * fundedAmount)/1000000000000000000;
        return inUSD;
    }

    modifier admin {
        require(msg.sender == owner);
        _;
    }

    function withDraw() payable admin public {
        msg.sender.transfer(address(this).balance);
        
        // to reset the amount
        for (uint256 index=0; index<funders.length; index++){
            address funderAddress = funders[index];
            addressFundedAmount[funderAddress] = 0;
        }
        funders = new address[](0); // resetting array
    } 
         
}

