from scripts.helpful_scripts import get_account, approve_erc20
from brownie import network, config, interface
from scripts.get_weth import get_weth
from web3 import Web3
from scripts.swap import swap
from scripts.chainlink import get_asset_price


amount = Web3.toWei(0.2, "ether")


def main():
    account = get_account()
    erc20_address = config["networks"][network.show_active()]["weth_token"]
    dai_address = config["networks"][network.show_active()]["dai_token"]

    # getting weth
    if network.show_active() in ["mainnet-fork"]:
        get_weth()

    # depositing
    lending_pool = get_lending_pool()
    approve_erc20(amount, lending_pool.address, erc20_address, account)
    print("Depositing...")
    txn = lending_pool.deposit(
        erc20_address, amount, account.address, 0, {"from": account}
    )
    txn.wait(1)
    print("Deposited!")

    # borrowing
    borrowable_eth, total_debt = get_borrowable_data(lending_pool, account)
    print("Let's borrow!")
    dai_to_eth_price = get_asset_price(
        config["networks"][network.show_active()]["dai_eth_price_feed"]
    )
    amount_dai_to_borrow = (1 / dai_to_eth_price) * (borrowable_eth * 0.90)
    print(f"We're going to borrow {amount_dai_to_borrow} DAI.")
    borrow_txn = lending_pool.borrow(
        dai_address,
        Web3.toWei(amount_dai_to_borrow, "ether"),
        1,
        0,
        account.address,
        {"from": account},
    )
    borrow_txn.wait(1)
    print("We borrowed some DAI!")
    get_borrowable_data(lending_pool, account)
    # repay_all(amount, lending_pool, account)
    # print(
    #    "You've just deposited, borrowed and repayed with Aave, Brownie and Chainlink!"
    # )

    # short sell / buy on margin
    sushiswap02_router02 = config["networks"][network.show_active()][
        "sushiswap02_routerv2"
    ]
    txn_approve = approve_erc20(
        amount_dai_to_borrow, sushiswapv2_router02, dai_address, account
    )
    txn_approve.wait(1)

    price_feed_address = config["networks"][network.show_active()]["dai_eth_price_feed"]
    swap(
        dai_address,
        weth_address,
        amount_dai_to_borrow - Web3 - toWei(1, "ether"),
        account,
        price_feed_address,
        sushiswap02_router02,
    )
    print(
        f"Ending WETH Balance is: {interface.IERC20(weth_address).balanceOf(account.address)}"
    )
    print(
        f"Ending DAI Balance is: {interface.IERC20(dai_address).balanceOf(account.address)}"
    )


def repay_all(amount, lending_pool, account):
    approve.erc20(
        Web3.toWei(amount, "ether"),
        lending_pool,
        config["networks"][network.show_active()]["dai_token"],
        account,
    )
    repay_txn = lending_pool.repay(
        config["networks"][network.show_active()]["dai_token"],
        amount,
        1,
        account.address,
        {"from": account},
    )
    repay_txn.wait(1)
    print("Repayed!")


def get_asset_price(price_feed_address):
    dai_eth_price_feed = interface.AggregatorV3Interface(price_feed_address)
    latest_price = dai_eth_price_feed.latestRoundData()[1]
    converted_latest_price = Web3.fromWei(latest_price, "ether")
    print(f"The DAI/ETH price is {converted_latest_price}")
    return float(converted_latest_price)


def get_borrowable_data(lending_pool, account):
    (
        total_collateral_eth,
        total_debt_eth,
        available_borrow_eth,
        current_liquidation_threshold,
        ltv,
        health_factor,
    ) = lending_pool.getUserAccountData(account.address)
    available_borrow_eth = Web3.fromWei(available_borrow_eth, "ether")
    total_collateral_eth = Web3.fromWei(total_collateral_eth, "ether")
    total_debt_eth = Web3.fromWei(total_debt_eth, "ether")
    print(f"You've {total_collateral_eth} worth of ETH deposited.")
    print(f"You've {total_debt_eth} worth of ETH borrowed.")
    print(f"You can borrow {available_borrow_eth} worth of ETH.")
    return (float(available_borrow_eth), float(total_debt_eth))


def approve_erc20(amount, spender, erc20_address, account):
    print("Approving ERC20 token...")
    erc20 = interface.IERC20(erc20_address)
    txn = erc20.approve(spender, amount, {"from": account})
    txn.wait(1)
    print("Approved!")
    return txn


def get_lending_pool():
    lending_pool_addresses_provider = interface.ILendingPoolAddressesProvider(
        config["networks"][network.show_active()]["lending_pool_addresses_provider"]
    )

    lending_pool_address = lending_pool_addresses_provider.getLendingPool()
    lending_pool = interface.ILendingPool(lending_pool_address)
    return lending_pool
