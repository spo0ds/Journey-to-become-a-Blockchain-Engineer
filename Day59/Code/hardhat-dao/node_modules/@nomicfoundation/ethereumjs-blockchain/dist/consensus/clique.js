"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliqueConsensus = exports.CLIQUE_DIFF_NOTURN = exports.CLIQUE_DIFF_INTURN = exports.CLIQUE_NONCE_DROP = exports.CLIQUE_NONCE_AUTH = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const debug_1 = require("debug");
const debug = (0, debug_1.debug)('blockchain:clique');
// Magic nonce number to vote on adding a new signer
exports.CLIQUE_NONCE_AUTH = Buffer.from('ffffffffffffffff', 'hex');
// Magic nonce number to vote on removing a signer.
exports.CLIQUE_NONCE_DROP = Buffer.alloc(8);
const CLIQUE_SIGNERS_KEY = 'CliqueSigners';
const CLIQUE_VOTES_KEY = 'CliqueVotes';
const CLIQUE_BLOCK_SIGNERS_SNAPSHOT_KEY = 'CliqueBlockSignersSnapshot';
// Block difficulty for in-turn signatures
exports.CLIQUE_DIFF_INTURN = BigInt(2);
// Block difficulty for out-of-turn signatures
exports.CLIQUE_DIFF_NOTURN = BigInt(1);
const DB_OPTS = {
    keyEncoding: 'buffer',
    valueEncoding: 'buffer',
};
/**
 * This class encapsulates Clique-related consensus functionality when used with the Blockchain class.
 */
