"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const LRUCache = require("lru-cache");
/**
 * Simple LRU Cache that allows for keys of type Buffer
 * @hidden
 */
class Cache {
    constructor(opts) {
        this._cache = new LRUCache(opts);
    }
    set(key, value) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        this._cache.set(key, value);
    }
    get(key) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        return this._cache.get(key);
    }
    del(key) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        this._cache.del(key);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map