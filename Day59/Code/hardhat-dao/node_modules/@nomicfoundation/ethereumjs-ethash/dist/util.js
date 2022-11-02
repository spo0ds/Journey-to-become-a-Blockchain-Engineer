"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufReverse = exports.fnvBuffer = exports.fnv = exports.getSeed = exports.getEpoc = exports.getFullSize = exports.getCacheSize = exports.params = void 0;
const bigint_crypto_utils_1 = require("bigint-crypto-utils");
const keccak_1 = require("ethereum-cryptography/keccak");
exports.params = {
    DATASET_BYTES_INIT: 1073741824,
    DATASET_BYTES_GROWTH: 8388608,
    CACHE_BYTES_INIT: 16777216,
    CACHE_BYTES_GROWTH: 131072,
    CACHE_MULTIPLIER: 1024,
    EPOCH_LENGTH: 30000,
    MIX_BYTES: 128,
    HASH_BYTES: 64,
    DATASET_PARENTS: 256,
    CACHE_ROUNDS: 3,
    ACCESSES: 64,
    WORD_BYTES: 4,
};
async function getCacheSize(epoc) {
    const { CACHE_BYTES_INIT, CACHE_BYTES_GROWTH, HASH_BYTES } = exports.params;
    let sz = CACHE_BYTES_INIT + CACHE_BYTES_GROWTH * epoc;
    sz -= HASH_BYTES;
    while (!(await (0, bigint_crypto_utils_1.isProbablyPrime)(sz / HASH_BYTES, undefined, true))) {
        sz -= 2 * HASH_BYTES;
    }
    return sz;
}
exports.getCacheSize = getCacheSize;
async function getFullSize(epoc) {
    const { DATASET_BYTES_INIT, DATASET_BYTES_GROWTH, MIX_BYTES } = exports.params;
    let sz = DATASET_BYTES_INIT + DATASET_BYTES_GROWTH * epoc;
    sz -= MIX_BYTES;
    while (!(await (0, bigint_crypto_utils_1.isProbablyPrime)(sz / MIX_BYTES, undefined, true))) {
        sz -= 2 * MIX_BYTES;
    }
    return sz;
}
exports.getFullSize = getFullSize;
function getEpoc(blockNumber) {
    return Number(blockNumber / BigInt(exports.params.EPOCH_LENGTH));
}
exports.getEpoc = getEpoc;
/**
 * Generates a seed give the end epoc and optional the begining epoc and the
 * begining epoc seed
 * @method getSeed
 * @param seed Buffer
 * @param begin Number
 * @param end Number
 */
function getSeed(seed, begin, end) {
    for (let i = begin; i < end; i++) {
        seed = Buffer.from((0, keccak_1.keccak256)(seed));
    }
    return seed;
}
exports.getSeed = getSeed;
function fnv(x, y) {
    return ((((x * 0x01000000) | 0) + ((x * 0x193) | 0)) ^ y) >>> 0;
}
exports.fnv = fnv;
function fnvBuffer(a, b) {
    const r = Buffer.alloc(a.length);
    for (let i = 0; i < a.length; i = i + 4) {
        r.writeUInt32LE(fnv(a.readUInt32LE(i), b.readUInt32LE(i)), i);
    }
    return r;
}
exports.fnvBuffer = fnvBuffer;
function bufReverse(a) {
    const length = a.length;
    const b = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
        b[i] = a[length - i - 1];
    }
    return b;
}
exports.bufReverse = bufReverse;
//# sourceMappingURL=util.js.map