import { network } from "hardhat"

export async function moveTime(amount: number) {
    console.log("Moving time...")
    for (let index = 0; index < amount; index++) {
        await network.provider.send("evm_increaseTime", [amount])
        console.log(`Moved forward ${amount} seconds`)
    }
}