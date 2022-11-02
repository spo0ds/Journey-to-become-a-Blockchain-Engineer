"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tdKey = exports.numberToHashKey = exports.HEADS_KEY = exports.headerKey = exports.HEAD_HEADER_KEY = exports.HEAD_BLOCK_KEY = exports.hashToNumberKey = exports.bufBE8 = exports.bodyKey = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
// Geth compatible DB keys
const HEADS_KEY = 'heads';
exports.HEADS_KEY = HEADS_KEY;
/**
 * Current canonical head for light sync
 */
const HEAD_HEADER_KEY = 'LastHeader';
exports.HEAD_HEADER_KEY = HEAD_HEADER_KEY;
/**
 * Current canonical head for full sync
 */
const HEAD_BLOCK_KEY = 'LastBlock';
exports.HEAD_BLOCK_KEY = HEAD_BLOCK_KEY;
/**
 * headerPrefix + number + hash -> header
 */
const HEADER_PREFIX = Buffer.from('h');
/**
 * headerPrefix + number + hash + tdSuffix -> td
 */
const TD_SUFFIX = Buffer.from('t');
/**
 * headerPrefix + number + numSuffix -> hash
 */
const NUM_SUFFIX = Buffer.from('n');
/**
 * blockHashPrefix + hash -> number
 */
const BLOCK_HASH_PEFIX = Buffer.from('H');
/**
 * bodyPrefix + number + hash -> block body
 */
const BODY_PREFIX = Buffer.from('b');
// Utility functions
/**
 * Convert bigint to big endian Buffer
 */
const bufBE8 = (n) => (0, ethereumjs_util_1.bigIntToBuffer)(BigInt.asUintN(64, n));
exports.bufBE8 = bufBE8;
const tdKey = (n, hash) => Buffer.concat([HEADER_PREFIX, bufBE8(n), hash, TD_SUFFIX]);
exports.tdKey = tdKey;
const headerKey = (n, hash) => Buffer.concat([HEADER_PREFIX, bufBE8(n), hash]);
exports.headerKey = headerKey;
const bodyKey = (n, hash) => Buffer.concat([BODY_PREFIX, bufBE8(n), hash]);
exports.bodyKey = bodyKey;
const numberToHashKey = (n) => Buffer.concat([HEADER_PREFIX, bufBE8(n), NUM_SUFFIX]);
exports.numberToHashKey = numberToHashKey;
const hashToNumberKey = (hash) => Buffer.concat([BLOCK_HASH_PEFIX, hash]);
exports.hashToNumberKey = hashToNumberKey;
//# sourceMappingURL=constants.js.map