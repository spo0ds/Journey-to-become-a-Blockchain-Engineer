const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Marketplace Tests", function () {
        let nftMarketplace, basicNft, deployer, player
        const PRICE = ethers.utils.parseEther("0.1")
        const TOKEN_ID = 0
        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            // player = (await getNamedAccounts()).player
            const accounts = await ethers.getSigners()
            player = accounts[1]

            await deployments.fixture(["all"])
            nftMarketplace = await ethers.getContract("NftMarketplace")
            basicNft = await ethers.getContract("BasicNft")

            await basicNft.mintNft()
            await basicNft.approve(nftMarketplace.address, TOKEN_ID)
        })

        it("list and can be bought", async function () {
            await nftMarketplace.listItems(basicNft.address, TOKEN_ID, PRICE)
            const playerConnectedNftMarketplace = nftMarketplace.connect(player)
            await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })

            const newOwner = await basicNft.ownerOf(TOKEN_ID)
            const deployerProceeds = await nftMarketplace.getProceeds(deployer)

            assert(newOwner.toString() == player.address)
            assert(deployerProceeds.toString() == PRICE.toString())
        })
    })