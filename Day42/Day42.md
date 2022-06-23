We're going to create a new folder "deploy" and we're going to create some scripts to deploy our raffle contract.With our raffle contract there's couple of things that we want to make note of.First thing is our constructor right now is absolutely massive.There are tons of parameters in here that we need to keep account of.Let's take a look at our constructor and see if there's any contract that we're already interacting with.

Knowing that vrfCoordinatorV2 is an address is a tip that we probably need to deploy some mocks for this.Since we're going to need to interact with a VRFCoordinator contract that's outside of our project but let's go ahead and start working on our raffle deployment script first and we know we're going to have to deploy some mocks.So we'll just keep that in mind.

So let's create a new file called "01-deploy-raffle.js".This is going to look really similar to what we've done before and we're going to do it again here.

```javascript
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
}
```

Let's go to our config and update module.exports.

```javascript
module.exports = {
    solidity: "0.8.8",
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
}
```

Similar to last time, to deploy our raffle:

```javascript
const raffle = await deploy("Raffle", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: 6,
    })
```

args contains ton of parameters.We'll come to that in a bit.

In our hardhat.config ,we don't have a network.So let's add our network information to get those blockConfirmations. 

```javascript
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },
        rinkeby: {
            chainId: 4,
            blockConfirmations: 6,
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
    },
```

Since writing a RINKEBY_RPC_URL and more, we also want to make sure in our .env we have all those information.

Now for waitConfirmation, it's going to be:

```javascript
const raffle = await deploy("Raffle", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
```

This is how we're going to deploy our raffle.Obviously we do have tons of arguments to work with.So let's get to it.Well the first thing that we need to get is the vrfCoordinatorV2.We're going to use the same strategy we used in our FundMe project with using mocks if we're on a development chain and using the actual contract address if we're on a testnet or a live network.So let's recreate that helper-hardhat-config.

```javascript
const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    },
}
```

We can get the vrfCoordinatorV2 address for rinkeby testnet in the [chainlink documentation](https://docs.chain.link/docs/vrf-contracts/).

So back in our deploy raffle, we're going to pick whether or not to use the vrfCoordinatorV2 in the network config or some mocks that we deploy which of course leads us to having to deploy a mock.Let's create a new file inside deploy folder called "00-deploy-mocks.js"

```javascript
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
}
```

And we also want to grab the chainId as well cause we want to deploy this on a development chain.

```javascript
const chainId = network.config.chainId
```

Now we only want to deply mock if we're on a development chain.So once again we're going to our helper config and add those develpoment chains.

```javascript
const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    },
}

const developmentChains = ["hardhat", "localhost"]
```

And then we want to export both of these.

```javascript
module.exports = {
    networkConfig,
    developmentChains,
}
```

Now in our deploy mocks, we want to grab those :

```javascript
const { developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
```

Now we can check to see if development chains, to detect local network to deploy mocks.

```javascript
if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfCoordinator
    }
```

Let's go ahead and deploy our mock vrfCoordinator.

**Mock Chainlink VRFCoordinator**

So in our contracts folder, we're going to create a new folder called "test" and inside test we're going to create a new file called "VRFCoordinatorV2Mock.sol" and import the mock here.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";
```

And we're going to make sure it compiles without any errors.

`yarn hardhat compile`

Now that we've our mock contract, we can actually go ahead and deploy it.

```javascript
if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfCoordinator
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [],
        })
    }
