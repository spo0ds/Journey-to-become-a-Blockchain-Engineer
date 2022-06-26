import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdrw

async function connect() {
    if (typeof window.ethereum !== undefined) {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        // console.log("Connected!")
        connectButton.innerHTML = "Connected!"
    } else {
        // console.log("No metamask!")
        connectButton.innerHTML = "Please install metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    // ethAmount = "1"
    ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== undefined) {
        // provider / connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // signer / wallet / someone with some gas
        const signer = provider.getSigner()
        // console.log(signer)
        // contract that we're interacting with
        // to get the contract, we need ABI and the address
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txnResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTxnMined(txnResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

async function listenForTxnMined(txnResponse, provider) {
    console.log(`Minign ${txnResponse.hash}...`)
    // return new Promise()
    return new Promise((resolve, reject) => {
        provider.once(txnResponse.hash, (txnReceipt) => {
            console.log(
                `Completed with ${txnReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    console.log("Withdrawing the fund...")
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txnResponse = await contract.withdraw()
            await listenForTxnMined(txnResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
