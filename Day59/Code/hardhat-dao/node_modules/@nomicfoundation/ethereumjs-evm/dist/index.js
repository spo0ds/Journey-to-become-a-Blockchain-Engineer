"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.getActivePrecompiles = exports.EvmErrorMessage = exports.EvmError = exports.EVM = void 0;
const evm_1 = require("./evm");
Object.defineProperty(exports, "EVM", { enumerable: true, get: function () { return evm_1.EVM; } });
const exceptions_1 = require("./exceptions");
Object.defineProperty(exports, "EvmError", { enumerable: true, get: function () { return exceptions_1.EvmError; } });
Object.defineProperty(exports, "EvmErrorMessage", { enumerable: true, get: function () { return exceptions_1.ERROR; } });
const message_1 = require("./message");
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return message_1.Message; } });
const precompiles_1 = require("./precompiles");
Object.defineProperty(exports, "getActivePrecompiles", { enumerable: true, get: function () { return precompiles_1.getActivePrecompiles; } });
//# sourceMappingURL=index.js.map