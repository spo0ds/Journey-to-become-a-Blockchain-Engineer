from scripts.helpful_scripts import get_account
from brownie import SimpleStorage


def deploy():
    account = get_account()
    ss = SimpleStorage.deploy({"from": account}, publish_source=True)
    txn = ss.store(25, {"from": account})
    txn.wait(1)
    print(txn.events)


def main():
    deploy()
