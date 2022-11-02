/// <reference types="node" />
import type { PrefixedHexString } from '@nomicfoundation/ethereumjs-util';
export declare type StoragePair = [key: PrefixedHexString, value: PrefixedHexString];
export declare type AccountState = [
    balance: PrefixedHexString,
    code: PrefixedHexString,
    storage: Array<StoragePair>
];
export interface GenesisState {
    [key: PrefixedHexString]: PrefixedHexString | AccountState;
}
/**
 * Derives the stateRoot of the genesis block based on genesis allocations
 */
export declare function genesisStateRoot(genesisState: GenesisState): Promise<Buffer>;
//# sourceMappingURL=index.d.ts.map