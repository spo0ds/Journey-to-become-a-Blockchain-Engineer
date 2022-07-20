const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages } = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomIpfs/"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let tokenUris

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait(1)
        subId = txReceipt.events[0].args.subId
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subId = networkConfig[chaiId].subId
    }

    log("---------------------------------------")

    await storeImages(imagesLocation)
    // const args = [
    //     vrfCoordinatorV2Address,
    //     subId,
    //     networkConfig[chainId].gasLane,
    //     networkConfig[chainId.callbackGasLimit],
    //     // catTokenUris
    //     networkConfig[chainId].mintFee,
    // ]
}

async function handleTokenUris() {
    tokenUris = []
    // store the image in IPFS
    // store the metadata in IPFS

    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
