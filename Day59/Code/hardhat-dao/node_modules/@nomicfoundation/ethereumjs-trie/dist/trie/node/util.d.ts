/// <reference types="node" />
import { BranchNode } from './branch';
import { ExtensionNode } from './extension';
import { LeafNode } from './leaf';
export declare function decodeRawNode(raw: Buffer[]): BranchNode | ExtensionNode | LeafNode;
export declare function decodeNode(raw: Buffer): BranchNode | ExtensionNode | LeafNode;
export declare function isRawNode(n: any): boolean;
//# sourceMappingURL=util.d.ts.map