from scripts.helpful_scripts import get_account, encode_function_data, upgrade
from brownie import (
    network,
    Box,
    ProxyAdmin,
    TransparentUpgradeableProxy,
    Contract,
    BoxV2,
)


def main():
    account = get_account()
    print(f"Deploying to {network.show_active()}")
    box = Box.deploy({"from": account})

    proxy_admin = ProxyAdmin.deploy({"from": account})

    # initializer = box.store, 1
    box_encoded_initializer_function = encode_function_data()

    proxy = TransparentUpgradeableProxy.deploy(
        box.address,
        proxy_admin.address,
        box_encoded_initializer_function,
        {"from": account, "gas_limit": 1000000},
    )

    print(f"Proxy deployed to {proxy}, you can now upgrade to V2!")
    proxy_box = Contract.from_abi("Box", proxy.address, Box.abi)

    # upgrade
    box_v2 = BoxV2.deploy({"from": account})
    upgrade_txn = upgrade(
        account, proxy, box_v2.address, proxy_admin_contract=proxy_admin
    )
    upgrade_txn.wait(1)
    print("Proxy has been upgraded")
    proxy_box = Contract.from_abi("BoxV2", proxy.address, BoxV2.abi)
    proxy_box.increment({"from": account}, publish_source=True)
    print(proxy_box.retrieve())
