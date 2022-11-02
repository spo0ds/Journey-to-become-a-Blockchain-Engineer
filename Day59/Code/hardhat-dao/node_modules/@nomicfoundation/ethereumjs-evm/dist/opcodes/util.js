"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exponentation = exports.abs = exports.toTwos = exports.fromTwos = exports.mod = exports.updateSstoreGas = exports.writeCallOutput = exports.subMemUsage = exports.maxCallGas = exports.jumpSubIsValid = exports.jumpIsValid = exports.getFullname = exports.getDataSlice = exports.divCeil = exports.describeLocation = exports.addressToBuffer = exports.trap = exports.setLengthLeftStorage = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const keccak_1 = require("ethereum-cryptography/keccak");
const exceptions_1 = require("../exceptions");
const MASK_160 = (BigInt(1) << BigInt(160)) - BigInt(1);
/**
 * Proxy function for @nomicfoundation/ethereumjs-util's setLengthLeft, except it returns a zero
 * length buffer in case the buffer is full of zeros.
 * @param value Buffer which we want to pad
 */
function setLengthLeftStorage(value) {
    if (value.equals(Buffer.alloc(value.length, 0))) {
        // return the empty buffer (the value is zero)
        return Buffer.alloc(0);
    }
    else {
        return (0, ethereumjs_util_1.setLengthLeft)(value, 32);
    }
}
exports.setLengthLeftStorage = setLengthLeftStorage;
/**
 * Wraps error message as EvmError
 */
function trap(err) {
    // TODO: facilitate extra data along with errors
    throw new exceptions_1.EvmError(err);
}
exports.trap = trap;
/**
 * Converts bigint address (they're stored like this on the stack) to buffer address
 */
function addressToBuffer(address) {
    if (Buffer.isBuffer(address))
        return address;
    return (0, ethereumjs_util_1.setLengthLeft)((0, ethereumjs_util_1.bigIntToBuffer)(address & MASK_160), 20);
}
exports.addressToBuffer = addressToBuffer;
/**
 * Error message helper - generates location string
 */
function describeLocation(runState) {
    const hash = (0, keccak_1.keccak256)(runState.interpreter.getCode()).toString('hex');
    const address = runState.interpreter.getAddress().buf.toString('hex');
    const pc = runState.programCounter - 1;
    return `${hash}/${address}:${pc}`;
}
exports.describeLocation = describeLocation;
/**
 * Find Ceil(a / b)
 *
 * @param {bigint} a
 * @param {bigint} b
 * @return {bigint}
 */
function divCeil(a, b) {
    const div = a / b;
    const modulus = mod(a, b);
    // Fast case - exact division
    if (modulus === BigInt(0))
        return div;
    // Round up
    return div < BigInt(0) ? div - BigInt(1) : div + BigInt(1);
}
exports.divCeil = divCeil;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 */
function getDataSlice(data, offset, length) {
    const len = BigInt(data.length);
    if (offset > len) {
        offset = len;
    }
    let end = offset + length;
    if (end > len) {
        end = len;
    }
    data = data.slice(Number(offset), Number(end));
    // Right-pad with zeros to fill dataLength bytes
    data = (0, ethereumjs_util_1.setLengthRight)(data, Number(length));
    return data;
}
exports.getDataSlice = getDataSlice;
/**
 * Get full opcode name from its name and code.
 *
 * @param code Integer code of opcode.
 * @param name Short name of the opcode.
 * @returns Full opcode name
 */
function getFullname(code, name) {
    switch (name) {
        case 'LOG':
            name += code - 0xa0;
            break;
        case 'PUSH':
            name += code - 0x5f;
            break;
        case 'DUP':
            name += code - 0x7f;
            break;
        case 'SWAP':
            name += code - 0x8f;
            break;
    }
    return name;
}
exports.getFullname = getFullname;
/**
 * Checks if a jump is valid given a destination (defined as a 1 in the validJumps array)
 */
function jumpIsValid(runState, dest) {
    return runState.validJumps[dest] === 1;
}
exports.jumpIsValid = jumpIsValid;
/**
 * Checks if a jumpsub is valid given a destination (defined as a 2 in the validJumps array)
 */
