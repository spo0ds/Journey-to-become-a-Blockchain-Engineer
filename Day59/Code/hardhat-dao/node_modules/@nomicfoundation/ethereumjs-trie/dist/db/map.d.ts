/// <reference types="node" />
import type { BatchDBOp, DB } from '../types';
export declare class MapDB implements DB {
    _database: Map<string, Buffer>;
    constructor(database?: Map<string, Buffer>);
    get(key: Buffer): Promise<Buffer | null>;
    put(key: Buffer, val: Buffer): Promise<void>;
    del(key: Buffer): Promise<void>;
    batch(opStack: BatchDBOp[]): Promise<void>;
    copy(): DB;
}
//# sourceMappingURL=map.d.ts.map