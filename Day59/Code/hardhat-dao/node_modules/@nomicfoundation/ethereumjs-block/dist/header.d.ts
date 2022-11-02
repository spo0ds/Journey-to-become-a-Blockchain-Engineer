/// <reference types="node" />
import { Common } from '@nomicfoundation/ethereumjs-common';
import { Address } from '@nomicfoundation/ethereumjs-util';
import type { BlockHeaderBuffer, BlockOptions, HeaderData, JsonHeader } from './types';
/**
 * An object that represents the block header.
 */
export declare class BlockHeader {
    readonly parentHash: Buffer;
    readonly uncleHash: Buffer;
    readonly coinbase: Address;
    readonly stateRoot: Buffer;
    readonly transactionsTrie: Buffer;
    readonly receiptTrie: Buffer;
    readonly logsBloom: Buffer;
    readonly difficulty: bigint;
    readonly number: bigint;
    readonly gasLimit: bigint;
    readonly gasUsed: bigint;
    readonly timestamp: bigint;
    readonly extraData: Buffer;
    readonly mixHash: Buffer;
    readonly nonce: Buffer;
    readonly baseFeePerGas?: bigint;
    readonly _common: Common;
    private cache;
    /**
     * EIP-4399: After merge to PoS, `mixHash` supplanted as `prevRandao`
     */
    get prevRandao(): Buffer;
    /**
     * Static constructor to create a block header from a header data dictionary
     *
     * @param headerData
     * @param opts
     */
    static fromHeaderData(headerData?: HeaderData, opts?: BlockOptions): BlockHeader;
    /**
     * Static constructor to create a block header from a RLP-serialized header
     *
     * @param serializedHeaderData
     * @param opts
     */
    static fromRLPSerializedHeader(serializedHeaderData: Buffer, opts?: BlockOptions): BlockHeader;
    /**
     * Static constructor to create a block header from an array of Buffer values
     *
     * @param values
     * @param opts
     */
    static fromValuesArray(values: BlockHeaderBuffer, opts?: BlockOptions): BlockHeader;
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     *
     * @deprecated Use the public static factory methods to assist in creating a Header object from
     * varying data types. For a default empty header, use {@link BlockHeader.fromHeaderData}.
     *
     */
    constructor(headerData: HeaderData, options?: BlockOptions);
    /**
     * Validates correct buffer lengths, throws if invalid.
     */
    _genericFormatValidation(): void;
    /**
     * Checks static parameters related to consensus algorithm
     * @throws if any check fails
     */
    _consensusFormatValidation(): void;
    /**
     * Validates if the block gasLimit remains in the boundaries set by the protocol.
     * Throws if out of bounds.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    validateGasLimit(parentBlockHeader: BlockHeader): void;
    /**
     * Calculates the base fee for a potential next block
     */
    calcNextBaseFee(): bigint;
    /**
     * Returns a Buffer Array of the raw Buffers in this header, in order.
     */
    raw(): BlockHeaderBuffer;
    /**
     * Returns the hash of the block header.
     */
    hash(): Buffer;
    /**
     * Checks if the block header is a genesis header.
     */
    isGenesis(): boolean;
    private _requireClique;
    /**
     * Returns the canonical difficulty for this block.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    ethashCanonicalDifficulty(parentBlockHeader: BlockHeader): bigint;
    /**
     * PoA clique signature hash without the seal.
     */
    cliqueSigHash(): Buffer;
    /**
     * Checks if the block header is an epoch transition
     * header (only clique PoA, throws otherwise)
     */
    cliqueIsEpochTransition(): boolean;
    /**
     * Returns extra vanity data
     * (only clique PoA, throws otherwise)
     */
    cliqueExtraVanity(): Buffer;
    /**
     * Returns extra seal data
     * (only clique PoA, throws otherwise)
     */
    cliqueExtraSeal(): Buffer;
    /**
     * Seal block with the provided signer.
     * Returns the final extraData field to be assigned to `this.extraData`.
     * @hidden
     */
    private cliqueSealBlock;
    /**
     * Returns a list of signers
     * (only clique PoA, throws otherwise)
     *
     * This function throws if not called on an epoch
     * transition block and should therefore be used
     * in conjunction with {@link BlockHeader.cliqueIsEpochTransition}
     */
    cliqueEpochTransitionSigners(): Address[];
    /**
     * Verifies the signature of the block (last 65 bytes of extraData field)
     * (only clique PoA, throws otherwise)
     *
     *  Method throws if signature is invalid
     */
    cliqueVerifySignature(signerList: Address[]): boolean;
    /**
     * Returns the signer address
     */
    cliqueSigner(): Address;
    /**
     * Returns the rlp encoding of the block header.
     */
    serialize(): Buffer;
    /**
     * Returns the block header in JSON format.
     */
    toJSON(): JsonHeader;
    /**
     * Validates extra data is DAO_ExtraData for DAO_ForceExtraDataRange blocks after DAO
     * activation block (see: https://blog.slock.it/hard-fork-specification-24b889e70703)
     */
    private _validateDAOExtraData;
    /**
     * Return a compact error string representation of the object
     */
    errorStr(): string;
    /**
     * Helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    protected _errorMsg(msg: string): string;
}
//# sourceMappingURL=header.d.ts.map