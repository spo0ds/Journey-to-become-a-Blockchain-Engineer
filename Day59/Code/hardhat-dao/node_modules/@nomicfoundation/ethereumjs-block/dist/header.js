"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockHeader = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const keccak_1 = require("ethereum-cryptography/keccak");
const clique_1 = require("./clique");
const helpers_1 = require("./helpers");
const DEFAULT_GAS_LIMIT = BigInt('0xffffffffffffff');
/**
 * An object that represents the block header.
 */
class BlockHeader {
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     *
     * @deprecated Use the public static factory methods to assist in creating a Header object from
     * varying data types. For a default empty header, use {@link BlockHeader.fromHeaderData}.
     *
     */
    constructor(headerData, options = {}) {
        this.cache = {
            hash: undefined,
        };
        if (options.common) {
            this._common = options.common.copy();
        }
        else {
            this._common = new ethereumjs_common_1.Common({
                chain: ethereumjs_common_1.Chain.Mainnet, // default
            });
        }
        if (options.hardforkByBlockNumber !== undefined && options.hardforkByTTD !== undefined) {
            throw new Error(`The hardforkByBlockNumber and hardforkByTTD options can't be used in conjunction`);
        }
        const skipValidateConsensusFormat = options.skipConsensusFormatValidation ?? false;
        const defaults = {
            parentHash: (0, ethereumjs_util_1.zeros)(32),
            uncleHash: ethereumjs_util_1.KECCAK256_RLP_ARRAY,
            coinbase: ethereumjs_util_1.Address.zero(),
            stateRoot: (0, ethereumjs_util_1.zeros)(32),
            transactionsTrie: ethereumjs_util_1.KECCAK256_RLP,
            receiptTrie: ethereumjs_util_1.KECCAK256_RLP,
            logsBloom: (0, ethereumjs_util_1.zeros)(256),
            difficulty: BigInt(0),
            number: BigInt(0),
            gasLimit: DEFAULT_GAS_LIMIT,
            gasUsed: BigInt(0),
            timestamp: BigInt(0),
            extraData: Buffer.from([]),
            mixHash: (0, ethereumjs_util_1.zeros)(32),
            nonce: (0, ethereumjs_util_1.zeros)(8),
            baseFeePerGas: undefined,
        };
        const parentHash = (0, ethereumjs_util_1.toType)(headerData.parentHash, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.parentHash;
        const uncleHash = (0, ethereumjs_util_1.toType)(headerData.uncleHash, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.uncleHash;
        const coinbase = new ethereumjs_util_1.Address((0, ethereumjs_util_1.toType)(headerData.coinbase ?? defaults.coinbase, ethereumjs_util_1.TypeOutput.Buffer));
        const stateRoot = (0, ethereumjs_util_1.toType)(headerData.stateRoot, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.stateRoot;
        const transactionsTrie = (0, ethereumjs_util_1.toType)(headerData.transactionsTrie, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.transactionsTrie;
        const receiptTrie = (0, ethereumjs_util_1.toType)(headerData.receiptTrie, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.receiptTrie;
        const logsBloom = (0, ethereumjs_util_1.toType)(headerData.logsBloom, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.logsBloom;
        const difficulty = (0, ethereumjs_util_1.toType)(headerData.difficulty, ethereumjs_util_1.TypeOutput.BigInt) ?? defaults.difficulty;
        const number = (0, ethereumjs_util_1.toType)(headerData.number, ethereumjs_util_1.TypeOutput.BigInt) ?? defaults.number;
        const gasLimit = (0, ethereumjs_util_1.toType)(headerData.gasLimit, ethereumjs_util_1.TypeOutput.BigInt) ?? defaults.gasLimit;
        const gasUsed = (0, ethereumjs_util_1.toType)(headerData.gasUsed, ethereumjs_util_1.TypeOutput.BigInt) ?? defaults.gasUsed;
        const timestamp = (0, ethereumjs_util_1.toType)(headerData.timestamp, ethereumjs_util_1.TypeOutput.BigInt) ?? defaults.timestamp;
        const extraData = (0, ethereumjs_util_1.toType)(headerData.extraData, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.extraData;
        const mixHash = (0, ethereumjs_util_1.toType)(headerData.mixHash, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.mixHash;
        const nonce = (0, ethereumjs_util_1.toType)(headerData.nonce, ethereumjs_util_1.TypeOutput.Buffer) ?? defaults.nonce;
        let baseFeePerGas = (0, ethereumjs_util_1.toType)(headerData.baseFeePerGas, ethereumjs_util_1.TypeOutput.BigInt) ?? defaults.baseFeePerGas;
        const hardforkByBlockNumber = options.hardforkByBlockNumber ?? false;
        if (hardforkByBlockNumber || options.hardforkByTTD !== undefined) {
            this._common.setHardforkByBlockNumber(number, options.hardforkByTTD);
        }
        if (this._common.isActivatedEIP(1559) === true) {
            if (baseFeePerGas === undefined) {
                if (number === this._common.hardforkBlock(ethereumjs_common_1.Hardfork.London)) {
                    baseFeePerGas = this._common.param('gasConfig', 'initialBaseFee');
                }
                else {
                    // Minimum possible value for baseFeePerGas is 7,
                    // so we use it as the default if the field is missing.
                    baseFeePerGas = BigInt(7);
                }
            }
        }
        else {
            if (baseFeePerGas) {
                throw new Error('A base fee for a block can only be set with EIP1559 being activated');
            }
        }
        this.parentHash = parentHash;
        this.uncleHash = uncleHash;
        this.coinbase = coinbase;
        this.stateRoot = stateRoot;
        this.transactionsTrie = transactionsTrie;
        this.receiptTrie = receiptTrie;
        this.logsBloom = logsBloom;
        this.difficulty = difficulty;
        this.number = number;
        this.gasLimit = gasLimit;
        this.gasUsed = gasUsed;
        this.timestamp = timestamp;
        this.extraData = extraData;
        this.mixHash = mixHash;
        this.nonce = nonce;
        this.baseFeePerGas = baseFeePerGas;
        this._genericFormatValidation();
        this._validateDAOExtraData();
        // Now we have set all the values of this Header, we possibly have set a dummy
        // `difficulty` value (defaults to 0). If we have a `calcDifficultyFromHeader`
        // block option parameter, we instead set difficulty to this value.
        if (options.calcDifficultyFromHeader &&
            this._common.consensusAlgorithm() === ethereumjs_common_1.ConsensusAlgorithm.Ethash) {
            this.difficulty = this.ethashCanonicalDifficulty(options.calcDifficultyFromHeader);
        }
        // If cliqueSigner is provided, seal block with provided privateKey.
        if (options.cliqueSigner) {
            // Ensure extraData is at least length CLIQUE_EXTRA_VANITY + CLIQUE_EXTRA_SEAL
            const minExtraDataLength = clique_1.CLIQUE_EXTRA_VANITY + clique_1.CLIQUE_EXTRA_SEAL;
            if (this.extraData.length < minExtraDataLength) {
                const remainingLength = minExtraDataLength - this.extraData.length;
                this.extraData = Buffer.concat([this.extraData, Buffer.alloc(remainingLength)]);
            }
            this.extraData = this.cliqueSealBlock(options.cliqueSigner);
        }
        // Validate consensus format after block is sealed (if applicable) so extraData checks will pass
        if (skipValidateConsensusFormat === false)
            this._consensusFormatValidation();
        const freeze = options?.freeze ?? true;
        if (freeze) {
            Object.freeze(this);
        }
    }
    /**
     * EIP-4399: After merge to PoS, `mixHash` supplanted as `prevRandao`
     */
    get prevRandao() {
        if (this._common.isActivatedEIP(4399) === false) {
            const msg = this._errorMsg('The prevRandao parameter can only be accessed when EIP-4399 is activated');
            throw new Error(msg);
        }
        return this.mixHash;
    }
    /**
     * Static constructor to create a block header from a header data dictionary
     *
     * @param headerData
     * @param opts
     */
    static fromHeaderData(headerData = {}, opts = {}) {
        return new BlockHeader(headerData, opts);
    }
    /**
     * Static constructor to create a block header from a RLP-serialized header
     *
     * @param serializedHeaderData
     * @param opts
     */
    static fromRLPSerializedHeader(serializedHeaderData, opts = {}) {
        const values = (0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(serializedHeaderData)));
        if (!Array.isArray(values)) {
            throw new Error('Invalid serialized header input. Must be array');
        }
        return BlockHeader.fromValuesArray(values, opts);
    }
    /**
     * Static constructor to create a block header from an array of Buffer values
     *
     * @param values
     * @param opts
     */
    static fromValuesArray(values, opts = {}) {
        const headerData = (0, helpers_1.valuesArrayToHeaderData)(values);
        const { number, baseFeePerGas } = headerData;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (opts.common?.isActivatedEIP(1559) && baseFeePerGas === undefined) {
            const eip1559ActivationBlock = (0, ethereumjs_util_1.bigIntToBuffer)(opts.common?.eipBlock(1559));
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (eip1559ActivationBlock && eip1559ActivationBlock.equals(number)) {
                throw new Error('invalid header. baseFeePerGas should be provided');
            }
        }
        return BlockHeader.fromHeaderData(headerData, opts);
    }
    /**
     * Validates correct buffer lengths, throws if invalid.
     */
    _genericFormatValidation() {
        const { parentHash, stateRoot, transactionsTrie, receiptTrie, mixHash, nonce } = this;
        if (parentHash.length !== 32) {
            const msg = this._errorMsg(`parentHash must be 32 bytes, received ${parentHash.length} bytes`);
            throw new Error(msg);
        }
        if (stateRoot.length !== 32) {
            const msg = this._errorMsg(`stateRoot must be 32 bytes, received ${stateRoot.length} bytes`);
            throw new Error(msg);
        }
        if (transactionsTrie.length !== 32) {
            const msg = this._errorMsg(`transactionsTrie must be 32 bytes, received ${transactionsTrie.length} bytes`);
            throw new Error(msg);
        }
        if (receiptTrie.length !== 32) {
            const msg = this._errorMsg(`receiptTrie must be 32 bytes, received ${receiptTrie.length} bytes`);
            throw new Error(msg);
        }
        if (mixHash.length !== 32) {
            const msg = this._errorMsg(`mixHash must be 32 bytes, received ${mixHash.length} bytes`);
            throw new Error(msg);
        }
        if (nonce.length !== 8) {
            const msg = this._errorMsg(`nonce must be 8 bytes, received ${nonce.length} bytes`);
            throw new Error(msg);
        }
        // check if the block used too much gas
        if (this.gasUsed > this.gasLimit) {
            const msg = this._errorMsg('Invalid block: too much gas used');
            throw new Error(msg);
        }
        // Validation for EIP-1559 blocks
        if (this._common.isActivatedEIP(1559) === true) {
            if (typeof this.baseFeePerGas !== 'bigint') {
                const msg = this._errorMsg('EIP1559 block has no base fee field');
                throw new Error(msg);
            }
            const londonHfBlock = this._common.hardforkBlock(ethereumjs_common_1.Hardfork.London);
            if (typeof londonHfBlock === 'bigint' &&
                londonHfBlock !== BigInt(0) &&
                this.number === londonHfBlock) {
                const initialBaseFee = this._common.param('gasConfig', 'initialBaseFee');
                if (this.baseFeePerGas !== initialBaseFee) {
                    const msg = this._errorMsg('Initial EIP1559 block does not have initial base fee');
                    throw new Error(msg);
                }
            }
        }
    }
    /**
     * Checks static parameters related to consensus algorithm
     * @throws if any check fails
     */
    _consensusFormatValidation() {
        const { nonce, uncleHash, difficulty, extraData } = this;
        const hardfork = this._common.hardfork();
        // Consensus type dependent checks
        if (this._common.consensusAlgorithm() === ethereumjs_common_1.ConsensusAlgorithm.Ethash) {
            // PoW/Ethash
            if (this.extraData.length > this._common.paramByHardfork('vm', 'maxExtraDataSize', hardfork)) {
                const msg = this._errorMsg('invalid amount of extra data');
                throw new Error(msg);
            }
        }
        if (this._common.consensusAlgorithm() === ethereumjs_common_1.ConsensusAlgorithm.Clique) {
            // PoA/Clique
            const minLength = clique_1.CLIQUE_EXTRA_VANITY + clique_1.CLIQUE_EXTRA_SEAL;
            if (!this.cliqueIsEpochTransition()) {
                // ExtraData length on epoch transition
                if (this.extraData.length !== minLength) {
                    const msg = this._errorMsg(`extraData must be ${minLength} bytes on non-epoch transition blocks, received ${this.extraData.length} bytes`);
                    throw new Error(msg);
                }
            }
            else {
                const signerLength = this.extraData.length - minLength;
                if (signerLength % 20 !== 0) {
                    const msg = this._errorMsg(`invalid signer list length in extraData, received signer length of ${signerLength} (not divisible by 20)`);
                    throw new Error(msg);
                }
                // coinbase (beneficiary) on epoch transition
                if (!this.coinbase.isZero()) {
                    const msg = this._errorMsg(`coinbase must be filled with zeros on epoch transition blocks, received ${this.coinbase}`);
                    throw new Error(msg);
                }
            }
            // MixHash format
            if (!this.mixHash.equals(Buffer.alloc(32))) {
                const msg = this._errorMsg(`mixHash must be filled with zeros, received ${this.mixHash}`);
                throw new Error(msg);
            }
        }
        // Validation for PoS blocks (EIP-3675)
        if (this._common.consensusType() === ethereumjs_common_1.ConsensusType.ProofOfStake) {
            let error = false;
            let errorMsg = '';
            if (!uncleHash.equals(ethereumjs_util_1.KECCAK256_RLP_ARRAY)) {
                errorMsg += `, uncleHash: ${uncleHash.toString('hex')} (expected: ${ethereumjs_util_1.KECCAK256_RLP_ARRAY.toString('hex')})`;
                error = true;
            }
            if (difficulty !== BigInt(0)) {
                errorMsg += `, difficulty: ${difficulty} (expected: 0)`;
                error = true;
            }
            if (extraData.length > 32) {
                errorMsg += `, extraData: ${extraData.toString('hex')} (cannot exceed 32 bytes length, received ${extraData.length} bytes)`;
                error = true;
            }
            if (!nonce.equals((0, ethereumjs_util_1.zeros)(8))) {
                errorMsg += `, nonce: ${nonce.toString('hex')} (expected: ${(0, ethereumjs_util_1.zeros)(8).toString('hex')})`;
                error = true;
            }
            if (error) {
                const msg = this._errorMsg(`Invalid PoS block${errorMsg}`);
                throw new Error(msg);
            }
        }
    }
    /**
     * Validates if the block gasLimit remains in the boundaries set by the protocol.
     * Throws if out of bounds.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    validateGasLimit(parentBlockHeader) {
        let parentGasLimit = parentBlockHeader.gasLimit;
        // EIP-1559: assume double the parent gas limit on fork block
        // to adopt to the new gas target centered logic
        const londonHardforkBlock = this._common.hardforkBlock(ethereumjs_common_1.Hardfork.London);
        if (typeof londonHardforkBlock === 'bigint' &&
            londonHardforkBlock !== BigInt(0) &&
            this.number === londonHardforkBlock) {
            const elasticity = this._common.param('gasConfig', 'elasticityMultiplier');
            parentGasLimit = parentGasLimit * elasticity;
        }
        const gasLimit = this.gasLimit;
        const hardfork = this._common.hardfork();
        const a = parentGasLimit / this._common.paramByHardfork('gasConfig', 'gasLimitBoundDivisor', hardfork);
        const maxGasLimit = parentGasLimit + a;
        const minGasLimit = parentGasLimit - a;
        if (gasLimit >= maxGasLimit) {
            const msg = this._errorMsg('gas limit increased too much');
            throw new Error(msg);
        }
        if (gasLimit <= minGasLimit) {
            const msg = this._errorMsg('gas limit decreased too much');
            throw new Error(msg);
        }
        if (gasLimit < this._common.paramByHardfork('gasConfig', 'minGasLimit', hardfork)) {
            const msg = this._errorMsg(`gas limit decreased below minimum gas limit for hardfork=${hardfork}`);
            throw new Error(msg);
        }
    }
    /**
     * Calculates the base fee for a potential next block
     */
    calcNextBaseFee() {
        if (this._common.isActivatedEIP(1559) === false) {
            const msg = this._errorMsg('calcNextBaseFee() can only be called with EIP1559 being activated');
            throw new Error(msg);
        }
        let nextBaseFee;
        const elasticity = this._common.param('gasConfig', 'elasticityMultiplier');
        const parentGasTarget = this.gasLimit / elasticity;
        if (parentGasTarget === this.gasUsed) {
            nextBaseFee = this.baseFeePerGas;
        }
        else if (this.gasUsed > parentGasTarget) {
            const gasUsedDelta = this.gasUsed - parentGasTarget;
            const baseFeeMaxChangeDenominator = this._common.param('gasConfig', 'baseFeeMaxChangeDenominator');
            const calculatedDelta = (this.baseFeePerGas * gasUsedDelta) / parentGasTarget / baseFeeMaxChangeDenominator;
            nextBaseFee =
                (calculatedDelta > BigInt(1) ? calculatedDelta : BigInt(1)) + this.baseFeePerGas;
        }
        else {
            const gasUsedDelta = parentGasTarget - this.gasUsed;
            const baseFeeMaxChangeDenominator = this._common.param('gasConfig', 'baseFeeMaxChangeDenominator');
            const calculatedDelta = (this.baseFeePerGas * gasUsedDelta) / parentGasTarget / baseFeeMaxChangeDenominator;
            nextBaseFee =
                this.baseFeePerGas - calculatedDelta > BigInt(0)
                    ? this.baseFeePerGas - calculatedDelta
                    : BigInt(0);
        }
        return nextBaseFee;
    }
    /**
     * Returns a Buffer Array of the raw Buffers in this header, in order.
     */
    raw() {
        const rawItems = [
            this.parentHash,
            this.uncleHash,
            this.coinbase.buf,
            this.stateRoot,
            this.transactionsTrie,
            this.receiptTrie,
            this.logsBloom,
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.difficulty),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.number),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.gasLimit),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.gasUsed),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.timestamp ?? BigInt(0)),
            this.extraData,
            this.mixHash,
            this.nonce,
        ];
        if (this._common.isActivatedEIP(1559) === true) {
            rawItems.push((0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.baseFeePerGas));
        }
        return rawItems;
    }
    /**
     * Returns the hash of the block header.
     */
    hash() {
        if (Object.isFrozen(this)) {
            if (!this.cache.hash) {
                this.cache.hash = Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(this.raw())))));
            }
            return this.cache.hash;
        }
        return Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(this.raw())))));
    }
    /**
     * Checks if the block header is a genesis header.
     */
    isGenesis() {
        return this.number === BigInt(0);
    }
    _requireClique(name) {
        if (this._common.consensusAlgorithm() !== ethereumjs_common_1.ConsensusAlgorithm.Clique) {
            const msg = this._errorMsg(`BlockHeader.${name}() call only supported for clique PoA networks`);
            throw new Error(msg);
        }
    }
    /**
     * Returns the canonical difficulty for this block.
     *
     * @param parentBlockHeader - the header from the parent `Block` of this header
     */
    ethashCanonicalDifficulty(parentBlockHeader) {
        if (this._common.consensusType() !== ethereumjs_common_1.ConsensusType.ProofOfWork) {
            const msg = this._errorMsg('difficulty calculation is only supported on PoW chains');
            throw new Error(msg);
        }
        if (this._common.consensusAlgorithm() !== ethereumjs_common_1.ConsensusAlgorithm.Ethash) {
            const msg = this._errorMsg('difficulty calculation currently only supports the ethash algorithm');
            throw new Error(msg);
        }
        const hardfork = this._common.hardfork();
        const blockTs = this.timestamp;
        const { timestamp: parentTs, difficulty: parentDif } = parentBlockHeader;
        const minimumDifficulty = this._common.paramByHardfork('pow', 'minimumDifficulty', hardfork);
        const offset = parentDif / this._common.paramByHardfork('pow', 'difficultyBoundDivisor', hardfork);
        let num = this.number;
        // We use a ! here as TS cannot follow this hardfork-dependent logic, but it always gets assigned
        let dif;
        if (this._common.hardforkGteHardfork(hardfork, ethereumjs_common_1.Hardfork.Byzantium) === true) {
            // max((2 if len(parent.uncles) else 1) - ((timestamp - parent.timestamp) // 9), -99) (EIP100)
            const uncleAddend = parentBlockHeader.uncleHash.equals(ethereumjs_util_1.KECCAK256_RLP_ARRAY) ? 1 : 2;
            let a = BigInt(uncleAddend) - (blockTs - parentTs) / BigInt(9);
            const cutoff = BigInt(-99);
            // MAX(cutoff, a)
            if (cutoff > a) {
                a = cutoff;
            }
            dif = parentDif + offset * a;
        }
        if (this._common.hardforkGteHardfork(hardfork, ethereumjs_common_1.Hardfork.Byzantium) === true) {
            // Get delay as parameter from common
            num = num - this._common.param('pow', 'difficultyBombDelay');
            if (num < BigInt(0)) {
                num = BigInt(0);
            }
        }
        else if (this._common.hardforkGteHardfork(hardfork, ethereumjs_common_1.Hardfork.Homestead) === true) {
            // 1 - (block_timestamp - parent_timestamp) // 10
            let a = BigInt(1) - (blockTs - parentTs) / BigInt(10);
            const cutoff = BigInt(-99);
            // MAX(cutoff, a)
            if (cutoff > a) {
                a = cutoff;
            }
            dif = parentDif + offset * a;
        }
        else {
            // pre-homestead
            if (parentTs + this._common.paramByHardfork('pow', 'durationLimit', hardfork) > blockTs) {
                dif = offset + parentDif;
            }
            else {
                dif = parentDif - offset;
            }
        }
        const exp = num / BigInt(100000) - BigInt(2);
        if (exp >= 0) {
            dif = dif + BigInt(2) ** exp;
        }
        if (dif < minimumDifficulty) {
            dif = minimumDifficulty;
        }
        return dif;
    }
    /**
     * PoA clique signature hash without the seal.
     */
    cliqueSigHash() {
        this._requireClique('cliqueSigHash');
        const raw = this.raw();
        raw[12] = this.extraData.slice(0, this.extraData.length - clique_1.CLIQUE_EXTRA_SEAL);
        return Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(raw)))));
    }
    /**
     * Checks if the block header is an epoch transition
     * header (only clique PoA, throws otherwise)
     */
    cliqueIsEpochTransition() {
        this._requireClique('cliqueIsEpochTransition');
        const epoch = BigInt(this._common.consensusConfig().epoch);
        // Epoch transition block if the block number has no
        // remainder on the division by the epoch length
        return this.number % epoch === BigInt(0);
    }
    /**
     * Returns extra vanity data
     * (only clique PoA, throws otherwise)
     */
    cliqueExtraVanity() {
        this._requireClique('cliqueExtraVanity');
        return this.extraData.slice(0, clique_1.CLIQUE_EXTRA_VANITY);
    }
    /**
     * Returns extra seal data
     * (only clique PoA, throws otherwise)
     */
    cliqueExtraSeal() {
        this._requireClique('cliqueExtraSeal');
        return this.extraData.slice(-clique_1.CLIQUE_EXTRA_SEAL);
    }
    /**
     * Seal block with the provided signer.
     * Returns the final extraData field to be assigned to `this.extraData`.
     * @hidden
     */
    cliqueSealBlock(privateKey) {
        this._requireClique('cliqueSealBlock');
        const signature = (0, ethereumjs_util_1.ecsign)(this.cliqueSigHash(), privateKey);
        const signatureB = Buffer.concat([
            signature.r,
            signature.s,
            (0, ethereumjs_util_1.bigIntToBuffer)(signature.v - BigInt(27)),
        ]);
        const extraDataWithoutSeal = this.extraData.slice(0, this.extraData.length - clique_1.CLIQUE_EXTRA_SEAL);
        const extraData = Buffer.concat([extraDataWithoutSeal, signatureB]);
        return extraData;
    }
    /**
     * Returns a list of signers
     * (only clique PoA, throws otherwise)
     *
     * This function throws if not called on an epoch
     * transition block and should therefore be used
     * in conjunction with {@link BlockHeader.cliqueIsEpochTransition}
     */
    cliqueEpochTransitionSigners() {
        this._requireClique('cliqueEpochTransitionSigners');
        if (!this.cliqueIsEpochTransition()) {
            const msg = this._errorMsg('Signers are only included in epoch transition blocks (clique)');
            throw new Error(msg);
        }
        const start = clique_1.CLIQUE_EXTRA_VANITY;
        const end = this.extraData.length - clique_1.CLIQUE_EXTRA_SEAL;
        const signerBuffer = this.extraData.slice(start, end);
        const signerList = [];
        const signerLength = 20;
        for (let start = 0; start <= signerBuffer.length - signerLength; start += signerLength) {
            signerList.push(signerBuffer.slice(start, start + signerLength));
        }
        return signerList.map((buf) => new ethereumjs_util_1.Address(buf));
    }
    /**
     * Verifies the signature of the block (last 65 bytes of extraData field)
     * (only clique PoA, throws otherwise)
     *
     *  Method throws if signature is invalid
     */
    cliqueVerifySignature(signerList) {
        this._requireClique('cliqueVerifySignature');
        const signerAddress = this.cliqueSigner();
        const signerFound = signerList.find((signer) => {
            return signer.equals(signerAddress);
        });
        return !!signerFound;
    }
    /**
     * Returns the signer address
     */
    cliqueSigner() {
        this._requireClique('cliqueSigner');
        const extraSeal = this.cliqueExtraSeal();
        // Reasonable default for default blocks
        if (extraSeal.length === 0 || extraSeal.equals(Buffer.alloc(65).fill(0))) {
            return ethereumjs_util_1.Address.zero();
        }
        const r = extraSeal.slice(0, 32);
        const s = extraSeal.slice(32, 64);
        const v = (0, ethereumjs_util_1.bufferToBigInt)(extraSeal.slice(64, 65)) + BigInt(27);
        const pubKey = (0, ethereumjs_util_1.ecrecover)(this.cliqueSigHash(), v, r, s);
        return ethereumjs_util_1.Address.fromPublicKey(pubKey);
    }
    /**
     * Returns the rlp encoding of the block header.
     */
    serialize() {
        return Buffer.from(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(this.raw())));
    }
    /**
     * Returns the block header in JSON format.
     */
    toJSON() {
        const jsonDict = {
            parentHash: '0x' + this.parentHash.toString('hex'),
            uncleHash: '0x' + this.uncleHash.toString('hex'),
            coinbase: this.coinbase.toString(),
            stateRoot: '0x' + this.stateRoot.toString('hex'),
            transactionsTrie: '0x' + this.transactionsTrie.toString('hex'),
            receiptTrie: '0x' + this.receiptTrie.toString('hex'),
            logsBloom: '0x' + this.logsBloom.toString('hex'),
            difficulty: (0, ethereumjs_util_1.bigIntToHex)(this.difficulty),
            number: (0, ethereumjs_util_1.bigIntToHex)(this.number),
            gasLimit: (0, ethereumjs_util_1.bigIntToHex)(this.gasLimit),
            gasUsed: (0, ethereumjs_util_1.bigIntToHex)(this.gasUsed),
            timestamp: (0, ethereumjs_util_1.bigIntToHex)(this.timestamp),
            extraData: '0x' + this.extraData.toString('hex'),
            mixHash: '0x' + this.mixHash.toString('hex'),
            nonce: '0x' + this.nonce.toString('hex'),
        };
        if (this._common.isActivatedEIP(1559) === true) {
            jsonDict.baseFeePerGas = (0, ethereumjs_util_1.bigIntToHex)(this.baseFeePerGas);
        }
        return jsonDict;
    }
    /**
     * Validates extra data is DAO_ExtraData for DAO_ForceExtraDataRange blocks after DAO
     * activation block (see: https://blog.slock.it/hard-fork-specification-24b889e70703)
     */
    _validateDAOExtraData() {
        if (this._common.hardforkIsActiveOnBlock(ethereumjs_common_1.Hardfork.Dao, this.number) === false) {
            return;
        }
        const DAOActivationBlock = this._common.hardforkBlock(ethereumjs_common_1.Hardfork.Dao);
        if (DAOActivationBlock === null || this.number < DAOActivationBlock) {
            return;
        }
        const DAO_ExtraData = Buffer.from('64616f2d686172642d666f726b', 'hex');
        const DAO_ForceExtraDataRange = BigInt(9);
        const drift = this.number - DAOActivationBlock;
        if (drift <= DAO_ForceExtraDataRange && !this.extraData.equals(DAO_ExtraData)) {
            const msg = this._errorMsg("extraData should be 'dao-hard-fork'");
            throw new Error(msg);
        }
    }
    /**
     * Return a compact error string representation of the object
     */
    errorStr() {
        let hash = '';
        try {
            hash = (0, ethereumjs_util_1.bufferToHex)(this.hash());
        }
        catch (e) {
            hash = 'error';
        }
        let hf = '';
        try {
            hf = this._common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        let errorStr = `block header number=${this.number} hash=${hash} `;
        errorStr += `hf=${hf} baseFeePerGas=${this.baseFeePerGas ?? 'none'}`;
        return errorStr;
    }
    /**
     * Helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    _errorMsg(msg) {
        return `${msg} (${this.errorStr()})`;
    }
}
exports.BlockHeader = BlockHeader;
//# sourceMappingURL=header.js.map