/// <reference types="node" />
import { Block, BlockHeader } from '@nomicfoundation/ethereumjs-block';
import { Common } from '@nomicfoundation/ethereumjs-common';
import { DBManager } from './db/manager';
import type { Consensus } from './consensus';
import type { GenesisState } from './genesisStates';
import type { BlockchainInterface, BlockchainOptions, OnBlock } from './types';
import type { BlockData } from '@nomicfoundation/ethereumjs-block';
import type { BigIntLike } from '@nomicfoundation/ethereumjs-util';
import type { AbstractLevel } from 'abstract-level';
/**
 * This class stores and interacts with blocks.
 */
export declare class Blockchain implements BlockchainInterface {
    consensus: Consensus;
    db: AbstractLevel<string | Buffer | Uint8Array, string | Buffer, string | Buffer>;
    dbManager: DBManager;
    private _genesisBlock?; /** The genesis block of this blockchain */
    private _customGenesisState?; /** Custom genesis state */
    /**
     * The following two heads and the heads stored within the `_heads` always point
     * to a hash in the canonical chain and never to a stale hash.
     * With the exception of `_headHeaderHash` this does not necessarily need to be
     * the hash with the highest total difficulty.
     */
    /** The hash of the current head block */
    private _headBlockHash?;
    /** The hash of the current head header */
    private _headHeaderHash?;
    /**
     * A Map which stores the head of each key (for instance the "vm" key) which is
     * updated along a {@link Blockchain.iterator} method run and can be used to (re)run
     * non-verified blocks (for instance in the VM).
     */
    private _heads;
    protected _isInitialized: boolean;
    private _lock;
    _common: Common;
    private _hardforkByHeadBlockNumber;
    private readonly _validateConsensus;
    private readonly _validateBlocks;
    /**
     * Safe creation of a new Blockchain object awaiting the initialization function,
     * encouraged method to use when creating a blockchain object.
     *
     * @param opts Constructor options, see {@link BlockchainOptions}
     */
    static create(opts?: BlockchainOptions): Promise<Blockchain>;
    /**
     * Creates a blockchain from a list of block objects,
     * objects must be readable by {@link Block.fromBlockData}
     *
     * @param blockData List of block objects
     * @param opts Constructor options, see {@link BlockchainOptions}
     */
    static fromBlocksData(blocksData: BlockData[], opts?: BlockchainOptions): Promise<Blockchain>;
    /**
     * Creates new Blockchain object.
     *
     * @deprecated The direct usage of this constructor is discouraged since
     * non-finalized async initialization might lead to side effects. Please
     * use the async {@link Blockchain.create} constructor instead (same API).
     *
     * @param opts An object with the options that this constructor takes. See
     * {@link BlockchainOptions}.
     */
    protected constructor(opts?: BlockchainOptions);
    /**
     * Returns a deep copy of this {@link Blockchain} instance.
     *
     * Note: this does not make a copy of the underlying db
     * since it is unknown if the source is on disk or in memory.
     * This should not be a significant issue in most usage since
     * the queries will only reflect the instance's known data.
     * If you would like this copied blockchain to use another db
     * set the {@link db} of this returned instance to a copy of
     * the original.
     */
    copy(): Blockchain;
    /**
     * This method is called in {@link Blockchain.create} and either sets up the DB or reads
     * values from the DB and makes these available to the consumers of
     * Blockchain.
     *
     * @hidden
     */
    private _init;
    /**
     * Run a function after acquiring a lock. It is implied that we have already
     * initialized the module (or we are calling this from the init function, like
     * `_setCanonicalGenesisBlock`)
     * @param action - function to run after acquiring a lock
     * @hidden
     */
    private runWithLock;
    /**
     * Returns the specified iterator head.
     *
     * This function replaces the old {@link Blockchain.getHead} method. Note that
     * the function deviates from the old behavior and returns the
     * genesis hash instead of the current head block if an iterator
     * has not been run. This matches the behavior of {@link Blockchain.iterator}.
     *
     * @param name - Optional name of the iterator head (default: 'vm')
     */
    getIteratorHead(name?: string): Promise<Block>;
    /**
     * Returns the specified iterator head.
     *
     * @param name - Optional name of the iterator head (default: 'vm')
     *
     * @deprecated use {@link Blockchain.getIteratorHead} instead.
     * Note that {@link Blockchain.getIteratorHead} doesn't return
     * the `headHeader` but the genesis hash as an initial iterator
     * head value (now matching the behavior of {@link Blockchain.iterator}
     * on a first run)
     */
    getHead(name?: string): Promise<Block>;
    /**
     * Returns the latest header in the canonical chain.
     */
    getCanonicalHeadHeader(): Promise<BlockHeader>;
    /**
     * Returns the latest full block in the canonical chain.
     */
    getCanonicalHeadBlock(): Promise<Block>;
    /**
     * Adds blocks to the blockchain.
     *
     * If an invalid block is met the function will throw, blocks before will
     * nevertheless remain in the DB. If any of the saved blocks has a higher
     * total difficulty than the current max total difficulty the canonical
     * chain is rebuilt and any stale heads/hashes are overwritten.
     * @param blocks - The blocks to be added to the blockchain
     */
    putBlocks(blocks: Block[]): Promise<void>;
    /**
     * Adds a block to the blockchain.
     *
     * If the block is valid and has a higher total difficulty than the current
     * max total difficulty, the canonical chain is rebuilt and any stale
     * heads/hashes are overwritten.
     * @param block - The block to be added to the blockchain
     */
    putBlock(block: Block): Promise<void>;
    /**
     * Adds many headers to the blockchain.
     *
     * If an invalid header is met the function will throw, headers before will
     * nevertheless remain in the DB. If any of the saved headers has a higher
     * total difficulty than the current max total difficulty the canonical
     * chain is rebuilt and any stale heads/hashes are overwritten.
     * @param headers - The headers to be added to the blockchain
     */
    putHeaders(headers: Array<any>): Promise<void>;
    /**
     * Adds a header to the blockchain.
     *
     * If this header is valid and it has a higher total difficulty than the current
     * max total difficulty, the canonical chain is rebuilt and any stale
     * heads/hashes are overwritten.
     * @param header - The header to be added to the blockchain
     */
    putHeader(header: BlockHeader): Promise<void>;
    /**
     * Entrypoint for putting any block or block header. Verifies this block,
     * checks the total TD: if this TD is higher than the current highest TD, we
     * have thus found a new canonical block and have to rewrite the canonical
     * chain. This also updates the head block hashes. If any of the older known
     * canonical chains just became stale, then we also reset every _heads header
     * which points to a stale header to the last verified header which was in the
     * old canonical chain, but also in the new canonical chain. This thus rolls
     * back these headers so that these can be updated to the "new" canonical
     * header using the iterator method.
     * @hidden
     */
    private _putBlockOrHeader;
    /**
     * Validates a block header, throwing if invalid. It is being validated against the reported `parentHash`.
     * It verifies the current block against the `parentHash`:
     * - The `parentHash` is part of the blockchain (it is a valid header)
     * - Current block number is parent block number + 1
     * - Current block has a strictly higher timestamp
     * - Additional PoW checks ->
     *   - Current block has valid difficulty and gas limit
     *   - In case that the header is an uncle header, it should not be too old or young in the chain.
     * - Additional PoA clique checks ->
     *   - Checks on coinbase and mixHash
     *   - Current block has a timestamp diff greater or equal to PERIOD
     *   - Current block has difficulty correctly marked as INTURN or NOTURN
     * @param header - header to be validated
     * @param height - If this is an uncle header, this is the height of the block that is including it
     */
    validateHeader(header: BlockHeader, height?: bigint): Promise<void>;
    /**
     * Validates a block, by validating the header against the current chain, any uncle headers, and then
     * whether the block is internally consistent
     * @param block block to be validated
     */
    validateBlock(block: Block): Promise<void>;
    /**
     * The following rules are checked in this method:
     * Uncle Header is a valid header.
     * Uncle Header is an orphan, i.e. it is not one of the headers of the canonical chain.
     * Uncle Header has a parentHash which points to the canonical chain. This parentHash is within the last 7 blocks.
     * Uncle Header is not already included as uncle in another block.
     * @param block - block for which uncles are being validated
     */
    private _validateUncleHeaders;
    /**
     * Gets a block by its hash.
     *
     * @param blockId - The block's hash or number. If a hash is provided, then
     * this will be immediately looked up, otherwise it will wait until we have
     * unlocked the DB
     */
    getBlock(blockId: Buffer | number | bigint): Promise<Block>;
    /**
     * @hidden
     */
    private _getBlock;
    /**
     * Gets total difficulty for a block specified by hash and number
     */
    getTotalDifficulty(hash: Buffer, number?: bigint): Promise<bigint>;
    /**
     * Looks up many blocks relative to blockId Note: due to `GetBlockHeaders
     * (0x03)` (ETH wire protocol) we have to support skip/reverse as well.
     * @param blockId - The block's hash or number
     * @param maxBlocks - Max number of blocks to return
     * @param skip - Number of blocks to skip apart
     * @param reverse - Fetch blocks in reverse
     */
    getBlocks(blockId: Buffer | bigint | number, maxBlocks: number, skip: number, reverse: boolean): Promise<Block[]>;
    /**
     * Given an ordered array, returns an array of hashes that are not in the
     * blockchain yet. Uses binary search to find out what hashes are missing.
     * Therefore, the array needs to be ordered upon number.
     * @param hashes - Ordered array of hashes (ordered on `number`).
     */
    selectNeededHashes(hashes: Array<Buffer>): Promise<Buffer[]>;
    /**
     * Completely deletes a block from the blockchain including any references to
     * this block. If this block was in the canonical chain, then also each child
     * block of this block is deleted Also, if this was a canonical block, each
     * head header which is part of this now stale chain will be set to the
     * parentHeader of this block An example reason to execute is when running the
     * block in the VM invalidates this block: this will then reset the canonical
     * head to the past block (which has been validated in the past by the VM, so
     * we can be sure it is correct).
     * @param blockHash - The hash of the block to be deleted
     */
    delBlock(blockHash: Buffer): Promise<void>;
    /**
     * @hidden
     */
    private _delBlock;
    /**
     * Updates the `DatabaseOperation` list to delete a block from the DB,
     * identified by `blockHash` and `blockNumber`. Deletes fields from `Header`,
     * `Body`, `HashToNumber` and `TotalDifficulty` tables. If child blocks of
     * this current block are in the canonical chain, delete these as well. Does
     * not actually commit these changes to the DB. Sets `_headHeaderHash` and
     * `_headBlockHash` to `headHash` if any of these matches the current child to
     * be deleted.
     * @param blockHash - the block hash to delete
     * @param blockNumber - the number corresponding to the block hash
     * @param headHash - the current head of the chain (if null, do not update
     * `_headHeaderHash` and `_headBlockHash`)
     * @param ops - the `DatabaseOperation` list to add the delete operations to
     * @hidden
     */
    private _delChild;
    /**
     * Iterates through blocks starting at the specified iterator head and calls
     * the onBlock function on each block. The current location of an iterator
     * head can be retrieved using {@link Blockchain.getIteratorHead}.
     *
     * @param name - Name of the state root head
     * @param onBlock - Function called on each block with params (block, reorg)
     * @param maxBlocks - How many blocks to run. By default, run all unprocessed blocks in the canonical chain.
     * @returns number of blocks actually iterated
     */
    iterator(name: string, onBlock: OnBlock, maxBlocks?: number): Promise<number>;
    /**
     * @hidden
     */
    private _iterator;
    /**
     * Set header hash of a certain `tag`.
     * When calling the iterator, the iterator will start running the first child block after the header hash currently stored.
     * @param tag - The tag to save the headHash to
     * @param headHash - The head hash to save
     */
    setIteratorHead(tag: string, headHash: Buffer): Promise<void>;
    /**
     * Find the common ancestor of the new block and the old block.
     * @param newHeader - the new block header
     */
    private findCommonAncestor;
    /**
     * Pushes DB operations to delete canonical number assignments for specified
     * block number and above This only deletes `NumberToHash` references, and not
     * the blocks themselves. Note: this does not write to the DB but only pushes
     * to a DB operations list.
     * @param blockNumber - the block number from which we start deleting
     * canonical chain assignments (including this block)
     * @param headHash - the hash of the current canonical chain head. The _heads
     * reference matching any hash of any of the deleted blocks will be set to
     * this
     * @param ops - the DatabaseOperation list to write DatabaseOperations to
     * @hidden
     */
    private _deleteCanonicalChainReferences;
    /**
     * Given a `header`, put all operations to change the canonical chain directly
     * into `ops`. This walks the supplied `header` backwards. It is thus assumed
     * that this header should be canonical header. For each header the
     * corresponding hash corresponding to the current canonical chain in the DB
     * is checked If the number => hash reference does not correspond to the
     * reference in the DB, we overwrite this reference with the implied number =>
     * hash reference Also, each `_heads` member is checked; if these point to a
     * stale hash, then the hash which we terminate the loop (i.e. the first hash
     * which matches the number => hash of the implied chain) is put as this stale
     * head hash The same happens to _headBlockHash
     * @param header - The canonical header.
     * @param ops - The database operations list.
     * @hidden
     */
    private _rebuildCanonical;
    /**
     * Builds the `DatabaseOperation[]` list which describes the DB operations to
     * write the heads, head header hash and the head header block to the DB
     * @hidden
     */
    private _saveHeadOps;
    /**
     * Gets the `DatabaseOperation[]` list to save `_heads`, `_headHeaderHash` and
     * `_headBlockHash` and writes these to the DB
     * @hidden
     */
    private _saveHeads;
    /**
     * Gets a header by hash and number. Header can exist outside the canonical
     * chain
     *
     * @hidden
     */
    private _getHeader;
    protected checkAndTransitionHardForkByNumber(number: bigint, td?: BigIntLike): void;
    /**
     * Gets a header by number. Header must be in the canonical chain
     */
    getCanonicalHeader(number: bigint): Promise<BlockHeader>;
    /**
     * This method either returns a Buffer if there exists one in the DB or if it
     * does not exist (DB throws a `NotFoundError`) then return false If DB throws
     * any other error, this function throws.
     * @param number
     */
    safeNumberToHash(number: bigint): Promise<Buffer | false>;
    /**
     * The genesis {@link Block} for the blockchain.
     */
    get genesisBlock(): Block;
    /**
     * Creates a genesis {@link Block} for the blockchain with params from {@link Common.genesis}
     * @param stateRoot The genesis stateRoot
     */
    createGenesisBlock(stateRoot: Buffer): Block;
    /**
     * Returns the genesis state of the blockchain.
     * All values are provided as hex-prefixed strings.
     */
    genesisState(): GenesisState;
}
//# sourceMappingURL=blockchain.d.ts.map