/// <reference types="node" />
import type { RunState } from '../interpreter';
import type { Common } from '@nomicfoundation/ethereumjs-common';
/**
 * Adjusts gas usage and refunds of SStore ops per EIP-1283 (Constantinople)
 *
 * @param {RunState} runState
 * @param {Buffer}   currentStorage
 * @param {Buffer}   originalStorage
 * @param {Buffer}   value
 * @param {Common}   common
 */
export declare function updateSstoreGasEIP1283(runState: RunState, currentStorage: Buffer, originalStorage: Buffer, value: Buffer, common: Common): bigint;
//# sourceMappingURL=EIP1283.d.ts.map