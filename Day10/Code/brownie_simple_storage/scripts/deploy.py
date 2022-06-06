from brownie import accounts, config, SimpleStorage, network


def deploy_SS():
    account = get_account()
    ss_contract = SimpleStorage.deploy({"from": account})
    stored_value = ss_contract.retrieve()
    print(stored_value)
    transaction = ss_contract.store(15, {"from": account})
    transaction.wait(1)
    updated_value = ss_contract.retrieve()
    print(updated_value)


def get_account():
    if network.show_active() == "development":
        return accounts[0]
    else:
        return accounts.add(config["wallets"]["from_key"])


def main():
    deploy_SS()
