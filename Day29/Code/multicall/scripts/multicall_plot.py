from brownie import Contract, interface, multicall
from datetime import datetime
import matplotlib.pyplot as plt


def main():
    price_feed = Contract.from_abi(
        "feed",
        "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        interface.AggregatorV3Interface.abi,
    )

    answers = []
    time_stamps = []
    round_Id = price_feed.latestRoundData()[0]
    multicall(address="0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696")
    with multicall:
        for id in range(round_Id, round_Id - 50, -1):
            round_data = price_feed.getRoundData(id)
            answers.append(round_data[1])
            time_stamps.append(datetime.fromtimestamp(round_data[3]))

    plt.plot(time_stamps, answers)
    plt.show()
