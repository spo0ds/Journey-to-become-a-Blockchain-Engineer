from brownie import FlashloanV1, accounts

AAVE_LENDING_POOL_ADDRESS_PROVIDER = "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8"


def main():
    """
    Deploy a `FlashloanV1` contract from `accounts[0]`.
    """

    acct = accounts.load()  # add your keystore ID as an argument to this call

    flashloan = FlashloanV1.deploy(AAVE_LENDING_POOL_ADDRESS_PROVIDER, {"from": acct})
    return flashloan
