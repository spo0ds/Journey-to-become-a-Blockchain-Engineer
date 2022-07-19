## Deploy Script

Let's go ahead and create a new deploy script "02-deploy-randomNft.js" and this is going to look really similar once again to our lottery contract that we've already done.We can copy some boilerplate from our basicNft deploy scripts.

```javascript
const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
}
```

Now since we're working with Chainlink here, we're going to be working with mocks again.So in our deploy folder, we're going to create a new scripts "00-deploy-mocks.js" and you can copy paste with the earlier section that we did with raffle since we're going to be doing the exact same thing.

```javascript
const { developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")

const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium. It costs 0.25 LINK per requests.
const GAS_PRICE_LINK = 1e9

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfCoordinator
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks Deployed!")
        log("-------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
```

Once we've done that, we need the chainId to decide if we're actually on developement chain.

```javascript
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let vrfCoordinatorV2Address

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    }
}
```

Then we want to create a subscription exactly the same as what we did with our lottery.

```javascript
if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
    }
```

We're going to get the subId from this exactly the same way we did it in the lottery section.

```javascript
let vrfCoordinatorV2Address, subId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subId = txReceipt.events[0].args.subId
    }
```

That's what we do if we're on the development chain else:

```javascript
else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subId = networkConfig[chaiId].subId
    }
```

We'll just double check our helper-hardhat config so that Rinkeby has both the vrfCoordinatorV2 and a subId.

Now we need to pass the arguments of the constructor.So we need the vrfCoordintor, subId, gasLane, callbackGasLimit, catTokenUris and a mintFee.

```javascript
const args = [
        vrfCoordinatorV2Address,
        subId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId.callbackGasLimit],
        // catTokenUris
        networkConfig[chainId].mintFee,
    ]
```

**Uploading token images with Pinata**