```

What are the arguments this VRFCoordinatorV2Mock will take?

If we roll over to the constructor, we can see it takes two thing : baseFee and a gasPriceLink.First one is the const baseFee.If we go back to the documentation, there's a premium section which has 0.25 LINK for rinkeby.This means each requests, there's a base fee of 0.25LINK for every requests.So anytime we want to request a random number on rinkeby, it's going to cost us 0.25 LINK or 0.25 Oracle gas to make this request.So in our deploy mock scripts.

```javascript
const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium. It costs 0.25 LINK per requests.
```

Remember this costs 0.25 LINK per request versus the pricefeed didn't cost anything is because the pricefeeds is being sponsored by a group of protocols who are paying for all these requests already.Since there isn't a sponsor for this, we're the only one requesting the randomness, we get to be the ones to actually sponsor getting the random number.

Then the second thing here is going to be gasPriceLink.This actually is a calculated value based on the gas price of the chain.If we were to request a random number in Ethereum and the ETH price skyrocketed up, gas would be incredibly incredibly expensive.When chainlink nodes respond, chainlink node pay the gas fees to give us randomness and do external execution.The chainlink nodes are actually ones that pay the gas when returning randomness or executing an upkeep or etc.In our performUpkeep or fulfillRandomWords, it's actually the chainlink nodes that are calling these two functions and paying the gas for it.They get paid in oracle gas to offset those cost but if the price of ETH or any native blockchain skyrocketed, the chainlink node still have to pay the gas fees.So chainlink node have a calculated variable called gas price per link which fluctuates based off the price of the actual chain, so that they never go bankrupt.

Basically the price of a request changes based off the price of the gas for that blockchain.You can think of it as LINK per gas.For now we can set it to whatever we want and we'll just set it to:

```javascript
const GAS_PRICE_LINK = 1e9
```

Now that we've the base fee and the gas price link, we'll have these be arguments for VRFCoordinatorV2Mock.

```javascript
const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfCoordinator
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
    }
```

Then we'll do:

```javascript
module.exports.tags = ["all", "mocks"]
```

So now that we've a VRFCoordinatorV2Mock deployed, we'll come back over our raffle and make some code around it.

```javascript
let vrfCoordinatorV2Address

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    }
```

We've the address here.If we're not on a local network, the vrf address is simply going to be derived from our network config.So let's import the network config as well from our helper hardhat config.

```javascript
const { developmentChains, networkConfig } = require("../helper-hardhat-config")


 if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
    }
```

We've got the setup to work with VRFCoordinatorV2Address.

What else do we need from our Raffle? 

Well we need an entrance fee.We probably want to change the entrance fee depending on what chain we're on.We're on a more expensive chain, we want to make the entry fee higher than others.So let's go back to our helper hardhat config and make an entrance fee based off of the blockchain.

```javascript
const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther("0.01"),
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
    },
}
```

On our deploy raffle, we can just say:

```javascript
const entranceFee = networkConfig[chainId]["entranceFee"]
```

Let's start populating our args here.

```javascript
const args = [vrfCoordinatorV2Address, entranceFee]
```

Now we need our gasLane.On Rinkeby and other networks, there are different gas lanes that we can choose from.Let's grab the only gas lane from [Rinkeby](https://docs.chain.link/docs/vrf-contracts/#rinkeby-testnet) "The 30 Gwei KeyHash".Let's drop this in our network config our our hardhat helper.

```javascript
4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    },
```

For hardhat,our mock doesn't care what gasLane we're working on because we're going to be mocking the gasLane anyways.So we can just use the same one or really anything here doesn't really matter.

```javascript
31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    },
```

Now it's time for the subscription Id.We can actually make a subscription Id using that using that website vrf.chain.link which is great but what if we're on a local chain.We can get a subscription Id for testnet but a little bit harder on a local network.We're going to learn how to create and fund subscription Ids completely programmatically.So you don't even need to use the UI if you don't want to.However, we're still going to use the UI for us to get our own subscription Id.But you could 100% automate the process of creating a subscription Id and funding a subscription Id because when we create and fund subscription Ids, we're just calling create subscription and fund subscription on that smart contract.

So on our development chain, we've a VRFCoordinatorV2Mock and we're going to create that subscription.

```javascript
if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const txnResponse = await vrfCoordinatorV2Mock.createSubscription()
        const txnReceipt = await txnResponse.wait(1)
    }
```

Inside the txnReceipt, there's actually an event that's emitted with our subscription that we can get.This is another place where emitting events is incredibly helpful.

```javascript
subId = txnReceipt.events[0].args.subId
```

Now we've our subscription, we've to fund the subscription.On a real network, you need the link token to actually fund the subscription.The current iteration of the mock allows you to fund the subscription without the link token.We can just run:

```javascript
// Fund the subscription
await vrfCoordinatorV2Mock.fundSubscription(subId, ???)
```

We need to fund some amount.For this we can just create some variable.

```javascript
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2") // outside of model.exports

// Fund the subscription
await vrfCoordinatorV2Mock.fundSubscription(subId, VRF_SUB_FUND_AMOUNT)
```

We can do this as well for a testnet or live net.But just so that we become familiar with the UI, we're not going to do the testnet programmatically and for testnet, we're just going to use exactly what we've been doing so far where we can put a subscription Id in our helper config.

```javascript
4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subId: "0",
    },
