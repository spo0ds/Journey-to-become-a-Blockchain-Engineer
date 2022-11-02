"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrieReadStream = void 0;
const readable_stream_1 = require("readable-stream");
const trie_1 = require("../trie");
const nibbles_1 = require("./nibbles");
class TrieReadStream extends readable_stream_1.Readable {
    constructor(trie) {
        super({ objectMode: true });
        this.trie = trie;
        this._started = false;
    }
    async _read() {
        if (this._started) {
            return;
        }
        this._started = true;
        try {
            await this._findValueNodes(async (_, node, key, walkController) => {
                if (node !== null) {
                    this.push({
                        key: (0, nibbles_1.nibblesToBuffer)(key),
                        value: node.value(),
                    });
                    walkController.allChildren(node, key);
                }
            });
        }
        catch (error) {
            if (error.message === 'Missing node in DB') {
                // pass
            }
            else {
                throw error;
            }
        }
        this.push(null);
    }
    /**
     * Finds all nodes that store k,v values
     * called by {@link TrieReadStream}
     * @private
     */
    async _findValueNodes(onFound) {
        const outerOnFound = async (nodeRef, node, key, walkController) => {
            let fullKey = key;
            if (node instanceof trie_1.LeafNode) {
                fullKey = key.concat(node.key());
                // found leaf node!
                onFound(nodeRef, node, fullKey, walkController);
            }
            else if (node instanceof trie_1.BranchNode && node.value()) {
                // found branch with value
                onFound(nodeRef, node, fullKey, walkController);
            }
            else {
                // keep looking for value nodes
                if (node !== null) {
                    walkController.allChildren(node, key);
                }
            }
        };
        await this.trie.walkTrie(this.trie.root(), outerOnFound);
    }
}
exports.TrieReadStream = TrieReadStream;
//# sourceMappingURL=readStream.js.map