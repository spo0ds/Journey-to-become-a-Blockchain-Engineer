/// <reference types="node" />
import { Common } from '@nomicfoundation/ethereumjs-common';
import { Account, Address } from '@nomicfoundation/ethereumjs-util';
import type { EVMStateAccess } from '@nomicfoundation/ethereumjs-evm/dist/types';
import type { AccountFields, StateManager } from '@nomicfoundation/ethereumjs-statemanager';
import type { AccessList } from '@nomicfoundation/ethereumjs-tx';
import type { Debugger } from 'debug';
declare type AddressHex = string;
export declare class VmState implements EVMStateAccess {
    protected _common: Common;
    protected _debug: Debugger;
    protected _checkpointCount: number;
    protected _stateManager: StateManager;
    protected _touched: Set<AddressHex>;
    protected _touchedStack: Set<AddressHex>[];
    protected _accessedStorage: Map<string, Set<string>>[];
    protected _accessedStorageReverted: Map<string, Set<string>>[];
    protected _originalStorageCache: Map<AddressHex, Map<AddressHex, Buffer>>;
    protected readonly DEBUG: boolean;
    constructor({ common, stateManager }: {
        common?: Common;
        stateManager: StateManager;
    });
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     *
     * Partial implementation, called from the subclass.
     */
    checkpoint(): Promise<void>;
    commit(): Promise<void>;
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     *
     * Partial implementation , called from the subclass.
     */
    revert(): Promise<void>;
    getAccount(address: Address): Promise<Account>;
    putAccount(address: Address, account: Account): Promise<void>;
    modifyAccountFields(address: Address, accountFields: AccountFields): Promise<void>;
    /**
     * Deletes an account from state under the provided `address`. The account will also be removed from the state trie.
     * @param address - Address of the account which should be deleted
     */
    deleteAccount(address: Address): Promise<void>;
    getContractCode(address: Address): Promise<Buffer>;
    putContractCode(address: Address, value: Buffer): Promise<void>;
    getContractStorage(address: Address, key: Buffer): Promise<Buffer>;
    putContractStorage(address: Address, key: Buffer, value: Buffer): Promise<void>;
    clearContractStorage(address: Address): Promise<void>;
    accountExists(address: Address): Promise<boolean>;
    setStateRoot(stateRoot: Buffer): Promise<void>;
    getStateRoot(): Promise<Buffer>;
    hasStateRoot(root: Buffer): Promise<boolean>;
    /**
     * Marks an account as touched, according to the definition
     * in [EIP-158](https://eips.ethereum.org/EIPS/eip-158).
     * This happens when the account is triggered for a state-changing
     * event. Touched accounts that are empty will be cleared
     * at the end of the tx.
     */
    touchAccount(address: Address): void;
    /**
     * Merges a storage map into the last item of the accessed storage stack
     */
    private _accessedStorageMerge;
    /**
     * Initializes the provided genesis state into the state trie.
     * Will error if there are uncommitted checkpoints on the instance.
     * @param initState address -> balance | [balance, code, storage]
     */
    generateCanonicalGenesis(initState: any): Promise<void>;
    /**
     * Removes accounts form the state trie that have been touched,
     * as defined in EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     */
    cleanupTouchedAccounts(): Promise<void>;
    /**
     * Caches the storage value associated with the provided `address` and `key`
     * on first invocation, and returns the cached (original) value from then
     * onwards. This is used to get the original value of a storage slot for
     * computing gas costs according to EIP-1283.
     * @param address - Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     */
    protected getOriginalContractStorage(address: Address, key: Buffer): Promise<Buffer>;
    /**
     * Clears the original storage cache. Refer to {@link StateManager.getOriginalContractStorage}
     * for more explanation.
     */
    _clearOriginalStorageCache(): void;
    /**
     * Clears the original storage cache. Refer to {@link StateManager.getOriginalContractStorage}
     * for more explanation. Alias of the internal {@link StateManager._clearOriginalStorageCache}
     */
    clearOriginalStorageCache(): void;
    /** EIP-2929 logic
     * This should only be called from within the EVM
     */
    /**
     * Returns true if the address is warm in the current context
     * @param address - The address (as a Buffer) to check
     */
    isWarmedAddress(address: Buffer): boolean;
    /**
     * Add a warm address in the current context
     * @param address - The address (as a Buffer) to check
     */
    addWarmedAddress(address: Buffer): void;
    /**
     * Returns true if the slot of the address is warm
     * @param address - The address (as a Buffer) to check
     * @param slot - The slot (as a Buffer) to check
     */
    isWarmedStorage(address: Buffer, slot: Buffer): boolean;
    /**
     * Mark the storage slot in the address as warm in the current context
     * @param address - The address (as a Buffer) to check
     * @param slot - The slot (as a Buffer) to check
     */
    addWarmedStorage(address: Buffer, slot: Buffer): void;
    /**
     * Clear the warm accounts and storage. To be called after a transaction finished.
     */
    clearWarmedAccounts(): void;
    /**
     * Generates an EIP-2930 access list
     *
     * Note: this method is not yet part of the {@link StateManager} interface.
     * If not implemented, {@link VM.runTx} is not allowed to be used with the
     * `reportAccessList` option and will instead throw.
     *
     * Note: there is an edge case on accessList generation where an
     * internal call might revert without an accessList but pass if the
     * accessList is used for a tx run (so the subsequent behavior might change).
     * This edge case is not covered by this implementation.
     *
     * @param addressesRemoved - List of addresses to be removed from the final list
     * @param addressesOnlyStorage - List of addresses only to be added in case of present storage slots
     *
     * @returns - an [@nomicfoundation/ethereumjs-tx](https://github.com/ethereumjs/ethereumjs-monorepo/packages/tx) `AccessList`
     */
    generateAccessList(addressesRemoved?: Address[], addressesOnlyStorage?: Address[]): AccessList;
    /**
     * Checks if the `account` corresponding to `address`
     * is empty or non-existent as defined in
     * EIP-161 (https://eips.ethereum.org/EIPS/eip-161).
     * @param address - Address to check
     */
    accountIsEmpty(address: Address): Promise<boolean>;
}
export {};
//# sourceMappingURL=vmState.d.ts.map