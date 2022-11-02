"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile07 = void 0;
const evm_1 = require("../evm");
const bn128 = require('rustbn.js');
function precompile07(opts) {
    const inputData = opts.data;
    const gasUsed = opts._common.param('gasPrices', 'ecMul');
    if (opts.gasLimit < gasUsed) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    const returnData = bn128.mul(inputData);
    // check ecmul success or failure by comparing the output length
    if (returnData.length !== 64) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: returnData,
    };
}
exports.precompile07 = precompile07;
//# sourceMappingURL=07-ecmul.js.map