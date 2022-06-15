// imports
const { ethers, run, network } = require("hardhat")

// async function
async function main() {
    const ssFactory = await ethers.getContractFactory("SimpleStorage")
    console.log("Deploying contract...")
    const simpleStorage = await ssFactory.deploy()
    await simpleStorage.deployed()
    console.log(`Deployed contract to: ${simpleStorage.address}`)
    // console.log(network.config)
    if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deployTransaction.wait(6) // wait 6 blocks and then run verification process
        await verify(simpleStorage.address, [])
    }

    const currentAge = await simpleStorage.retrieve()
    console.log(`Current Age: ${currentAge}`)

    // Update the current age
    const txnResponse = await simpleStorage.store("7")
    await txnResponse.wait(1)
    const updatedAge = await simpleStorage.retrieve()
    console.log(`Updated age: ${updatedAge}`)
}

async function verify(contractAddress, args) {
    console.log("Verfying contract ...")
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

// const verify = async (contractAddress, args) => {
//     console.log("Verfying contract ...")
//     try {
//         await run("verify:verify", {
//             address: contractAddress,
//             constructorArguments: args,
//         })
//     } catch (e) {
//         if (e.message.toLowerCase().includes("already verified")) {
//             console.log("Already verified!")
//         } else {
//             console.log(e)
//         }
//     }
// }
// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
