"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripemdPrecompileAddress = exports.precompiles = exports.getActivePrecompiles = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const _01_ecrecover_1 = require("./01-ecrecover");
const _02_sha256_1 = require("./02-sha256");
const _03_ripemd160_1 = require("./03-ripemd160");
const _04_identity_1 = require("./04-identity");
const _05_modexp_1 = require("./05-modexp");
const _06_ecadd_1 = require("./06-ecadd");
const _07_ecmul_1 = require("./07-ecmul");
const _08_ecpairing_1 = require("./08-ecpairing");
const _09_blake2f_1 = require("./09-blake2f");
const _0a_bls12_g1add_1 = require("./0a-bls12-g1add");
const _0b_bls12_g1mul_1 = require("./0b-bls12-g1mul");
const _0c_bls12_g1multiexp_1 = require("./0c-bls12-g1multiexp");
const _0d_bls12_g2add_1 = require("./0d-bls12-g2add");
const _0e_bls12_g2mul_1 = require("./0e-bls12-g2mul");
const _0f_bls12_g2multiexp_1 = require("./0f-bls12-g2multiexp");
const _10_bls12_pairing_1 = require("./10-bls12-pairing");
const _11_bls12_map_fp_to_g1_1 = require("./11-bls12-map-fp-to-g1");
const _12_bls12_map_fp2_to_g2_1 = require("./12-bls12-map-fp2-to-g2");
var PrecompileAvailabilityCheck;
(function (PrecompileAvailabilityCheck) {
    PrecompileAvailabilityCheck[PrecompileAvailabilityCheck["EIP"] = 0] = "EIP";
    PrecompileAvailabilityCheck[PrecompileAvailabilityCheck["Hardfork"] = 1] = "Hardfork";
})(PrecompileAvailabilityCheck || (PrecompileAvailabilityCheck = {}));
const ripemdPrecompileAddress = '0000000000000000000000000000000000000003';
exports.ripemdPrecompileAddress = ripemdPrecompileAddress;
const precompiles = {
    '0000000000000000000000000000000000000001': _01_ecrecover_1.precompile01,
    '0000000000000000000000000000000000000002': _02_sha256_1.precompile02,
    [ripemdPrecompileAddress]: _03_ripemd160_1.precompile03,
    '0000000000000000000000000000000000000004': _04_identity_1.precompile04,
    '0000000000000000000000000000000000000005': _05_modexp_1.precompile05,
    '0000000000000000000000000000000000000006': _06_ecadd_1.precompile06,
    '0000000000000000000000000000000000000007': _07_ecmul_1.precompile07,
    '0000000000000000000000000000000000000008': _08_ecpairing_1.precompile08,
    '0000000000000000000000000000000000000009': _09_blake2f_1.precompile09,
    '000000000000000000000000000000000000000a': _0a_bls12_g1add_1.precompile0a,
    '000000000000000000000000000000000000000b': _0b_bls12_g1mul_1.precompile0b,
    '000000000000000000000000000000000000000c': _0c_bls12_g1multiexp_1.precompile0c,
    '000000000000000000000000000000000000000d': _0d_bls12_g2add_1.precompile0d,
    '000000000000000000000000000000000000000e': _0e_bls12_g2mul_1.precompile0e,
    '000000000000000000000000000000000000000f': _0f_bls12_g2multiexp_1.precompile0f,
    '0000000000000000000000000000000000000010': _10_bls12_pairing_1.precompile10,
    '0000000000000000000000000000000000000011': _11_bls12_map_fp_to_g1_1.precompile11,
    '0000000000000000000000000000000000000012': _12_bls12_map_fp2_to_g2_1.precompile12,
};
exports.precompiles = precompiles;
const precompileAvailability = {
    '0000000000000000000000000000000000000001': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Chainstart,
    },
    '0000000000000000000000000000000000000002': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Chainstart,
    },
    [ripemdPrecompileAddress]: {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Chainstart,
    },
    '0000000000000000000000000000000000000004': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Chainstart,
    },
    '0000000000000000000000000000000000000005': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Byzantium,
    },
    '0000000000000000000000000000000000000006': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Byzantium,
    },
    '0000000000000000000000000000000000000007': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Byzantium,
    },
    '0000000000000000000000000000000000000008': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Byzantium,
    },
    '0000000000000000000000000000000000000009': {
        type: PrecompileAvailabilityCheck.Hardfork,
        param: ethereumjs_common_1.Hardfork.Istanbul,
    },
    '000000000000000000000000000000000000000a': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    '000000000000000000000000000000000000000b': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    '000000000000000000000000000000000000000c': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    '000000000000000000000000000000000000000d': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    '000000000000000000000000000000000000000f': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    '000000000000000000000000000000000000000e': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    '0000000000000000000000000000000000000010': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    '0000000000000000000000000000000000000011': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
    '0000000000000000000000000000000000000012': {
        type: PrecompileAvailabilityCheck.EIP,
        param: 2537,
    },
};
function getPrecompile(address, common) {
    const addr = address.buf.toString('hex');
    if (precompiles[addr] !== undefined) {
        const availability = precompileAvailability[addr];
        if ((availability.type === PrecompileAvailabilityCheck.Hardfork &&
            common.gteHardfork(availability.param)) ||
            (availability.type === PrecompileAvailabilityCheck.EIP &&
                common.eips().includes(availability.param))) {
            return precompiles[addr];
        }
    }
    return precompiles[''];
}
function getActivePrecompiles(common, customPrecompiles) {
    const precompileMap = new Map();
    if (customPrecompiles) {
        for (const precompile of customPrecompiles) {
            precompileMap.set(precompile.address.buf.toString('hex'), 'function' in precompile ? precompile.function : undefined);
        }
    }
    for (const addressString in precompiles) {
        if (precompileMap.has(addressString)) {
            continue;
        }
        const address = new ethereumjs_util_1.Address(Buffer.from(addressString, 'hex'));
        const precompileFunc = getPrecompile(address, common);
        if (precompileFunc !== undefined) {
            precompileMap.set(addressString, precompileFunc);
        }
    }
    return precompileMap;
}
exports.getActivePrecompiles = getActivePrecompiles;
//# sourceMappingURL=index.js.map