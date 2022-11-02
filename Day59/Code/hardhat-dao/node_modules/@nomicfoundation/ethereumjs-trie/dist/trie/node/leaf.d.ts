/// <reference types="node" />
import { Node } from './node';
import type { Nibbles } from '../../types';
export declare class LeafNode extends Node {
    constructor(nibbles: Nibbles, value: Buffer);
    static encodeKey(key: Nibbles): Nibbles;
}
//# sourceMappingURL=leaf.d.ts.map