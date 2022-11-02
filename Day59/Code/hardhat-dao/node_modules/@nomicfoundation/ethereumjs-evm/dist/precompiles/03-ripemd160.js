"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile03 = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const ripemd160_1 = require("ethereum-cryptography/ripemd160");
const evm_1 = require("../evm");
function precompile03(opts) {
    const data = opts.data;
    let gasUsed = opts._common.param('gasPrices', 'ripemd160');
    gasUsed += opts._common.param('gasPrices', 'ripemd160Word') * BigInt(Math.ceil(data.length / 32));
    if (opts.gasLimit < gasUsed) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: (0, ethereumjs_util_1.setLengthLeft)((0, ethereumjs_util_1.toBuffer)((0, ripemd160_1.ripemd160)(data)), 32),
    };
}
exports.precompile03 = precompile03;
//# sourceMappingURL=03-ripemd160.js.map