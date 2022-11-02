"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Common = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const crc_32_1 = require("crc-32");
const events_1 = require("events");
const goerli = require("./chains/goerli.json");
const mainnet = require("./chains/mainnet.json");
const rinkeby = require("./chains/rinkeby.json");
const ropsten = require("./chains/ropsten.json");
const sepolia = require("./chains/sepolia.json");
const eips_1 = require("./eips");
const enums_1 = require("./enums");
const hardforks_1 = require("./hardforks");
/**
 * Common class to access chain and hardfork parameters and to provide
 * a unified and shared view on the network and hardfork state.
 *
 * Use the {@link Common.custom} static constructor for creating simple
 * custom chain {@link Common} objects (more complete custom chain setups
 * can be created via the main constructor and the {@link CommonOpts.customChains} parameter).
 */
class Common extends events_1.EventEmitter {
    constructor(opts) {
        super();
        this._eips = [];
        this._customChains = opts.customChains ?? [];
        this._chainParams = this.setChain(opts.chain);
        this.DEFAULT_HARDFORK = this._chainParams.defaultHardfork ?? enums_1.Hardfork.Merge;
        this._hardfork = this.DEFAULT_HARDFORK;
        if (opts.hardfork !== undefined) {
            this.setHardfork(opts.hardfork);
        }
        if (opts.eips) {
            this.setEIPs(opts.eips);
        }
    }
    /**
     * Creates a {@link Common} object for a custom chain, based on a standard one.
     *
     * It uses all the {@link Chain} parameters from the {@link baseChain} option except the ones overridden
     * in a provided {@link chainParamsOrName} dictionary. Some usage example:
     *
     * ```javascript
     * Common.custom({chainId: 123})
     * ```
     *
     * There are also selected supported custom chains which can be initialized by using one of the
     * {@link CustomChains} for {@link chainParamsOrName}, e.g.:
     *
     * ```javascript
     * Common.custom(CustomChains.MaticMumbai)
     * ```
     *
     * Note that these supported custom chains only provide some base parameters (usually the chain and
     * network ID and a name) and can only be used for selected use cases (e.g. sending a tx with
     * the `@nomicfoundation/ethereumjs-tx` library to a Layer-2 chain).
     *
     * @param chainParamsOrName Custom parameter dict (`name` will default to `custom-chain`) or string with name of a supported custom chain
     * @param opts Custom chain options to set the {@link CustomCommonOpts.baseChain}, selected {@link CustomCommonOpts.hardfork} and others
     */
    static custom(chainParamsOrName, opts = {}) {
        const baseChain = opts.baseChain ?? 'mainnet';
        const standardChainParams = { ...Common._getChainParams(baseChain) };
        standardChainParams['name'] = 'custom-chain';
        if (typeof chainParamsOrName !== 'string') {
            return new Common({
                chain: {
                    ...standardChainParams,
                    ...chainParamsOrName,
                },
                ...opts,
            });
        }
        else {
            if (chainParamsOrName === enums_1.CustomChain.PolygonMainnet) {
                return Common.custom({
                    name: enums_1.CustomChain.PolygonMainnet,
                    chainId: 137,
                    networkId: 137,
                }, opts);
            }
            if (chainParamsOrName === enums_1.CustomChain.PolygonMumbai) {
                return Common.custom({
                    name: enums_1.CustomChain.PolygonMumbai,
                    chainId: 80001,
                    networkId: 80001,
                }, opts);
            }
            if (chainParamsOrName === enums_1.CustomChain.ArbitrumRinkebyTestnet) {
                return Common.custom({
                    name: enums_1.CustomChain.ArbitrumRinkebyTestnet,
                    chainId: 421611,
                    networkId: 421611,
                }, opts);
            }
            if (chainParamsOrName === enums_1.CustomChain.xDaiChain) {
                return Common.custom({
                    name: enums_1.CustomChain.xDaiChain,
                    chainId: 100,
                    networkId: 100,
                }, opts);
            }
            if (chainParamsOrName === enums_1.CustomChain.OptimisticKovan) {
                return Common.custom({
                    name: enums_1.CustomChain.OptimisticKovan,
                    chainId: 69,
                    networkId: 69,
                }, 
                // Optimism has not implemented the London hardfork yet (targeting Q1.22)
                { hardfork: enums_1.Hardfork.Berlin, ...opts });
            }
            if (chainParamsOrName === enums_1.CustomChain.OptimisticEthereum) {
                return Common.custom({
                    name: enums_1.CustomChain.OptimisticEthereum,
                    chainId: 10,
                    networkId: 10,
                }, 
                // Optimism has not implemented the London hardfork yet (targeting Q1.22)
                { hardfork: enums_1.Hardfork.Berlin, ...opts });
            }
            throw new Error(`Custom chain ${chainParamsOrName} not supported`);
        }
    }
    /**
     * Static method to determine if a {@link chainId} is supported as a standard chain
     * @param chainId bigint id (`1`) of a standard chain
     * @returns boolean
     */
    static isSupportedChainId(chainId) {
        const initializedChains = this._getInitializedChains();
        return Boolean(initializedChains['names'][chainId.toString()]);
    }
    static _getChainParams(chain, customChains) {
        const initializedChains = this._getInitializedChains(customChains);
        if (typeof chain === 'number' || typeof chain === 'bigint') {
            chain = chain.toString();
            if (initializedChains['names'][chain]) {
                const name = initializedChains['names'][chain];
                return initializedChains[name];
            }
            throw new Error(`Chain with ID ${chain} not supported`);
        }
        if (initializedChains[chain] !== undefined) {
            return initializedChains[chain];
        }
        throw new Error(`Chain with name ${chain} not supported`);
    }
    /**
     * Sets the chain
     * @param chain String ('mainnet') or Number (1) chain representation.
     *              Or, a Dictionary of chain parameters for a private network.
     * @returns The dictionary with parameters set as chain
     */
    setChain(chain) {
        if (typeof chain === 'number' || typeof chain === 'bigint' || typeof chain === 'string') {
            this._chainParams = Common._getChainParams(chain, this._customChains);
        }
        else if (typeof chain === 'object') {
            if (this._customChains.length > 0) {
                throw new Error('Chain must be a string, number, or bigint when initialized with customChains passed in');
            }
            const required = ['networkId', 'genesis', 'hardforks', 'bootstrapNodes'];
            for (const param of required) {
                if (!(param in chain)) {
                    throw new Error(`Missing required chain parameter: ${param}`);
                }
            }
            this._chainParams = chain;
        }
        else {
            throw new Error('Wrong input format');
        }
        for (const hf of this.hardforks()) {
            if (hf.block === undefined) {
                throw new Error(`Hardfork cannot have undefined block number`);
            }
        }
        return this._chainParams;
    }
    /**
     * Sets the hardfork to get params for
     * @param hardfork String identifier (e.g. 'byzantium') or {@link Hardfork} enum
     */
    setHardfork(hardfork) {
        let existing = false;
        for (const hfChanges of hardforks_1.hardforks) {
            if (hfChanges[0] === hardfork) {
                if (this._hardfork !== hardfork) {
                    this._hardfork = hardfork;
                    this.emit('hardforkChanged', hardfork);
                }
                existing = true;
            }
        }
        if (!existing) {
            throw new Error(`Hardfork with name ${hardfork} not supported`);
        }
    }
    /**
     * Returns the hardfork based on the block number or an optional
     * total difficulty (Merge HF) provided.
     *
     * An optional TD takes precedence in case the corresponding HF block
     * is set to `null` or otherwise needs to match (if not an error
     * will be thrown).
     *
     * @param blockNumber
     * @param td
     * @returns The name of the HF
     */
    getHardforkByBlockNumber(blockNumber, td) {
        blockNumber = (0, ethereumjs_util_1.toType)(blockNumber, ethereumjs_util_1.TypeOutput.BigInt);
        td = (0, ethereumjs_util_1.toType)(td, ethereumjs_util_1.TypeOutput.BigInt);
        let hardfork = enums_1.Hardfork.Chainstart;
        let minTdHF;
        let maxTdHF;
        let previousHF;
        for (const hf of this.hardforks()) {
            // Skip comparison for not applied HFs
            if (hf.block === null) {
                if (td !== undefined && td !== null && hf.ttd !== undefined && hf.ttd !== null) {
                    if (td >= BigInt(hf.ttd)) {
                        return hf.name;
                    }
                }
                continue;
            }
            if (blockNumber >= BigInt(hf.block)) {
                hardfork = hf.name;
            }
            if (td && (typeof hf.ttd === 'string' || typeof hf.ttd === 'bigint')) {
                if (td >= BigInt(hf.ttd)) {
                    minTdHF = hf.name;
                }
                else {
                    maxTdHF = previousHF;
                }
            }
            previousHF = hf.name;
        }
        if (td) {
            let msgAdd = `block number: ${blockNumber} (-> ${hardfork}), `;
            if (minTdHF !== undefined) {
                if (!this.hardforkGteHardfork(hardfork, minTdHF)) {
                    const msg = 'HF determined by block number is lower than the minimum total difficulty HF';
                    msgAdd += `total difficulty: ${td} (-> ${minTdHF})`;
                    throw new Error(`${msg}: ${msgAdd}`);
                }
            }
            if (maxTdHF !== undefined) {
                if (!this.hardforkGteHardfork(maxTdHF, hardfork)) {
                    const msg = 'Maximum HF determined by total difficulty is lower than the block number HF';
                    msgAdd += `total difficulty: ${td} (-> ${maxTdHF})`;
                    throw new Error(`${msg}: ${msgAdd}`);
                }
            }
        }
        return hardfork;
    }
    /**
     * Sets a new hardfork based on the block number or an optional
     * total difficulty (Merge HF) provided.
     *
     * An optional TD takes precedence in case the corresponding HF block
     * is set to `null` or otherwise needs to match (if not an error
     * will be thrown).
     *
     * @param blockNumber
     * @param td
     * @returns The name of the HF set
     */
    setHardforkByBlockNumber(blockNumber, td) {
        const hardfork = this.getHardforkByBlockNumber(blockNumber, td);
        this.setHardfork(hardfork);
        return hardfork;
    }
    /**
     * Internal helper function, returns the params for the given hardfork for the chain set
     * @param hardfork Hardfork name
     * @returns Dictionary with hardfork params or null if hardfork not on chain
     */
    _getHardfork(hardfork) {
        const hfs = this.hardforks();
        for (const hf of hfs) {
            if (hf['name'] === hardfork)
                return hf;
        }
        return null;
    }
    /**
     * Sets the active EIPs
     * @param eips
     */
    setEIPs(eips = []) {
        for (const eip of eips) {
            if (!(eip in eips_1.EIPs)) {
                throw new Error(`${eip} not supported`);
            }
            const minHF = this.gteHardfork(eips_1.EIPs[eip]['minimumHardfork']);
            if (!minHF) {
                throw new Error(`${eip} cannot be activated on hardfork ${this.hardfork()}, minimumHardfork: ${minHF}`);
            }
            if (eips_1.EIPs[eip].requiredEIPs !== undefined) {
                for (const elem of eips_1.EIPs[eip].requiredEIPs) {
                    if (!(eips.includes(elem) || this.isActivatedEIP(elem))) {
                        throw new Error(`${eip} requires EIP ${elem}, but is not included in the EIP list`);
                    }
                }
            }
        }
        this._eips = eips;
    }
    /**
     * Returns a parameter for the current chain setup
     *
     * If the parameter is present in an EIP, the EIP always takes precendence.
     * Otherwise the parameter if taken from the latest applied HF with
     * a change on the respective parameter.
     *
     * @param topic Parameter topic ('gasConfig', 'gasPrices', 'vm', 'pow')
     * @param name Parameter name (e.g. 'minGasLimit' for 'gasConfig' topic)
     * @returns The value requested or `BigInt(0)` if not found
     */
    param(topic, name) {
        // TODO: consider the case that different active EIPs
        // can change the same parameter
        let value;
        for (const eip of this._eips) {
            value = this.paramByEIP(topic, name, eip);
            if (value !== undefined)
                return value;
        }
        return this.paramByHardfork(topic, name, this._hardfork);
    }
    /**
     * Returns the parameter corresponding to a hardfork
     * @param topic Parameter topic ('gasConfig', 'gasPrices', 'vm', 'pow')
     * @param name Parameter name (e.g. 'minGasLimit' for 'gasConfig' topic)
     * @param hardfork Hardfork name
     * @returns The value requested or `BigInt(0)` if not found
     */
    paramByHardfork(topic, name, hardfork) {
        let value = null;
        for (const hfChanges of hardforks_1.hardforks) {
            // EIP-referencing HF file (e.g. berlin.json)
            if ('eips' in hfChanges[1]) {
                const hfEIPs = hfChanges[1]['eips'];
                for (const eip of hfEIPs) {
                    const valueEIP = this.paramByEIP(topic, name, eip);
                    value = typeof valueEIP === 'bigint' ? valueEIP : value;
                }
                // Parameter-inlining HF file (e.g. istanbul.json)
            }
            else {
                if (hfChanges[1][topic] === undefined) {
                    throw new Error(`Topic ${topic} not defined`);
                }
                if (hfChanges[1][topic][name] !== undefined) {
                    value = hfChanges[1][topic][name].v;
                }
            }
            if (hfChanges[0] === hardfork)
                break;
        }
        return BigInt(value ?? 0);
    }
    /**
     * Returns a parameter corresponding to an EIP
     * @param topic Parameter topic ('gasConfig', 'gasPrices', 'vm', 'pow')
     * @param name Parameter name (e.g. 'minGasLimit' for 'gasConfig' topic)
     * @param eip Number of the EIP
     * @returns The value requested or `undefined` if not found
     */
    paramByEIP(topic, name, eip) {
        if (!(eip in eips_1.EIPs)) {
            throw new Error(`${eip} not supported`);
        }
        const eipParams = eips_1.EIPs[eip];
        if (!(topic in eipParams)) {
            throw new Error(`Topic ${topic} not defined`);
        }
        if (eipParams[topic][name] === undefined) {
            return undefined;
        }
        const value = eipParams[topic][name].v;
        return BigInt(value);
    }
    /**
     * Returns a parameter for the hardfork active on block number or
     * optional provided total difficulty (Merge HF)
     * @param topic Parameter topic
     * @param name Parameter name
     * @param blockNumber Block number
     * @param td Total difficulty
     *    * @returns The value requested or `BigInt(0)` if not found
     */
    paramByBlock(topic, name, blockNumber, td) {
        const hardfork = this.getHardforkByBlockNumber(blockNumber, td);
        return this.paramByHardfork(topic, name, hardfork);
    }
    /**
     * Checks if an EIP is activated by either being included in the EIPs
     * manually passed in with the {@link CommonOpts.eips} or in a
     * hardfork currently being active
     *
     * Note: this method only works for EIPs being supported
     * by the {@link CommonOpts.eips} constructor option
     * @param eip
     */
    isActivatedEIP(eip) {
        if (this.eips().includes(eip)) {
            return true;
        }
        for (const hfChanges of hardforks_1.hardforks) {
            const hf = hfChanges[1];
            if (this.gteHardfork(hf['name']) && 'eips' in hf) {
                if (hf['eips'].includes(eip)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Checks if set or provided hardfork is active on block number
     * @param hardfork Hardfork name or null (for HF set)
     * @param blockNumber
     * @returns True if HF is active on block number
     */
    hardforkIsActiveOnBlock(hardfork, blockNumber) {
        blockNumber = (0, ethereumjs_util_1.toType)(blockNumber, ethereumjs_util_1.TypeOutput.BigInt);
        hardfork = hardfork ?? this._hardfork;
        const hfBlock = this.hardforkBlock(hardfork);
        if (typeof hfBlock === 'bigint' && hfBlock !== BigInt(0) && blockNumber >= hfBlock) {
            return true;
        }
        return false;
    }
    /**
     * Alias to hardforkIsActiveOnBlock when hardfork is set
     * @param blockNumber
     * @returns True if HF is active on block number
     */
    activeOnBlock(blockNumber) {
        return this.hardforkIsActiveOnBlock(null, blockNumber);
    }
    /**
     * Sequence based check if given or set HF1 is greater than or equal HF2
     * @param hardfork1 Hardfork name or null (if set)
     * @param hardfork2 Hardfork name
     * @param opts Hardfork options
     * @returns True if HF1 gte HF2
     */
    hardforkGteHardfork(hardfork1, hardfork2) {
        hardfork1 = hardfork1 ?? this._hardfork;
        const hardforks = this.hardforks();
        let posHf1 = -1, posHf2 = -1;
        let index = 0;
        for (const hf of hardforks) {
            if (hf['name'] === hardfork1)
                posHf1 = index;
            if (hf['name'] === hardfork2)
                posHf2 = index;
            index += 1;
        }
        return posHf1 >= posHf2 && posHf2 !== -1;
    }
    /**
     * Alias to hardforkGteHardfork when hardfork is set
     * @param hardfork Hardfork name
     * @returns True if hardfork set is greater than hardfork provided
     */
    gteHardfork(hardfork) {
        return this.hardforkGteHardfork(null, hardfork);
    }
    /**
     * Returns the hardfork change block for hardfork provided or set
     * @param hardfork Hardfork name, optional if HF set
     * @returns Block number or null if unscheduled
     */
    hardforkBlock(hardfork) {
        hardfork = hardfork ?? this._hardfork;
        const block = this._getHardfork(hardfork)?.['block'];
        if (block === undefined || block === null) {
            return null;
        }
        return BigInt(block);
    }
    /**
     * Returns the hardfork change block for eip
     * @param eip EIP number
     * @returns Block number or null if unscheduled
     */
    eipBlock(eip) {
        for (const hfChanges of hardforks_1.hardforks) {
            const hf = hfChanges[1];
            if ('eips' in hf) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (hf['eips'].includes(eip)) {
                    return this.hardforkBlock(hfChanges[0]);
                }
            }
        }
        return null;
    }
    /**
     * Returns the hardfork change total difficulty (Merge HF) for hardfork provided or set
     * @param hardfork Hardfork name, optional if HF set
     * @returns Total difficulty or null if no set
     */
    hardforkTTD(hardfork) {
        hardfork = hardfork ?? this._hardfork;
        const ttd = this._getHardfork(hardfork)?.['ttd'];
        if (ttd === undefined || ttd === null) {
            return null;
        }
        return BigInt(ttd);
    }
    /**
     * True if block number provided is the hardfork (given or set) change block
     * @param blockNumber Number of the block to check
     * @param hardfork Hardfork name, optional if HF set
     * @returns True if blockNumber is HF block
     */
    isHardforkBlock(blockNumber, hardfork) {
        blockNumber = (0, ethereumjs_util_1.toType)(blockNumber, ethereumjs_util_1.TypeOutput.BigInt);
        hardfork = hardfork ?? this._hardfork;
        const block = this.hardforkBlock(hardfork);
        return typeof block === 'bigint' && block !== BigInt(0) ? block === blockNumber : false;
    }
    /**
     * Returns the change block for the next hardfork after the hardfork provided or set
     * @param hardfork Hardfork name, optional if HF set
     * @returns Block number or null if not available
     */
    nextHardforkBlock(hardfork) {
        hardfork = hardfork ?? this._hardfork;
        const hfBlock = this.hardforkBlock(hardfork);
        if (hfBlock === null) {
            return null;
        }
        // Next fork block number or null if none available
        // Logic: if accumulator is still null and on the first occurrence of
        // a block greater than the current hfBlock set the accumulator,
        // pass on the accumulator as the final result from this time on
        const nextHfBlock = this.hardforks().reduce((acc, hf) => {
            const block = BigInt(typeof hf.block !== 'number' ? 0 : hf.block);
            return block > hfBlock && acc === null ? block : acc;
        }, null);
        return nextHfBlock;
    }
    /**
     * True if block number provided is the hardfork change block following the hardfork given or set
     * @param blockNumber Number of the block to check
     * @param hardfork Hardfork name, optional if HF set
     * @returns True if blockNumber is HF block
     */
    isNextHardforkBlock(blockNumber, hardfork) {
        blockNumber = (0, ethereumjs_util_1.toType)(blockNumber, ethereumjs_util_1.TypeOutput.BigInt);
        hardfork = hardfork ?? this._hardfork;
        const nextHardforkBlock = this.nextHardforkBlock(hardfork);
        return nextHardforkBlock === null ? false : nextHardforkBlock === blockNumber;
    }
    /**
     * Internal helper function to calculate a fork hash
     * @param hardfork Hardfork name
     * @param genesisHash Genesis block hash of the chain
     * @returns Fork hash as hex string
     */
    _calcForkHash(hardfork, genesisHash) {
        let hfBuffer = Buffer.alloc(0);
        let prevBlock = 0;
        for (const hf of this.hardforks()) {
            const block = hf.block;
            // Skip for chainstart (0), not applied HFs (null) and
            // when already applied on same block number HFs
            if (typeof block === 'number' && block !== 0 && block !== prevBlock) {
                const hfBlockBuffer = Buffer.from(block.toString(16).padStart(16, '0'), 'hex');
                hfBuffer = Buffer.concat([hfBuffer, hfBlockBuffer]);
            }
            if (hf.name === hardfork)
                break;
            if (typeof block === 'number') {
                prevBlock = block;
            }
        }
        const inputBuffer = Buffer.concat([genesisHash, hfBuffer]);
        // CRC32 delivers result as signed (negative) 32-bit integer,
        // convert to hex string
        const forkhash = (0, ethereumjs_util_1.intToBuffer)((0, crc_32_1.buf)(inputBuffer) >>> 0).toString('hex');
        return `0x${forkhash}`;
    }
    /**
     * Returns an eth/64 compliant fork hash (EIP-2124)
     * @param hardfork Hardfork name, optional if HF set
     * @param genesisHash Genesis block hash of the chain, optional if already defined and not needed to be calculated
     */
    forkHash(hardfork, genesisHash) {
        hardfork = hardfork ?? this._hardfork;
        const data = this._getHardfork(hardfork);
        if (data === null || (data?.block === null && data?.ttd === undefined)) {
            const msg = 'No fork hash calculation possible for future hardfork';
            throw new Error(msg);
        }
        if (data?.forkHash !== null && data?.forkHash !== undefined) {
            return data.forkHash;
        }
        if (!genesisHash)
            throw new Error('genesisHash required for forkHash calculation');
        return this._calcForkHash(hardfork, genesisHash);
    }
    /**
     *
     * @param forkHash Fork hash as a hex string
     * @returns Array with hardfork data (name, block, forkHash)
     */
    hardforkForForkHash(forkHash) {
        const resArray = this.hardforks().filter((hf) => {
            return hf.forkHash === forkHash;
        });
        return resArray.length >= 1 ? resArray[resArray.length - 1] : null;
    }
    /**
     * Returns the Genesis parameters of the current chain
     * @returns Genesis dictionary
     */
    genesis() {
        return this._chainParams.genesis;
    }
    /**
     * Returns the hardforks for current chain
     * @returns {Array} Array with arrays of hardforks
     */
    hardforks() {
        return this._chainParams.hardforks;
    }
    /**
     * Returns bootstrap nodes for the current chain
     * @returns {Dictionary} Dict with bootstrap nodes
     */
    bootstrapNodes() {
        return this._chainParams.bootstrapNodes;
    }
    /**
     * Returns DNS networks for the current chain
     * @returns {String[]} Array of DNS ENR urls
     */
    dnsNetworks() {
        return this._chainParams.dnsNetworks;
    }
    /**
     * Returns the hardfork set
     * @returns Hardfork name
     */
    hardfork() {
        return this._hardfork;
    }
    /**
     * Returns the Id of current chain
     * @returns chain Id
     */
    chainId() {
        return BigInt(this._chainParams.chainId);
    }
    /**
     * Returns the name of current chain
     * @returns chain name (lower case)
     */
    chainName() {
        return this._chainParams.name;
    }
    /**
     * Returns the Id of current network
     * @returns network Id
     */
    networkId() {
        return BigInt(this._chainParams.networkId);
    }
    /**
     * Returns the active EIPs
     * @returns List of EIPs
     */
    eips() {
        return this._eips;
    }
    /**
     * Returns the consensus type of the network
     * Possible values: "pow"|"poa"|"pos"
     *
     * Note: This value can update along a Hardfork.
     */
    consensusType() {
        const hardfork = this.hardfork();
        let value;
        for (const hfChanges of hardforks_1.hardforks) {
            if ('consensus' in hfChanges[1]) {
                value = hfChanges[1]['consensus']['type'];
            }
            if (hfChanges[0] === hardfork)
                break;
        }
        return value ?? this._chainParams['consensus']['type'];
    }
    /**
     * Returns the concrete consensus implementation
     * algorithm or protocol for the network
     * e.g. "ethash" for "pow" consensus type,
     * "clique" for "poa" consensus type or
     * "casper" for "pos" consensus type.
     *
     * Note: This value can update along a Hardfork.
     */
    consensusAlgorithm() {
        const hardfork = this.hardfork();
        let value;
        for (const hfChanges of hardforks_1.hardforks) {
            if ('consensus' in hfChanges[1]) {
                value = hfChanges[1]['consensus']['algorithm'];
            }
            if (hfChanges[0] === hardfork)
                break;
        }
        return value ?? this._chainParams['consensus']['algorithm'];
    }
    /**
     * Returns a dictionary with consensus configuration
     * parameters based on the consensus algorithm
     *
     * Expected returns (parameters must be present in
     * the respective chain json files):
     *
     * ethash: -
     * clique: period, epoch
     * aura: -
     * casper: -
     *
     * Note: This value can update along a Hardfork.
     */
    consensusConfig() {
        const hardfork = this.hardfork();
        let value;
        for (const hfChanges of hardforks_1.hardforks) {
            if ('consensus' in hfChanges[1]) {
                // The config parameter is named after the respective consensus algorithm
                value = hfChanges[1]['consensus'][hfChanges[1]['consensus']['algorithm']];
            }
            if (hfChanges[0] === hardfork)
                break;
        }
        return value ?? this._chainParams['consensus'][this.consensusAlgorithm()];
    }
    /**
     * Returns a deep copy of this {@link Common} instance.
     */
    copy() {
        const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        copy.removeAllListeners();
        return copy;
    }
    static _getInitializedChains(customChains) {
        const names = {};
        for (const [name, id] of Object.entries(enums_1.Chain)) {
            names[id] = name.toLowerCase();
        }
        const chains = { mainnet, ropsten, rinkeby, goerli, sepolia };
        if (customChains) {
            for (const chain of customChains) {
                const { name } = chain;
                names[chain.chainId.toString()] = name;
                chains[name] = chain;
            }
        }
        chains.names = names;
        return chains;
    }
}
exports.Common = Common;
//# sourceMappingURL=common.js.map