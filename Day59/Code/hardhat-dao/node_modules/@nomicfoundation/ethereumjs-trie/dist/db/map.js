"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapDB = void 0;
class MapDB {
    constructor(database) {
        this._database = database ?? new Map();
    }
    async get(key) {
        const result = this._database.get(key.toString('hex'));
        if (result !== undefined) {
            return result;
        }
        return null;
    }
    async put(key, val) {
        this._database.set(key.toString('hex'), val);
    }
    async del(key) {
        this._database.delete(key.toString('hex'));
    }
    async batch(opStack) {
        for (const op of opStack) {
            if (op.type === 'del') {
                await this.del(op.key);
            }
            if (op.type === 'put') {
                await this.put(op.key, op.value);
            }
        }
    }
    copy() {
        return new MapDB(this._database);
    }
}
exports.MapDB = MapDB;
//# sourceMappingURL=map.js.map