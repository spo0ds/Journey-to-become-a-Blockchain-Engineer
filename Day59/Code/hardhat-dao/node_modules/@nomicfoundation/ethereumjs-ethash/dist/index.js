"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ethash = exports.Miner = void 0;
const ethereumjs_block_1 = require("@nomicfoundation/ethereumjs-block");
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const keccak_1 = require("ethereum-cryptography/keccak");
const util_1 = require("./util");
function xor(a, b) {
    const len = Math.max(a.length, b.length);
    const res = Buffer.alloc(len);
    for (let i = 0; i < len; i++) {
        res[i] = a[i] ^ b[i];
    }
    return res;
}
class Miner {
    /**
     * Create a Miner object
     * @param mineObject - The object to mine on, either a `BlockHeader` or a `Block` object
     * @param ethash - Ethash object to use for mining
     */
    constructor(mineObject, ethash) {
        if (mineObject instanceof ethereumjs_block_1.BlockHeader) {
            this.blockHeader = mineObject;
        }
        else if (mineObject instanceof ethereumjs_block_1.Block) {
            this.block = mineObject;
            this.blockHeader = mineObject.header;
        }
        else {
            throw new Error('unsupported mineObject');
        }
        this.currentNonce = BigInt(0);
        this.ethash = ethash;
        this.stopMining = false;
    }
    /**
     * Stop the miner on the next iteration
     */
    stop() {
        this.stopMining = true;
    }
    /**
     * Iterate `iterations` time over nonces, returns a `BlockHeader` or `Block` if a solution is found, `undefined` otherwise
     * @param iterations - Number of iterations to iterate over. If `-1` is passed, the loop runs until a solution is found
     * @returns - `undefined` if no solution was found within the iterations, or a `BlockHeader` or `Block`
     *           with valid PoW based upon what was passed in the constructor
     */
    async mine(iterations = 0) {
        const solution = await this.iterate(iterations);
        if (solution) {
            if (this.block) {
                const data = this.block.toJSON();
                data.header.mixHash = solution.mixHash;
                data.header.nonce = solution.nonce;
                return ethereumjs_block_1.Block.fromBlockData(data, { common: this.block._common });
            }
            else {
                const data = this.blockHeader.toJSON();
                data.mixHash = solution.mixHash;
                data.nonce = solution.nonce;
                return ethereumjs_block_1.BlockHeader.fromHeaderData(data, { common: this.blockHeader._common });
            }
        }
    }
    /**
     * Iterate `iterations` times over nonces to find a valid PoW. Caches solution if one is found
     * @param iterations - Number of iterations to iterate over. If `-1` is passed, the loop runs until a solution is found
     * @returns - `undefined` if no solution was found, or otherwise a `Solution` object
     */
    async iterate(iterations = 0) {
        if (this.solution) {
            return this.solution;
        }
        if (!this.headerHash) {
            this.headerHash = this.ethash.headerHash(this.blockHeader.raw());
        }
        const headerHash = this.headerHash;
        const { number, difficulty } = this.blockHeader;
        await this.ethash.loadEpoc(number);
        while (iterations !== 0 && !this.stopMining) {
            // The promise/setTimeout construction is necessary to ensure we jump out of the event loop
            // Without this, for high-difficulty blocks JS never jumps out of the Promise
            const solution = await new Promise((resolve) => {
                setTimeout(() => {
                    const nonce = (0, ethereumjs_util_1.setLengthLeft)((0, ethereumjs_util_1.bigIntToBuffer)(this.currentNonce), 8);
                    const a = this.ethash.run(headerHash, nonce);
                    const result = (0, ethereumjs_util_1.bufferToBigInt)(a.hash);
                    if (ethereumjs_util_1.TWO_POW256 / difficulty > result) {
                        const solution = {
                            mixHash: a.mix,
                            nonce,
                        };
                        this.solution = solution;
                        resolve(solution);
                        return;
                    }
                    this.currentNonce++;
                    iterations--;
                    resolve(null);
                }, 0);
            });
            if (solution !== null) {
                return solution;
            }
        }
    }
}
exports.Miner = Miner;
class Ethash {
    constructor(cacheDB) {
        this.dbOpts = {
            valueEncoding: 'json',
        };
        this.cacheDB = cacheDB;
        this.cache = [];
    }
    mkcache(cacheSize, seed) {
        // console.log(`generating cache\nsize: ${cacheSize}\nseed: ${seed.toString('hex')}`)
        const n = Math.floor(cacheSize / util_1.params.HASH_BYTES);
        const o = [Buffer.from((0, keccak_1.keccak512)(seed))];
        let i;
        for (i = 1; i < n; i++) {
            o.push(Buffer.from((0, keccak_1.keccak512)(o[o.length - 1])));
        }
        for (let _ = 0; _ < util_1.params.CACHE_ROUNDS; _++) {
            for (i = 0; i < n; i++) {
                const v = o[i].readUInt32LE(0) % n;
                o[i] = Buffer.from((0, keccak_1.keccak512)(xor(o[(i - 1 + n) % n], o[v])));
            }
        }
        this.cache = o;
        return this.cache;
    }
    calcDatasetItem(i) {
        const n = this.cache.length;
        const r = Math.floor(util_1.params.HASH_BYTES / util_1.params.WORD_BYTES);
        let mix = Buffer.from(this.cache[i % n]);
        mix.writeInt32LE(mix.readUInt32LE(0) ^ i, 0);
        mix = Buffer.from((0, keccak_1.keccak512)(mix));
        for (let j = 0; j < util_1.params.DATASET_PARENTS; j++) {
            const cacheIndex = (0, util_1.fnv)(i ^ j, mix.readUInt32LE((j % r) * 4));
            mix = (0, util_1.fnvBuffer)(mix, this.cache[cacheIndex % n]);
        }
        return Buffer.from((0, keccak_1.keccak512)(mix));
    }
    run(val, nonce, fullSize) {
        if (fullSize === undefined) {
            if (this.fullSize === undefined) {
                throw new Error('fullSize needed');
            }
            else {
                fullSize = this.fullSize;
            }
        }
        const n = Math.floor(fullSize / util_1.params.HASH_BYTES);
        const w = Math.floor(util_1.params.MIX_BYTES / util_1.params.WORD_BYTES);
        const s = Buffer.from((0, keccak_1.keccak512)(Buffer.concat([val, (0, util_1.bufReverse)(nonce)])));
        const mixhashes = Math.floor(util_1.params.MIX_BYTES / util_1.params.HASH_BYTES);
        let mix = Buffer.concat(Array(mixhashes).fill(s));
        let i;
        for (i = 0; i < util_1.params.ACCESSES; i++) {
            const p = ((0, util_1.fnv)(i ^ s.readUInt32LE(0), mix.readUInt32LE((i % w) * 4)) % Math.floor(n / mixhashes)) *
                mixhashes;
            const newdata = [];
            for (let j = 0; j < mixhashes; j++) {
                newdata.push(this.calcDatasetItem(p + j));
            }
            mix = (0, util_1.fnvBuffer)(mix, Buffer.concat(newdata));
        }
        const cmix = Buffer.alloc(mix.length / 4);
        for (i = 0; i < mix.length / 4; i = i + 4) {
            const a = (0, util_1.fnv)(mix.readUInt32LE(i * 4), mix.readUInt32LE((i + 1) * 4));
            const b = (0, util_1.fnv)(a, mix.readUInt32LE((i + 2) * 4));
            const c = (0, util_1.fnv)(b, mix.readUInt32LE((i + 3) * 4));
            cmix.writeUInt32LE(c, i);
        }
        return {
            mix: cmix,
            hash: Buffer.from((0, keccak_1.keccak256)(Buffer.concat([s, cmix]))),
        };
    }
    cacheHash() {
        return Buffer.from((0, keccak_1.keccak256)(Buffer.concat(this.cache)));
    }
    headerHash(rawHeader) {
        return Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(rawHeader.slice(0, -2))))));
    }
    /**
     * Loads the seed and cache given a block number.
     */
    async loadEpoc(number) {
        const epoc = (0, util_1.getEpoc)(number);
        if (this.epoc === epoc) {
            return;
        }
        this.epoc = epoc;
        if (!this.cacheDB) {
            throw new Error('cacheDB needed');
        }
        // gives the seed the first epoc found
        const findLastSeed = async (epoc) => {
            if (epoc === 0) {
                return [(0, ethereumjs_util_1.zeros)(32), 0];
            }
            let data;
            try {
                data = await this.cacheDB.get(epoc, this.dbOpts);
            }
            catch (error) {
                if (error.code !== 'LEVEL_NOT_FOUND') {
                    throw error;
                }
            }
            if (data) {
                return [data.seed, epoc];
            }
            else {
                return findLastSeed(epoc - 1);
            }
        };
        let data;
        try {
            data = await this.cacheDB.get(epoc, this.dbOpts);
        }
        catch (error) {
            if (error.code !== 'LEVEL_NOT_FOUND') {
                throw error;
            }
        }
        if (!data) {
            this.cacheSize = await (0, util_1.getCacheSize)(epoc);
            this.fullSize = await (0, util_1.getFullSize)(epoc);
            const [seed, foundEpoc] = await findLastSeed(epoc);
            this.seed = (0, util_1.getSeed)(seed, foundEpoc, epoc);
            const cache = this.mkcache(this.cacheSize, this.seed);
            // store the generated cache
            await this.cacheDB.put(epoc, {
                cacheSize: this.cacheSize,
                fullSize: this.fullSize,
                seed: this.seed,
                cache,
            }, this.dbOpts);
        }
        else {
            this.cache = data.cache.map((a) => {
                return Buffer.from(a);
            });
            this.cacheSize = data.cacheSize;
            this.fullSize = data.fullSize;
            this.seed = Buffer.from(data.seed);
        }
    }
    /**
     * Returns a `Miner` object
     * To mine a `BlockHeader` or `Block`, use the one-liner `await ethash.getMiner(block).mine(-1)`
     * @param mineObject - Object to mine on, either a `BlockHeader` or a `Block`
     * @returns - A miner object
     */
    getMiner(mineObject) {
        return new Miner(mineObject, this);
    }
    async _verifyPOW(header) {
        const headerHash = this.headerHash(header.raw());
        const { number, difficulty, mixHash, nonce } = header;
        await this.loadEpoc(number);
        const a = this.run(headerHash, nonce);
        const result = (0, ethereumjs_util_1.bufferToBigInt)(a.hash);
        return a.mix.equals(mixHash) && ethereumjs_util_1.TWO_POW256 / difficulty > result;
    }
    async verifyPOW(block) {
        // don't validate genesis blocks
        if (block.header.isGenesis()) {
            return true;
        }
        const valid = await this._verifyPOW(block.header);
        if (!valid) {
            return false;
        }
        for (let index = 0; index < block.uncleHeaders.length; index++) {
            const valid = await this._verifyPOW(block.uncleHeaders[index]);
            if (!valid) {
                return false;
            }
        }
        return true;
    }
}
exports.Ethash = Ethash;
//# sourceMappingURL=index.js.map