```

Righ now we'll just leave it as 0 later on when we actually create a subscription, we'll update our subscription Id.

```javascript
else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subId = networkConfig[chainId]["subId"]
    }
```

Now we need a callBackGasLimit.It's going to vary network to network.

```javascript
const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subId: "0",
        callBackGasLimit: "500000",
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callBackGasLimit: "500000",
    },
}
```

```javascript
const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"]
```

All we need now is the interval and we can change this network to network as well.

```javascript
const networkConfig = {
    4: {
        name: "rinkeby",
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subId: "0",
        callBackGasLimit: "500000",
        interval: "30",
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callBackGasLimit: "500000",
        interval: "30",
    },
}
```

```javascript
const entranceFee = networkConfig[chainId]["entranceFee"]
const gasLane = networkConfig[chainId]["gasLane"]
const callBackGasLimit = networkConfig[chainId]["callBackGasLimit"]
const interval = networkConfig[chainId]["interval"]

const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subId, callBackGasLimit, interval]
```

Now we have an argument array for everything in our constructor of Raffle contract.

Let's go ahead and add that verification piece.So once again we'll create new folder "utils", create a new file inside it "verify.js".

```javascript
const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    verify,
}
```

Once we've our verify script, we're going to import it.
```javascript
const { verify } = require("../utils/verify")
```


```javascript
if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(raffle.address, args)
    }

    log("------------------------------------------------")
