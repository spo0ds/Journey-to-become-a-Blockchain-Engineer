/// <reference types="node" />
import { Common } from '@nomicfoundation/ethereumjs-common';
import { Address } from '@nomicfoundation/ethereumjs-util';
import AsyncEventEmitter = require('async-eventemitter');
import { EvmError } from './exceptions';
import { Message } from './message';
import { TransientStorage } from './transientStorage';
import type { InterpreterOpts, RunState } from './interpreter';
import type { MessageWithTo } from './message';
import type { OpHandler, OpcodeList } from './opcodes';
import type { AsyncDynamicGasHandler, SyncDynamicGasHandler } from './opcodes/gas';
import type { CustomPrecompile, PrecompileFunc } from './precompiles';
import type { Block, CustomOpcode, EEIInterface, EVMEvents, EVMInterface, EVMRunCallOpts, EVMRunCodeOpts, Log } from './types';
import type { Account } from '@nomicfoundation/ethereumjs-util';
/**
 * Options for instantiating a {@link EVM}.
 */
export interface EVMOpts {
    /**
     * Use a {@link Common} instance for EVM instantiation.
     *
     * ### Supported EIPs
     *
     * - [EIP-1153](https://eips.ethereum.org/EIPS/eip-1153) - Transient Storage Opcodes (`experimental`)
     * - [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) - EIP-1559 Fee Market
     * - [EIP-2315](https://eips.ethereum.org/EIPS/eip-2315) - VM simple subroutines (`experimental`)
     * - [EIP-2537](https://eips.ethereum.org/EIPS/eip-2537) - BLS12-381 precompiles (`experimental`)
     * - [EIP-2565](https://eips.ethereum.org/EIPS/eip-2565) - ModExp Gas Cost
     * - [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718) - Typed Transactions
     * - [EIP-2929](https://eips.ethereum.org/EIPS/eip-2929) - Gas cost increases for state access opcodes
     * - [EIP-2930](https://eips.ethereum.org/EIPS/eip-2930) - Access List Transaction Type
     * - [EIP-3198](https://eips.ethereum.org/EIPS/eip-3198) - BASEFEE opcode
     * - [EIP-3529](https://eips.ethereum.org/EIPS/eip-3529) - Reduction in refunds
     * - [EIP-3540](https://eips.ethereum.org/EIPS/eip-3541) - EVM Object Format (EOF) v1 (`experimental`)
     * - [EIP-3541](https://eips.ethereum.org/EIPS/eip-3541) - Reject new contracts starting with the 0xEF byte
     *   [EIP-3651](https://eips.ethereum.org/EIPS/eip-3651) - Warm COINBASE (`experimental`)
     * - [EIP-3670](https://eips.ethereum.org/EIPS/eip-3670) - EOF - Code Validation (`experimental`)
     * - [EIP-3855](https://eips.ethereum.org/EIPS/eip-3855) - PUSH0 instruction (`experimental`)
     * - [EIP-3860](https://eips.ethereum.org/EIPS/eip-3860) - Limit and meter initcode (`experimental`)
     * - [EIP-4399](https://eips.ethereum.org/EIPS/eip-4399) - Supplant DIFFICULTY opcode with PREVRANDAO (Merge) (`experimental`)
     * - [EIP-5133](https://eips.ethereum.org/EIPS/eip-5133) - Delaying Difficulty Bomb to mid-September 2022
     *
     * *Annotations:*
     *
     * - `experimental`: behaviour can change on patch versions
     */
    common?: Common;
    /**
     * Allows unlimited contract sizes while debugging. By setting this to `true`, the check for
     * contract size limit of 24KB (see [EIP-170](https://git.io/vxZkK)) is bypassed.
     *
     * Default: `false` [ONLY set to `true` during debugging]
     */
    allowUnlimitedContractSize?: boolean;
    /**
     * Override or add custom opcodes to the EVM instruction set
     * These custom opcodes are EIP-agnostic and are always statically added
     * To delete an opcode, add an entry of format `{opcode: number}`. This will delete that opcode from the EVM.
     * If this opcode is then used in the EVM, the `INVALID` opcode would instead be used.
     * To add an opcode, add an entry of the following format:
     * {
     *    // The opcode number which will invoke the custom opcode logic
     *    opcode: number
     *    // The name of the opcode (as seen in the `step` event)
     *    opcodeName: string
     *    // The base fee of the opcode
     *    baseFee: number
     *    // If the opcode charges dynamic gas, add this here. To charge the gas, use the `i` methods of the BN, to update the charged gas
     *    gasFunction?: function(runState: RunState, gas: BN, common: Common)
     *    // The logic of the opcode which holds the logic of changing the current state
     *    logicFunction: function(runState: RunState)
     * }
     * Note: gasFunction and logicFunction can both be async or synchronous functions
     */
    customOpcodes?: CustomOpcode[];
    customPrecompiles?: CustomPrecompile[];
    eei: EEIInterface;
}
/**
 * EVM is responsible for executing an EVM message fully
 * (including any nested calls and creates), processing the results
 * and storing them to state (or discarding changes in case of exceptions).
 * @ignore
 */
