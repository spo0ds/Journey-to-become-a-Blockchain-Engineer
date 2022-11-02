"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvmErrorResult = exports.CodesizeExceedsMaximumError = exports.INVALID_EOF_RESULT = exports.INVALID_BYTECODE_RESULT = exports.COOGResult = exports.OOGResult = exports.EVM = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const AsyncEventEmitter = require("async-eventemitter");
const debug_1 = require("debug");
const util_1 = require("util");
const eof_1 = require("./eof");
const exceptions_1 = require("./exceptions");
const interpreter_1 = require("./interpreter");
const message_1 = require("./message");
const opcodes_1 = require("./opcodes");
const precompiles_1 = require("./precompiles");
const transientStorage_1 = require("./transientStorage");
const debug = (0, debug_1.debug)('evm');
const debugGas = (0, debug_1.debug)('evm:gas');
// very ugly way to detect if we are running in a browser
const isBrowser = new Function('try {return this===window;}catch(e){ return false;}');
let mcl;
let mclInitPromise;
if (isBrowser() === false) {
    mcl = require('mcl-wasm');
    mclInitPromise = mcl.init(mcl.BLS12_381);
}
/**
 * EVM is responsible for executing an EVM message fully
 * (including any nested calls and creates), processing the results
 * and storing them to state (or discarding changes in case of exceptions).
 * @ignore
 */
