/// <reference types="node" />
import { EvmError } from './exceptions';
import { Memory } from './memory';
import { Message } from './message';
import { Stack } from './stack';
import type { EVM } from './evm';
import type { OpHandler, Opcode } from './opcodes';
import type { Block, EEIInterface, Log } from './types';
import type { Common } from '@nomicfoundation/ethereumjs-common';
import type { Account, Address } from '@nomicfoundation/ethereumjs-util';
export interface InterpreterOpts {
    pc?: number;
}
/**
 * Immediate (unprocessed) result of running an EVM bytecode.
 */
export interface RunResult {
    logs: Log[];
    returnValue?: Buffer;
    /**
     * A map from the accounts that have self-destructed to the addresses to send their funds to
     */
    selfdestruct: {
        [k: string]: Buffer;
    };
}
export interface Env {
    address: Address;
    caller: Address;
    callData: Buffer;
    callValue: bigint;
    code: Buffer;
    isStatic: boolean;
    depth: number;
    gasPrice: bigint;
    origin: Address;
    block: Block;
    contract: Account;
    codeAddress: Address;
    gasRefund: bigint;
}
export interface RunState {
    programCounter: number;
    opCode: number;
    memory: Memory;
    memoryWordCount: bigint;
    highestMemCost: bigint;
    stack: Stack;
    returnStack: Stack;
    code: Buffer;
    shouldDoJumpAnalysis: boolean;
    validJumps: Uint8Array;
    eei: EEIInterface;
    env: Env;
    messageGasLimit?: bigint;
    interpreter: Interpreter;
    gasRefund: bigint;
    gasLeft: bigint;
    auth?: Address; /** EIP-3074 AUTH parameter */
    returnBuffer: Buffer;
}
export interface InterpreterResult {
    runState: RunState;
    exceptionError?: EvmError;
}
export interface InterpreterStep {
    gasLeft: bigint;
    gasRefund: bigint;
    eei: EEIInterface;
    stack: bigint[];
    returnStack: bigint[];
    pc: number;
    depth: number;
    opcode: {
        name: string;
        fee: number;
        dynamicFee?: bigint;
        isAsync: boolean;
    };
    account: Account;
    address: Address;
    memory: Buffer;
    memoryWordCount: bigint;
    codeAddress: Address;
}
/**
 * Parses and executes EVM bytecode.
 */
