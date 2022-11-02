"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomChain = exports.ConsensusAlgorithm = exports.ConsensusType = exports.Hardfork = exports.Chain = void 0;
var Chain;
(function (Chain) {
    Chain[Chain["Mainnet"] = 1] = "Mainnet";
    Chain[Chain["Ropsten"] = 3] = "Ropsten";
    Chain[Chain["Rinkeby"] = 4] = "Rinkeby";
    Chain[Chain["Goerli"] = 5] = "Goerli";
    Chain[Chain["Sepolia"] = 11155111] = "Sepolia";
})(Chain = exports.Chain || (exports.Chain = {}));
var Hardfork;
(function (Hardfork) {
    Hardfork["Chainstart"] = "chainstart";
    Hardfork["Homestead"] = "homestead";
    Hardfork["Dao"] = "dao";
    Hardfork["TangerineWhistle"] = "tangerineWhistle";
    Hardfork["SpuriousDragon"] = "spuriousDragon";
    Hardfork["Byzantium"] = "byzantium";
    Hardfork["Constantinople"] = "constantinople";
    Hardfork["Petersburg"] = "petersburg";
    Hardfork["Istanbul"] = "istanbul";
    Hardfork["MuirGlacier"] = "muirGlacier";
    Hardfork["Berlin"] = "berlin";
    Hardfork["London"] = "london";
    Hardfork["ArrowGlacier"] = "arrowGlacier";
    Hardfork["GrayGlacier"] = "grayGlacier";
    Hardfork["MergeForkIdTransition"] = "mergeForkIdTransition";
    Hardfork["Merge"] = "merge";
    Hardfork["Shanghai"] = "shanghai";
})(Hardfork = exports.Hardfork || (exports.Hardfork = {}));
var ConsensusType;
(function (ConsensusType) {
    ConsensusType["ProofOfStake"] = "pos";
    ConsensusType["ProofOfWork"] = "pow";
    ConsensusType["ProofOfAuthority"] = "poa";
})(ConsensusType = exports.ConsensusType || (exports.ConsensusType = {}));
var ConsensusAlgorithm;
(function (ConsensusAlgorithm) {
    ConsensusAlgorithm["Ethash"] = "ethash";
    ConsensusAlgorithm["Clique"] = "clique";
    ConsensusAlgorithm["Casper"] = "casper";
})(ConsensusAlgorithm = exports.ConsensusAlgorithm || (exports.ConsensusAlgorithm = {}));
var CustomChain;
(function (CustomChain) {
    /**
     * Polygon (Matic) Mainnet
     *
     * - [Documentation](https://docs.matic.network/docs/develop/network-details/network)
     */
    CustomChain["PolygonMainnet"] = "polygon-mainnet";
    /**
     * Polygon (Matic) Mumbai Testnet
     *
     * - [Documentation](https://docs.matic.network/docs/develop/network-details/network)
     */
    CustomChain["PolygonMumbai"] = "polygon-mumbai";
    /**
     * Arbitrum Rinkeby Testnet
     *
     * - [Documentation](https://developer.offchainlabs.com/docs/public_testnet)
     */
    CustomChain["ArbitrumRinkebyTestnet"] = "arbitrum-rinkeby-testnet";
    /**
     * xDai EVM sidechain with a native stable token
     *
     * - [Documentation](https://www.xdaichain.com/)
     */
    CustomChain["xDaiChain"] = "x-dai-chain";
    /**
     * Optimistic Kovan - testnet for Optimism roll-up
     *
     * - [Documentation](https://community.optimism.io/docs/developers/tutorials.html)
     */
    CustomChain["OptimisticKovan"] = "optimistic-kovan";
    /**
     * Optimistic Ethereum - mainnet for Optimism roll-up
     *
     * - [Documentation](https://community.optimism.io/docs/developers/tutorials.html)
     */
    CustomChain["OptimisticEthereum"] = "optimistic-ethereum";
})(CustomChain = exports.CustomChain || (exports.CustomChain = {}));
//# sourceMappingURL=enums.js.map