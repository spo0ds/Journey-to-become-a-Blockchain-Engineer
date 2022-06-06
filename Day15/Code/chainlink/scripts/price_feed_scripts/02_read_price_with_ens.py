from brownie import Contract, network


def get_price(pair):
    if network.show_active() not in ["mainnet", "mainnet-fork"]:
        print("Only for mainnet ETH!")
    else:
        print(Contract(f"{pair}.data.eth").latestAnswer() / 1e8)


def main():
    return get_price("eth-usd")
