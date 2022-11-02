"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile12 = void 0;
const evm_1 = require("../evm");
const exceptions_1 = require("../exceptions");
const { BLS12_381_ToFp2Point, BLS12_381_FromG2Point } = require('./util/bls12_381');
async function precompile12(opts) {
    const mcl = opts._EVM._mcl;
    const inputData = opts.data;
    // note: the gas used is constant; even if the input is incorrect.
    const gasUsed = opts._common.paramByEIP('gasPrices', 'Bls12381MapG2Gas', 2537) ?? BigInt(0);
    if (opts.gasLimit < gasUsed) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    if (inputData.length !== 128) {
        return (0, evm_1.EvmErrorResult)(new exceptions_1.EvmError(exceptions_1.ERROR.BLS_12_381_INVALID_INPUT_LENGTH), opts.gasLimit);
    }
    // check if some parts of input are zero bytes.
    const zeroBytes16 = Buffer.alloc(16, 0);
    const zeroByteCheck = [
        [0, 16],
        [64, 80],
    ];
    for (const index in zeroByteCheck) {
        const slicedBuffer = opts.data.slice(zeroByteCheck[index][0], zeroByteCheck[index][1]);
        if (!slicedBuffer.equals(zeroBytes16)) {
            return (0, evm_1.EvmErrorResult)(new exceptions_1.EvmError(exceptions_1.ERROR.BLS_12_381_POINT_NOT_ON_CURVE), opts.gasLimit);
        }
    }
    // convert input to mcl Fp2 point
    let Fp2Point;
    try {
        Fp2Point = BLS12_381_ToFp2Point(opts.data.slice(0, 64), opts.data.slice(64, 128), mcl);
    }
    catch (e) {
        return (0, evm_1.EvmErrorResult)(e, opts.gasLimit);
    }
    // map it to G2
    const result = Fp2Point.mapToG2();
    const returnValue = BLS12_381_FromG2Point(result);
    return {
        executionGasUsed: gasUsed,
        returnValue,
    };
}
exports.precompile12 = precompile12;
//# sourceMappingURL=12-bls12-map-fp2-to-g2.js.map