/// <reference types="node" />
import { Account, Address } from '@nomicfoundation/ethereumjs-util';
import type { RunBlockOpts, RunBlockResult, TxReceipt } from './types';
import type { VM } from './vm';
import type { EVMStateAccess } from '@nomicfoundation/ethereumjs-evm';
/**
 * @ignore
 */
export declare function runBlock(this: VM, opts: RunBlockOpts): Promise<RunBlockResult>;
export declare function calculateMinerReward(minerReward: bigint, ommersNum: number): bigint;
export declare function rewardAccount(state: EVMStateAccess, address: Address, reward: bigint): Promise<Account>;
/**
 * Returns the encoded tx receipt.
 */
export declare function encodeReceipt(receipt: TxReceipt, txType: number): Buffer;
//# sourceMappingURL=runBlock.d.ts.map