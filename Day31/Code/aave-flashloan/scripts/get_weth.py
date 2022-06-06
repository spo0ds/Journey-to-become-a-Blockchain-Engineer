from brownie import accounts, config, network, interface


def main():
    """
    Runs the get_weth function to get WETH
    """
    get_weth()


def get_weth():
    """
    Mints WETH by depositing ETH.
    """
    acct = accounts.add(
        config["wallets"]["from_key"]
    )  # add your keystore ID as an argument to this call
    weth = interface.WethInterface(config["networks"][network.show_active()]["weth"])
    tx = weth.deposit({"from": acct, "value": 100_000_000_000_000_000})
    print("Received 0.1 WETH")
    return tx
