from brownie import PriceFeedConsumer
from scripts.helpful_scripts import get_account, get_contract


def test_can_get_latest_price():
    # Arrange
    address = get_contract("eth_usd_price_feed").address
    # Act
    price_feed = PriceFeedConsumer.deploy(address, {"from": get_account()})
    # Assert
    value = price_feed.getLatestPrice({"from": get_account()})
    assert isinstance(value, int)
    assert value > 0
