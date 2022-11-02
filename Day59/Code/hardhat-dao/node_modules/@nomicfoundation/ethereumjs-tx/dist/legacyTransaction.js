"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const keccak_1 = require("ethereum-cryptography/keccak");
const baseTransaction_1 = require("./baseTransaction");
const types_1 = require("./types");
const util_1 = require("./util");
const TRANSACTION_TYPE = 0;
function meetsEIP155(_v, chainId) {
    const v = Number(_v);
    const chainIdDoubled = Number(chainId) * 2;
    return v === chainIdDoubled + 35 || v === chainIdDoubled + 36;
}
/**
 * An Ethereum non-typed (legacy) transaction
 */
class Transaction extends baseTransaction_1.BaseTransaction {
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     *
     * It is not recommended to use this constructor directly. Instead use
     * the static factory methods to assist in creating a Transaction object from
     * varying data types.
     */
    constructor(txData, opts = {}) {
        super({ ...txData, type: TRANSACTION_TYPE }, opts);
        this.common = this._validateTxV(this.v, opts.common);
        this.gasPrice = (0, ethereumjs_util_1.bufferToBigInt)((0, ethereumjs_util_1.toBuffer)(txData.gasPrice === '' ? '0x' : txData.gasPrice));
        if (this.gasPrice * this.gasLimit > ethereumjs_util_1.MAX_INTEGER) {
            const msg = this._errorMsg('gas limit * gasPrice cannot exceed MAX_INTEGER (2^256-1)');
            throw new Error(msg);
        }
        this._validateCannotExceedMaxInteger({ gasPrice: this.gasPrice });
        if (this.common.gteHardfork('spuriousDragon')) {
            if (!this.isSigned()) {
                this.activeCapabilities.push(types_1.Capability.EIP155ReplayProtection);
            }
            else {
                // EIP155 spec:
                // If block.number >= 2,675,000 and v = CHAIN_ID * 2 + 35 or v = CHAIN_ID * 2 + 36
                // then when computing the hash of a transaction for purposes of signing or recovering
                // instead of hashing only the first six elements (i.e. nonce, gasprice, startgas, to, value, data)
                // hash nine elements, with v replaced by CHAIN_ID, r = 0 and s = 0.
                // v and chain ID meet EIP-155 conditions
                if (meetsEIP155(this.v, this.common.chainId())) {
                    this.activeCapabilities.push(types_1.Capability.EIP155ReplayProtection);
                }
            }
        }
        if (this.common.isActivatedEIP(3860)) {
            (0, util_1.checkMaxInitCodeSize)(this.common, this.data.length);
        }
        const freeze = opts?.freeze ?? true;
        if (freeze) {
            Object.freeze(this);
        }
    }
    /**
     * Instantiate a transaction from a data dictionary.
     *
     * Format: { nonce, gasPrice, gasLimit, to, value, data, v, r, s }
     *
     * Notes:
     * - All parameters are optional and have some basic default values
     */
    static fromTxData(txData, opts = {}) {
        return new Transaction(txData, opts);
    }
    /**
     * Instantiate a transaction from the serialized tx.
     *
     * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
     */
    static fromSerializedTx(serialized, opts = {}) {
        const values = (0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(serialized)));
        if (!Array.isArray(values)) {
            throw new Error('Invalid serialized tx input. Must be array');
        }
        return this.fromValuesArray(values, opts);
    }
    /**
     * Create a transaction from a values array.
     *
     * Format: `[nonce, gasPrice, gasLimit, to, value, data, v, r, s]`
     */
    static fromValuesArray(values, opts = {}) {
        // If length is not 6, it has length 9. If v/r/s are empty Buffers, it is still an unsigned transaction
        // This happens if you get the RLP data from `raw()`
        if (values.length !== 6 && values.length !== 9) {
            throw new Error('Invalid transaction. Only expecting 6 values (for unsigned tx) or 9 values (for signed tx).');
        }
        const [nonce, gasPrice, gasLimit, to, value, data, v, r, s] = values;
        (0, ethereumjs_util_1.validateNoLeadingZeroes)({ nonce, gasPrice, gasLimit, value, v, r, s });
        return new Transaction({
            nonce,
            gasPrice,
            gasLimit,
            to,
            value,
            data,
            v,
            r,
            s,
        }, opts);
    }
    /**
     * Returns a Buffer Array of the raw Buffers of the legacy transaction, in order.
     *
     * Format: `[nonce, gasPrice, gasLimit, to, value, data, v, r, s]`
     *
     * For legacy txs this is also the correct format to add transactions
     * to a block with {@link Block.fromValuesArray} (use the `serialize()` method
     * for typed txs).
     *
     * For an unsigned tx this method returns the empty Buffer values
     * for the signature parameters `v`, `r` and `s`. For an EIP-155 compliant
     * representation have a look at {@link Transaction.getMessageToSign}.
     */
    raw() {
        return [
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.nonce),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.gasPrice),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.gasLimit),
            this.to !== undefined ? this.to.buf : Buffer.from([]),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.value),
            this.data,
            this.v !== undefined ? (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.v) : Buffer.from([]),
            this.r !== undefined ? (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.r) : Buffer.from([]),
            this.s !== undefined ? (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.s) : Buffer.from([]),
        ];
    }
    /**
     * Returns the serialized encoding of the legacy transaction.
     *
     * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
     *
     * For an unsigned tx this method uses the empty Buffer values for the
     * signature parameters `v`, `r` and `s` for encoding. For an EIP-155 compliant
     * representation for external signing use {@link Transaction.getMessageToSign}.
     */
    serialize() {
        return Buffer.from(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(this.raw())));
    }
    _getMessageToSign() {
        const values = [
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.nonce),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.gasPrice),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.gasLimit),
            this.to !== undefined ? this.to.buf : Buffer.from([]),
            (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(this.value),
            this.data,
        ];
        if (this.supports(types_1.Capability.EIP155ReplayProtection)) {
            values.push((0, ethereumjs_util_1.toBuffer)(this.common.chainId()));
            values.push((0, ethereumjs_util_1.unpadBuffer)((0, ethereumjs_util_1.toBuffer)(0)));
            values.push((0, ethereumjs_util_1.unpadBuffer)((0, ethereumjs_util_1.toBuffer)(0)));
        }
        return values;
    }
    getMessageToSign(hashMessage = true) {
        const message = this._getMessageToSign();
        if (hashMessage) {
            return Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(message)))));
        }
        else {
            return message;
        }
    }
    /**
     * The amount of gas paid for the data in this tx
     */
    getDataFee() {
        if (this.cache.dataFee && this.cache.dataFee.hardfork === this.common.hardfork()) {
            return this.cache.dataFee.value;
        }
        if (Object.isFrozen(this)) {
            this.cache.dataFee = {
                value: super.getDataFee(),
                hardfork: this.common.hardfork(),
            };
        }
        return super.getDataFee();
    }
    /**
     * The up front amount that an account must have for this transaction to be valid
     */
    getUpfrontCost() {
        return this.gasLimit * this.gasPrice + this.value;
    }
    /**
     * Computes a sha3-256 hash of the serialized tx.
     *
     * This method can only be used for signed txs (it throws otherwise).
     * Use {@link Transaction.getMessageToSign} to get a tx hash for the purpose of signing.
     */
    hash() {
        if (!this.isSigned()) {
            const msg = this._errorMsg('Cannot call hash method if transaction is not signed');
            throw new Error(msg);
        }
        if (Object.isFrozen(this)) {
            if (!this.cache.hash) {
                this.cache.hash = Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(this.raw())))));
            }
            return this.cache.hash;
        }
        return Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(this.raw())))));
    }
    /**
     * Computes a sha3-256 hash which can be used to verify the signature
     */
    getMessageToVerifySignature() {
        if (!this.isSigned()) {
            const msg = this._errorMsg('This transaction is not signed');
            throw new Error(msg);
        }
        const message = this._getMessageToSign();
        return Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(message)))));
    }
    /**
     * Returns the public key of the sender
     */
    getSenderPublicKey() {
        const msgHash = this.getMessageToVerifySignature();
        const { v, r, s } = this;
        this._validateHighS();
        try {
            return (0, ethereumjs_util_1.ecrecover)(msgHash, v, (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(r), (0, ethereumjs_util_1.bigIntToUnpaddedBuffer)(s), this.supports(types_1.Capability.EIP155ReplayProtection) ? this.common.chainId() : undefined);
        }
        catch (e) {
            const msg = this._errorMsg('Invalid Signature');
            throw new Error(msg);
        }
    }
    /**
     * Process the v, r, s values from the `sign` method of the base transaction.
     */
    _processSignature(v, r, s) {
        if (this.supports(types_1.Capability.EIP155ReplayProtection)) {
            v += this.common.chainId() * BigInt(2) + BigInt(8);
        }
        const opts = { ...this.txOptions, common: this.common };
        return Transaction.fromTxData({
            nonce: this.nonce,
            gasPrice: this.gasPrice,
            gasLimit: this.gasLimit,
            to: this.to,
            value: this.value,
            data: this.data,
            v,
            r: (0, ethereumjs_util_1.bufferToBigInt)(r),
            s: (0, ethereumjs_util_1.bufferToBigInt)(s),
        }, opts);
    }
    /**
     * Returns an object with the JSON representation of the transaction.
     */
    toJSON() {
        return {
            nonce: (0, ethereumjs_util_1.bigIntToHex)(this.nonce),
            gasPrice: (0, ethereumjs_util_1.bigIntToHex)(this.gasPrice),
            gasLimit: (0, ethereumjs_util_1.bigIntToHex)(this.gasLimit),
            to: this.to !== undefined ? this.to.toString() : undefined,
            value: (0, ethereumjs_util_1.bigIntToHex)(this.value),
            data: '0x' + this.data.toString('hex'),
            v: this.v !== undefined ? (0, ethereumjs_util_1.bigIntToHex)(this.v) : undefined,
            r: this.r !== undefined ? (0, ethereumjs_util_1.bigIntToHex)(this.r) : undefined,
            s: this.s !== undefined ? (0, ethereumjs_util_1.bigIntToHex)(this.s) : undefined,
        };
    }
    /**
     * Validates tx's `v` value
     */
    _validateTxV(_v, common) {
        let chainIdBigInt;
        const v = _v !== undefined ? Number(_v) : undefined;
        // Check for valid v values in the scope of a signed legacy tx
        if (v !== undefined) {
            // v is 1. not matching the EIP-155 chainId included case and...
            // v is 2. not matching the classic v=27 or v=28 case
            if (v < 37 && v !== 27 && v !== 28) {
                throw new Error(`Legacy txs need either v = 27/28 or v >= 37 (EIP-155 replay protection), got v = ${v}`);
            }
        }
        // No unsigned tx and EIP-155 activated and chain ID included
        if (v !== undefined &&
            v !== 0 &&
            (!common || common.gteHardfork('spuriousDragon')) &&
            v !== 27 &&
            v !== 28) {
            if (common) {
                if (!meetsEIP155(BigInt(v), common.chainId())) {
                    throw new Error(`Incompatible EIP155-based V ${v} and chain id ${common.chainId()}. See the Common parameter of the Transaction constructor to set the chain id.`);
                }
            }
            else {
                // Derive the original chain ID
                let numSub;
                if ((v - 35) % 2 === 0) {
                    numSub = 35;
                }
                else {
                    numSub = 36;
                }
                // Use derived chain ID to create a proper Common
                chainIdBigInt = BigInt(v - numSub) / BigInt(2);
            }
        }
        return this._getCommon(common, chainIdBigInt);
    }
    /**
     * Return a compact error string representation of the object
     */
    errorStr() {
        let errorStr = this._getSharedErrorPostfix();
        errorStr += ` gasPrice=${this.gasPrice}`;
        return errorStr;
    }
    /**
     * Internal helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    _errorMsg(msg) {
        return `${msg} (${this.errorStr()})`;
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=legacyTransaction.js.map