```

```javascript
module.exports.tags = ["all", "raffle"]
```

Alright let's test this out.We'll do `yarn hardhat deploy` and see if the script works correctly.

**Raffle.sol Unit Tests**

We've our contracts and deploy scripts that means it's time for us to write some tests.We'll create a new folder "test", inside it create another folder "unit" and inside it we create a new file "Raffle.test.js".Let's write some unit tests.

We're going to grab our development chains so that we only run unit tests on a development chain.

```javascript
const { network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? Describe.skip : describe()
```

First describe is going to be our Raffle unit test.

```javascript
!developmentChains.includes(network.name) ? Describe.skip : describe("Raffle", async function () {
})
```

What are the main things that we're going to deploy?

Well we probably want to deploy raffle, vrfCoordinatorV2Mock and in our beforeEach, we'll get these.

```javascript
const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? Describe.skip
    : describe("Raffle", async function () {
          let raffle, vrfCoordinatorV2Mock

          beforeEach(async function () {
              const { deployer } = await getNamedAccounts()
              await deployments.fixture(["all"]) // deploys everything
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
          })
      })
```

Our first set of test is going to be for the constructor.

```javascript
describe("constructor", async function () {
              it("initializes the raffle correctly", async function () {
                  // Ideally we make our tests have just 1 assert per "it"
                  const raffleState = await raffle.getRaffleState()
                  const interval = await raffle.getInterval()
                  assert.equal(raffleState.toString(), "0") // checking for OPEN state
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })
```

Let's test this so far. `yarn hardhat test`

Let's go to our hardhat config just so that it doesn't always prints out the gas.

```javascript
gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
solidity: "0.8.8",
``` 

Now if you run yarn hardhat test again, it shouldn't have that gas bit printed out.

Enter Raffleis going to be our next describe block.

```javascript
describe("enterRaffle", async function () {
              it("reverts when you don't pay enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughETHEntered"
                  )
              })
          })
```

We can try this out to make sure this actually works.

`yarn hardhat test --grep "you don't pay enough"`

We also wanna test, if raffle isn't open, we'll revert but we'll test that in a little bit.We wanna see if it records player or not.

```javascript
it("records player when they entered", async function () {
})
```

We'll enter the raffle first we're going to need that raffle entrance fee.Let's go ahead and save it at the top.

```javascript
let raffle, vrfCoordinatorV2Mock, raffleEntranceFee

raffleEntranceFee = await raffle.getEntranceFee() // inside beforeEach
```

Now that we've the raffle entrance fee, we can use it to enter the raffle.

```javascript
it("records player when they entered", async function () {
    await raffle.enterRaffle({ value: raffleEntranceFee })
})
```

We can make sure that our deployer here has been correctly recorded.So since right now we're connected to the deployer, we'll make sure that the deployer actually is in our contract.

```javascript
it("records player when they entered", async function () {
    await raffle.enterRaffle({ value: raffleEntranceFee })
    const playerFromContract = await raffle.getPlayer(0)
    assert.equal(playerFromContract, deployer)
})
```

Now we can grep for this: `yarn hardhat test --grep "records player when they entered"`

You'll get an error saying "deployer isn't defined."

It's because we got our deployer in beforeEach but we didn't save it up globally.

```javascript
let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer

deployer = (await getNamedAccounts()).deployer // inside beforeEach
```

**Testing Events & Chai Matchers**

It's also emitting an event.So let's make sure it emits an event. 

```javascript
it("emits event on enter", async function () {
        await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
        raffle,
        "RaffleEnter"
    )
})
```

".to.emit" we get from ethereum waffle and we're saying a Raffle contract to emit a RaffleEnter event.

`yarn hardhat test --grep "event on enter"`

**Raffle.sol Unit Tests Continued**

Let's now go ahead and make sure that we can't enter the raffle whenever the raffle is not open.

```javascript
it("doesn't allow entrance when raffle is calculating", async function () {
    await raffle.enterRaffle({ value: raffleEntranceFee })
})
```

Now we want this raffle to get into a closed state.How do we move from open to calculating state? Well in performUpkeep from raffle.OPEN to raffle.CALCULATING but performUpkeep can only be called if checkUpkeep return true otherwise it'll revert with Raffle__UpKeepNotNeeded.So we need to make checkUpkeep return true and we'll pretend to be the chainlinkKeeper network to keep calling checkUpkeep waiting for it to be true then once we make it true, we'll pretend to be the chainlink keeper and call performUpkeep to put the contract in a state of calculating.

**Hardhat Methods & "Time Travel"**

```solidity
bool isOpen = (RaffleState.OPEN == s_raffleState);
bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
bool hasPlayers = (s_players.length > 0);
bool hasBalance = address(this).balance > 0;
upKeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
```

Well in order for checkUpkeep to be true, we first need to see that we are indeed open which we're.Next thing that we need to do though is that timePassed bit.We need to actually wait that 30 seconds for time to pass.Now that kind of sound awful.Do we have to wait 30 seconds for all of our tests?What if our interval was 10 days?

Well hardhat comes actually built in with tons of functions for us to manipulate our blockchain to do literally whatever we want it to do.In a hardhat documentation there's a section called "[Hardhat Network Reference](https://hardhat.org/hardhat-network/reference)" and in here there's a ton of information about how the hardhat network actually works and different configs that we can do with it.If scroll enough we can see the JSON-RPC methods that we can use on the blockchain.Additionally we can do even more than that.We can use these things called "Hardhat network methods".Since this is our local hardhat network and we're using this for testing, we want to be able to test any scenario and these methods tht give us the ability to do that.

Some of the special testing debugging methods are going to be the `evm_increaseTime` and `evm_mine`.Increase time allows us to automatically increase the time of our blockchain and evm_mine allows us to mine or create new blocks because if we increase the time it doesn't do anything unless there's a new block mined.

```javascript
it("doesn't allow entrance when raffle is calculating", async function () {
    await raffle.enterRaffle({ value: raffleEntranceFee })
    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
})
```

Interval isn't set globally so we probably want to do that.

```javascript
let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval

