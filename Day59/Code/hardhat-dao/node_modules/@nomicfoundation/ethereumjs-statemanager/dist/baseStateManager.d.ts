/// <reference types="node" />
import type { Cache } from './cache';
import type { AccountFields } from './interface';
import type { DefaultStateManagerOpts } from './stateManager';
import type { Account, Address } from '@nomicfoundation/ethereumjs-util';
import type { Debugger } from 'debug';
/**
 * Abstract BaseStateManager class for the non-storage-backend
 * related functionality parts of a StateManager like keeping
 * track of accessed storage (`EIP-2929`) or touched accounts
 * (`EIP-158`).
 *
 * This is not a full StateManager implementation in itself but
 * can be used to ease implementing an own StateManager.
 *
 * Note that the implementation is pretty new (October 2021)
 * and we cannot guarantee a stable interface yet.
 */
export declare abstract class BaseStateManager {
    _debug: Debugger;
    _cache: Cache;
    /**
     * StateManager is run in DEBUG mode (default: false)
     * Taken from DEBUG environment variable
     *
     * Safeguards on debug() calls are added for
     * performance reasons to avoid string literal evaluation
     * @hidden
     */
    protected readonly DEBUG: boolean;
    /**
     * Needs to be called from the subclass constructor
     */
    constructor(_opts: DefaultStateManagerOpts);
    /**
     * Gets the account associated with `address`. Returns an empty account if the account does not exist.
     * @param address - Address of the `account` to get
     */
    getAccount(address: Address): Promise<Account>;
    /**
     * Saves an account into state under the provided `address`.
     * @param address - Address under which to store `account`
     * @param account - The account to store
     */
    putAccount(address: Address, account: Account): Promise<void>;
    /**
     * Gets the account associated with `address`, modifies the given account
     * fields, then saves the account into state. Account fields can include
     * `nonce`, `balance`, `storageRoot`, and `codeHash`.
     * @param address - Address of the account to modify
     * @param accountFields - Object containing account fields and values to modify
     */
    modifyAccountFields(address: Address, accountFields: AccountFields): Promise<void>;
    /**
     * Deletes an account from state under the provided `address`. The account will also be removed from the state trie.
     * @param address - Address of the account which should be deleted
     */
    deleteAccount(address: Address): Promise<void>;
    accountIsEmpty(address: Address): Promise<boolean>;
    abstract putContractCode(address: Address, value: Buffer): Promise<void>;
    abstract getContractStorage(address: Address, key: Buffer): Promise<Buffer>;
    abstract putContractStorage(address: Address, key: Buffer, value: Buffer): Promise<void>;
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     *
     * Partial implementation, called from the subclass.
     */
    checkpoint(): Promise<void>;
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     *
     * Partial implementation, called from the subclass.
     */
    commit(): Promise<void>;
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     *
     * Partial implementation , called from the subclass.
     */
    revert(): Promise<void>;
    flush(): Promise<void>;
}
//# sourceMappingURL=baseStateManager.d.ts.map