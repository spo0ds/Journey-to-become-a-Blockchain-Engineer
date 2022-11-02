"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile11 = void 0;
const evm_1 = require("../evm");
const exceptions_1 = require("../exceptions");
const { BLS12_381_ToFpPoint, BLS12_381_FromG1Point } = require('./util/bls12_381');
async function precompile11(opts) {
    const mcl = opts._EVM._mcl;
    const inputData = opts.data;
    // note: the gas used is constant; even if the input is incorrect.
    const gasUsed = opts._common.paramByEIP('gasPrices', 'Bls12381MapG1Gas', 2537) ?? BigInt(0);
    if (opts.gasLimit < gasUsed) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    if (inputData.length !== 64) {
        return (0, evm_1.EvmErrorResult)(new exceptions_1.EvmError(exceptions_1.ERROR.BLS_12_381_INVALID_INPUT_LENGTH), opts.gasLimit);
    }
    // check if some parts of input are zero bytes.
    const zeroBytes16 = Buffer.alloc(16, 0);
    if (!opts.data.slice(0, 16).equals(zeroBytes16)) {
        return (0, evm_1.EvmErrorResult)(new exceptions_1.EvmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE), opts.gasLimit);
    }
    // convert input to mcl Fp1 point
    let Fp1Point;
    try {
        Fp1Point = BLS12_381_ToFpPoint(opts.data.slice(0, 64), mcl);
    }
    catch (e) {
        return (0, evm_1.EvmErrorResult)(e, opts.gasLimit);
    }
    // map it to G1
    const result = Fp1Point.mapToG1();
    const returnValue = BLS12_381_FromG1Point(result);
    return {
        executionGasUsed: gasUsed,
        returnValue,
    };
}
exports.precompile11 = precompile11;
//# sourceMappingURL=11-bls12-map-fp-to-g1.js.map