interval = await raffle.getInterval() // inside beforeEach
```

So we want to increase the time by whatever interval is to make sure that we can actually get that checkUpkeep to return true.Additionally we want to do:

```javascript
it("doesn't allow entrance when raffle is calculating", async function () {
    await raffle.enterRaffle({ value: raffleEntranceFee })
    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
    await network.provider.send("evm_mine", [])
})
```

So we've increased the time of our blockchain, mined a block to move forward.It should be open, we have a player cause we entered the raffle and we should have a balance because we've entered the raffle.checkUpkeep should now return true so we should be able to call performUpkeep and pretend to be a chainlink keeper.

```javascript
// pretend to be a chainlink keeper
await raffle.performUpkeep([])
```

We passed the empty calldata just by passing a blank array.Now this should be in a calculating state.

```javascript
 it("doesn't allow entrance when raffle is calculating", async function () {
    await raffle.enterRaffle({ value: raffleEntranceFee })
    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
    await network.provider.send("evm_mine", [])
    // pretend to be a chainlink keeper
    await raffle.performUpkeep([])
    await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
        "Raffle__NotOpen"
    )
})
```

Let's go ahead and test our checkUpkeep now.

```javascript
describe("checkUpkeep", async function () {
    it("returns false if people haven't sent any ETH", async function () {})
})
```

We'll have every parameters of upkeepNeed to be true except for the fact that nobody has enterd yet.

```javascript
it("returns false if people haven't sent any ETH", async function () {
    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
    await network.provider.send("evm_mine", [])
})
```

**Callstatic**

Now we're going to call checkUpkeep.Here's the thing checkUpkeep is a public function.So if we just run `await raffle.checkUpkeep([])`, this is going to kick off the transaction.Hardhat knows it's public function they're clearly trying to send the transaction here.If this was a public view function, it wouldn't.It would just return that view.The thing is I don't really wanna send the transaction, I want to simulate sending the transaction and see what this upkeepNeeded would return.Well I can actually get that by using something called `callstatic`.I can simulate calling this transaction and seeing what it'll respond.

```javascript
it("returns false if people haven't sent any ETH", async function () {
    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
    await network.provider.send("evm_mine", [])
    await raffle.callStatic.checkUpkeep([])
})
```

This will give me the upkeepNeeded the bytes performData.I can extrapolate just the upkeepNeeded by:

```javascript
const { upkeepNeeeded } = await raffle.callStatic.checkUpkeep([])
```

Then I can do the assertion.

```javascript
it("returns false if people haven't sent any ETH", async function () {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeeded)
              })
```

`yarn hardhat test --grep "returns false if people"`

Let's also test for it return false if raffle isn't open.

```javascript
it("returns false if raffle isn't open", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep([])
                  const raffleState = await raffle.getRaffleState()
                  const { upkeepNeeeded } = await raffle.callStatic.checkUpkeep([])
                  assert.equal(raffleState.toString(), "1") // it should be equal to calculating
              })
```


Now let's write some tests for performUpkeep.

```javascript
describe("performUpkeep", function () {
              it("it can only run if checkUpkeep is true", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await raffle.performUpkeep([])
                  assert(tx)
              })
          })
```

We want to revert with Raffle_UpKeepNotNeeded if checkUpkeep is false.

```javascript
it("reverts when checkUpkeep is false", async function(){
                  await expect(raffle.performUpkeep([])).to.be.revertedWith("Raffle__UpKeepNotNeeded")
              })
```

Our revert actually goes ahead and reverts all the parameters that we pass in the error. Our test is smart enough to know that if all we do is put the name of the error that's getting reverted with then it's good enough.If we want to be super specific, we can make it a string enterpolation and add all the parameters in there.

Well we should check to see that requestRandomWords actually gets called, the raffle state gets changed and we emit the event.

```javascript
it("updates the raffle state, emits an event, and calls the vrfCoordinator", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const txResponse = await raffle.performUpkeep([])
                  const txReceipt = await txResponse.wait(1)
                  const requestId = txReceipt.evens[1].args.requestId
                  const raffleState = await raffle.getRaffleState()
                  assert(requestId.toNumber() > 0)
                  assert(raffleState.toNumber() == 1)
              })
```

We could get the requestId from `emit RequestRaffleWinner(requestId);` this emitted event.However we should look at our VRFCoordinatorMock.When we call requestRandomWords both in the mock and in the actual contract, you'll notice that it also emits an event with RandomWordsRequested.

```solidity
 emit RandomWordsRequested(
      _keyHash,
      requestId,
      preSeed,
      _subId,
      _minimumRequestConfirmations,
      _callbackGasLimit,
      _numWords,
      msg.sender
    );
