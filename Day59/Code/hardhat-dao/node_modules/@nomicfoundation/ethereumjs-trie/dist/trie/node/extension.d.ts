/// <reference types="node" />
import { Node } from './node';
import type { Nibbles } from '../../types';
export declare class ExtensionNode extends Node {
    constructor(nibbles: Nibbles, value: Buffer);
    static encodeKey(key: Nibbles): Nibbles;
}
//# sourceMappingURL=extension.d.ts.map