"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasperConsensus = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
/**
 * This class encapsulates Casper-related consensus functionality when used with the Blockchain class.
 */
class CasperConsensus {
    constructor() {
        this.algorithm = ethereumjs_common_1.ConsensusAlgorithm.Casper;
    }
    async genesisInit() { }
    async setup() { }
    async validateConsensus() { }
    async validateDifficulty(header) {
        if (header.difficulty !== BigInt(0)) {
            const msg = 'invalid difficulty.  PoS blocks must have difficulty 0';
            throw new Error(`${msg} ${header.errorStr()}`);
        }
    }
    async newBlock() { }
}
exports.CasperConsensus = CasperConsensus;
//# sourceMappingURL=casper.js.map