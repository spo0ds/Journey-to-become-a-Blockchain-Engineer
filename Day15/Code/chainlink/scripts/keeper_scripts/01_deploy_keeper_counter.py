#!/usr/bin/python3
from scripts.helpful_scripts import get_account
from brownie import Counter, config, network


def deploy_keeper_counter():
    account = get_account()
    return Counter.deploy(
        config["networks"][network.show_active()]["update_interval"],
        {"from": account},
        publish_source=config["networks"][network.show_active()].get("verify", False),
    )


def main():
    deploy_keeper_counter()