export declare class EVM implements EVMInterface {
    protected _tx?: {
        gasPrice: bigint;
        origin: Address;
    };
    protected _block?: Block;
    readonly _common: Common;
    eei: EEIInterface;
    readonly _transientStorage: TransientStorage;
    readonly events: AsyncEventEmitter<EVMEvents>;
    /**
     * This opcode data is always set since `getActiveOpcodes()` is called in the constructor
     * @hidden
     */
    _opcodes: OpcodeList;
    readonly _allowUnlimitedContractSize: boolean;
    protected readonly _customOpcodes?: CustomOpcode[];
    protected readonly _customPrecompiles?: CustomPrecompile[];
    /**
     * @hidden
     */
    _handlers: Map<number, OpHandler>;
    /**
     * @hidden
     */
    _dynamicGasHandlers: Map<number, AsyncDynamicGasHandler | SyncDynamicGasHandler>;
    protected _precompiles: Map<string, PrecompileFunc>;
    protected readonly _optsCached: EVMOpts;
    get precompiles(): Map<string, PrecompileFunc>;
    get opcodes(): OpcodeList;
    protected _isInitialized: boolean;
    /**
     * Cached emit() function, not for public usage
     * set to public due to implementation internals
     * @hidden
     */
    readonly _emit: (topic: string, data: any) => Promise<void>;
    /**
     * Pointer to the mcl package, not for public usage
     * set to public due to implementation internals
     * @hidden
     */
    readonly _mcl: any;
    /**
     * EVM is run in DEBUG mode (default: false)
     * Taken from DEBUG environment variable
     *
     * Safeguards on debug() calls are added for
     * performance reasons to avoid string literal evaluation
     * @hidden
     */
    readonly DEBUG: boolean;
    /**
     * EVM async constructor. Creates engine instance and initializes it.
     *
     * @param opts EVM engine constructor options
     */
    static create(opts: EVMOpts): Promise<EVM>;
    constructor(opts: EVMOpts);
    protected init(): Promise<void>;
    /**
     * Returns a list with the currently activated opcodes
     * available for EVM execution
     */
    getActiveOpcodes(): OpcodeList;
    protected _executeCall(message: MessageWithTo): Promise<EVMResult>;
    protected _executeCreate(message: Message): Promise<EVMResult>;
    /**
     * Starts the actual bytecode processing for a CALL or CREATE, providing
     * it with the {@link EEI}.
     */
    protected runInterpreter(message: Message, opts?: InterpreterOpts): Promise<ExecResult>;
    /**
     * Executes an EVM message, determining whether it's a call or create
     * based on the `to` address. It checkpoints the state and reverts changes
     * if an exception happens during the message execution.
     */
    runCall(opts: EVMRunCallOpts): Promise<EVMResult>;
    /**
     * Bound to the global VM and therefore
     * shouldn't be used directly from the evm class
     */
    runCode(opts: EVMRunCodeOpts): Promise<ExecResult>;
    /**
     * Returns code for precompile at the given address, or undefined
     * if no such precompile exists.
     */
    getPrecompile(address: Address): PrecompileFunc | undefined;
    /**
     * Executes a precompiled contract with given data and gas limit.
     */
    protected runPrecompile(code: PrecompileFunc, data: Buffer, gasLimit: bigint): Promise<ExecResult> | ExecResult;
    protected _loadCode(message: Message): Promise<void>;
    protected _generateAddress(message: Message): Promise<Address>;
    protected _reduceSenderBalance(account: Account, message: Message): Promise<void>;
    protected _addToBalance(toAccount: Account, message: MessageWithTo): Promise<void>;
    protected _touchAccount(address: Address): Promise<void>;
    /**
     * Once the interpreter has finished depth 0, a post-message cleanup should be done
     */
    private postMessageCleanup;
    copy(): EVM;
}
/**
 * Result of executing a message via the {@link EVM}.
 */
export interface EVMResult {
    /**
     * Address of created account during transaction, if any
     */
    createdAddress?: Address;
    /**
     * Contains the results from running the code, if any, as described in {@link runCode}
     */
    execResult: ExecResult;
}
/**
 * Result of executing a call via the {@link EVM}.
 */
export interface ExecResult {
    runState?: RunState;
    /**
     * Description of the exception, if any occurred
     */
    exceptionError?: EvmError;
    /**
     * Amount of gas left
     */
    gas?: bigint;
    /**
     * Amount of gas the code used to run
     */
    executionGasUsed: bigint;
    /**
     * Return value from the contract
     */
    returnValue: Buffer;
    /**
     * Array of logs that the contract emitted
     */
    logs?: Log[];
    /**
     * A map from the accounts that have self-destructed to the addresses to send their funds to
     */
    selfdestruct?: {
        [k: string]: Buffer;
    };
    /**
     * The gas refund counter
     */
    gasRefund?: bigint;
}
export declare function OOGResult(gasLimit: bigint): ExecResult;
export declare function COOGResult(gasUsedCreateCode: bigint): ExecResult;
export declare function INVALID_BYTECODE_RESULT(gasLimit: bigint): ExecResult;
export declare function INVALID_EOF_RESULT(gasLimit: bigint): ExecResult;
export declare function CodesizeExceedsMaximumError(gasUsed: bigint): ExecResult;
export declare function EvmErrorResult(error: EvmError, gasUsed: bigint): ExecResult;
//# sourceMappingURL=evm.d.ts.map