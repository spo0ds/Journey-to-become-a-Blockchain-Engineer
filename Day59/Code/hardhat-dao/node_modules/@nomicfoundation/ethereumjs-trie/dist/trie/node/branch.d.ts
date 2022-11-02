/// <reference types="node" />
import type { EmbeddedNode } from '../../types';
export declare class BranchNode {
    _branches: (EmbeddedNode | null)[];
    _value: Buffer | null;
    constructor();
    static fromArray(arr: Buffer[]): BranchNode;
    value(v?: Buffer | null): Buffer | null;
    setBranch(i: number, v: EmbeddedNode | null): void;
    raw(): (EmbeddedNode | null)[];
    serialize(): Buffer;
    getBranch(i: number): EmbeddedNode | null;
    getChildren(): [number, EmbeddedNode][];
}
//# sourceMappingURL=branch.d.ts.map