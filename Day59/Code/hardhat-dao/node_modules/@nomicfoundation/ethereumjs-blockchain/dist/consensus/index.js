"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthashConsensus = exports.CliqueConsensus = exports.CasperConsensus = void 0;
const casper_1 = require("./casper");
Object.defineProperty(exports, "CasperConsensus", { enumerable: true, get: function () { return casper_1.CasperConsensus; } });
const clique_1 = require("./clique");
Object.defineProperty(exports, "CliqueConsensus", { enumerable: true, get: function () { return clique_1.CliqueConsensus; } });
const ethash_1 = require("./ethash");
Object.defineProperty(exports, "EthashConsensus", { enumerable: true, get: function () { return ethash_1.EthashConsensus; } });
//# sourceMappingURL=index.js.map