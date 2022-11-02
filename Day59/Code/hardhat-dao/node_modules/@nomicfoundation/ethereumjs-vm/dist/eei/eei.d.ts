/// <reference types="node" />
import { VmState } from './vmState';
import type { Common } from '@nomicfoundation/ethereumjs-common';
import type { EEIInterface } from '@nomicfoundation/ethereumjs-evm';
import type { StateManager } from '@nomicfoundation/ethereumjs-statemanager';
import type { Address } from '@nomicfoundation/ethereumjs-util';
declare type Block = {
    hash(): Buffer;
};
declare type Blockchain = {
    getBlock(blockId: number): Promise<Block | null>;
    copy(): Blockchain;
};
/**
 * External interface made available to EVM bytecode. Modeled after
 * the ewasm EEI [spec](https://github.com/ewasm/design/blob/master/eth_interface.md).
 * It includes methods for accessing/modifying state, calling or creating contracts, access
 * to environment data among other things.
 * The EEI instance also keeps artifacts produced by the bytecode such as logs
 * and to-be-selfdestructed addresses.
 */
export declare class EEI extends VmState implements EEIInterface {
    protected _common: Common;
    protected _blockchain: Blockchain;
    constructor(stateManager: StateManager, common: Common, blockchain: Blockchain);
    /**
     * Returns balance of the given account.
     * @param address - Address of account
     */
    getExternalBalance(address: Address): Promise<bigint>;
    /**
     * Get size of an account’s code.
     * @param address - Address of account
     */
    getExternalCodeSize(address: Address): Promise<bigint>;
    /**
     * Returns code of an account.
     * @param address - Address of account
     */
    getExternalCode(address: Address): Promise<Buffer>;
    /**
     * Returns Gets the hash of one of the 256 most recent complete blocks.
     * @param num - Number of block
     */
    getBlockHash(num: bigint): Promise<bigint>;
    /**
     * Storage 256-bit value into storage of an address
     * @param address Address to store into
     * @param key Storage key
     * @param value Storage value
     */
    storageStore(address: Address, key: Buffer, value: Buffer): Promise<void>;
    /**
     * Loads a 256-bit value to memory from persistent storage.
     * @param address Address to get storage key value from
     * @param key Storage key
     * @param original If true, return the original storage value (default: false)
     */
    storageLoad(address: Address, key: Buffer, original?: boolean): Promise<Buffer>;
    copy(): EEI;
}
export {};
//# sourceMappingURL=eei.d.ts.map