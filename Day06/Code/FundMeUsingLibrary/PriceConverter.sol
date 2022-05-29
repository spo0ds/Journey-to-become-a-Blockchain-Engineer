// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


library PriceConverter {

    function getVersion() internal view returns(uint256){
        AggregatorV3Interface rate = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        return rate.version();
    }

    function getPrice() internal view returns(uint256){
        AggregatorV3Interface rate = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        (,int256 answer,,,) = rate.latestRoundData();
        return uint256(answer);
    } 

    function convert(uint256 fundedAmount) internal view returns(uint256){
        uint256 ethPrice = getPrice();
        uint256 inUSD = (ethPrice * fundedAmount)/ 1e18;
        return inUSD;
    }
}


 



