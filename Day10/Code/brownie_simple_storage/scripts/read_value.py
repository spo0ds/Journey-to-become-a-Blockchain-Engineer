from brownie import SimpleStorage, accounts, config


def read_contract():
    ss_contract = SimpleStorage[-1]  # -1 for most recent deployment
    print(ss_contract.retrieve())


def main():
    read_contract()
