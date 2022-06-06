# NOTE: The following tests begin by transferring assets to the deployed flashloan
# contract. this ensures that the tests pass with the base Flashloan implementation,
# i.e. one that does not implement any custom logic.

# The initial transfer should be removed prior to testing your final implementation.


def test_eth_flashloan(accounts, ETH, flashloan_v1):
    """
    Test a flashloan that borrows Ethereum.
    """

    # transfer ether to the flashloan contract
    accounts[0].transfer(flashloan_v1, "2 ether")

    flashloan_v1.flashloan(ETH, {"from": accounts[0]})


def test_dai_flashloan(Contract, accounts, DAI, flashloan_v1):
    """
    Test a flashloan that borrows DAI.

    To use a different asset, swap DAI with any of the fixture names in `tests/conftest.py`
    """

    # purchase DAI on uniswap
    uniswap_dai = Contract.from_explorer("0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667")
    uniswap_dai.ethToTokenSwapInput(
        1, 10000000000, {"from": accounts[0], "value": "2 ether"}
    )

    # transfer DAI to the flashloan contract
    balance = DAI.balanceOf(accounts[0])
    DAI.transfer(flashloan_v1, balance, {"from": accounts[0]})

    flashloan_v1.flashloan(DAI, {"from": accounts[0]})