```

And if you look in here the second parameter that it has is indeed the requestId.So in reality, us emitting the requestId is redundant.We can just use the emitted requestId from the VRFCoordinator.Before our events get emitted, requestRandomWords is going to emit an event.So instead of 0th events, so we're using our own event so 1 is being passed there `txReceipt.evens[1]`.

Now it's time for fulfillRandomWords.

```javascript
describe("fulfillRandomWords", function() {
})
```

and in here we're going to add another beforeEach.We want to have somebody have entered the raffle before we run any test in here.

```javascript
beforeEach(async function () {
    await raffle.enterRaffle({ value: raffleEntranceFee })
    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
    await network.provider.send("evm_mine", [])
})
```

So the first thing we wanna do is we want to see that fulfillRandomWords can only be called so long as there's a request in flight.

```javascript
it("can only be called after performUpkeep", async function () {
    await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
    ).to.be.revertedWith("nonexistent request")
})
```

and we're going to do the exact same thing with a different requestId and hopefully we're going to get an non existent request.

```javascript
it("can only be called after performUpkeep", async function () {
    await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith("nonexistent request")

    await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith("nonexistent request")
})
```

Why are we reverting on request that don't exist? 

If we look at our VRFCoordinatorV2Mock, in fulfillRandomWords function which is what the chainlink node actually calls and inside this function calls another contract that does the random number verification.So we're basically checking this part right here.

```solidity
if (s_requests[_requestId].subId == 0) {
    revert("nonexistent request");
}
```

And also we can look that fulfillRandomWords needs a requestId and a consumer address.

```solidity
function fulfillRandomWords(uint256 _requestId, address _consumer) external {}
```

Ideally no requestId here allows the fulfillRandomWords to go through.It obviously would be really hardh for us to test every single possible requestId.We're going to see a way in future to actually test for a ton of these variables with something called `fuzz testing`.

**Massive Promise Test**

This is exactly what we're going to do when we get to the staging test.We're going to write this test literally almost exactly the same.This is basically gonna be the test that puts everything together.So we're going to test that this indeed picks a winner, resets the lottery and sends money which is kind of alot of a single it.We probably want to split it into each pieces but for this we're going to put them all into one.

```javascript
it("picks a winner, resets the lottery, and sends money", async function () {
})
```

For this one also we're going to add some additional entrances.Additional people who're entering this lottery.

```javascript
it("picks a winner, resets the lottery, and sends money", async function () {
    const additionalEntrants = 3
})
```

We're going to have some more of those fake accounts from ethers enter our lottery here.

```javascript
const additionalEntrants = 3
const startingAccountIndex = 1 // deployer = 0
const accounts = await ethers.getSigner()
```

We're going to have a loop and connect our raffle contract to these new accounts and we're going to have these new accounts enter our raffle.

```javascript
for (let i = startingAccountIndex;
         i < startingAccountIndex + additionalEntrants;
         i++
    ) {
        const accountConnectedRaffle = raffle.connect(accounts[i])
        await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
      }
```

So we're going to have total of 4 people into this raffle.Now that we've them in here, we're going to keep note of our starting timestamp.

```javascript
const startingTimeStamp = await raffle.getLastTimeStamp()
```

We want to performUpkeep which is going to mock being chainlink keepers which will kick off calling fulfillRandomWords and we're going to mock doing that as well being the chainlink VRF.Once we do that we can ofcourse just check to see if the recentWinner gets recorded, the raffle gets reset, players reset, timestamp rest, is everything reset? but we wanna do this in a specific way.If we're doing this on a testnet after we call fulfillRandomWords, we'll have to wait for the fulfillRandomWords to be called.Since we're working with a hardhat local chain, we don't really need to wait for anything.But we're going to simulate that we do need to wait for that event to be called.So in order for us to simulate waiting for that event, we once again need to setup a `listener`.

Now if we setup a listener, we don't want this test to finish before the listener is done listening.So we need to once again create a new promise and this is going to be incredibly important especially for our staging tests.

```javascript
await new Promise(async (resolve, reject) => {
})
```

We're going to setup that once syntax.

```javascript
await new Promise(async (resolve, reject) => {
    raffle.once("WinnerPicked")
})
```

Listen for this WinnerPicked event.If WinnerPicked happens, do some stuff.

```javascript
await new Promise(async (resolve, reject) => {
    raffle.once("WinnerPicked", () => {
        })
})
```

Inside the once anonymous function, we're going to add all of our asserts because we want to wait for winner to get picked.

Now before the events get fired though, we ofcourse need to actually call fulfillRandomWords.This is going to seem it's a little bit backwards but that's because we want to setup our listeners so that when we do fire the methods that will fire the event, our listener is activated and is waiting for it.So we're going to put all of our code inside of the promise because if we put it outside of the promise, promise will never get resolved because the listener will never fire it's event.

We don't want to wait forever.Maybe there's an issue in our listener and we want to be able to reject it, if there's an issue.So in our hardhat.config, we can add a timeout.

```javascript
mocha: {
        timeout: 200000, // 200 seconds max
    },
