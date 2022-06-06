from scripts.helpful_scripts import (
    get_account,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    get_contract,
    get_account,
)
from scripts.deploy_and_create import deploy_and_create
from brownie import network, AdvancedCollectible
import pytest


def test_can_create_advanced_collectible():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip()
    # Act
    advanced_collectible, creation_txn = deploy_and_create()
    requestID = creation_txn.events["requestedCollectable"]["requestID"]
    random_number = 777
    get_contract("vrf_coordinator").callBackWithRandomness(
        requestID, random_number, advanced_collectible.address, {"from": get_account()}
    )
    # Assert
    advanced_collectible.tokenCounter() == 1
    assert advanced_collectible.tokenIDToBreed(0) == random_number % 3
