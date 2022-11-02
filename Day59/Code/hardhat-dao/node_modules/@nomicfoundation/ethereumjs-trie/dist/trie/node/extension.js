"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionNode = void 0;
const hex_1 = require("../../util/hex");
const node_1 = require("./node");
class ExtensionNode extends node_1.Node {
    constructor(nibbles, value) {
        super(nibbles, value, false);
    }
    static encodeKey(key) {
        return (0, hex_1.addHexPrefix)(key, false);
    }
}
exports.ExtensionNode = ExtensionNode;
//# sourceMappingURL=extension.js.map