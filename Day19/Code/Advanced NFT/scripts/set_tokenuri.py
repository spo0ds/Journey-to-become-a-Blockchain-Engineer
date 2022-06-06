from brownie import network, AdvancedCollectible
from scripts.helpful_scripts import get_breed, get_account

cat_metadata_dict = {
    "Persian": "https://ipfs.io/ipfs/QmdQKEsk5s9msnMBnbXGkmkyJmGWaaK9es2RBVmv8apfUq?filename=0-Persian.json"
}


def main():
    print(f"Working on {network.show_active()}")
    advanced_Collectible = AdvancedCollectible[-1]
    number_of_collectibles = advanced_Collectible.tokenCounter()
    print(f"You have {number_of_collectibles} tokenIDs.")
    for token_id in range(number_of_collectibles):
        breed = get_breed(advanced_Collectible.tokenIDToBreed(token_id))
        if not advanced_Collectible.tokenURI(token_id).startswith("https://"):
            print(f"Setting tokenUTI of {token_id}")
            set_tokenURI(token_id, advanced_Collectible, cat_metadata_dict[breed])


def set_tokenURI(token_id, nft_contract, tokenURI):
    account = get_account()
    txn = nft_contract.setTokenURI(token_id, tokenURI, {"from": account})
    txn.wait(1)
    print(
        f"Awesome! You can view your NFT at {OPENSEA_URL.format(nft_contract.address, token_id)}"
    )
    print("Please wait upto 20 minutes, and hit the refresh metadata button")
