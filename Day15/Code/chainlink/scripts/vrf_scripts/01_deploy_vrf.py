#!/usr/bin/python3
from brownie import VRFConsumer, config, network
from scripts.helpful_scripts import (
    get_account,
    get_contract,
)


def depoly_vrf():
    account = get_account()
    print(f"On network {network.show_active()}")
    keyhash = config["networks"][network.show_active()]["keyhash"]
    fee = config["networks"][network.show_active()]["fee"]
    vrf_coordinator = get_contract("vrf_coordinator")
    link_token = get_contract("link_token")

    vrf_consumer =  VRFConsumer.deploy(
        keyhash,
        vrf_coordinator,
        link_token,
        fee,
        {"from": account},
    )

    if (config["networks"][network.show_active()].get("verify", False)):
        vrf_consumer.tx.wait(BLOCK_CONFIRMATIONS_FOR_VERIFICATION)
        VRFConsumer.publish_source(vrf_consumer)
    else: 
        vrf_consumer.tx.wait(1)


def main():
    depoly_vrf()
