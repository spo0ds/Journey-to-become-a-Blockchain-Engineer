#!/usr/bin/python3
from brownie import PriceFeedConsumer


def main():
    price_feed_contract = PriceFeedConsumer[-1]
    print(f"Reading data from {price_feed_contract.address}")
    print(price_feed_contract.getLatestPrice())
