from scripts.helpful_scripts import get_account, OPENSEA_URL
from brownie import SimpleCollectible

sample_token_uri = (
    "https://ipfs.io/ipfs/QmV88W51WyDqwWb9QzyroT6TiHH7iVcrvfj8vWAkciKMsU/cat.png"
)




def deploy_and_create():
    account = get_account()
    simple_collectible = SimpleCollectible.deploy({"from": account})
    txn = simple_collectible.createCollectible(sample_token_uri, {"from": account})
    txn.wait(1)
    print(
        f"Awesome, you can view your NFT at {OPENSEA_URL.format(simple_collectible.address, simple_collectible.tokenCounter() - 1)}"
    )
    print("Please wait up to 20 minutes, and hit the refresh metadata button. ")
    return simple_collectible


def main():
    deploy_and_create()
