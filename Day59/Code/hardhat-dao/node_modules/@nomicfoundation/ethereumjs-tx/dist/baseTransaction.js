"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTransaction = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const types_1 = require("./types");
/**
 * This base class will likely be subject to further
 * refactoring along the introduction of additional tx types
 * on the Ethereum network.
 *
 * It is therefore not recommended to use directly.
 */
class BaseTransaction {
    constructor(txData, opts) {
        this.cache = {
            hash: undefined,
            dataFee: undefined,
        };
        /**
         * List of tx type defining EIPs,
         * e.g. 1559 (fee market) and 2930 (access lists)
         * for FeeMarketEIP1559Transaction objects
         */
        this.activeCapabilities = [];
        /**
         * The default chain the tx falls back to if no Common
         * is provided and if the chain can't be derived from
         * a passed in chainId (only EIP-2718 typed txs) or
         * EIP-155 signature (legacy txs).
         *
         * @hidden
         */
        this.DEFAULT_CHAIN = ethereumjs_common_1.Chain.Mainnet;
        /**
         * The default HF if the tx type is active on that HF
         * or the first greater HF where the tx is active.
         *
         * @hidden
         */
        this.DEFAULT_HARDFORK = ethereumjs_common_1.Hardfork.Merge;
        const { nonce, gasLimit, to, value, data, v, r, s, type } = txData;
        this._type = Number((0, ethereumjs_util_1.bufferToBigInt)((0, ethereumjs_util_1.toBuffer)(type)));
        this.txOptions = opts;
        const toB = (0, ethereumjs_util_1.toBuffer)(to === '' ? '0x' : to);
        const vB = (0, ethereumjs_util_1.toBuffer)(v === '' ? '0x' : v);
        const rB = (0, ethereumjs_util_1.toBuffer)(r === '' ? '0x' : r);
        const sB = (0, ethereumjs_util_1.toBuffer)(s === '' ? '0x' : s);
        this.nonce = (0, ethereumjs_util_1.bufferToBigInt)((0, ethereumjs_util_1.toBuffer)(nonce === '' ? '0x' : nonce));
        this.gasLimit = (0, ethereumjs_util_1.bufferToBigInt)((0, ethereumjs_util_1.toBuffer)(gasLimit === '' ? '0x' : gasLimit));
        this.to = toB.length > 0 ? new ethereumjs_util_1.Address(toB) : undefined;
        this.value = (0, ethereumjs_util_1.bufferToBigInt)((0, ethereumjs_util_1.toBuffer)(value === '' ? '0x' : value));
        this.data = (0, ethereumjs_util_1.toBuffer)(data === '' ? '0x' : data);
        this.v = vB.length > 0 ? (0, ethereumjs_util_1.bufferToBigInt)(vB) : undefined;
        this.r = rB.length > 0 ? (0, ethereumjs_util_1.bufferToBigInt)(rB) : undefined;
        this.s = sB.length > 0 ? (0, ethereumjs_util_1.bufferToBigInt)(sB) : undefined;
        this._validateCannotExceedMaxInteger({ value: this.value, r: this.r, s: this.s });
        // geth limits gasLimit to 2^64-1
        this._validateCannotExceedMaxInteger({ gasLimit: this.gasLimit }, 64);
        // EIP-2681 limits nonce to 2^64-1 (cannot equal 2^64-1)
        this._validateCannotExceedMaxInteger({ nonce: this.nonce }, 64, true);
    }
    /**
     * Returns the transaction type.
     *
     * Note: legacy txs will return tx type `0`.
     */
    get type() {
        return this._type;
    }
    /**
     * Checks if a tx type defining capability is active
     * on a tx, for example the EIP-1559 fee market mechanism
     * or the EIP-2930 access list feature.
     *
     * Note that this is different from the tx type itself,
     * so EIP-2930 access lists can very well be active
     * on an EIP-1559 tx for example.
     *
     * This method can be useful for feature checks if the
     * tx type is unknown (e.g. when instantiated with
     * the tx factory).
     *
     * See `Capabilites` in the `types` module for a reference
     * on all supported capabilities.
     */
    supports(capability) {
        return this.activeCapabilities.includes(capability);
    }
    validate(stringError = false) {
        const errors = [];
        if (this.getBaseFee() > this.gasLimit) {
            errors.push(`gasLimit is too low. given ${this.gasLimit}, need at least ${this.getBaseFee()}`);
        }
        if (this.isSigned() && !this.verifySignature()) {
            errors.push('Invalid Signature');
        }
        return stringError ? errors : errors.length === 0;
    }
    _validateYParity() {
        const { v } = this;
        if (v !== undefined && v !== BigInt(0) && v !== BigInt(1)) {
            const msg = this._errorMsg('The y-parity of the transaction should either be 0 or 1');
            throw new Error(msg);
        }
    }
    /**
     * EIP-2: All transaction signatures whose s-value is greater than secp256k1n/2are considered invalid.
     * Reasoning: https://ethereum.stackexchange.com/a/55728
     */
    _validateHighS() {
        const { s } = this;
        if (this.common.gteHardfork('homestead') && s !== undefined && s > ethereumjs_util_1.SECP256K1_ORDER_DIV_2) {
            const msg = this._errorMsg('Invalid Signature: s-values greater than secp256k1n/2 are considered invalid');
            throw new Error(msg);
        }
    }
    /**
     * The minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
     */
    getBaseFee() {
        const txFee = this.common.param('gasPrices', 'tx');
        let fee = this.getDataFee();
        if (txFee)
            fee += txFee;
        if (this.common.gteHardfork('homestead') && this.toCreationAddress()) {
            const txCreationFee = this.common.param('gasPrices', 'txCreation');
            if (txCreationFee)
                fee += txCreationFee;
        }
        return fee;
    }
    /**
     * The amount of gas paid for the data in this tx
     */
    getDataFee() {
        const txDataZero = this.common.param('gasPrices', 'txDataZero');
        const txDataNonZero = this.common.param('gasPrices', 'txDataNonZero');
        let cost = BigInt(0);
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] === 0 ? (cost += txDataZero) : (cost += txDataNonZero);
        }
        if ((this.to === undefined || this.to === null) && this.common.isActivatedEIP(3860)) {
            const dataLength = BigInt(Math.ceil(this.data.length / 32));
            const initCodeCost = this.common.param('gasPrices', 'initCodeWordCost') * dataLength;
            cost += initCodeCost;
        }
        return cost;
    }
    /**
     * If the tx's `to` is to the creation address
     */
    toCreationAddress() {
        return this.to === undefined || this.to.buf.length === 0;
    }
    isSigned() {
        const { v, r, s } = this;
        if (v === undefined || r === undefined || s === undefined) {
            return false;
        }
        else {
            return true;
        }
    }
    /**
     * Determines if the signature is valid
     */
    verifySignature() {
        try {
            // Main signature verification is done in `getSenderPublicKey()`
            const publicKey = this.getSenderPublicKey();
            return (0, ethereumjs_util_1.unpadBuffer)(publicKey).length !== 0;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Returns the sender's address
     */
    getSenderAddress() {
        return new ethereumjs_util_1.Address((0, ethereumjs_util_1.publicToAddress)(this.getSenderPublicKey()));
    }
    /**
     * Signs a transaction.
     *
     * Note that the signed tx is returned as a new object,
     * use as follows:
     * ```javascript
     * const signedTx = tx.sign(privateKey)
     * ```
     */
    sign(privateKey) {
        if (privateKey.length !== 32) {
            const msg = this._errorMsg('Private key must be 32 bytes in length.');
            throw new Error(msg);
        }
        // Hack for the constellation that we have got a legacy tx after spuriousDragon with a non-EIP155 conforming signature
        // and want to recreate a signature (where EIP155 should be applied)
        // Leaving this hack lets the legacy.spec.ts -> sign(), verifySignature() test fail
        // 2021-06-23
        let hackApplied = false;
        if (this.type === 0 &&
            this.common.gteHardfork('spuriousDragon') &&
            !this.supports(types_1.Capability.EIP155ReplayProtection)) {
            this.activeCapabilities.push(types_1.Capability.EIP155ReplayProtection);
            hackApplied = true;
        }
        const msgHash = this.getMessageToSign(true);
        const { v, r, s } = (0, ethereumjs_util_1.ecsign)(msgHash, privateKey);
        const tx = this._processSignature(v, r, s);
        // Hack part 2
        if (hackApplied) {
            const index = this.activeCapabilities.indexOf(types_1.Capability.EIP155ReplayProtection);
            if (index > -1) {
                this.activeCapabilities.splice(index, 1);
            }
        }
        return tx;
    }
    /**
     * Does chain ID checks on common and returns a common
     * to be used on instantiation
     * @hidden
     *
     * @param common - {@link Common} instance from tx options
     * @param chainId - Chain ID from tx options (typed txs) or signature (legacy tx)
     */
    _getCommon(common, chainId) {
        // Chain ID provided
        if (chainId !== undefined) {
            const chainIdBigInt = (0, ethereumjs_util_1.bufferToBigInt)((0, ethereumjs_util_1.toBuffer)(chainId));
            if (common) {
                if (common.chainId() !== chainIdBigInt) {
                    const msg = this._errorMsg('The chain ID does not match the chain ID of Common');
                    throw new Error(msg);
                }
                // Common provided, chain ID does match
                // -> Return provided Common
                return common.copy();
            }
            else {
                if (ethereumjs_common_1.Common.isSupportedChainId(chainIdBigInt)) {
                    // No Common, chain ID supported by Common
                    // -> Instantiate Common with chain ID
                    return new ethereumjs_common_1.Common({ chain: chainIdBigInt, hardfork: this.DEFAULT_HARDFORK });
                }
                else {
                    // No Common, chain ID not supported by Common
                    // -> Instantiate custom Common derived from DEFAULT_CHAIN
                    return ethereumjs_common_1.Common.custom({
                        name: 'custom-chain',
                        networkId: chainIdBigInt,
                        chainId: chainIdBigInt,
                    }, { baseChain: this.DEFAULT_CHAIN, hardfork: this.DEFAULT_HARDFORK });
                }
            }
        }
        else {
            // No chain ID provided
            // -> return Common provided or create new default Common
            return (common?.copy() ?? new ethereumjs_common_1.Common({ chain: this.DEFAULT_CHAIN, hardfork: this.DEFAULT_HARDFORK }));
        }
    }
    /**
     * Validates that an object with BigInt values cannot exceed the specified bit limit.
     * @param values Object containing string keys and BigInt values
     * @param bits Number of bits to check (64 or 256)
     * @param cannotEqual Pass true if the number also cannot equal one less the maximum value
     */
    _validateCannotExceedMaxInteger(values, bits = 256, cannotEqual = false) {
        for (const [key, value] of Object.entries(values)) {
            switch (bits) {
                case 64:
                    if (cannotEqual) {
                        if (value !== undefined && value >= ethereumjs_util_1.MAX_UINT64) {
                            const msg = this._errorMsg(`${key} cannot equal or exceed MAX_UINT64 (2^64-1), given ${value}`);
                            throw new Error(msg);
                        }
                    }
                    else {
                        if (value !== undefined && value > ethereumjs_util_1.MAX_UINT64) {
                            const msg = this._errorMsg(`${key} cannot exceed MAX_UINT64 (2^64-1), given ${value}`);
                            throw new Error(msg);
                        }
                    }
                    break;
                case 256:
                    if (cannotEqual) {
                        if (value !== undefined && value >= ethereumjs_util_1.MAX_INTEGER) {
                            const msg = this._errorMsg(`${key} cannot equal or exceed MAX_INTEGER (2^256-1), given ${value}`);
                            throw new Error(msg);
                        }
                    }
                    else {
                        if (value !== undefined && value > ethereumjs_util_1.MAX_INTEGER) {
                            const msg = this._errorMsg(`${key} cannot exceed MAX_INTEGER (2^256-1), given ${value}`);
                            throw new Error(msg);
                        }
                    }
                    break;
                default: {
                    const msg = this._errorMsg('unimplemented bits value');
                    throw new Error(msg);
                }
            }
        }
    }
    /**
     * Returns the shared error postfix part for _error() method
     * tx type implementations.
     */
    _getSharedErrorPostfix() {
        let hash = '';
        try {
            hash = this.isSigned() ? (0, ethereumjs_util_1.bufferToHex)(this.hash()) : 'not available (unsigned)';
        }
        catch (e) {
            hash = 'error';
        }
        let isSigned = '';
        try {
            isSigned = this.isSigned().toString();
        }
        catch (e) {
            hash = 'error';
        }
        let hf = '';
        try {
            hf = this.common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        let postfix = `tx type=${this.type} hash=${hash} nonce=${this.nonce} value=${this.value} `;
        postfix += `signed=${isSigned} hf=${hf}`;
        return postfix;
    }
}
exports.BaseTransaction = BaseTransaction;
//# sourceMappingURL=baseTransaction.js.map