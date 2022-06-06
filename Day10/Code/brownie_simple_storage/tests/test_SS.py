from brownie import SimpleStorage, accounts


def test_deploy():
    # Arrange
    account = accounts[0]
    # Act
    ss_contract = SimpleStorage.deploy({"from": account})
    starting_value = ss_contract.retrieve()
    expected = 0
    # Assert
    assert starting_value == expected


def test_updating_age():
    # Arrange
    account = accounts[0]
    ss_contract = SimpleStorage.deploy(
        {"from": account}
    )  # part of the setup not the act we're testing
    # Act
    expected = 15
    ss_contract.store(expected, {"from": account})
    # Assert
    assert expected == ss_contract.retrieve()