class EVM {
    constructor(opts) {
        this._isInitialized = false;
        /**
         * EVM is run in DEBUG mode (default: false)
         * Taken from DEBUG environment variable
         *
         * Safeguards on debug() calls are added for
         * performance reasons to avoid string literal evaluation
         * @hidden
         */
        this.DEBUG = false;
        this.events = new AsyncEventEmitter();
        this._optsCached = opts;
        this.eei = opts.eei;
        this._transientStorage = new transientStorage_1.TransientStorage();
        if (opts.common) {
            this._common = opts.common;
        }
        else {
            const DEFAULT_CHAIN = ethereumjs_common_1.Chain.Mainnet;
            this._common = new ethereumjs_common_1.Common({ chain: DEFAULT_CHAIN });
        }
        // Supported EIPs
        const supportedEIPs = [
            1153, 1559, 2315, 2537, 2565, 2718, 2929, 2930, 3074, 3198, 3529, 3540, 3541, 3607, 3651,
            3670, 3855, 3860, 4399, 5133,
        ];
        for (const eip of this._common.eips()) {
            if (!supportedEIPs.includes(eip)) {
                throw new Error(`EIP-${eip} is not supported by the EVM`);
            }
        }
        const supportedHardforks = [
            ethereumjs_common_1.Hardfork.Chainstart,
            ethereumjs_common_1.Hardfork.Homestead,
            ethereumjs_common_1.Hardfork.Dao,
            ethereumjs_common_1.Hardfork.TangerineWhistle,
            ethereumjs_common_1.Hardfork.SpuriousDragon,
            ethereumjs_common_1.Hardfork.Byzantium,
            ethereumjs_common_1.Hardfork.Constantinople,
            ethereumjs_common_1.Hardfork.Petersburg,
            ethereumjs_common_1.Hardfork.Istanbul,
            ethereumjs_common_1.Hardfork.MuirGlacier,
            ethereumjs_common_1.Hardfork.Berlin,
            ethereumjs_common_1.Hardfork.London,
            ethereumjs_common_1.Hardfork.ArrowGlacier,
            ethereumjs_common_1.Hardfork.GrayGlacier,
            ethereumjs_common_1.Hardfork.MergeForkIdTransition,
            ethereumjs_common_1.Hardfork.Merge,
        ];
        if (!supportedHardforks.includes(this._common.hardfork())) {
            throw new Error(`Hardfork ${this._common.hardfork()} not set as supported in supportedHardforks`);
        }
        this._allowUnlimitedContractSize = opts.allowUnlimitedContractSize ?? false;
        this._customOpcodes = opts.customOpcodes;
        this._customPrecompiles = opts.customPrecompiles;
        this._common.on('hardforkChanged', () => {
            this.getActiveOpcodes();
            this._precompiles = (0, precompiles_1.getActivePrecompiles)(this._common, this._customPrecompiles);
        });
        // Initialize the opcode data
        this.getActiveOpcodes();
        this._precompiles = (0, precompiles_1.getActivePrecompiles)(this._common, this._customPrecompiles);
        if (this._common.isActivatedEIP(2537)) {
            if (isBrowser() === true) {
                throw new Error('EIP-2537 is currently not supported in browsers');
            }
            else {
                this._mcl = mcl;
            }
        }
        // Safeguard if "process" is not available (browser)
        if (typeof process?.env.DEBUG !== 'undefined') {
            this.DEBUG = true;
        }
        // We cache this promisified function as it's called from the main execution loop, and
        // promisifying each time has a huge performance impact.
        this._emit = ((0, util_1.promisify)(this.events.emit.bind(this.events)));
    }
    get precompiles() {
        return this._precompiles;
    }
    get opcodes() {
        return this._opcodes;
    }
    /**
     * EVM async constructor. Creates engine instance and initializes it.
     *
     * @param opts EVM engine constructor options
     */
    static async create(opts) {
        const evm = new this(opts);
        await evm.init();
        return evm;
    }
    async init() {
        if (this._isInitialized) {
            return;
        }
        if (this._common.isActivatedEIP(2537)) {
            if (isBrowser() === true) {
                throw new Error('EIP-2537 is currently not supported in browsers');
            }
            else {
                const mcl = this._mcl;
                await mclInitPromise; // ensure that mcl is initialized.
                mcl.setMapToMode(mcl.IRTF); // set the right map mode; otherwise mapToG2 will return wrong values.
                mcl.verifyOrderG1(1); // subgroup checks for G1
                mcl.verifyOrderG2(1); // subgroup checks for G2
            }
        }
        this._isInitialized = true;
    }
    /**
     * Returns a list with the currently activated opcodes
     * available for EVM execution
     */
    getActiveOpcodes() {
        const data = (0, opcodes_1.getOpcodesForHF)(this._common, this._customOpcodes);
        this._opcodes = data.opcodes;
        this._dynamicGasHandlers = data.dynamicGasHandlers;
        this._handlers = data.handlers;
        return data.opcodes;
    }
    async _executeCall(message) {
        const account = await this.eei.getAccount(message.authcallOrigin ?? message.caller);
        let errorMessage;
        // Reduce tx value from sender
        if (!message.delegatecall) {
            try {
                await this._reduceSenderBalance(account, message);
            }
            catch (e) {
                errorMessage = e;
            }
        }
        // Load `to` account
        const toAccount = await this.eei.getAccount(message.to);
        // Add tx value to the `to` account
        if (!message.delegatecall) {
            try {
                await this._addToBalance(toAccount, message);
            }
            catch (e) {
                errorMessage = e;
            }
        }
        // Load code
        await this._loadCode(message);
        let exit = false;
        if (!message.code || message.code.length === 0) {
            exit = true;
            if (this.DEBUG) {
                debug(`Exit early on no code`);
            }
        }
        if (errorMessage !== undefined) {
            exit = true;
            if (this.DEBUG) {
                debug(`Exit early on value transfer overflowed`);
            }
        }
        if (exit) {
            return {
                execResult: {
                    gasRefund: message.gasRefund,
                    executionGasUsed: BigInt(0),
                    exceptionError: errorMessage,
                    returnValue: Buffer.alloc(0),
                },
            };
        }
        let result;
        if (message.isCompiled) {
            if (this.DEBUG) {
                debug(`Run precompile`);
            }
            result = await this.runPrecompile(message.code, message.data, message.gasLimit);
            result.gasRefund = message.gasRefund;
        }
        else {
            if (this.DEBUG) {
                debug(`Start bytecode processing...`);
            }
            result = await this.runInterpreter(message);
        }
        if (message.depth === 0) {
            this.postMessageCleanup();
        }
        return {
            execResult: result,
        };
    }
    async _executeCreate(message) {
        const account = await this.eei.getAccount(message.caller);
        // Reduce tx value from sender
        await this._reduceSenderBalance(account, message);
        if (this._common.isActivatedEIP(3860)) {
            if (message.data.length > Number(this._common.param('vm', 'maxInitCodeSize'))) {
                return {
                    createdAddress: message.to,
                    execResult: {
                        returnValue: Buffer.alloc(0),
                        exceptionError: new exceptions_1.EvmError(exceptions_1.ERROR.INITCODE_SIZE_VIOLATION),
                        executionGasUsed: message.gasLimit,
                    },
                };
            }
        }
        message.code = message.data;
        message.data = Buffer.alloc(0);
        message.to = await this._generateAddress(message);
        if (this.DEBUG) {
            debug(`Generated CREATE contract address ${message.to}`);
        }
        let toAccount = await this.eei.getAccount(message.to);
        // Check for collision
        if ((toAccount.nonce && toAccount.nonce > BigInt(0)) ||
            !toAccount.codeHash.equals(ethereumjs_util_1.KECCAK256_NULL)) {
            if (this.DEBUG) {
                debug(`Returning on address collision`);
            }
            return {
                createdAddress: message.to,
                execResult: {
                    returnValue: Buffer.alloc(0),
                    exceptionError: new exceptions_1.EvmError(exceptions_1.ERROR.CREATE_COLLISION),
                    executionGasUsed: message.gasLimit,
                },
            };
        }
        await this.eei.clearContractStorage(message.to);
        const newContractEvent = {
            address: message.to,
            code: message.code,
        };
        await this._emit('newContract', newContractEvent);
        toAccount = await this.eei.getAccount(message.to);
        // EIP-161 on account creation and CREATE execution
        if (this._common.gteHardfork(ethereumjs_common_1.Hardfork.SpuriousDragon)) {
            toAccount.nonce += BigInt(1);
        }
        // Add tx value to the `to` account
        let errorMessage;
        try {
            await this._addToBalance(toAccount, message);
        }
        catch (e) {
            errorMessage = e;
        }
        let exit = false;
        if (message.code === undefined || message.code.length === 0) {
            exit = true;
            if (this.DEBUG) {
                debug(`Exit early on no code`);
            }
        }
        if (errorMessage !== undefined) {
            exit = true;
            if (this.DEBUG) {
                debug(`Exit early on value transfer overflowed`);
            }
        }
        if (exit) {
            return {
                createdAddress: message.to,
                execResult: {
                    executionGasUsed: BigInt(0),
                    gasRefund: message.gasRefund,
                    exceptionError: errorMessage,
                    returnValue: Buffer.alloc(0),
                },
            };
        }
        if (this.DEBUG) {
            debug(`Start bytecode processing...`);
        }
        let result = await this.runInterpreter(message);
        // fee for size of the return value
        let totalGas = result.executionGasUsed;
        let returnFee = BigInt(0);
        if (!result.exceptionError) {
            returnFee =
                BigInt(result.returnValue.length) * BigInt(this._common.param('gasPrices', 'createData'));
            totalGas = totalGas + returnFee;
            if (this.DEBUG) {
                debugGas(`Add return value size fee (${returnFee} to gas used (-> ${totalGas}))`);
            }
        }
        // Check for SpuriousDragon EIP-170 code size limit
        let allowedCodeSize = true;
        if (!result.exceptionError &&
            this._common.gteHardfork(ethereumjs_common_1.Hardfork.SpuriousDragon) &&
            result.returnValue.length > Number(this._common.param('vm', 'maxCodeSize'))) {
            allowedCodeSize = false;
        }
        // If enough gas and allowed code size
        let CodestoreOOG = false;
        if (totalGas <= message.gasLimit && (this._allowUnlimitedContractSize || allowedCodeSize)) {
            if (this._common.isActivatedEIP(3541) && result.returnValue[0] === eof_1.EOF.FORMAT) {
                if (!this._common.isActivatedEIP(3540)) {
                    result = { ...result, ...INVALID_BYTECODE_RESULT(message.gasLimit) };
                }
                // Begin EOF1 contract code checks
                // EIP-3540 EOF1 header check
                const eof1CodeAnalysisResults = eof_1.EOF.codeAnalysis(result.returnValue);
                if (typeof eof1CodeAnalysisResults?.code === 'undefined') {
                    result = {
                        ...result,
                        ...INVALID_EOF_RESULT(message.gasLimit),
                    };
                }
                else if (this._common.isActivatedEIP(3670)) {
                    // EIP-3670 EOF1 opcode check
                    const codeStart = eof1CodeAnalysisResults.data > 0 ? 10 : 7;
                    // The start of the code section of an EOF1 compliant contract will either be
                    // index 7 (if no data section is present) or index 10 (if a data section is present)
                    // in the bytecode of the contract
                    if (!eof_1.EOF.validOpcodes(result.returnValue.slice(codeStart, codeStart + eof1CodeAnalysisResults.code))) {
                        result = {
                            ...result,
                            ...INVALID_EOF_RESULT(message.gasLimit),
                        };
                    }
                    else {
                        result.executionGasUsed = totalGas;
                    }
                }
            }
            else {
                result.executionGasUsed = totalGas;
            }
        }
        else {
            if (this._common.gteHardfork(ethereumjs_common_1.Hardfork.Homestead)) {
                if (this.DEBUG) {
                    debug(`Not enough gas or code size not allowed (>= Homestead)`);
                }
                result = { ...result, ...CodesizeExceedsMaximumError(message.gasLimit) };
            }
            else {
                // we are in Frontier
                if (this.DEBUG) {
                    debug(`Not enough gas or code size not allowed (Frontier)`);
                }
                if (totalGas - returnFee <= message.gasLimit) {
                    // we cannot pay the code deposit fee (but the deposit code actually did run)
                    result = { ...result, ...COOGResult(totalGas - returnFee) };
                    CodestoreOOG = true;
                }
                else {
                    result = { ...result, ...OOGResult(message.gasLimit) };
                }
            }
        }
        // Save code if a new contract was created
        if (!result.exceptionError &&
            result.returnValue !== undefined &&
            result.returnValue.length !== 0) {
            await this.eei.putContractCode(message.to, result.returnValue);
            if (this.DEBUG) {
                debug(`Code saved on new contract creation`);
            }
        }
        else if (CodestoreOOG) {
            // This only happens at Frontier. But, let's do a sanity check;
            if (!this._common.gteHardfork(ethereumjs_common_1.Hardfork.Homestead)) {
                // Pre-Homestead behavior; put an empty contract.
                // This contract would be considered "DEAD" in later hard forks.
                // It is thus an unecessary default item, which we have to save to dik
                // It does change the state root, but it only wastes storage.
                //await this._state.putContractCode(message.to, result.returnValue)
                const account = await this.eei.getAccount(message.to);
                await this.eei.putAccount(message.to, account);
            }
        }
        return {
            createdAddress: message.to,
            execResult: result,
        };
    }
    /**
     * Starts the actual bytecode processing for a CALL or CREATE, providing
     * it with the {@link EEI}.
     */
    async runInterpreter(message, opts = {}) {
        const env = {
            address: message.to ?? ethereumjs_util_1.Address.zero(),
            caller: message.caller ?? ethereumjs_util_1.Address.zero(),
            callData: message.data ?? Buffer.from([0]),
            callValue: message.value ?? BigInt(0),
            code: message.code,
            isStatic: message.isStatic ?? false,
            depth: message.depth ?? 0,
            gasPrice: this._tx.gasPrice,
            origin: this._tx.origin ?? message.caller ?? ethereumjs_util_1.Address.zero(),
            block: this._block ?? defaultBlock(),
            contract: await this.eei.getAccount(message.to ?? ethereumjs_util_1.Address.zero()),
            codeAddress: message.codeAddress,
            gasRefund: message.gasRefund,
        };
        const interpreter = new interpreter_1.Interpreter(this, this.eei, env, message.gasLimit);
        if (message.selfdestruct) {
            interpreter._result.selfdestruct = message.selfdestruct;
        }
        const interpreterRes = await interpreter.run(message.code, opts);
        let result = interpreter._result;
        let gasUsed = message.gasLimit - interpreterRes.runState.gasLeft;
        if (interpreterRes.exceptionError) {
            if (interpreterRes.exceptionError.error !== exceptions_1.ERROR.REVERT &&
                interpreterRes.exceptionError.error !== exceptions_1.ERROR.INVALID_EOF_FORMAT) {
                gasUsed = message.gasLimit;
            }
            // Clear the result on error
            result = {
                ...result,
                logs: [],
                selfdestruct: {},
            };
        }
        return {
            ...result,
            runState: {
                ...interpreterRes.runState,
                ...result,
                ...interpreter._env,
            },
            exceptionError: interpreterRes.exceptionError,
            gas: interpreterRes.runState?.gasLeft,
            executionGasUsed: gasUsed,
            gasRefund: interpreterRes.runState.gasRefund,
            returnValue: result.returnValue ? result.returnValue : Buffer.alloc(0),
        };
    }
    /**
     * Executes an EVM message, determining whether it's a call or create
     * based on the `to` address. It checkpoints the state and reverts changes
     * if an exception happens during the message execution.
     */
    async runCall(opts) {
        let message = opts.message;
        if (!message) {
            this._block = opts.block ?? defaultBlock();
            this._tx = {
                gasPrice: opts.gasPrice ?? BigInt(0),
                origin: opts.origin ?? opts.caller ?? ethereumjs_util_1.Address.zero(),
            };
            const caller = opts.caller ?? ethereumjs_util_1.Address.zero();
            const value = opts.value ?? BigInt(0);
            if (opts.skipBalance === true) {
                const callerAccount = await this.eei.getAccount(caller);
                if (callerAccount.balance < value) {
                    // if skipBalance and balance less than value, set caller balance to `value` to ensure sufficient funds
                    callerAccount.balance = value;
                    await this.eei.putAccount(caller, callerAccount);
                }
            }
            message = new message_1.Message({
                caller,
                gasLimit: opts.gasLimit ?? BigInt(0xffffff),
                to: opts.to,
                value,
                data: opts.data,
                code: opts.code,
                depth: opts.depth,
                isCompiled: opts.isCompiled,
                isStatic: opts.isStatic,
                salt: opts.salt,
                selfdestruct: opts.selfdestruct ?? {},
                delegatecall: opts.delegatecall,
            });
        }
        await this._emit('beforeMessage', message);
        if (!message.to && this._common.isActivatedEIP(2929) === true) {
            message.code = message.data;
            this.eei.addWarmedAddress((await this._generateAddress(message)).buf);
        }
        await this.eei.checkpoint();
        this._transientStorage.checkpoint();
        if (this.DEBUG) {
            debug('-'.repeat(100));
            debug(`message checkpoint`);
        }
        let result;
        if (this.DEBUG) {
            const { caller, gasLimit, to, value, delegatecall } = message;
            debug(`New message caller=${caller} gasLimit=${gasLimit} to=${to?.toString() ?? 'none'} value=${value} delegatecall=${delegatecall ? 'yes' : 'no'}`);
        }
        if (message.to) {
            if (this.DEBUG) {
                debug(`Message CALL execution (to: ${message.to})`);
            }
            result = await this._executeCall(message);
        }
        else {
            if (this.DEBUG) {
                debug(`Message CREATE execution (to undefined)`);
            }
            result = await this._executeCreate(message);
        }
        if (this.DEBUG) {
            const { executionGasUsed, exceptionError, returnValue } = result.execResult;
            debug(`Received message execResult: [ gasUsed=${executionGasUsed} exceptionError=${exceptionError ? `'${exceptionError.error}'` : 'none'} returnValue=0x${(0, ethereumjs_util_1.short)(returnValue)} gasRefund=${result.execResult.gasRefund ?? 0} ]`);
        }
        const err = result.execResult.exceptionError;
        // This clause captures any error which happened during execution
        // If that is the case, then all refunds are forfeited
        if (err) {
            result.execResult.selfdestruct = {};
            result.execResult.gasRefund = BigInt(0);
        }
        if (err) {
            if (this._common.gteHardfork(ethereumjs_common_1.Hardfork.Homestead) ||
                err.error !== exceptions_1.ERROR.CODESTORE_OUT_OF_GAS) {
                result.execResult.logs = [];
                await this.eei.revert();
                this._transientStorage.revert();
                if (this.DEBUG) {
                    debug(`message checkpoint reverted`);
                }
            }
            else {
                // we are in chainstart and the error was the code deposit error
                // we do like nothing happened.
                await this.eei.commit();
                this._transientStorage.commit();
                if (this.DEBUG) {
                    debug(`message checkpoint committed`);
                }
            }
        }
        else {
            await this.eei.commit();
            this._transientStorage.commit();
            if (this.DEBUG) {
                debug(`message checkpoint committed`);
            }
        }
        await this._emit('afterMessage', result);
        return result;
    }
    /**
     * Bound to the global VM and therefore
     * shouldn't be used directly from the evm class
     */
    async runCode(opts) {
        this._block = opts.block ?? defaultBlock();
        this._tx = {
            gasPrice: opts.gasPrice ?? BigInt(0),
            origin: opts.origin ?? opts.caller ?? ethereumjs_util_1.Address.zero(),
        };
        const message = new message_1.Message({
            code: opts.code,
            data: opts.data,
            gasLimit: opts.gasLimit,
            to: opts.address ?? ethereumjs_util_1.Address.zero(),
            caller: opts.caller,
            value: opts.value,
            depth: opts.depth,
            selfdestruct: opts.selfdestruct ?? {},
            isStatic: opts.isStatic,
        });
        return this.runInterpreter(message, { pc: opts.pc });
    }
    /**
     * Returns code for precompile at the given address, or undefined
     * if no such precompile exists.
     */
    getPrecompile(address) {
        return this.precompiles.get(address.buf.toString('hex'));
    }
    /**
     * Executes a precompiled contract with given data and gas limit.
     */
    runPrecompile(code, data, gasLimit) {
        if (typeof code !== 'function') {
            throw new Error('Invalid precompile');
        }
        const opts = {
            data,
            gasLimit,
            _common: this._common,
            _EVM: this,
        };
        return code(opts);
    }
    async _loadCode(message) {
        if (!message.code) {
            const precompile = this.getPrecompile(message.codeAddress);
            if (precompile) {
                message.code = precompile;
                message.isCompiled = true;
            }
            else {
                message.code = await this.eei.getContractCode(message.codeAddress);
                message.isCompiled = false;
            }
        }
    }
    async _generateAddress(message) {
        let addr;
        if (message.salt) {
            addr = (0, ethereumjs_util_1.generateAddress2)(message.caller.buf, message.salt, message.code);
        }
        else {
            const acc = await this.eei.getAccount(message.caller);
            let newNonce = acc.nonce;
            if (message.depth > 0) {
                newNonce--;
            }
            addr = (0, ethereumjs_util_1.generateAddress)(message.caller.buf, (0, ethereumjs_util_1.bigIntToBuffer)(newNonce));
        }
        return new ethereumjs_util_1.Address(addr);
    }
    async _reduceSenderBalance(account, message) {
        account.balance -= message.value;
        if (account.balance < BigInt(0)) {
            throw new exceptions_1.EvmError(exceptions_1.ERROR.INSUFFICIENT_BALANCE);
        }
        const result = this.eei.putAccount(message.authcallOrigin ?? message.caller, account);
        if (this.DEBUG) {
            debug(`Reduced sender (${message.caller}) balance (-> ${account.balance})`);
        }
        return result;
    }
    async _addToBalance(toAccount, message) {
        const newBalance = toAccount.balance + message.value;
        if (newBalance > ethereumjs_util_1.MAX_INTEGER) {
            throw new exceptions_1.EvmError(exceptions_1.ERROR.VALUE_OVERFLOW);
        }
        toAccount.balance = newBalance;
        // putAccount as the nonce may have changed for contract creation
        const result = this.eei.putAccount(message.to, toAccount);
        if (this.DEBUG) {
            debug(`Added toAccount (${message.to}) balance (-> ${toAccount.balance})`);
        }
        return result;
    }
    async _touchAccount(address) {
        const account = await this.eei.getAccount(address);
        return this.eei.putAccount(address, account);
    }
    /**
     * Once the interpreter has finished depth 0, a post-message cleanup should be done
     */
    postMessageCleanup() {
        if (this._common.isActivatedEIP(1153))
            this._transientStorage.clear();
    }
    copy() {
        const opts = {
            ...this._optsCached,
            common: this._common.copy(),
            eei: this.eei.copy(),
        };
        return new EVM(opts);
    }
}
exports.EVM = EVM;
function OOGResult(gasLimit) {
    return {
        returnValue: Buffer.alloc(0),
        executionGasUsed: gasLimit,
        exceptionError: new exceptions_1.EvmError(exceptions_1.ERROR.OUT_OF_GAS),
    };
}
exports.OOGResult = OOGResult;
// CodeDeposit OOG Result
function COOGResult(gasUsedCreateCode) {
    return {
        returnValue: Buffer.alloc(0),
        executionGasUsed: gasUsedCreateCode,
        exceptionError: new exceptions_1.EvmError(exceptions_1.ERROR.CODESTORE_OUT_OF_GAS),
    };
}
exports.COOGResult = COOGResult;
function INVALID_BYTECODE_RESULT(gasLimit) {
    return {
        returnValue: Buffer.alloc(0),
        executionGasUsed: gasLimit,
        exceptionError: new exceptions_1.EvmError(exceptions_1.ERROR.INVALID_BYTECODE_RESULT),
    };
}
exports.INVALID_BYTECODE_RESULT = INVALID_BYTECODE_RESULT;
function INVALID_EOF_RESULT(gasLimit) {
    return {
        returnValue: Buffer.alloc(0),
        executionGasUsed: gasLimit,
        exceptionError: new exceptions_1.EvmError(exceptions_1.ERROR.INVALID_EOF_FORMAT),
    };
}
exports.INVALID_EOF_RESULT = INVALID_EOF_RESULT;
function CodesizeExceedsMaximumError(gasUsed) {
    return {
        returnValue: Buffer.alloc(0),
        executionGasUsed: gasUsed,
        exceptionError: new exceptions_1.EvmError(exceptions_1.ERROR.CODESIZE_EXCEEDS_MAXIMUM),
    };
}
exports.CodesizeExceedsMaximumError = CodesizeExceedsMaximumError;
function EvmErrorResult(error, gasUsed) {
    return {
        returnValue: Buffer.alloc(0),
        executionGasUsed: gasUsed,
        exceptionError: error,
    };
}
exports.EvmErrorResult = EvmErrorResult;
function defaultBlock() {
    return {
        header: {
            number: BigInt(0),
            cliqueSigner: () => ethereumjs_util_1.Address.zero(),
            coinbase: ethereumjs_util_1.Address.zero(),
            timestamp: BigInt(0),
            difficulty: BigInt(0),
            prevRandao: (0, ethereumjs_util_1.zeros)(32),
            gasLimit: BigInt(0),
            baseFeePerGas: undefined,
        },
    };
}
//# sourceMappingURL=evm.js.map