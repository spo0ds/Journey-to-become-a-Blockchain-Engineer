"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeReceipt = exports.rewardAccount = exports.calculateMinerReward = exports.runBlock = void 0;
const ethereumjs_block_1 = require("@nomicfoundation/ethereumjs-block");
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_trie_1 = require("@nomicfoundation/ethereumjs-trie");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const debug_1 = require("debug");
const bloom_1 = require("./bloom");
const DAOConfig = require("./config/dao_fork_accounts_config.json");
const debug = (0, debug_1.debug)('vm:block');
/* DAO account list */
const DAOAccountList = DAOConfig.DAOAccounts;
const DAORefundContract = DAOConfig.DAORefundContract;
/**
 * @ignore
 */
async function runBlock(opts) {
    const state = this.eei;
    const { root } = opts;
    let { block } = opts;
    const generateFields = opts.generate === true;
    /**
     * The `beforeBlock` event.
     *
     * @event Event: beforeBlock
     * @type {Object}
     * @property {Block} block emits the block that is about to be processed
     */
    await this._emit('beforeBlock', block);
    if (this._hardforkByBlockNumber ||
        this._hardforkByTTD !== undefined ||
        opts.hardforkByTTD !== undefined) {
        this._common.setHardforkByBlockNumber(block.header.number, opts.hardforkByTTD ?? this._hardforkByTTD);
    }
    if (this.DEBUG) {
        debug('-'.repeat(100));
        debug(`Running block hash=${block.hash().toString('hex')} number=${block.header.number} hardfork=${this._common.hardfork()}`);
    }
    // Set state root if provided
    if (root) {
        if (this.DEBUG) {
            debug(`Set provided state root ${root.toString('hex')}`);
        }
        await state.setStateRoot(root);
    }
    // check for DAO support and if we should apply the DAO fork
    if (this._common.hardforkIsActiveOnBlock(ethereumjs_common_1.Hardfork.Dao, block.header.number) === true &&
        block.header.number === this._common.hardforkBlock(ethereumjs_common_1.Hardfork.Dao)) {
        if (this.DEBUG) {
            debug(`Apply DAO hardfork`);
        }
        await _applyDAOHardfork(state);
    }
    // Checkpoint state
    await state.checkpoint();
    if (this.DEBUG) {
        debug(`block checkpoint`);
    }
    let result;
    try {
        result = await applyBlock.bind(this)(block, opts);
        if (this.DEBUG) {
            debug(`Received block results gasUsed=${result.gasUsed} bloom=${(0, ethereumjs_util_1.short)(result.bloom.bitvector)} (${result.bloom.bitvector.length} bytes) receiptsRoot=${result.receiptsRoot.toString('hex')} receipts=${result.receipts.length} txResults=${result.results.length}`);
        }
    }
    catch (err) {
        await state.revert();
        if (this.DEBUG) {
            debug(`block checkpoint reverted`);
        }
        throw err;
    }
    // Persist state
    await state.commit();
    if (this.DEBUG) {
        debug(`block checkpoint committed`);
    }
    const stateRoot = await state.getStateRoot();
    // Given the generate option, either set resulting header
    // values to the current block, or validate the resulting
    // header values against the current block.
    if (generateFields) {
        const bloom = result.bloom.bitvector;
        const gasUsed = result.gasUsed;
        const receiptTrie = result.receiptsRoot;
        const transactionsTrie = await _genTxTrie(block);
        const generatedFields = { stateRoot, bloom, gasUsed, receiptTrie, transactionsTrie };
        const blockData = {
            ...block,
            header: { ...block.header, ...generatedFields },
        };
        block = ethereumjs_block_1.Block.fromBlockData(blockData, { common: this._common });
    }
    else {
        if (result.receiptsRoot.equals(block.header.receiptTrie) === false) {
            if (this.DEBUG) {
                debug(`Invalid receiptTrie received=${result.receiptsRoot.toString('hex')} expected=${block.header.receiptTrie.toString('hex')}`);
            }
            const msg = _errorMsg('invalid receiptTrie', this, block);
            throw new Error(msg);
        }
        if (!result.bloom.bitvector.equals(block.header.logsBloom)) {
            if (this.DEBUG) {
                debug(`Invalid bloom received=${result.bloom.bitvector.toString('hex')} expected=${block.header.logsBloom.toString('hex')}`);
            }
            const msg = _errorMsg('invalid bloom', this, block);
            throw new Error(msg);
        }
        if (result.gasUsed !== block.header.gasUsed) {
            if (this.DEBUG) {
                debug(`Invalid gasUsed received=${result.gasUsed} expected=${block.header.gasUsed}`);
            }
            const msg = _errorMsg('invalid gasUsed', this, block);
            throw new Error(msg);
        }
        if (!stateRoot.equals(block.header.stateRoot)) {
            if (this.DEBUG) {
                debug(`Invalid stateRoot received=${stateRoot.toString('hex')} expected=${block.header.stateRoot.toString('hex')}`);
            }
            const msg = _errorMsg('invalid block stateRoot', this, block);
            throw new Error(msg);
        }
    }
    const results = {
        receipts: result.receipts,
        logsBloom: result.bloom.bitvector,
        results: result.results,
        stateRoot,
        gasUsed: result.gasUsed,
        receiptsRoot: result.receiptsRoot,
    };
    const afterBlockEvent = { ...results, block };
    /**
     * The `afterBlock` event
     *
     * @event Event: afterBlock
     * @type {AfterBlockEvent}
     * @property {AfterBlockEvent} result emits the results of processing a block
     */
    await this._emit('afterBlock', afterBlockEvent);
    if (this.DEBUG) {
        debug(`Running block finished hash=${block.hash().toString('hex')} number=${block.header.number} hardfork=${this._common.hardfork()}`);
    }
    return results;
}
exports.runBlock = runBlock;
/**
 * Validates and applies a block, computing the results of
 * applying its transactions. This method doesn't modify the
 * block itself. It computes the block rewards and puts
 * them on state (but doesn't persist the changes).
 * @param {Block} block
 * @param {RunBlockOpts} opts
 */
