/// <reference types="node" />
import type { RunState } from '../interpreter';
import type { Common } from '@nomicfoundation/ethereumjs-common';
/**
 * Adjusts gas usage and refunds of SStore ops per EIP-2200 (Istanbul)
 *
 * @param {RunState} runState
 * @param {Buffer}   currentStorage
 * @param {Buffer}   originalStorage
 * @param {Buffer}   value
 * @param {Common}   common
 */
export declare function updateSstoreGasEIP2200(runState: RunState, currentStorage: Buffer, originalStorage: Buffer, value: Buffer, key: Buffer, common: Common): bigint;
//# sourceMappingURL=EIP2200.d.ts.map