from brownie import interface, network, config
from web3 import Web3


def get_asset_price(
    address_price_feed=None,
):
    # For mainnet we can just do:
    # return Contract(f"{pair}.data.eth").latestAnswer() / 1e8
    address_price_feed = (
        address_price_feed
        if address_price_feed
        else config["networks"][network.show_active()]["dai_eth_price_feed"]
    )
    dai_eth_price_feed = interface.AggregatorV3Interface(address_price_feed)
    latest_price = Web3.fromWei(dai_eth_price_feed.latestRoundData()[1], "ether")
    print(f"The DAI/ETH price is {latest_price}")
    return float(latest_price)