async function applyBlock(block, opts) {
    // Validate block
    if (opts.skipBlockValidation !== true) {
        if (block.header.gasLimit >= BigInt('0x8000000000000000')) {
            const msg = _errorMsg('Invalid block with gas limit greater than (2^63 - 1)', this, block);
            throw new Error(msg);
        }
        else {
            if (this.DEBUG) {
                debug(`Validate block`);
            }
            // TODO: decide what block validation method is appropriate here
            if (opts.skipHeaderValidation !== true) {
                if (typeof this.blockchain.validateHeader === 'function') {
                    await this.blockchain.validateHeader(block.header);
                }
                else {
                    throw new Error('cannot validate header: blockchain has no `validateHeader` method');
                }
            }
            await block.validateData();
        }
    }
    // Apply transactions
    if (this.DEBUG) {
        debug(`Apply transactions`);
    }
    const blockResults = await applyTransactions.bind(this)(block, opts);
    // Pay ommers and miners
    if (block._common.consensusType() === ethereumjs_common_1.ConsensusType.ProofOfWork) {
        await assignBlockRewards.bind(this)(block);
    }
    return blockResults;
}
/**
 * Applies the transactions in a block, computing the receipts
 * as well as gas usage and some relevant data. This method is
 * side-effect free (it doesn't modify the block nor the state).
 * @param {Block} block
 * @param {RunBlockOpts} opts
 */
async function applyTransactions(block, opts) {
    const bloom = new bloom_1.Bloom();
    // the total amount of gas used processing these transactions
    let gasUsed = BigInt(0);
    const receiptTrie = new ethereumjs_trie_1.Trie();
    const receipts = [];
    const txResults = [];
    /*
     * Process transactions
     */
    for (let txIdx = 0; txIdx < block.transactions.length; txIdx++) {
        const tx = block.transactions[txIdx];
        let maxGasLimit;
        if (this._common.isActivatedEIP(1559) === true) {
            maxGasLimit = block.header.gasLimit * this._common.param('gasConfig', 'elasticityMultiplier');
        }
        else {
            maxGasLimit = block.header.gasLimit;
        }
        const gasLimitIsHigherThanBlock = maxGasLimit < tx.gasLimit + gasUsed;
        if (gasLimitIsHigherThanBlock) {
            const msg = _errorMsg('tx has a higher gas limit than the block', this, block);
            throw new Error(msg);
        }
        // Run the tx through the VM
        const { skipBalance, skipNonce } = opts;
        const txRes = await this.runTx({
            tx,
            block,
            skipBalance,
            skipNonce,
            blockGasUsed: gasUsed,
        });
        txResults.push(txRes);
        if (this.DEBUG) {
            debug('-'.repeat(100));
        }
        // Add to total block gas usage
        gasUsed += txRes.totalGasSpent;
        if (this.DEBUG) {
            debug(`Add tx gas used (${txRes.totalGasSpent}) to total block gas usage (-> ${gasUsed})`);
        }
        // Combine blooms via bitwise OR
        bloom.or(txRes.bloom);
        // Add receipt to trie to later calculate receipt root
        receipts.push(txRes.receipt);
        const encodedReceipt = encodeReceipt(txRes.receipt, tx.type);
        await receiptTrie.put(Buffer.from(ethereumjs_rlp_1.RLP.encode(txIdx)), encodedReceipt);
    }
    return {
        bloom,
        gasUsed,
        receiptsRoot: receiptTrie.root(),
        receipts,
        results: txResults,
    };
}
/**
 * Calculates block rewards for miner and ommers and puts
 * the updated balances of their accounts to state.
 */
