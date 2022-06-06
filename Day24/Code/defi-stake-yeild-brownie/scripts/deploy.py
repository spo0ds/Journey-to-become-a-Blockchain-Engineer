from scripts.helpful_scripts import get_account, get_contract
from brownie import DappToken, TokenFarm, config, network
from web3 import Web3
import yaml
import json
import os
import shutil

KEPT_BALANCE = Web3.toWei(100, "ether")


def deploy_token_farm_and_dapp_token(front_end_update=False):
    account = get_account()
    dapp_token = DappToken.deploy({"from": account})
    token_farm = TokenFarm.deploy(
        dapp_token.address,
        {"from": account},
        publish_source=config["networks"][network.show_active()].get("verify", False),
    )
    txn = dapp_token.transfer(
        token_farm.address, dapp_token.totalSupply() - KEPT_BALANCE, {"from": account}
    )
    txn.wait(1)
    # dapp_token, weth_token, fau_token/dai
    weth_token = get_contract("weth_token")
    fau_token = get_contract("fau_token")
    dict_of_allowed_tokens = {
        dapp_token: get_contract("dai_usd_price_feed"),
        fau_token: get_contract("dai_usd_price_feed"),
        weth_token: get_contract("eth_usd_price_feed"),
    }
    add_allowed_tokens(token_farm, dict_of_allowed_tokens, account)
    if front_end_update:
        update_front_end()
    return token_farm, dapp_token


def add_allowed_tokens(token_farm, dict_of_allowed_tokens, account):
    for token in dict_of_allowed_tokens:
        add_txn = token_farm.addAllowedTokens(token.address, {"from": account})
        add_txn.wait(1)
        set_txn = token_farm.setPriceFeedContract(
            token.address, dict_of_allowed_tokens[token], {"from": account}
        )
        set_txn.wait(1)
        return token_farm


def update_front_end():
    copy_folders_to_front_end("./build", "./front_end/src/chain-info")
    with open("brownie-config.yaml", "r") as f:
        config_dict = yaml.load(f, Loader=yaml.FullLoader)
    with open("./front_end/src/brownie-config.json", "w") as f:
        json.dump(config_dict, f)
    print("Front end updated!")


def copy_folders_to_front_end(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def main():
    deploy_token_farm_and_dapp_token(front_end_update=True)
