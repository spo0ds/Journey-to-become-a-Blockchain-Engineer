"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile06 = void 0;
const evm_1 = require("../evm");
const bn128 = require('rustbn.js');
function precompile06(opts) {
    const inputData = opts.data;
    const gasUsed = opts._common.param('gasPrices', 'ecAdd');
    if (opts.gasLimit < gasUsed) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    const returnData = bn128.add(inputData);
    // check ecadd success or failure by comparing the output length
    if (returnData.length !== 64) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: returnData,
    };
}
exports.precompile06 = precompile06;
//# sourceMappingURL=06-ecadd.js.map