"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile02 = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const sha256_1 = require("ethereum-cryptography/sha256");
const evm_1 = require("../evm");
function precompile02(opts) {
    const data = opts.data;
    let gasUsed = opts._common.param('gasPrices', 'sha256');
    gasUsed += opts._common.param('gasPrices', 'sha256Word') * BigInt(Math.ceil(data.length / 32));
    if (opts.gasLimit < gasUsed) {
        return (0, evm_1.OOGResult)(opts.gasLimit);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: (0, ethereumjs_util_1.toBuffer)((0, sha256_1.sha256)(data)),
    };
}
exports.precompile02 = precompile02;
//# sourceMappingURL=02-sha256.js.map