function jumpSubIsValid(runState, dest) {
    return runState.validJumps[dest] === 2;
}
exports.jumpSubIsValid = jumpSubIsValid;
/**
 * Returns an overflow-safe slice of an array. It right-pads
 * the data with zeros to `length`.
 * @param gasLimit requested gas Limit
 * @param gasLeft current gas left
 * @param runState the current runState
 * @param common the common
 */
function maxCallGas(gasLimit, gasLeft, runState, common) {
    if (common.gteHardfork(ethereumjs_common_1.Hardfork.TangerineWhistle)) {
        const gasAllowed = gasLeft - gasLeft / BigInt(64);
        return gasLimit > gasAllowed ? gasAllowed : gasLimit;
    }
    else {
        return gasLimit;
    }
}
exports.maxCallGas = maxCallGas;
/**
 * Subtracts the amount needed for memory usage from `runState.gasLeft`
 */
function subMemUsage(runState, offset, length, common) {
    // YP (225): access with zero length will not extend the memory
    if (length === BigInt(0))
        return BigInt(0);
    const newMemoryWordCount = divCeil(offset + length, BigInt(32));
    if (newMemoryWordCount <= runState.memoryWordCount)
        return BigInt(0);
    const words = newMemoryWordCount;
    const fee = common.param('gasPrices', 'memory');
    const quadCoeff = common.param('gasPrices', 'quadCoeffDiv');
    // words * 3 + words ^2 / 512
    let cost = words * fee + (words * words) / quadCoeff;
    if (cost > runState.highestMemCost) {
        const currentHighestMemCost = runState.highestMemCost;
        runState.highestMemCost = cost;
        cost -= currentHighestMemCost;
    }
    runState.memoryWordCount = newMemoryWordCount;
    return cost;
}
exports.subMemUsage = subMemUsage;
/**
 * Writes data returned by eei.call* methods to memory
 */
function writeCallOutput(runState, outOffset, outLength) {
    const returnData = runState.interpreter.getReturnData();
    if (returnData.length > 0) {
        const memOffset = Number(outOffset);
        let dataLength = Number(outLength);
        if (BigInt(returnData.length) < dataLength) {
            dataLength = returnData.length;
        }
        const data = getDataSlice(returnData, BigInt(0), BigInt(dataLength));
        runState.memory.extend(memOffset, dataLength);
        runState.memory.write(memOffset, dataLength, data);
    }
}
exports.writeCallOutput = writeCallOutput;
/**
 * The first rule set of SSTORE rules, which are the rules pre-Constantinople and in Petersburg
 */
function updateSstoreGas(runState, currentStorage, value, common) {
    if ((value.length === 0 && currentStorage.length === 0) ||
        (value.length > 0 && currentStorage.length > 0)) {
        const gas = common.param('gasPrices', 'sstoreReset');
        return gas;
    }
    else if (value.length === 0 && currentStorage.length > 0) {
        const gas = common.param('gasPrices', 'sstoreReset');
        runState.interpreter.refundGas(common.param('gasPrices', 'sstoreRefund'), 'updateSstoreGas');
        return gas;
    }
    else {
        /*
          The situations checked above are:
          -> Value/Slot are both 0
          -> Value/Slot are both nonzero
          -> Value is zero, but slot is nonzero
          Thus, the remaining case is where value is nonzero, but slot is zero, which is this clause
        */
        return common.param('gasPrices', 'sstoreSet');
    }
}
exports.updateSstoreGas = updateSstoreGas;
function mod(a, b) {
    let r = a % b;
    if (r < BigInt(0)) {
        r = b + r;
    }
    return r;
}
exports.mod = mod;
function fromTwos(a) {
    return BigInt.asIntN(256, a);
}
exports.fromTwos = fromTwos;
function toTwos(a) {
    return BigInt.asUintN(256, a);
}
exports.toTwos = toTwos;
function abs(a) {
    if (a > 0) {
        return a;
    }
    return a * BigInt(-1);
}
exports.abs = abs;
const N = BigInt(115792089237316195423570985008687907853269984665640564039457584007913129639936);
function exponentation(bas, exp) {
    let t = BigInt(1);
    while (exp > BigInt(0)) {
        if (exp % BigInt(2) !== BigInt(0)) {
            t = (t * bas) % N;
        }
        bas = (bas * bas) % N;
        exp = exp / BigInt(2);
    }
    return t;
}
exports.exponentation = exponentation;
//# sourceMappingURL=util.js.map