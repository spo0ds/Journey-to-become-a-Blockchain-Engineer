/// <reference types="node" />
import { Block } from '@nomicfoundation/ethereumjs-block';
import { DBOp } from './operation';
import type { BlockHeader } from '@nomicfoundation/ethereumjs-block';
declare function DBSetTD(TD: bigint, blockNumber: bigint, blockHash: Buffer): DBOp;
declare function DBSetBlockOrHeader(blockBody: Block | BlockHeader): DBOp[];
declare function DBSetHashToNumber(blockHash: Buffer, blockNumber: bigint): DBOp;
declare function DBSaveLookups(blockHash: Buffer, blockNumber: bigint): DBOp[];
export { DBOp, DBSaveLookups, DBSetBlockOrHeader, DBSetHashToNumber, DBSetTD };
//# sourceMappingURL=helpers.d.ts.map