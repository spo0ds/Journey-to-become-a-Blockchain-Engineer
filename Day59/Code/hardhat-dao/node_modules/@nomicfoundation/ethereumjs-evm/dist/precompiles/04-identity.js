"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile04 = void 0;
const evm_1 = require("../evm");
function precompile04(opts) {
    const data = opts.data;
    let gasUsed = opts._common.param('gasPrices', 'identity');
    gasUsed += opts._common.param('gasPrices', 'identityWord') * BigInt(Math.ceil(data.length / 32));
    if (opts.gasLimit < gasUsed) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: data,
    };
}
exports.precompile04 = precompile04;
//# sourceMappingURL=04-identity.js.map