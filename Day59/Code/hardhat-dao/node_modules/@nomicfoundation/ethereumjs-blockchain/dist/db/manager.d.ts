/// <reference types="node" />
import { Block, BlockHeader } from '@nomicfoundation/ethereumjs-block';
import { Cache } from './cache';
import { DBOp, DBTarget } from './operation';
import type { DatabaseKey } from './operation';
import type { BlockBodyBuffer } from '@nomicfoundation/ethereumjs-block';
import type { Common } from '@nomicfoundation/ethereumjs-common';
import type { AbstractLevel } from 'abstract-level';
/**
 * @hidden
 */
export interface GetOpts {
    keyEncoding?: string;
    valueEncoding?: string;
    cache?: string;
}
export declare type CacheMap = {
    [key: string]: Cache<Buffer>;
};
/**
 * Abstraction over a DB to facilitate storing/fetching blockchain-related
 * data, such as blocks and headers, indices, and the head block.
 * @hidden
 */
export declare class DBManager {
    private _cache;
    private _common;
    private _db;
    constructor(db: AbstractLevel<string | Buffer | Uint8Array, string | Buffer, string | Buffer>, common: Common);
    /**
     * Fetches iterator heads from the db.
     */
    getHeads(): Promise<{
        [key: string]: Buffer;
    }>;
    /**
     * Fetches header of the head block.
     */
    getHeadHeader(): Promise<Buffer>;
    /**
     * Fetches head block.
     */
    getHeadBlock(): Promise<Buffer>;
    /**
     * Fetches a block (header and body) given a block id,
     * which can be either its hash or its number.
     */
    getBlock(blockId: Buffer | bigint | number): Promise<Block>;
    /**
     * Fetches body of a block given its hash and number.
     */
    getBody(blockHash: Buffer, blockNumber: bigint): Promise<BlockBodyBuffer>;
    /**
     * Fetches header of a block given its hash and number.
     */
    getHeader(blockHash: Buffer, blockNumber: bigint): Promise<BlockHeader>;
    /**
     * Fetches total difficulty for a block given its hash and number.
     */
    getTotalDifficulty(blockHash: Buffer, blockNumber: bigint): Promise<bigint>;
    /**
     * Performs a block hash to block number lookup.
     */
    hashToNumber(blockHash: Buffer): Promise<bigint>;
    /**
     * Performs a block number to block hash lookup.
     */
    numberToHash(blockNumber: bigint): Promise<Buffer>;
    /**
     * Fetches a key from the db. If `opts.cache` is specified
     * it first tries to load from cache, and on cache miss will
     * try to put the fetched item on cache afterwards.
     */
    get(dbOperationTarget: DBTarget, key?: DatabaseKey): Promise<any>;
    /**
     * Performs a batch operation on db.
     */
    batch(ops: DBOp[]): Promise<void>;
}
//# sourceMappingURL=manager.d.ts.map