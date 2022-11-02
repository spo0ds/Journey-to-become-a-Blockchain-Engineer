"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthashConsensus = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_ethash_1 = require("@nomicfoundation/ethereumjs-ethash");
/**
 * This class encapsulates Ethash-related consensus functionality when used with the Blockchain class.
 */
class EthashConsensus {
    constructor() {
        this.algorithm = ethereumjs_common_1.ConsensusAlgorithm.Ethash;
    }
    async validateConsensus(block) {
        if (!this._ethash) {
            throw new Error('blockchain not provided');
        }
        const valid = await this._ethash.verifyPOW(block);
        if (!valid) {
            throw new Error('invalid POW');
        }
    }
    /**
     * Checks that the block's `difficulty` matches the canonical difficulty of the parent header.
     * @param header - header of block to be checked
     */
    async validateDifficulty(header) {
        if (!this.blockchain) {
            throw new Error('blockchain not provided');
        }
        const parentHeader = (await this.blockchain.getBlock(header.parentHash)).header;
        if (header.ethashCanonicalDifficulty(parentHeader) !== header.difficulty) {
            throw new Error(`invalid difficulty ${header.errorStr()}`);
        }
    }
    async genesisInit() { }
    async setup({ blockchain }) {
        this.blockchain = blockchain;
        this._ethash = new ethereumjs_ethash_1.Ethash(this.blockchain.db);
    }
    async newBlock() { }
}
exports.EthashConsensus = EthashConsensus;
//# sourceMappingURL=ethash.js.map