"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const hex_1 = require("../../util/hex");
const nibbles_1 = require("../../util/nibbles");
class Node {
    constructor(nibbles, value, terminator) {
        this._nibbles = nibbles;
        this._value = value;
        this._terminator = terminator;
    }
    static decodeKey(key) {
        return (0, hex_1.removeHexPrefix)(key);
    }
    key(k) {
        if (k !== undefined) {
            this._nibbles = k;
        }
        return this._nibbles.slice(0);
    }
    keyLength() {
        return this._nibbles.length;
    }
    value(v) {
        if (v !== undefined) {
            this._value = v;
        }
        return this._value;
    }
    encodedKey() {
        return (0, hex_1.addHexPrefix)(this._nibbles.slice(0), this._terminator);
    }
    raw() {
        return [(0, nibbles_1.nibblesToBuffer)(this.encodedKey()), this._value];
    }
    serialize() {
        return Buffer.from(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(this.raw())));
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map