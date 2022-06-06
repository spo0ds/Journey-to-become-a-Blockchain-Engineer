#!/usr/bin/python3
from brownie import Counter
from scripts.helpful_scripts import get_account


def main():
    account = get_account()
    keeper_contract = Counter[-1]
    upkeepNeeded, performData = keeper_contract.checkUpkeep.call(
        # "0x000000000000000000000000d04647b7cb523bb9f26730e9b6de1174db7591ad",
        "",
        {"from": account},
    )
    print(f"The status of this upkeep is currently: {upkeepNeeded}")
    print(f"Here is the perform data: {performData}")
