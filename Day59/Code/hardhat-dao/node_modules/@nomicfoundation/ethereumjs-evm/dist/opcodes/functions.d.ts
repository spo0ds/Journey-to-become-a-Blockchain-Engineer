import type { RunState } from '../interpreter';
import type { Common } from '@nomicfoundation/ethereumjs-common';
export interface SyncOpHandler {
    (runState: RunState, common: Common): void;
}
export interface AsyncOpHandler {
    (runState: RunState, common: Common): Promise<void>;
}
export declare type OpHandler = SyncOpHandler | AsyncOpHandler;
export declare const handlers: Map<number, OpHandler>;
//# sourceMappingURL=functions.d.ts.map