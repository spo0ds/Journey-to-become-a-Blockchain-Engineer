import { Common } from '@nomicfoundation/ethereumjs-common';
import AsyncEventEmitter = require('async-eventemitter');
import type { BlockBuilder } from './buildBlock';
import type { BuildBlockOpts, RunBlockOpts, RunBlockResult, RunTxOpts, RunTxResult, VMEvents, VMOpts } from './types';
import type { BlockchainInterface } from '@nomicfoundation/ethereumjs-blockchain';
import type { EEIInterface, EVMInterface } from '@nomicfoundation/ethereumjs-evm';
import type { StateManager } from '@nomicfoundation/ethereumjs-statemanager';
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
export declare class VM {
    /**
     * The StateManager used by the VM
     */
    readonly stateManager: StateManager;
    /**
     * The blockchain the VM operates on
     */
    readonly blockchain: BlockchainInterface;
    readonly _common: Common;
    readonly events: AsyncEventEmitter<VMEvents>;
    /**
     * The EVM used for bytecode execution
     */
    readonly evm: EVMInterface;
    readonly eei: EEIInterface;
    protected readonly _opts: VMOpts;
    protected _isInitialized: boolean;
    protected readonly _hardforkByBlockNumber: boolean;
    protected readonly _hardforkByTTD?: bigint;
    /**
     * Cached emit() function, not for public usage
     * set to public due to implementation internals
     * @hidden
     */
    readonly _emit: (topic: string, data: any) => Promise<void>;
    /**
     * VM is run in DEBUG mode (default: false)
     * Taken from DEBUG environment variable
     *
     * Safeguards on debug() calls are added for
     * performance reasons to avoid string literal evaluation
     * @hidden
     */
    readonly DEBUG: boolean;
    /**
     * VM async constructor. Creates engine instance and initializes it.
     *
     * @param opts VM engine constructor options
     */
    static create(opts?: VMOpts): Promise<VM>;
    /**
     * Instantiates a new {@link VM} Object.
     *
     * @deprecated The direct usage of this constructor is discouraged since
     * non-finalized async initialization might lead to side effects. Please
     * use the async {@link VM.create} constructor instead (same API).
     * @param opts
     */
    protected constructor(opts?: VMOpts);
    init(): Promise<void>;
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
    runBlock(opts: RunBlockOpts): Promise<RunBlockResult>;
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     *
     * @param {RunTxOpts} opts
     */
    runTx(opts: RunTxOpts): Promise<RunTxResult>;
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
    buildBlock(opts: BuildBlockOpts): Promise<BlockBuilder>;
    /**
     * Returns a copy of the {@link VM} instance.
     */
    copy(): Promise<VM>;
    /**
     * Return a compact error string representation of the object
     */
    errorStr(): string;
}
//# sourceMappingURL=vm.d.ts.map