async function assignBlockRewards(block) {
    if (this.DEBUG) {
        debug(`Assign block rewards`);
    }
    const state = this.eei;
    const minerReward = this._common.param('pow', 'minerReward');
    const ommers = block.uncleHeaders;
    // Reward ommers
    for (const ommer of ommers) {
        const reward = calculateOmmerReward(ommer.number, block.header.number, minerReward);
        const account = await rewardAccount(state, ommer.coinbase, reward);
        if (this.DEBUG) {
            debug(`Add uncle reward ${reward} to account ${ommer.coinbase} (-> ${account.balance})`);
        }
    }
    // Reward miner
    const reward = calculateMinerReward(minerReward, ommers.length);
    const account = await rewardAccount(state, block.header.coinbase, reward);
    if (this.DEBUG) {
        debug(`Add miner reward ${reward} to account ${block.header.coinbase} (-> ${account.balance})`);
    }
}
function calculateOmmerReward(ommerBlockNumber, blockNumber, minerReward) {
    const heightDiff = blockNumber - ommerBlockNumber;
    let reward = ((BigInt(8) - heightDiff) * minerReward) / BigInt(8);
    if (reward < BigInt(0)) {
        reward = BigInt(0);
    }
    return reward;
}
function calculateMinerReward(minerReward, ommersNum) {
    // calculate nibling reward
    const niblingReward = minerReward / BigInt(32);
    const totalNiblingReward = niblingReward * BigInt(ommersNum);
    const reward = minerReward + totalNiblingReward;
    return reward;
}
exports.calculateMinerReward = calculateMinerReward;
async function rewardAccount(state, address, reward) {
    const account = await state.getAccount(address);
    account.balance += reward;
    await state.putAccount(address, account);
    return account;
}
exports.rewardAccount = rewardAccount;
/**
 * Returns the encoded tx receipt.
 */
function encodeReceipt(receipt, txType) {
    const encoded = Buffer.from(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)([
        receipt.stateRoot ??
            (receipt.status === 0
                ? Buffer.from([])
                : Buffer.from('01', 'hex')),
        (0, ethereumjs_util_1.bigIntToBuffer)(receipt.cumulativeBlockGasUsed),
        receipt.bitvector,
        receipt.logs,
    ])));
    if (txType === 0) {
        return encoded;
    }
    // Serialize receipt according to EIP-2718:
    // `typed-receipt = tx-type || receipt-data`
    return Buffer.concat([(0, ethereumjs_util_1.intToBuffer)(txType), encoded]);
}
exports.encodeReceipt = encodeReceipt;
/**
 * Apply the DAO fork changes to the VM
 */
async function _applyDAOHardfork(state) {
    const DAORefundContractAddress = new ethereumjs_util_1.Address(Buffer.from(DAORefundContract, 'hex'));
    if ((await state.accountExists(DAORefundContractAddress)) === false) {
        await state.putAccount(DAORefundContractAddress, new ethereumjs_util_1.Account());
    }
    const DAORefundAccount = await state.getAccount(DAORefundContractAddress);
    for (const addr of DAOAccountList) {
        // retrieve the account and add it to the DAO's Refund accounts' balance.
        const address = new ethereumjs_util_1.Address(Buffer.from(addr, 'hex'));
        const account = await state.getAccount(address);
        DAORefundAccount.balance += account.balance;
        // clear the accounts' balance
        account.balance = BigInt(0);
        await state.putAccount(address, account);
    }
    // finally, put the Refund Account
    await state.putAccount(DAORefundContractAddress, DAORefundAccount);
}
async function _genTxTrie(block) {
    const trie = new ethereumjs_trie_1.Trie();
    for (const [i, tx] of block.transactions.entries()) {
        await trie.put(Buffer.from(ethereumjs_rlp_1.RLP.encode(i)), tx.serialize());
    }
    return trie.root();
}
/**
 * Internal helper function to create an annotated error message
 *
 * @param msg Base error message
 * @hidden
 */
function _errorMsg(msg, vm, block) {
    const blockErrorStr = 'errorStr' in block ? block.errorStr() : 'block';
    const errorMsg = `${msg} (${vm.errorStr()} -> ${blockErrorStr})`;
    return errorMsg;
}
//# sourceMappingURL=runBlock.js.map