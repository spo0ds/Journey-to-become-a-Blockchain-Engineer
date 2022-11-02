"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCommon = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
function makeCommon({ chainId, networkId, hardfork }) {
    const common = ethereumjs_common_1.Common.custom({
        chainId,
        networkId,
    }, {
        hardfork,
    });
    return common;
}
exports.makeCommon = makeCommon;
//# sourceMappingURL=makeCommon.js.map