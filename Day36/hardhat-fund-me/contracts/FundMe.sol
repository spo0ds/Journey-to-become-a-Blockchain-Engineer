// SPDX-License-Identifier: MIT
// pragma
pragma solidity ^0.8.8;

// imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// error codes
error FundMe__NotOwner();
error FundMe__BalanceNotEnough();

// contracts
/** @title A contract for crowd funding
 *  @author Spoods
 *  @notice Showcase of funding contract
 *  @dev Implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // state variables
    mapping(address => uint256) private s_addressFundedAmount;
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    AggregatorV3Interface private s_priceFeed;

    modifier admin() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        // require(
        //     msg.value.convert(s_priceFeed) >= MINIMUM_USD,
        //     "You need to spend more ETH!"
        // );

        if (msg.value.convert(s_priceFeed) < MINIMUM_USD) {
            revert FundMe__BalanceNotEnough();
        }
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressFundedAmount[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable admin {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressFundedAmount[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable admin {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressFundedAmount[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressFundedAmount(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressFundedAmount[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
