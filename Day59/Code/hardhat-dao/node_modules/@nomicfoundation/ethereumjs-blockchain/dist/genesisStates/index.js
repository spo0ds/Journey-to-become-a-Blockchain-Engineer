"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genesisStateRoot = void 0;
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_trie_1 = require("@nomicfoundation/ethereumjs-trie");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const keccak_1 = require("ethereum-cryptography/keccak");
/**
 * Derives the stateRoot of the genesis block based on genesis allocations
 */
async function genesisStateRoot(genesisState) {
    const trie = new ethereumjs_trie_1.Trie({ useKeyHashing: true });
    for (const [key, value] of Object.entries(genesisState)) {
        const address = (0, ethereumjs_util_1.isHexPrefixed)(key) ? (0, ethereumjs_util_1.toBuffer)(key) : Buffer.from(key, 'hex');
        const account = new ethereumjs_util_1.Account();
        if (typeof value === 'string') {
            account.balance = BigInt(value);
        }
        else {
            const [balance, code, storage] = value;
            if (balance !== undefined) {
                account.balance = BigInt(balance);
            }
            if (code !== undefined) {
                account.codeHash = Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.toBuffer)(code)));
            }
            if (storage !== undefined) {
                const storageTrie = new ethereumjs_trie_1.Trie();
                for (const [k, val] of storage) {
                    const storageKey = (0, ethereumjs_util_1.isHexPrefixed)(k) ? (0, ethereumjs_util_1.toBuffer)(k) : Buffer.from(k, 'hex');
                    const storageVal = Buffer.from(ethereumjs_rlp_1.RLP.encode(Uint8Array.from((0, ethereumjs_util_1.unpadBuffer)((0, ethereumjs_util_1.isHexPrefixed)(val) ? (0, ethereumjs_util_1.toBuffer)(val) : Buffer.from(val, 'hex')))));
                    await storageTrie.put(storageKey, storageVal);
                }
                account.storageRoot = storageTrie.root();
            }
        }
        await trie.put(address, account.serialize());
    }
    return trie.root();
}
exports.genesisStateRoot = genesisStateRoot;
//# sourceMappingURL=index.js.map