"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VM = void 0;
const ethereumjs_blockchain_1 = require("@nomicfoundation/ethereumjs-blockchain");
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_evm_1 = require("@nomicfoundation/ethereumjs-evm");
const ethereumjs_statemanager_1 = require("@nomicfoundation/ethereumjs-statemanager");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const AsyncEventEmitter = require("async-eventemitter");
const util_1 = require("util");
const buildBlock_1 = require("./buildBlock");
const eei_1 = require("./eei/eei");
const runBlock_1 = require("./runBlock");
const runTx_1 = require("./runTx");
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
class VM {
    /**
     * Instantiates a new {@link VM} Object.
     *
     * @deprecated The direct usage of this constructor is discouraged since
     * non-finalized async initialization might lead to side effects. Please
     * use the async {@link VM.create} constructor instead (same API).
     * @param opts
     */
    constructor(opts = {}) {
        this._isInitialized = false;
        /**
         * VM is run in DEBUG mode (default: false)
         * Taken from DEBUG environment variable
         *
         * Safeguards on debug() calls are added for
         * performance reasons to avoid string literal evaluation
         * @hidden
         */
        this.DEBUG = false;
        this.events = new AsyncEventEmitter();
        this._opts = opts;
        if (opts.common) {
            this._common = opts.common;
        }
        else {
            const DEFAULT_CHAIN = ethereumjs_common_1.Chain.Mainnet;
            this._common = new ethereumjs_common_1.Common({ chain: DEFAULT_CHAIN });
        }
        if (opts.stateManager) {
            this.stateManager = opts.stateManager;
        }
        else {
            this.stateManager = new ethereumjs_statemanager_1.DefaultStateManager({});
        }
        this.blockchain = opts.blockchain ?? new ethereumjs_blockchain_1.Blockchain({ common: this._common });
        // TODO tests
        if (opts.eei) {
            if (opts.evm) {
                throw new Error('cannot specify EEI if EVM opt provided');
            }
            this.eei = opts.eei;
        }
        else {
            if (opts.evm) {
                this.eei = opts.evm.eei;
            }
            else {
                this.eei = new eei_1.EEI(this.stateManager, this._common, this.blockchain);
            }
        }
        // TODO tests
        if (opts.evm) {
            this.evm = opts.evm;
        }
        else {
            this.evm = new ethereumjs_evm_1.EVM({
                common: this._common,
                eei: this.eei,
            });
        }
        if (opts.hardforkByBlockNumber !== undefined && opts.hardforkByTTD !== undefined) {
            throw new Error(`The hardforkByBlockNumber and hardforkByTTD options can't be used in conjunction`);
        }
        this._hardforkByBlockNumber = opts.hardforkByBlockNumber ?? false;
        this._hardforkByTTD = (0, ethereumjs_util_1.toType)(opts.hardforkByTTD, ethereumjs_util_1.TypeOutput.BigInt);
        // Safeguard if "process" is not available (browser)
        if (process !== undefined && typeof process.env.DEBUG !== 'undefined') {
            this.DEBUG = true;
        }
        // We cache this promisified function as it's called from the main execution loop, and
        // promisifying each time has a huge performance impact.
        this._emit = ((0, util_1.promisify)(this.events.emit.bind(this.events)));
    }
    /**
     * VM async constructor. Creates engine instance and initializes it.
     *
     * @param opts VM engine constructor options
     */
    static async create(opts = {}) {
        const vm = new this(opts);
        await vm.init();
        return vm;
    }
    async init() {
        if (this._isInitialized)
            return;
        if (typeof this.blockchain._init === 'function') {
            await this.blockchain._init();
        }
        if (!this._opts.stateManager) {
            if (this._opts.activateGenesisState === true) {
                if (typeof this.blockchain.genesisState === 'function') {
                    await this.eei.generateCanonicalGenesis(this.blockchain.genesisState());
                }
                else {
                    throw new Error('cannot activate genesis state: blockchain object has no `genesisState` method');
                }
            }
        }
        if (this._opts.activatePrecompiles === true && typeof this._opts.stateManager === 'undefined') {
            await this.eei.checkpoint();
            // put 1 wei in each of the precompiles in order to make the accounts non-empty and thus not have them deduct `callNewAccount` gas.
            for (const [addressStr] of (0, ethereumjs_evm_1.getActivePrecompiles)(this._common)) {
                const address = new ethereumjs_util_1.Address(Buffer.from(addressStr, 'hex'));
                const account = await this.eei.getAccount(address);
                // Only do this if it is not overridden in genesis
                // Note: in the case that custom genesis has storage fields, this is preserved
                if (account.isEmpty()) {
                    const newAccount = ethereumjs_util_1.Account.fromAccountData({
                        balance: 1,
                        storageRoot: account.storageRoot,
                    });
                    await this.eei.putAccount(address, newAccount);
                }
            }
            await this.eei.commit();
        }
        this._isInitialized = true;
    }
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     *
     * This method modifies the state. If `generate` is `true`, the state modifications will be
     * reverted if an exception is raised. If it's `false`, it won't revert if the block's header is
     * invalid. If an error is thrown from an event handler, the state may or may not be reverted.
     *
     * @param {RunBlockOpts} opts - Default values for options:
     *  - `generate`: false
     */
    async runBlock(opts) {
        return runBlock_1.runBlock.bind(this)(opts);
    }
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     *
     * @param {RunTxOpts} opts
     */
    async runTx(opts) {
        return runTx_1.runTx.bind(this)(opts);
    }
    /**
     * Build a block on top of the current state
     * by adding one transaction at a time.
     *
     * Creates a checkpoint on the StateManager and modifies the state
     * as transactions are run. The checkpoint is committed on {@link BlockBuilder.build}
     * or discarded with {@link BlockBuilder.revert}.
     *
     * @param {BuildBlockOpts} opts
     * @returns An instance of {@link BlockBuilder} with methods:
     * - {@link BlockBuilder.addTransaction}
     * - {@link BlockBuilder.build}
     * - {@link BlockBuilder.revert}
     */
    async buildBlock(opts) {
        return buildBlock_1.buildBlock.bind(this)(opts);
    }
    /**
     * Returns a copy of the {@link VM} instance.
     */
    async copy() {
        const evmCopy = this.evm.copy();
        const eeiCopy = evmCopy.eei;
        return VM.create({
            stateManager: eeiCopy._stateManager,
            blockchain: eeiCopy._blockchain,
            common: eeiCopy._common,
            evm: evmCopy,
            hardforkByBlockNumber: this._hardforkByBlockNumber ? true : undefined,
            hardforkByTTD: this._hardforkByTTD,
        });
    }
    /**
     * Return a compact error string representation of the object
     */
    errorStr() {
        let hf = '';
        try {
            hf = this._common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        const errorStr = `vm hf=${hf}`;
        return errorStr;
    }
}
exports.VM = VM;
//# sourceMappingURL=vm.js.map