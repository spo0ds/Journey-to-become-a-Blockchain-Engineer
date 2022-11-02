"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockHeaderFromRpc = void 0;
const header_1 = require("./header");
const helpers_1 = require("./helpers");
/**
 * Creates a new block header object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param options - An object describing the blockchain
 */
function blockHeaderFromRpc(blockParams, options) {
    const { parentHash, sha3Uncles, miner, stateRoot, transactionsRoot, receiptsRoot, logsBloom, difficulty, number, gasLimit, gasUsed, timestamp, extraData, mixHash, nonce, baseFeePerGas, } = blockParams;
    const blockHeader = header_1.BlockHeader.fromHeaderData({
        parentHash,
        uncleHash: sha3Uncles,
        coinbase: miner,
        stateRoot,
        transactionsTrie: transactionsRoot,
        receiptTrie: receiptsRoot,
        logsBloom,
        difficulty: (0, helpers_1.numberToHex)(difficulty),
        number,
        gasLimit,
        gasUsed,
        timestamp,
        extraData,
        mixHash,
        nonce,
        baseFeePerGas,
    }, options);
    return blockHeader;
}
exports.blockHeaderFromRpc = blockHeaderFromRpc;
//# sourceMappingURL=header-from-rpc.js.map