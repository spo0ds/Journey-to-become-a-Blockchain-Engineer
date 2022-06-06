#!/usr/bin/python3
from brownie import APIConsumer, config, network
from scripts.helpful_scripts import fund_with_link, get_account


def main():
    account = get_account()
    api_contract = APIConsumer[-1]
    tx = fund_with_link(
        api_contract.address, amount=config["networks"][network.show_active()]["fee"]
    )
    tx.wait(1)
    request_tx = api_contract.requestVolumeData({"from": account})
    request_tx.wait(1)
