/// <reference types="node" />
import { ConsensusAlgorithm } from '@nomicfoundation/ethereumjs-common';
import { Address } from '@nomicfoundation/ethereumjs-util';
import type { Blockchain } from '..';
import type { Consensus, ConsensusOptions } from './interface';
import type { Block, BlockHeader } from '@nomicfoundation/ethereumjs-block';
export declare const CLIQUE_NONCE_AUTH: Buffer;
export declare const CLIQUE_NONCE_DROP: Buffer;
export declare const CLIQUE_DIFF_INTURN: bigint;
export declare const CLIQUE_DIFF_NOTURN: bigint;
declare type CliqueSignerState = [blockNumber: bigint, signers: Address[]];
declare type CliqueLatestSignerStates = CliqueSignerState[];
declare type CliqueVote = [
    blockNumber: bigint,
    vote: [signer: Address, beneficiary: Address, cliqueNonce: Buffer]
];
declare type CliqueLatestVotes = CliqueVote[];
declare type CliqueBlockSigner = [blockNumber: bigint, signer: Address];
declare type CliqueLatestBlockSigners = CliqueBlockSigner[];
/**
 * This class encapsulates Clique-related consensus functionality when used with the Blockchain class.
 */
export declare class CliqueConsensus implements Consensus {
    blockchain: Blockchain | undefined;
    algorithm: ConsensusAlgorithm;
    /**
     * Keep signer history data (signer states and votes)
     * for all block numbers >= HEAD_BLOCK - CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT
     *
     * This defines a limit for reorgs on PoA clique chains.
     */
    private CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT;
    /**
     * List with the latest signer states checkpointed on blocks where
     * a change (added new or removed a signer) occurred.
     *
     * Format:
     * [ [BLOCK_NUMBER_1, [SIGNER1, SIGNER 2,]], [BLOCK_NUMBER2, [SIGNER1, SIGNER3]], ...]
     *
     * The top element from the array represents the list of current signers.
     * On reorgs elements from the array are removed until BLOCK_NUMBER > REORG_BLOCK.
     *
     * Always keep at least one item on the stack.
     */
    _cliqueLatestSignerStates: CliqueLatestSignerStates;
    /**
     * List with the latest signer votes.
     *
     * Format:
     * [ [BLOCK_NUMBER_1, [SIGNER, BENEFICIARY, AUTH]], [BLOCK_NUMBER_1, [SIGNER, BENEFICIARY, AUTH]] ]
     * where AUTH = CLIQUE_NONCE_AUTH | CLIQUE_NONCE_DROP
     *
     * For votes all elements here must be taken into account with a
     * block number >= LAST_EPOCH_BLOCK
     * (nevertheless keep entries with blocks before EPOCH_BLOCK in case a reorg happens
     * during an epoch change)
     *
     * On reorgs elements from the array are removed until BLOCK_NUMBER > REORG_BLOCK.
     */
    _cliqueLatestVotes: CliqueLatestVotes;
    /**
     * List of signers for the last consecutive {@link Blockchain.cliqueSignerLimit} blocks.
     * Kept as a snapshot for quickly checking for "recently signed" error.
     * Format: [ [BLOCK_NUMBER, SIGNER_ADDRESS], ...]
     *
     * On reorgs elements from the array are removed until BLOCK_NUMBER > REORG_BLOCK.
     */
    _cliqueLatestBlockSigners: CliqueLatestBlockSigners;
    constructor();
    /**
     *
     * @param param dictionary containin a {@link Blockchain} object
     *
     * Note: this method must be called before consensus checks are used or type errors will occur
     */
    setup({ blockchain }: ConsensusOptions): Promise<void>;
    genesisInit(genesisBlock: Block): Promise<void>;
    validateConsensus(block: Block): Promise<void>;
    validateDifficulty(header: BlockHeader): Promise<void>;
    newBlock(block: Block, commonAncestor: BlockHeader | undefined): Promise<void>;
    /**
     * Save genesis signers to db
     * @param genesisBlock genesis block
     * @hidden
     */
    private cliqueSaveGenesisSigners;
    /**
     * Save signer state to db
     * @param signerState
     * @hidden
     */
    private cliqueUpdateSignerStates;
    /**
     * Update clique votes and save to db
     * @param header BlockHeader
     * @hidden
     */
    private cliqueUpdateVotes;
    /**
     * Returns a list with the current block signers
     */
    cliqueActiveSigners(): Address[];
    /**
     * Number of consecutive blocks out of which a signer may only sign one.
     * Defined as `Math.floor(SIGNER_COUNT / 2) + 1` to enforce majority consensus.
     * signer count -> signer limit:
     *   1 -> 1, 2 -> 2, 3 -> 2, 4 -> 2, 5 -> 3, ...
     * @hidden
     */
    private cliqueSignerLimit;
    /**
     * Checks if signer was recently signed.
     * Returns true if signed too recently: more than once per {@link CliqueConsensus.cliqueSignerLimit} consecutive blocks.
     * @param header BlockHeader
     * @hidden
     */
    private cliqueCheckRecentlySigned;
    /**
     * Remove clique snapshots with blockNumber higher than input.
     * @param blockNumber - the block number from which we start deleting
     * @hidden
     */
    private _cliqueDeleteSnapshots;
    /**
     * Update snapshot of latest clique block signers.
     * Used for checking for 'recently signed' error.
     * Length trimmed to {@link Blockchain.cliqueSignerLimit}.
     * @param header BlockHeader
     * @hidden
     */
    private cliqueUpdateLatestBlockSigners;
    /**
     * Fetches clique signers.
     * @hidden
     */
    private getCliqueLatestSignerStates;
    /**
     * Fetches clique votes.
     * @hidden
     */
    private getCliqueLatestVotes;
    /**
     * Fetches snapshot of clique signers.
     * @hidden
     */
    private getCliqueLatestBlockSigners;
    /**
     * Build clique snapshots.
     * @param header - the new block header
     * @hidden
     */
    private _cliqueBuildSnapshots;
    /**
     * Helper to determine if a signer is in or out of turn for the next block.
     * @param signer The signer address
     */
    cliqueSignerInTurn(signer: Address): Promise<boolean>;
}
export {};
//# sourceMappingURL=clique.d.ts.map