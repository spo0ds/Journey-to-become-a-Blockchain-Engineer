"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultStateManager = void 0;
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_trie_1 = require("@nomicfoundation/ethereumjs-trie");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const keccak_1 = require("ethereum-cryptography/keccak");
const baseStateManager_1 = require("./baseStateManager");
const cache_1 = require("./cache");
/**
 * Prefix to distinguish between a contract deployed with code `0x80`
 * and `RLP([])` (also having the value `0x80`).
 *
 * Otherwise the creation of the code hash for the `0x80` contract
 * will be the same as the hash of the empty trie which leads to
 * misbehaviour in the underyling trie library.
 */
const CODEHASH_PREFIX = Buffer.from('c');
/**
 * Default StateManager implementation for the VM.
 *
 * The state manager abstracts from the underlying data store
 * by providing higher level access to accounts, contract code
 * and storage slots.
 *
 * The default state manager implementation uses a
 * `@nomicfoundation/ethereumjs-trie` trie as a data backend.
 */
class DefaultStateManager extends baseStateManager_1.BaseStateManager {
    /**
     * Instantiate the StateManager interface.
     */
    constructor(opts = {}) {
        super(opts);
        this._trie = opts.trie ?? new ethereumjs_trie_1.Trie({ useKeyHashing: true });
        this._storageTries = {};
        this._prefixCodeHashes = opts.prefixCodeHashes ?? true;
        /*
         * For a custom StateManager implementation adopt these
         * callbacks passed to the `Cache` instantiated to perform
         * the `get`, `put` and `delete` operations with the
         * desired backend.
         */
        const getCb = async (address) => {
            const rlp = await this._trie.get(address.buf);
            return rlp ? ethereumjs_util_1.Account.fromRlpSerializedAccount(rlp) : undefined;
        };
        const putCb = async (keyBuf, accountRlp) => {
            const trie = this._trie;
            await trie.put(keyBuf, accountRlp);
        };
        const deleteCb = async (keyBuf) => {
            const trie = this._trie;
            await trie.del(keyBuf);
        };
        this._cache = new cache_1.Cache({ getCb, putCb, deleteCb });
    }
    /**
     * Copies the current instance of the `StateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted.
     */
    copy() {
        return new DefaultStateManager({
            trie: this._trie.copy(false),
        });
    }
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     */
    async putContractCode(address, value) {
        const codeHash = Buffer.from((0, keccak_1.keccak256)(value));
        if (codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
            return;
        }
        const key = this._prefixCodeHashes ? Buffer.concat([CODEHASH_PREFIX, codeHash]) : codeHash;
        // @ts-expect-error
        await this._trie._db.put(key, value);
        if (this.DEBUG) {
            this._debug(`Update codeHash (-> ${(0, ethereumjs_util_1.short)(codeHash)}) for account ${address}`);
        }
        await this.modifyAccountFields(address, { codeHash });
    }
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @returns {Promise<Buffer>} -  Resolves with the code corresponding to the provided address.
     * Returns an empty `Buffer` if the account has no associated code.
     */
    async getContractCode(address) {
        const account = await this.getAccount(address);
        if (!account.isContract()) {
            return Buffer.alloc(0);
        }
        const key = this._prefixCodeHashes
            ? Buffer.concat([CODEHASH_PREFIX, account.codeHash])
            : account.codeHash;
        // @ts-expect-error
        const code = await this._trie._db.get(key);
        return code ?? Buffer.alloc(0);
    }
    /**
     * Creates a storage trie from the primary storage trie
     * for an account and saves this in the storage cache.
     * @private
     */
    async _lookupStorageTrie(address) {
        // from state trie
        const account = await this.getAccount(address);
        const storageTrie = this._trie.copy(false);
        storageTrie.root(account.storageRoot);
        storageTrie.flushCheckpoints();
        return storageTrie;
    }
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    async _getStorageTrie(address) {
        // from storage cache
        const addressHex = address.buf.toString('hex');
        let storageTrie = this._storageTries[addressHex];
        if (storageTrie === undefined || storageTrie === null) {
            // lookup from state
            storageTrie = await this._lookupStorageTrie(address);
        }
        return storageTrie;
    }
    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns {Promise<Buffer>} - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Buffer` is returned.
     */
    async getContractStorage(address, key) {
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        const trie = await this._getStorageTrie(address);
        const value = await trie.get(key);
        const decoded = Buffer.from(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(value ?? [])));
        return decoded;
    }
    /**
     * Modifies the storage trie of an account.
     * @private
     * @param address -  Address of the account whose storage is to be modified
     * @param modifyTrie - Function to modify the storage trie of the account
     */
    async _modifyContractStorage(address, modifyTrie) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            const storageTrie = await this._getStorageTrie(address);
            modifyTrie(storageTrie, async () => {
                // update storage cache
                const addressHex = address.buf.toString('hex');
                this._storageTries[addressHex] = storageTrie;
                // update contract storageRoot
                const contract = this._cache.get(address);
                contract.storageRoot = storageTrie.root();
                await this.putAccount(address, contract);
                resolve();
            });
        });
    }
    /**
     * Adds value to the state trie for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`. Cannot be more than 32 bytes. Leading zeros are stripped. If it is a empty or filled with zeros, deletes the value.
     */
    async putContractStorage(address, key, value) {
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        if (value.length > 32) {
            throw new Error('Storage value cannot be longer than 32 bytes');
        }
        value = (0, ethereumjs_util_1.unpadBuffer)(value);
        await this._modifyContractStorage(address, async (storageTrie, done) => {
            if (Buffer.isBuffer(value) && value.length) {
                // format input
                const encodedValue = Buffer.from(ethereumjs_rlp_1.RLP.encode(Uint8Array.from(value)));
                if (this.DEBUG) {
                    this._debug(`Update contract storage for account ${address} to ${(0, ethereumjs_util_1.short)(value)}`);
                }
                await storageTrie.put(key, encodedValue);
            }
            else {
                // deleting a value
                if (this.DEBUG) {
                    this._debug(`Delete contract storage for account`);
                }
                await storageTrie.del(key);
            }
            done();
        });
    }
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address -  Address to clear the storage of
     */
    async clearContractStorage(address) {
        await this._modifyContractStorage(address, (storageTrie, done) => {
            storageTrie.root(storageTrie.EMPTY_TRIE_ROOT);
            done();
        });
    }
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     */
    async checkpoint() {
        this._trie.checkpoint();
        await super.checkpoint();
    }
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     */
    async commit() {
        // setup trie checkpointing
        await this._trie.commit();
        await super.commit();
    }
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     */
    async revert() {
        // setup trie checkpointing
        await this._trie.revert();
        this._storageTries = {};
        await super.revert();
    }
    /**
     * Get an EIP-1186 proof
     * @param address address to get proof of
     * @param storageSlots storage slots to get proof of
     */
    async getProof(address, storageSlots = []) {
        const account = await this.getAccount(address);
        const accountProof = (await this._trie.createProof(address.buf)).map((p) => (0, ethereumjs_util_1.bufferToHex)(p));
        const storageProof = [];
        const storageTrie = await this._getStorageTrie(address);
        for (const storageKey of storageSlots) {
            const proof = (await storageTrie.createProof(storageKey)).map((p) => (0, ethereumjs_util_1.bufferToHex)(p));
            let value = (0, ethereumjs_util_1.bufferToHex)(await this.getContractStorage(address, storageKey));
            if (value === '0x') {
                value = '0x0';
            }
            const proofItem = {
                key: (0, ethereumjs_util_1.bufferToHex)(storageKey),
                value,
                proof,
            };
            storageProof.push(proofItem);
        }
        const returnValue = {
            address: address.toString(),
            balance: (0, ethereumjs_util_1.bigIntToHex)(account.balance),
            codeHash: (0, ethereumjs_util_1.bufferToHex)(account.codeHash),
            nonce: (0, ethereumjs_util_1.bigIntToHex)(account.nonce),
            storageHash: (0, ethereumjs_util_1.bufferToHex)(account.storageRoot),
            accountProof,
            storageProof,
        };
        return returnValue;
    }
    /**
     * Verify an EIP-1186 proof. Throws if proof is invalid, otherwise returns true.
     * @param proof the proof to prove
     */
    async verifyProof(proof) {
        const rootHash = Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.toBuffer)(proof.accountProof[0])));
        const key = (0, ethereumjs_util_1.toBuffer)(proof.address);
        const accountProof = proof.accountProof.map((rlpString) => (0, ethereumjs_util_1.toBuffer)(rlpString));
        // This returns the account if the proof is valid.
        // Verify that it matches the reported account.
        const value = await new ethereumjs_trie_1.Trie({ useKeyHashing: true }).verifyProof(rootHash, key, accountProof);
        if (value === null) {
            // Verify that the account is empty in the proof.
            const emptyBuffer = Buffer.from('');
            const notEmptyErrorMsg = 'Invalid proof provided: account is not empty';
            const nonce = (0, ethereumjs_util_1.unpadBuffer)((0, ethereumjs_util_1.toBuffer)(proof.nonce));
            if (!nonce.equals(emptyBuffer)) {
                throw new Error(`${notEmptyErrorMsg} (nonce is not zero)`);
            }
            const balance = (0, ethereumjs_util_1.unpadBuffer)((0, ethereumjs_util_1.toBuffer)(proof.balance));
            if (!balance.equals(emptyBuffer)) {
                throw new Error(`${notEmptyErrorMsg} (balance is not zero)`);
            }
            const storageHash = (0, ethereumjs_util_1.toBuffer)(proof.storageHash);
            if (!storageHash.equals(ethereumjs_util_1.KECCAK256_RLP)) {
                throw new Error(`${notEmptyErrorMsg} (storageHash does not equal KECCAK256_RLP)`);
            }
            const codeHash = (0, ethereumjs_util_1.toBuffer)(proof.codeHash);
            if (!codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
                throw new Error(`${notEmptyErrorMsg} (codeHash does not equal KECCAK256_NULL)`);
            }
        }
        else {
            const account = ethereumjs_util_1.Account.fromRlpSerializedAccount(value);
            const { nonce, balance, storageRoot, codeHash } = account;
            const invalidErrorMsg = 'Invalid proof provided:';
            if (nonce !== BigInt(proof.nonce)) {
                throw new Error(`${invalidErrorMsg} nonce does not match`);
            }
            if (balance !== BigInt(proof.balance)) {
                throw new Error(`${invalidErrorMsg} balance does not match`);
            }
            if (!storageRoot.equals((0, ethereumjs_util_1.toBuffer)(proof.storageHash))) {
                throw new Error(`${invalidErrorMsg} storageHash does not match`);
            }
            if (!codeHash.equals((0, ethereumjs_util_1.toBuffer)(proof.codeHash))) {
                throw new Error(`${invalidErrorMsg} codeHash does not match`);
            }
        }
        const storageRoot = (0, ethereumjs_util_1.toBuffer)(proof.storageHash);
        for (const stProof of proof.storageProof) {
            const storageProof = stProof.proof.map((value) => (0, ethereumjs_util_1.toBuffer)(value));
            const storageValue = (0, ethereumjs_util_1.setLengthLeft)((0, ethereumjs_util_1.toBuffer)(stProof.value), 32);
            const storageKey = (0, ethereumjs_util_1.toBuffer)(stProof.key);
            const proofValue = await new ethereumjs_trie_1.Trie({ useKeyHashing: true }).verifyProof(storageRoot, storageKey, storageProof);
            const reportedValue = (0, ethereumjs_util_1.setLengthLeft)(Buffer.from(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(proofValue ?? []))), 32);
            if (!reportedValue.equals(storageValue)) {
                throw new Error('Reported trie value does not match storage');
            }
        }
        return true;
    }
    /**
     * Gets the state-root of the Merkle-Patricia trie representation
     * of the state of this StateManager. Will error if there are uncommitted
     * checkpoints on the instance.
     * @returns {Promise<Buffer>} - Returns the state-root of the `StateManager`
     */
    async getStateRoot() {
        await this._cache.flush();
        return this._trie.root();
    }
    /**
     * Sets the state of the instance to that represented
     * by the provided `stateRoot`. Will error if there are uncommitted
     * checkpoints on the instance or if the state root does not exist in
     * the state trie.
     * @param stateRoot - The state-root to reset the instance to
     */
    async setStateRoot(stateRoot) {
        await this._cache.flush();
        if (!stateRoot.equals(this._trie.EMPTY_TRIE_ROOT)) {
            const hasRoot = await this._trie.checkRoot(stateRoot);
            if (!hasRoot) {
                throw new Error('State trie does not contain state root');
            }
        }
        this._trie.root(stateRoot);
        this._cache.clear();
        this._storageTries = {};
    }
    /**
     * Dumps the RLP-encoded storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @returns {Promise<StorageDump>} - The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    async dumpStorage(address) {
        return new Promise((resolve, reject) => {
            this._getStorageTrie(address)
                .then((trie) => {
                const storage = {};
                const stream = trie.createReadStream();
                stream.on('data', (val) => {
                    storage[val.key.toString('hex')] = val.value.toString('hex');
                });
                stream.on('end', () => {
                    resolve(storage);
                });
            })
                .catch((e) => {
                reject(e);
            });
        });
    }
    /**
     * Checks whether there is a state corresponding to a stateRoot
     */
    async hasStateRoot(root) {
        return this._trie.checkRoot(root);
    }
    /**
     * Checks if the `account` corresponding to `address`
     * exists
     * @param address - Address of the `account` to check
     */
    async accountExists(address) {
        const account = this._cache.lookup(address);
        if (account &&
            (account.virtual === undefined || account.virtual === false) &&
            !this._cache.keyIsDeleted(address)) {
            return true;
        }
        if (await this._trie.get(address.buf)) {
            return true;
        }
        return false;
    }
}
exports.DefaultStateManager = DefaultStateManager;
//# sourceMappingURL=stateManager.js.map