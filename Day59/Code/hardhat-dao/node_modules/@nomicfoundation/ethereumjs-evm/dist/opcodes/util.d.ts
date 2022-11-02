/// <reference types="node" />
import type { RunState } from '../interpreter';
import type { Common } from '@nomicfoundation/ethereumjs-common';
/**
 * Proxy function for @nomicfoundation/ethereumjs-util's setLengthLeft, except it returns a zero
 * length buffer in case the buffer is full of zeros.
 * @param value Buffer which we want to pad
 */
export declare function setLengthLeftStorage(value: Buffer): Buffer;
/**
 * Wraps error message as EvmError
 */
export declare function trap(err: string): void;
/**
 * Converts bigint address (they're stored like this on the stack) to buffer address
 */
export declare function addressToBuffer(address: bigint | Buffer): Buffer;
/**
 * Error message helper - generates location string
 */
export declare function describeLocation(runState: RunState): string;
/**
 * Find Ceil(a / b)
 *
 * @param {bigint} a
 * @param {bigint} b
 * @return {bigint}
 */
export declare function divCeil(a: bigint, b: bigint): bigint;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 */
export declare function getDataSlice(data: Buffer, offset: bigint, length: bigint): Buffer;
/**
 * Get full opcode name from its name and code.
 *
 * @param code Integer code of opcode.
 * @param name Short name of the opcode.
 * @returns Full opcode name
 */
export declare function getFullname(code: number, name: string): string;
/**
 * Checks if a jump is valid given a destination (defined as a 1 in the validJumps array)
 */
export declare function jumpIsValid(runState: RunState, dest: number): boolean;
/**
 * Checks if a jumpsub is valid given a destination (defined as a 2 in the validJumps array)
 */
export declare function jumpSubIsValid(runState: RunState, dest: number): boolean;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 * @param gasLimit requested gas Limit
 * @param gasLeft current gas left
 * @param runState the current runState
 * @param common the common
 */
export declare function maxCallGas(gasLimit: bigint, gasLeft: bigint, runState: RunState, common: Common): bigint;
/**
 * Subtracts the amount needed for memory usage from `runState.gasLeft`
 */
export declare function subMemUsage(runState: RunState, offset: bigint, length: bigint, common: Common): bigint;
/**
 * Writes data returned by eei.call* methods to memory
 */
export declare function writeCallOutput(runState: RunState, outOffset: bigint, outLength: bigint): void;
/**
 * The first rule set of SSTORE rules, which are the rules pre-Constantinople and in Petersburg
 */
export declare function updateSstoreGas(runState: RunState, currentStorage: Buffer, value: Buffer, common: Common): bigint;
export declare function mod(a: bigint, b: bigint): bigint;
export declare function fromTwos(a: bigint): bigint;
export declare function toTwos(a: bigint): bigint;
export declare function abs(a: bigint): bigint;
export declare function exponentation(bas: bigint, exp: bigint): bigint;
//# sourceMappingURL=util.d.ts.map