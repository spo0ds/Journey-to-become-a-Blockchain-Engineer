import time

import pytest
from brownie import APIConsumer, network, config
from scripts.helpful_scripts import (
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    get_account,
    listen_for_event,
    get_contract,
    fund_with_link
)


@pytest.fixture
def deploy_api_contract(get_job_id, chainlink_fee):
    # Arrange / Act
    api_consumer = APIConsumer.deploy(
        get_contract("oracle").address,
        get_job_id,
        chainlink_fee,
        get_contract("link_token").address,
        {"from": get_account()},
    )
    block_confirmations=6
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        block_confirmations=1
    api_consumer.tx.wait(block_confirmations)
    # Assert
    assert api_consumer is not None
    return api_consumer


def test_send_api_request_local(
    deploy_api_contract,
    chainlink_fee,
    get_data,
):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    api_contract = deploy_api_contract
    get_contract("link_token").transfer(
        api_contract.address, chainlink_fee * 2, {"from": get_account()}
    )
    # Act
    transaction_receipt = api_contract.requestVolumeData({"from": get_account()})
    requestId = transaction_receipt.events["ChainlinkRequested"]["id"]
    # Assert
    get_contract("oracle").fulfillOracleRequest(
        requestId, get_data, {"from": get_account()}
    )
    assert isinstance(api_contract.volume(), int)
    assert api_contract.volume() > 0

def test_send_api_request_testnet(deploy_api_contract, chainlink_fee):
    # Arrange
    if network.show_active() not in ["kovan", "rinkeby", "mainnet"]:
        pytest.skip("Only for local testing")
    api_contract = deploy_api_contract

    if (config["networks"][network.show_active()].get("verify", False)):
        APIConsumer.publish_source(api_contract)

    tx = fund_with_link(
        api_contract.address, amount=chainlink_fee
    )
    tx.wait(1)
    # Act
    transaction = api_contract.requestVolumeData({"from": get_account()})
    transaction.wait(1)

    # Assert
    event_response = listen_for_event(api_contract, "DataFullfilled")
    assert event_response.event is not None
    assert isinstance(api_contract.volume(), int)
    assert api_contract.volume() > 0
