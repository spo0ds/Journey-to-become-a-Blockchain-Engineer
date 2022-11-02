"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRawNode = exports.decodeNode = exports.decodeRawNode = void 0;
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const hex_1 = require("../../util/hex");
const nibbles_1 = require("../../util/nibbles");
const branch_1 = require("./branch");
const extension_1 = require("./extension");
const leaf_1 = require("./leaf");
function decodeRawNode(raw) {
    if (raw.length === 17) {
        return branch_1.BranchNode.fromArray(raw);
    }
    else if (raw.length === 2) {
        const nibbles = (0, nibbles_1.bufferToNibbles)(raw[0]);
        if ((0, hex_1.isTerminator)(nibbles)) {
            return new leaf_1.LeafNode(leaf_1.LeafNode.decodeKey(nibbles), raw[1]);
        }
        return new extension_1.ExtensionNode(extension_1.ExtensionNode.decodeKey(nibbles), raw[1]);
    }
    else {
        throw new Error('Invalid node');
    }
}
exports.decodeRawNode = decodeRawNode;
function decodeNode(raw) {
    const des = (0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(raw)));
    if (!Array.isArray(des)) {
        throw new Error('Invalid node');
    }
    return decodeRawNode(des);
}
exports.decodeNode = decodeNode;
function isRawNode(n) {
    return Array.isArray(n) && !Buffer.isBuffer(n);
}
exports.isRawNode = isRawNode;
//# sourceMappingURL=util.js.map