class CliqueConsensus {
    constructor() {
        /**
         * Keep signer history data (signer states and votes)
         * for all block numbers >= HEAD_BLOCK - CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT
         *
         * This defines a limit for reorgs on PoA clique chains.
         */
        this.CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT = 100;
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
        this._cliqueLatestSignerStates = [];
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
        this._cliqueLatestVotes = [];
        /**
         * List of signers for the last consecutive {@link Blockchain.cliqueSignerLimit} blocks.
         * Kept as a snapshot for quickly checking for "recently signed" error.
         * Format: [ [BLOCK_NUMBER, SIGNER_ADDRESS], ...]
         *
         * On reorgs elements from the array are removed until BLOCK_NUMBER > REORG_BLOCK.
         */
        this._cliqueLatestBlockSigners = [];
        this.algorithm = ethereumjs_common_1.ConsensusAlgorithm.Clique;
    }
    /**
     *
     * @param param dictionary containin a {@link Blockchain} object
     *
     * Note: this method must be called before consensus checks are used or type errors will occur
     */
    async setup({ blockchain }) {
        this.blockchain = blockchain;
        this._cliqueLatestSignerStates = await this.getCliqueLatestSignerStates();
        this._cliqueLatestVotes = await this.getCliqueLatestVotes();
        this._cliqueLatestBlockSigners = await this.getCliqueLatestBlockSigners();
    }
    async genesisInit(genesisBlock) {
        await this.cliqueSaveGenesisSigners(genesisBlock);
    }
    async validateConsensus(block) {
        if (!this.blockchain) {
            throw new Error('blockchain not provided');
        }
        const { header } = block;
        const valid = header.cliqueVerifySignature(this.cliqueActiveSigners());
        if (!valid) {
            throw new Error('invalid PoA block signature (clique)');
        }
        if (this.cliqueCheckRecentlySigned(header)) {
            throw new Error('recently signed');
        }
        // validate checkpoint signers towards active signers on epoch transition blocks
        if (header.cliqueIsEpochTransition()) {
            // note: keep votes on epoch transition blocks in case of reorgs.
            // only active (non-stale) votes will counted (if vote.blockNumber >= lastEpochBlockNumber
            const checkpointSigners = header.cliqueEpochTransitionSigners();
            const activeSigners = this.cliqueActiveSigners();
            for (const [i, cSigner] of checkpointSigners.entries()) {
                if (activeSigners[i]?.equals(cSigner) !== true) {
                    throw new Error(`checkpoint signer not found in active signers list at index ${i}: ${cSigner}`);
                }
            }
        }
    }
    async validateDifficulty(header) {
        if (!this.blockchain) {
            throw new Error('blockchain not provided');
        }
        if (header.difficulty !== exports.CLIQUE_DIFF_INTURN && header.difficulty !== exports.CLIQUE_DIFF_NOTURN) {
            const msg = `difficulty for clique block must be INTURN (2) or NOTURN (1), received: ${header.difficulty}`;
            throw new Error(`${msg} ${header.errorStr()}`);
        }
        const signers = this.cliqueActiveSigners();
        if (signers.length === 0) {
            // abort if signers are unavailable
            const msg = 'no signers available';
            throw new Error(`${msg} ${header.errorStr()}`);
        }
        const signerIndex = signers.findIndex((address) => address.equals(header.cliqueSigner()));
        const inTurn = header.number % BigInt(signers.length) === BigInt(signerIndex);
        if ((inTurn && header.difficulty === exports.CLIQUE_DIFF_INTURN) ||
            (!inTurn && header.difficulty === exports.CLIQUE_DIFF_NOTURN)) {
            return;
        }
        throw new Error(`'invalid clique difficulty ${header.errorStr()}`);
    }
    async newBlock(block, commonAncestor) {
        // Clique: update signer votes and state
        const { header } = block;
        const commonAncestorNumber = commonAncestor?.number;
        if (commonAncestorNumber !== undefined) {
            await this._cliqueDeleteSnapshots(commonAncestorNumber + BigInt(1));
            for (let number = commonAncestorNumber + BigInt(1); number <= header.number; number++) {
                const canonicalHeader = await this.blockchain.getCanonicalHeader(number);
                await this._cliqueBuildSnapshots(canonicalHeader);
            }
        }
    }
    /**
     * Save genesis signers to db
     * @param genesisBlock genesis block
     * @hidden
     */
    async cliqueSaveGenesisSigners(genesisBlock) {
        const genesisSignerState = [
            BigInt(0),
            genesisBlock.header.cliqueEpochTransitionSigners(),
        ];
        await this.cliqueUpdateSignerStates(genesisSignerState);
        debug(`[Block 0] Genesis block -> update signer states`);
        await this.cliqueUpdateVotes();
    }
    /**
     * Save signer state to db
     * @param signerState
     * @hidden
     */
    async cliqueUpdateSignerStates(signerState) {
        if (signerState) {
            this._cliqueLatestSignerStates.push(signerState);
        }
        // trim to CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT
        const limit = this.CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT;
        const blockSigners = this._cliqueLatestBlockSigners;
        const lastBlockNumber = blockSigners[blockSigners.length - 1]?.[0];
        if (lastBlockNumber) {
            const blockLimit = lastBlockNumber - BigInt(limit);
            const states = this._cliqueLatestSignerStates;
            const lastItem = states[states.length - 1];
            this._cliqueLatestSignerStates = states.filter((state) => state[0] >= blockLimit);
            if (this._cliqueLatestSignerStates.length === 0) {
                // always keep at least one item on the stack
                this._cliqueLatestSignerStates.push(lastItem);
            }
        }
        // save to db
        const formatted = this._cliqueLatestSignerStates.map((state) => [
            (0, ethereumjs_util_1.bigIntToBuffer)(state[0]),
            state[1].map((a) => a.toBuffer()),
        ]);
        await this.blockchain.db.put(CLIQUE_SIGNERS_KEY, Buffer.from(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(formatted))), DB_OPTS);
        // Output active signers for debugging purposes
        let i = 0;
        for (const signer of this.cliqueActiveSigners()) {
            debug(`Clique signer [${i}]: ${signer}`);
            i++;
        }
    }
    /**
     * Update clique votes and save to db
     * @param header BlockHeader
     * @hidden
     */
    async cliqueUpdateVotes(header) {
        // Block contains a vote on a new signer
        if (header && !header.coinbase.isZero()) {
            const signer = header.cliqueSigner();
            const beneficiary = header.coinbase;
            const nonce = header.nonce;
            const latestVote = [header.number, [signer, beneficiary, nonce]];
            // Do two rounds here, one to execute on a potential previously reached consensus
            // on the newly touched beneficiary, one with the added new vote
            for (let round = 1; round <= 2; round++) {
                // See if there is a new majority consensus to update the signer list
                const lastEpochBlockNumber = header.number -
                    (header.number %
                        BigInt(this.blockchain._common.consensusConfig().epoch));
                const limit = this.cliqueSignerLimit();
                let activeSigners = this.cliqueActiveSigners();
                let consensus = false;
                // AUTH vote analysis
                let votes = this._cliqueLatestVotes.filter((vote) => {
                    return (vote[0] >= BigInt(lastEpochBlockNumber) &&
                        !vote[1][0].equals(signer) &&
                        vote[1][1].equals(beneficiary) &&
                        vote[1][2].equals(exports.CLIQUE_NONCE_AUTH));
                });
                const beneficiaryVotesAUTH = [];
                for (const vote of votes) {
                    const num = beneficiaryVotesAUTH.filter((voteCMP) => {
                        return voteCMP.equals(vote[1][0]);
                    }).length;
                    if (num === 0) {
                        beneficiaryVotesAUTH.push(vote[1][0]);
                    }
                }
                let numBeneficiaryVotesAUTH = beneficiaryVotesAUTH.length;
                if (round === 2 && nonce.equals(exports.CLIQUE_NONCE_AUTH)) {
                    numBeneficiaryVotesAUTH += 1;
                }
                // Majority consensus
                if (numBeneficiaryVotesAUTH >= limit) {
                    consensus = true;
                    // Authorize new signer
                    activeSigners.push(beneficiary);
                    activeSigners.sort((a, b) => {
                        // Sort by buffer size
                        return a.toBuffer().compare(b.toBuffer());
                    });
                    // Discard votes for added signer
                    this._cliqueLatestVotes = this._cliqueLatestVotes.filter((vote) => !vote[1][1].equals(beneficiary));
                    debug(`[Block ${header.number}] Clique majority consensus (AUTH ${beneficiary})`);
                }
                // DROP vote
                votes = this._cliqueLatestVotes.filter((vote) => {
                    return (vote[0] >= BigInt(lastEpochBlockNumber) &&
                        !vote[1][0].equals(signer) &&
                        vote[1][1].equals(beneficiary) &&
                        vote[1][2].equals(exports.CLIQUE_NONCE_DROP));
                });
                const beneficiaryVotesDROP = [];
                for (const vote of votes) {
                    const num = beneficiaryVotesDROP.filter((voteCMP) => {
                        return voteCMP.equals(vote[1][0]);
                    }).length;
                    if (num === 0) {
                        beneficiaryVotesDROP.push(vote[1][0]);
                    }
                }
                let numBeneficiaryVotesDROP = beneficiaryVotesDROP.length;
                if (round === 2 && nonce.equals(exports.CLIQUE_NONCE_DROP)) {
                    numBeneficiaryVotesDROP += 1;
                }
                // Majority consensus
                if (numBeneficiaryVotesDROP >= limit) {
                    consensus = true;
                    // Drop signer
                    activeSigners = activeSigners.filter((signer) => !signer.equals(beneficiary));
                    this._cliqueLatestVotes = this._cliqueLatestVotes.filter(
                    // Discard votes from removed signer and for removed signer
                    (vote) => !vote[1][0].equals(beneficiary) && !vote[1][1].equals(beneficiary));
                    debug(`[Block ${header.number}] Clique majority consensus (DROP ${beneficiary})`);
                }
                if (round === 1) {
                    // Always add the latest vote to the history no matter if already voted
                    // the same vote or not
                    this._cliqueLatestVotes.push(latestVote);
                    debug(`[Block ${header.number}] New clique vote: ${signer} -> ${beneficiary} ${nonce.equals(exports.CLIQUE_NONCE_AUTH) ? 'AUTH' : 'DROP'}`);
                }
                if (consensus) {
                    if (round === 1) {
                        debug(`[Block ${header.number}] Clique majority consensus on existing votes -> update signer states`);
                    }
                    else {
                        debug(`[Block ${header.number}] Clique majority consensus on new vote -> update signer states`);
                    }
                    const newSignerState = [header.number, activeSigners];
                    await this.cliqueUpdateSignerStates(newSignerState);
                    return;
                }
            }
        }
        // trim to lastEpochBlockNumber - CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT
        const limit = this.CLIQUE_SIGNER_HISTORY_BLOCK_LIMIT;
        const blockSigners = this._cliqueLatestBlockSigners;
        const lastBlockNumber = blockSigners[blockSigners.length - 1]?.[0];
        if (lastBlockNumber) {
            const lastEpochBlockNumber = lastBlockNumber -
                (lastBlockNumber %
                    BigInt(this.blockchain._common.consensusConfig().epoch));
            const blockLimit = lastEpochBlockNumber - BigInt(limit);
            this._cliqueLatestVotes = this._cliqueLatestVotes.filter((state) => state[0] >= blockLimit);
        }
        // save votes to db
        const formatted = this._cliqueLatestVotes.map((v) => [
            (0, ethereumjs_util_1.bigIntToBuffer)(v[0]),
            [v[1][0].toBuffer(), v[1][1].toBuffer(), v[1][2]],
        ]);
        await this.blockchain.db.put(CLIQUE_VOTES_KEY, Buffer.from(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(formatted))), DB_OPTS);
    }
    /**
     * Returns a list with the current block signers
     */
    cliqueActiveSigners() {
        const signers = this._cliqueLatestSignerStates;
        if (signers.length === 0) {
            return [];
        }
        return [...signers[signers.length - 1][1]];
    }
    /**
     * Number of consecutive blocks out of which a signer may only sign one.
     * Defined as `Math.floor(SIGNER_COUNT / 2) + 1` to enforce majority consensus.
     * signer count -> signer limit:
     *   1 -> 1, 2 -> 2, 3 -> 2, 4 -> 2, 5 -> 3, ...
     * @hidden
     */
    cliqueSignerLimit() {
        return Math.floor(this.cliqueActiveSigners().length / 2) + 1;
    }
    /**
     * Checks if signer was recently signed.
     * Returns true if signed too recently: more than once per {@link CliqueConsensus.cliqueSignerLimit} consecutive blocks.
     * @param header BlockHeader
     * @hidden
     */
    cliqueCheckRecentlySigned(header) {
        if (header.isGenesis() || header.number === BigInt(1)) {
            // skip genesis, first block
            return false;
        }
        const limit = this.cliqueSignerLimit();
        // construct recent block signers list with this block
        let signers = this._cliqueLatestBlockSigners;
        signers = signers.slice(signers.length < limit ? 0 : 1);
        if (signers.length > 0 && signers[signers.length - 1][0] !== header.number - BigInt(1)) {
            // if the last signed block is not one minus the head we are trying to compare
            // we do not have a complete picture of the state to verify if too recently signed
            return false;
        }
        signers.push([header.number, header.cliqueSigner()]);
        const seen = signers.filter((s) => s[1].equals(header.cliqueSigner())).length;
        return seen > 1;
    }
    /**
     * Remove clique snapshots with blockNumber higher than input.
     * @param blockNumber - the block number from which we start deleting
     * @hidden
     */
    async _cliqueDeleteSnapshots(blockNumber) {
        // remove blockNumber from clique snapshots
        // (latest signer states, latest votes, latest block signers)
        this._cliqueLatestSignerStates = this._cliqueLatestSignerStates.filter((s) => s[0] <= blockNumber);
        await this.cliqueUpdateSignerStates();
        this._cliqueLatestVotes = this._cliqueLatestVotes.filter((v) => v[0] <= blockNumber);
        await this.cliqueUpdateVotes();
        this._cliqueLatestBlockSigners = this._cliqueLatestBlockSigners.filter((s) => s[0] <= blockNumber);
        await this.cliqueUpdateLatestBlockSigners();
    }
    /**
     * Update snapshot of latest clique block signers.
     * Used for checking for 'recently signed' error.
     * Length trimmed to {@link Blockchain.cliqueSignerLimit}.
     * @param header BlockHeader
     * @hidden
     */
    async cliqueUpdateLatestBlockSigners(header) {
        if (header) {
            if (header.isGenesis()) {
                return;
            }
            // add this block's signer
            const signer = [header.number, header.cliqueSigner()];
            this._cliqueLatestBlockSigners.push(signer);
            // trim length to `this.cliqueSignerLimit()`
            const length = this._cliqueLatestBlockSigners.length;
            const limit = this.cliqueSignerLimit();
            if (length > limit) {
                this._cliqueLatestBlockSigners = this._cliqueLatestBlockSigners.slice(length - limit, length);
            }
        }
        // save to db
        const formatted = this._cliqueLatestBlockSigners.map((b) => [
            (0, ethereumjs_util_1.bigIntToBuffer)(b[0]),
            b[1].toBuffer(),
        ]);
        await this.blockchain.db.put(CLIQUE_BLOCK_SIGNERS_SNAPSHOT_KEY, Buffer.from(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(formatted))), DB_OPTS);
    }
    /**
     * Fetches clique signers.
     * @hidden
     */
    async getCliqueLatestSignerStates() {
        try {
            const signerStates = await this.blockchain.db.get(CLIQUE_SIGNERS_KEY, DB_OPTS);
            const states = (0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(signerStates)));
            return states.map((state) => {
                const blockNum = (0, ethereumjs_util_1.bufferToBigInt)(state[0]);
                const addrs = state[1].map((buf) => new ethereumjs_util_1.Address(buf));
                return [blockNum, addrs];
            });
        }
        catch (error) {
            if (error.code === 'LEVEL_NOT_FOUND') {
                return [];
            }
            throw error;
        }
    }
    /**
     * Fetches clique votes.
     * @hidden
     */
    async getCliqueLatestVotes() {
        try {
            const signerVotes = await this.blockchain.db.get(CLIQUE_VOTES_KEY, DB_OPTS);
            const votes = (0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(signerVotes)));
            return votes.map((vote) => {
                const blockNum = (0, ethereumjs_util_1.bufferToBigInt)(vote[0]);
                const signer = new ethereumjs_util_1.Address(vote[1][0]);
                const beneficiary = new ethereumjs_util_1.Address(vote[1][1]);
                const nonce = vote[1][2];
                return [blockNum, [signer, beneficiary, nonce]];
            });
        }
        catch (error) {
            if (error.code === 'LEVEL_NOT_FOUND') {
                return [];
            }
            throw error;
        }
    }
    /**
     * Fetches snapshot of clique signers.
     * @hidden
     */
    async getCliqueLatestBlockSigners() {
        try {
            const blockSigners = await this.blockchain.db.get(CLIQUE_BLOCK_SIGNERS_SNAPSHOT_KEY, DB_OPTS);
            const signers = (0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(blockSigners)));
            return signers.map((s) => {
                const blockNum = (0, ethereumjs_util_1.bufferToBigInt)(s[0]);
                const signer = new ethereumjs_util_1.Address(s[1]);
                return [blockNum, signer];
            });
        }
        catch (error) {
            if (error.code === 'LEVEL_NOT_FOUND') {
                return [];
            }
            throw error;
        }
    }
    /**
     * Build clique snapshots.
     * @param header - the new block header
     * @hidden
     */
    async _cliqueBuildSnapshots(header) {
        if (!header.cliqueIsEpochTransition()) {
            await this.cliqueUpdateVotes(header);
        }
        await this.cliqueUpdateLatestBlockSigners(header);
    }
    /**
     * Helper to determine if a signer is in or out of turn for the next block.
     * @param signer The signer address
     */
    async cliqueSignerInTurn(signer) {
        const signers = this.cliqueActiveSigners();
        const signerIndex = signers.findIndex((address) => address.equals(signer));
        if (signerIndex === -1) {
            throw new Error('Signer not found');
        }
        const { number } = await this.blockchain.getCanonicalHeadHeader();
        //eslint-disable-next-line
        return (number + BigInt(1)) % BigInt(signers.length) === BigInt(signerIndex);
    }
}
exports.CliqueConsensus = CliqueConsensus;
//# sourceMappingURL=clique.js.map