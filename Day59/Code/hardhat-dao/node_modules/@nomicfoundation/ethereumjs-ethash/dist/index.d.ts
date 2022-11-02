/// <reference types="node" />
import { Block, BlockHeader } from '@nomicfoundation/ethereumjs-block';
import type { AbstractLevel } from 'abstract-level';
export declare type Solution = {
    mixHash: Buffer;
    nonce: Buffer;
};
export declare class Miner {
    private blockHeader;
    private block?;
    private ethash;
    solution?: Solution;
    private currentNonce;
    private headerHash?;
    private stopMining;
    /**
     * Create a Miner object
     * @param mineObject - The object to mine on, either a `BlockHeader` or a `Block` object
     * @param ethash - Ethash object to use for mining
     */
    constructor(mineObject: BlockHeader | Block, ethash: Ethash);
    /**
     * Stop the miner on the next iteration
     */
    stop(): void;
    /**
     * Iterate `iterations` time over nonces, returns a `BlockHeader` or `Block` if a solution is found, `undefined` otherwise
     * @param iterations - Number of iterations to iterate over. If `-1` is passed, the loop runs until a solution is found
     * @returns - `undefined` if no solution was found within the iterations, or a `BlockHeader` or `Block`
     *           with valid PoW based upon what was passed in the constructor
     */
    mine(iterations?: number): Promise<undefined | BlockHeader | Block>;
    /**
     * Iterate `iterations` times over nonces to find a valid PoW. Caches solution if one is found
     * @param iterations - Number of iterations to iterate over. If `-1` is passed, the loop runs until a solution is found
     * @returns - `undefined` if no solution was found, or otherwise a `Solution` object
     */
    iterate(iterations?: number): Promise<undefined | Solution>;
}
export declare type EthashCacheDB = AbstractLevel<string | Buffer | Uint8Array, string | Buffer, {
    cache: Buffer[];
    fullSize: number;
    cacheSize: number;
    seed: Buffer;
}>;
export declare class Ethash {
    dbOpts: Object;
    cacheDB?: EthashCacheDB;
    cache: Buffer[];
    epoc?: number;
    fullSize?: number;
    cacheSize?: number;
    seed?: Buffer;
    constructor(cacheDB?: EthashCacheDB);
    mkcache(cacheSize: number, seed: Buffer): Buffer[];
    calcDatasetItem(i: number): Buffer;
    run(val: Buffer, nonce: Buffer, fullSize?: number): {
        mix: Buffer;
        hash: Buffer;
    };
    cacheHash(): Buffer;
    headerHash(rawHeader: Buffer[]): Buffer;
    /**
     * Loads the seed and cache given a block number.
     */
    loadEpoc(number: bigint): Promise<void>;
    /**
     * Returns a `Miner` object
     * To mine a `BlockHeader` or `Block`, use the one-liner `await ethash.getMiner(block).mine(-1)`
     * @param mineObject - Object to mine on, either a `BlockHeader` or a `Block`
     * @returns - A miner object
     */
    getMiner(mineObject: BlockHeader | Block): Miner;
    _verifyPOW(header: BlockHeader): Promise<boolean>;
    verifyPOW(block: Block): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map