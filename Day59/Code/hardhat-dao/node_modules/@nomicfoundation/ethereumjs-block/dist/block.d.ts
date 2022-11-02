/// <reference types="node" />
import { Trie } from '@nomicfoundation/ethereumjs-trie';
import { BlockHeader } from './header';
import type { BlockBuffer, BlockData, BlockOptions, JsonBlock } from './types';
import type { Common } from '@nomicfoundation/ethereumjs-common';
import type { TypedTransaction } from '@nomicfoundation/ethereumjs-tx';
/**
 * An object that represents the block.
 */
export declare class Block {
    readonly header: BlockHeader;
    readonly transactions: TypedTransaction[];
    readonly uncleHeaders: BlockHeader[];
    readonly txTrie: Trie;
    readonly _common: Common;
    /**
     * Static constructor to create a block from a block data dictionary
     *
     * @param blockData
     * @param opts
     */
    static fromBlockData(blockData?: BlockData, opts?: BlockOptions): Block;
    /**
     * Static constructor to create a block from a RLP-serialized block
     *
     * @param serialized
     * @param opts
     */
    static fromRLPSerializedBlock(serialized: Buffer, opts?: BlockOptions): Block;
    /**
     * Static constructor to create a block from an array of Buffer values
     *
     * @param values
     * @param opts
     */
    static fromValuesArray(values: BlockBuffer, opts?: BlockOptions): Block;
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     * Use the static factory methods to assist in creating a Block object from varying data types and options.
     */
    constructor(header?: BlockHeader, transactions?: TypedTransaction[], uncleHeaders?: BlockHeader[], opts?: BlockOptions);
    /**
     * Returns a Buffer Array of the raw Buffers of this block, in order.
     */
    raw(): BlockBuffer;
    /**
     * Returns the hash of the block.
     */
    hash(): Buffer;
    /**
     * Determines if this block is the genesis block.
     */
    isGenesis(): boolean;
    /**
     * Returns the rlp encoding of the block.
     */
    serialize(): Buffer;
    /**
     * Generates transaction trie for validation.
     */
    genTxTrie(): Promise<void>;
    /**
     * Validates the transaction trie by generating a trie
     * and do a check on the root hash.
     */
    validateTransactionsTrie(): Promise<boolean>;
    /**
     * Validates transaction signatures and minimum gas requirements.
     *
     * @param stringError - If `true`, a string with the indices of the invalid txs is returned.
     */
    validateTransactions(): boolean;
    validateTransactions(stringError: false): boolean;
    validateTransactions(stringError: true): string[];
    /**
     * Validates the block data, throwing if invalid.
     * This can be checked on the Block itself without needing access to any parent block
     * It checks:
     * - All transactions are valid
     * - The transactions trie is valid
     * - The uncle hash is valid
     * @param onlyHeader if only passed the header, skip validating txTrie and unclesHash (default: false)
     */
    validateData(onlyHeader?: boolean): Promise<void>;
    /**
     * Validates the uncle's hash.
     */
    validateUnclesHash(): boolean;
    /**
     * Consistency checks for uncles included in the block, if any.
     *
     * Throws if invalid.
     *
     * The rules for uncles checked are the following:
     * Header has at most 2 uncles.
     * Header does not count an uncle twice.
     */
    validateUncles(): void;
    /**
     * Returns the canonical difficulty for this block.
     *
     * @param parentBlock - the parent of this `Block`
     */
    ethashCanonicalDifficulty(parentBlock: Block): bigint;
    /**
     * Validates if the block gasLimit remains in the boundaries set by the protocol.
     * Throws if invalid
     *
     * @param parentBlock - the parent of this `Block`
     */
    validateGasLimit(parentBlock: Block): void;
    /**
     * Returns the block in JSON format.
     */
    toJSON(): JsonBlock;
    /**
     * Return a compact error string representation of the object
     */
    errorStr(): string;
    /**
     * Internal helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    protected _errorMsg(msg: string): string;
}
//# sourceMappingURL=block.d.ts.map