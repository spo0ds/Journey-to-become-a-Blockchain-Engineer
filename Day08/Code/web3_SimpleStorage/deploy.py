from solcx import compile_standard, install_solc
import json
from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()


with open("./SimpleStorage.sol", "r") as f:
    ss_file = f.read()

install_solc("0.6.0")

# compile our solidity
compiled_sol = compile_standard(
    {
        "language": "Solidity",
        "sources": {"SimpleStorage.sol": {"content": ss_file}},
        "settings": {
            "outputSelection": {
                "*": {
                    "*": ["abi", "metadata", "evm.bytecode", "evm.bytecode.sourceMap"]
                }
            }
        },
    },
    solc_version="0.6.0",
)

# print(compiled_sol)


with open("compiled_code.json", "w") as f:
    json.dump(compiled_sol, f)

# get bytecode
bytecode = compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["evm"][
    "bytecode"
]["object"]

# get ABI
abi = compiled_sol["contracts"]["SimpleStorage.sol"]["SimpleStorage"]["abi"]

# for connecting to ganache
w3 = Web3(
    Web3.HTTPProvider("https://rinkeby.infura.io/v3/6675befc593f4ba3b7700074febdd863")
)
chain_id = 4
my_address = "0x33312a27FBD848802421fEc986f32c38e4B9F8d6"
private_key = os.environ.get("PRIVATE_KEY")


# create the contract in Python
SimpleStorage = w3.eth.contract(abi=abi, bytecode=bytecode)

# get the latest transaction nonce
nonce = w3.eth.getTransactionCount(my_address)

# creating a transaction
transaction = SimpleStorage.constructor().buildTransaction(
    {
        "chainId": chain_id,
        "gasPrice": w3.eth.gas_price,
        "from": my_address,
        "nonce": nonce,
    }
)


# signing a transaction
signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)

# sending the signed transaction
print("Deploying contract ....")
tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print("Deployed!")


# working with contracts
ss_contract = w3.eth.contract(address=tx_receipt.contractAddress, abi=abi)

# initialize our age
print(ss_contract.functions.retrieve().call())

# print(ss_contract.functions.store(25).call())
print("Updating Contract ...")
store_transaction = ss_contract.functions.store(30).buildTransaction(
    {
        "chainId": chain_id,
        "gasPrice": w3.eth.gas_price,
        "from": my_address,
        "nonce": nonce + 1,  # +1 because we actually used nonce already
    }
)

signed_store_txn = w3.eth.account.sign_transaction(
    store_transaction, private_key=private_key
)


send_store_tx = w3.eth.send_raw_transaction(signed_store_txn.rawTransaction)
tx_receipt = w3.eth.wait_for_transaction_receipt(send_store_tx)
print("Updated!")