export declare class Interpreter {
    protected _vm: any;
    protected _runState: RunState;
    protected _eei: EEIInterface;
    protected _common: Common;
    protected _evm: EVM;
    _env: Env;
    _result: RunResult;
    private opDebuggers;
    constructor(evm: EVM, eei: EEIInterface, env: Env, gasLeft: bigint);
    run(code: Buffer, opts?: InterpreterOpts): Promise<InterpreterResult>;
    /**
     * Executes the opcode to which the program counter is pointing,
     * reducing its base gas cost, and increments the program counter.
     */
    runStep(): Promise<void>;
    /**
     * Get the handler function for an opcode.
     */
    getOpHandler(opInfo: Opcode): OpHandler;
    /**
     * Get info for an opcode from EVM's list of opcodes.
     */
    lookupOpInfo(op: number): Opcode;
    _runStepHook(dynamicFee: bigint, gasLeft: bigint): Promise<void>;
    _getValidJumpDests(code: Buffer): Uint8Array;
    /**
     * Logic extracted from EEI
     */
    /**
     * Subtracts an amount from the gas counter.
     * @param amount - Amount of gas to consume
     * @param context - Usage context for debugging
     * @throws if out of gas
     */
    useGas(amount: bigint, context?: string): void;
    /**
     * Adds a positive amount to the gas counter.
     * @param amount - Amount of gas refunded
     * @param context - Usage context for debugging
     */
    refundGas(amount: bigint, context?: string): void;
    /**
     * Reduces amount of gas to be refunded by a positive value.
     * @param amount - Amount to subtract from gas refunds
     * @param context - Usage context for debugging
     */
    subRefund(amount: bigint, context?: string): void;
    /**
     * Increments the internal gasLeft counter. Used for adding callStipend.
     * @param amount - Amount to add
     */
    addStipend(amount: bigint): void;
    /**
     * Returns balance of the given account.
     * @param address - Address of account
     */
    getExternalBalance(address: Address): Promise<bigint>;
    /**
     * Store 256-bit a value in memory to persistent storage.
     */
    storageStore(key: Buffer, value: Buffer): Promise<void>;
    /**
     * Loads a 256-bit value to memory from persistent storage.
     * @param key - Storage key
     * @param original - If true, return the original storage value (default: false)
     */
    storageLoad(key: Buffer, original?: boolean): Promise<Buffer>;
    /**
     * Store 256-bit a value in memory to transient storage.
     * @param address Address to use
     * @param key Storage key
     * @param value Storage value
     */
    transientStorageStore(key: Buffer, value: Buffer): void;
    /**
     * Loads a 256-bit value to memory from transient storage.
     * @param address Address to use
     * @param key Storage key
     */
    transientStorageLoad(key: Buffer): Buffer;
    /**
     * Set the returning output data for the execution.
     * @param returnData - Output data to return
     */
    finish(returnData: Buffer): void;
    /**
     * Set the returning output data for the execution. This will halt the
     * execution immediately and set the execution result to "reverted".
     * @param returnData - Output data to return
     */
    revert(returnData: Buffer): void;
    /**
     * Returns address of currently executing account.
     */
    getAddress(): Address;
    /**
     * Returns balance of self.
     */
    getSelfBalance(): bigint;
    /**
     * Returns the deposited value by the instruction/transaction
     * responsible for this execution.
     */
    getCallValue(): bigint;
    /**
     * Returns input data in current environment. This pertains to the input
     * data passed with the message call instruction or transaction.
     */
    getCallData(): Buffer;
    /**
     * Returns size of input data in current environment. This pertains to the
     * input data passed with the message call instruction or transaction.
     */
    getCallDataSize(): bigint;
    /**
     * Returns caller address. This is the address of the account
     * that is directly responsible for this execution.
     */
    getCaller(): bigint;
    /**
     * Returns the size of code running in current environment.
     */
    getCodeSize(): bigint;
    /**
     * Returns the code running in current environment.
     */
    getCode(): Buffer;
    /**
     * Returns the current gasCounter.
     */
    getGasLeft(): bigint;
    /**
     * Returns size of current return data buffer. This contains the return data
     * from the last executed call, callCode, callDelegate, callStatic or create.
     * Note: create only fills the return data buffer in case of a failure.
     */
    getReturnDataSize(): bigint;
    /**
     * Returns the current return data buffer. This contains the return data
     * from last executed call, callCode, callDelegate, callStatic or create.
     * Note: create only fills the return data buffer in case of a failure.
     */
    getReturnData(): Buffer;
    /**
     * Returns true if the current call must be executed statically.
     */
    isStatic(): boolean;
    /**
     * Returns price of gas in current environment.
     */
    getTxGasPrice(): bigint;
    /**
     * Returns the execution's origination address. This is the
     * sender of original transaction; it is never an account with
     * non-empty associated code.
     */
    getTxOrigin(): bigint;
    /**
     * Returns the block’s number.
     */
    getBlockNumber(): bigint;
    /**
     * Returns the block's beneficiary address.
     */
    getBlockCoinbase(): bigint;
    /**
     * Returns the block's timestamp.
     */
    getBlockTimestamp(): bigint;
    /**
     * Returns the block's difficulty.
     */
    getBlockDifficulty(): bigint;
    /**
     * Returns the block's prevRandao field.
     */
    getBlockPrevRandao(): bigint;
    /**
     * Returns the block's gas limit.
     */
    getBlockGasLimit(): bigint;
    /**
     * Returns the Base Fee of the block as proposed in [EIP-3198](https;//eips.etheruem.org/EIPS/eip-3198)
     */
    getBlockBaseFee(): bigint;
    /**
     * Returns the chain ID for current chain. Introduced for the
     * CHAINID opcode proposed in [EIP-1344](https://eips.ethereum.org/EIPS/eip-1344).
     */
    getChainId(): bigint;
    /**
     * Sends a message with arbitrary data to a given address path.
     */
    call(gasLimit: bigint, address: Address, value: bigint, data: Buffer): Promise<bigint>;
    /**
     * Sends a message with arbitrary data to a given address path.
     */
    authcall(gasLimit: bigint, address: Address, value: bigint, data: Buffer): Promise<bigint>;
    /**
     * Message-call into this account with an alternative account's code.
     */
    callCode(gasLimit: bigint, address: Address, value: bigint, data: Buffer): Promise<bigint>;
    /**
     * Sends a message with arbitrary data to a given address path, but disallow
     * state modifications. This includes log, create, selfdestruct and call with
     * a non-zero value.
     */
    callStatic(gasLimit: bigint, address: Address, value: bigint, data: Buffer): Promise<bigint>;
    /**
     * Message-call into this account with an alternative account’s code, but
     * persisting the current values for sender and value.
     */
    callDelegate(gasLimit: bigint, address: Address, value: bigint, data: Buffer): Promise<bigint>;
    _baseCall(msg: Message): Promise<bigint>;
    /**
     * Creates a new contract with a given value.
     */
    create(gasLimit: bigint, value: bigint, data: Buffer, salt?: Buffer): Promise<bigint>;
    /**
     * Creates a new contract with a given value. Generates
     * a deterministic address via CREATE2 rules.
     */
    create2(gasLimit: bigint, value: bigint, data: Buffer, salt: Buffer): Promise<bigint>;
    /**
     * Mark account for later deletion and give the remaining balance to the
     * specified beneficiary address. This will cause a trap and the
     * execution will be aborted immediately.
     * @param toAddress - Beneficiary address
     */
    selfDestruct(toAddress: Address): Promise<void>;
    _selfDestruct(toAddress: Address): Promise<void>;
    /**
     * Creates a new log in the current environment.
     */
    log(data: Buffer, numberOfTopics: number, topics: Buffer[]): void;
    private _getReturnCode;
}
//# sourceMappingURL=interpreter.d.ts.map