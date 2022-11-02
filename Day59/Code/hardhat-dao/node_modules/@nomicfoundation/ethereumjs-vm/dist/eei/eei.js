"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EEI = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const vmState_1 = require("./vmState");
/**
 * External interface made available to EVM bytecode. Modeled after
 * the ewasm EEI [spec](https://github.com/ewasm/design/blob/master/eth_interface.md).
 * It includes methods for accessing/modifying state, calling or creating contracts, access
 * to environment data among other things.
 * The EEI instance also keeps artifacts produced by the bytecode such as logs
 * and to-be-selfdestructed addresses.
 */
class EEI extends vmState_1.VmState {
    constructor(stateManager, common, blockchain) {
        super({ common, stateManager });
        this._common = common;
        this._blockchain = blockchain;
    }
    /**
     * Returns balance of the given account.
     * @param address - Address of account
     */
    async getExternalBalance(address) {
        const account = await this.getAccount(address);
        return account.balance;
    }
    /**
     * Get size of an account’s code.
     * @param address - Address of account
     */
    async getExternalCodeSize(address) {
        const code = await this.getContractCode(address);
        return BigInt(code.length);
    }
    /**
     * Returns code of an account.
     * @param address - Address of account
     */
    async getExternalCode(address) {
        return this.getContractCode(address);
    }
    /**
     * Returns Gets the hash of one of the 256 most recent complete blocks.
     * @param num - Number of block
     */
    async getBlockHash(num) {
        const block = await this._blockchain.getBlock(Number(num));
        return (0, ethereumjs_util_1.bufferToBigInt)(block.hash());
    }
    /**
     * Storage 256-bit value into storage of an address
     * @param address Address to store into
     * @param key Storage key
     * @param value Storage value
     */
    async storageStore(address, key, value) {
        await this.putContractStorage(address, key, value);
    }
    /**
     * Loads a 256-bit value to memory from persistent storage.
     * @param address Address to get storage key value from
     * @param key Storage key
     * @param original If true, return the original storage value (default: false)
     */
    async storageLoad(address, key, original = false) {
        if (original) {
            return this.getOriginalContractStorage(address, key);
        }
        else {
            return this.getContractStorage(address, key);
        }
    }
    copy() {
        return new EEI(this._stateManager.copy(), this._common.copy(), this._blockchain.copy());
    }
}
exports.EEI = EEI;
//# sourceMappingURL=eei.js.map