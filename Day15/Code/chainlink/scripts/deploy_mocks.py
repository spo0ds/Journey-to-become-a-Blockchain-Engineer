from scripts.helpful_scripts import deploy_mocks

DECIMALS = 18
INITIAL_VALUE = 2000


def main():
    deploy_mocks(decimals=DECIMALS, initial_value=INITIAL_VALUE)
