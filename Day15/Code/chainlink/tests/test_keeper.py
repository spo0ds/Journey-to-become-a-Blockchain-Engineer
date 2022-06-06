from brownie import Counter
from scripts.helpful_scripts import get_account


def test_can_call_check_upkeep():
    # Arrange
    interval = 2
    account = get_account()
    counter = Counter.deploy(interval, {"from": account})
    upkeepNeeded, performData = counter.checkUpkeep.call(
        "",
        {"from": account},
    )
    assert isinstance(upkeepNeeded, bool)
    assert isinstance(performData, bytes)