```

If the event doesn't get fired in 200 seconds, this would be considered a failure and the test will fail.Let's wrap this on a try catch because if something fails, it'll cause us a whole bunch of a headache. 

```javascript
await new Promise(async (resolve, reject) => {
    raffle.once("WinnerPicked", () => {
        try {
            } catch (e) {
                reject(e)
            }
        resolve()
    })
})
```

If firing events takes too long, we want to just go ahead and throw an error otherwise we're going to resolve.

Now outside the listener but inside of the promise, we're going to do:

```javascript
await new Promise(async (resolve, reject) => {
    raffle.once("WinnerPicked", () => {
        try {
            } catch (e) {
                reject(e)
            }
            resolve()
    })
    const tx = await raffle.performUpkeep([])
    const txReceipt = await tx.wait(1)
    await vrfCoordinatorV2Mock.fulfillRandomWords(txReceipt.events[1].args.requestId,raffle.address)
})
```

All inside the promise, we're setting up a listener for the WinnerPicked event and then we're mocking the chainlink keepers and the chainlink VRF.Once the fulfillRandomWords function gets called, it should emit a winner picked event so the raffle that was setup that was listening to get emitted will pick up and go "I found the event WinnerPicked" and we can go ahead and do some stuff.

Once the event gets fired, we jump into our try catch which is going to be basically us doing all the asserts.

```javascript
try {
        const recentWinner = await raffle.getRecentWinner()
        const raffleState = await raffle.getRaffleState()
        const endingTimeStamp = await raffle.getLastTimeStamp()
    } catch (e) {
        reject(e)
    }
```

Let's start doing some asserts.So first we should assert that `s_players` array has been reset to zero.so if we call getNumberOfPlayers, it should be 0.

```javascript
const numPlayers = await raffle.getNumOfPlayer()
assert.equal(numPlayers.toString(), "0")
```

We can assert for raffle state back to being open.

```javascript
assert.equal(raffleState.toString(), "0")
```

We should assert for endingTimeStamp is now greater than startingTimeStamp.

```javascript
assert(endingTimeStamp > startingTimeStamp)
```

We also want to make sure that our recent winner is correct.To look at who the winner's going to be let's print the recentWinner along with all the accounts.

```javascript
console.log(`Recent Winner: ${recentWinner}`)
console.log(accounts[0].address)
console.log(accounts[1].address)
console.log(accounts[2].address)
console.log(accounts[3].address)
```

So it's look the winner is going to be account 1.So we now we know account 1 is going to be the winner, we can get the winner starting balance before we call fulfillRandomWords.

```javascript
const winnerSB = await accounts[1].getBalance()
```

Now that we have the winner starting balance, we can also get the winner ending balance in our try.

```javascript
const winnerEB = await accounts[1].getBalance()
```

We can make sure that the winner got paid what they need.

```javascript
assert.equal(
                winnerEB.toStrig(),
                winnerSB.add(
                    raffleEntranceFee
                    .mul(additionalEntrants)
                    .add(raffleEntranceFee)
                    .toStrig()
            )
        )
```

This math is basically saying that the winner should end with a balance of all of the money that everybody else added to the contract.

Let's do a quick refresher of just the recent it test.We're picking a winner, reset the lottery and sending the money.Basically we're testing that the fulfillRandomWords function does what we want it to do.A random winner wins and they get the money.We first started with having a bunch of random people enter the lottery.Then we wanted to call performUpkeep and fulfillRandomWords.We want to pretend that the random number was drawn.

But we could have assert and checked after, we called fulfillRandomness however on a testnet where we don't always know exactly when a transaction is going to finish, we have to wait, have to listen for an event to be fired.Before we can call the transaction that would end the whole thing, we needed to set something up to listen for that event to be fired and we said "Hey, only once the event is fired, only once the transaction is called, we do our testing."

For our local network, we're mocking the VRFCoordinator, we've control.We know exactly when this is going to run but on a testnet we don't.You'll see in a staging test, we have to rely on setting up a listener to listen for the chainlink VRF and the keepers to fire their events.That's why staging test is going to be so important  to make sure that we're doing everything correct.That's why we setup our local test like above so that it mimics what we're going to be doing on a staging test.Again we're setting up the listener and we're saying "Once we do here the event, then we're going to try to actually check all the balances and everything is working as intended" and if we don't see it we're going to reject and there's a timeout if it takes more than 200 seconds, we're going to say "Something went wrong.We're going to cancel it."  
