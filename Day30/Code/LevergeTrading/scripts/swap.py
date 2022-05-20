from brownie import interface, chain, network, config, accounts
from scripts.helpful_scripts import get_account, approve_erc20
from scripts.get_weth import get_weth
from web3 import Web3
from chainlink_mapping import price_feed_mapping
from scripts.chainlink import get_asset_price

amount_to_swap = Web3.toWei(0.1, "ether")


def main():
    account = get_account()
    weth_address = config["networks"][network.show_active()]["weth_token"]
    dai_address = config["networks"][network.show_active()]["dai_token"]
    sushiswap02_router02 = config["networks"][network.show_active()][
        "sushiswapv2_router02"
    ]
    print(
        f"The starting balance of DAI in {account.address} is now {interface.IERC20(dai_address).balanceOf(account.address)}"
    )
    if network.show_active() in ["mainnet-fork"]:
        get_weth(account=account)
    tx = approve_erc20(amount_to_swap, sushiswap02_router02, weth_address, account)
    tx.wait(1)
    price_feed_address = price_feed_mapping[network.show_active()][
        (dai_address, weth_address)
    ]
    swap(
        weth_address,
        dai_address,
        amount_to_swap,
        account,
        price_feed_address,
        sushiswap02_router02,
        reverse_feed=True,
    )
    print(
        f"The ending balance of DAI in {account.address} is now {interface.IERC20(dai_address).balanceOf(account.address)}"
    )


def swap(
    address_from_token,
    address_to_token,
    amount,
    account,
    price_feed_address,
    swap_router_address,
    reverse_feed=False,
):

    path = [
        address_from_token,
        address_to_token,
    ]

    # The pool jumping path to swap your token
    from_to_price = get_asset_price(address_price_feed=price_feed_address)
    if reverse_feed:
        from_to_price = 1 / from_to_price
    amountOutMin = int((from_to_price * 0.90) * amount)
    timestamp = chain[brownie.web3.eth.get_block_number()]["timestamp"] + 120
    routerv2 = interface.IUniswapV2Router02(swap_router_address)
    swap_tx = routerv2.swapExactTokensForTokens(
        amount, amountOutMin, path, account.address, timestamp, {"from": account}
    )
    swap_tx.wait(1)
    return swap_tx
