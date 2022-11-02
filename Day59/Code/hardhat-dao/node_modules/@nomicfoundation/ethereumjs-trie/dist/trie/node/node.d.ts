/// <reference types="node" />
import type { Nibbles } from '../../types';
export declare class Node {
    _nibbles: Nibbles;
    _value: Buffer;
    _terminator: boolean;
    constructor(nibbles: Nibbles, value: Buffer, terminator: boolean);
    static decodeKey(key: Nibbles): Nibbles;
    key(k?: Nibbles): Nibbles;
    keyLength(): number;
    value(v?: Buffer): Buffer;
    encodedKey(): Nibbles;
    raw(): [Buffer, Buffer];
    serialize(): Buffer;
}
//# sourceMappingURL=node.d.ts.map