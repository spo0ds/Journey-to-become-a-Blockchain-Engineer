import type { CustomOpcode } from '../types';
import type { OpHandler } from './functions';
import type { AsyncDynamicGasHandler, SyncDynamicGasHandler } from './gas';
import type { Common } from '@nomicfoundation/ethereumjs-common';
export declare class Opcode {
    readonly code: number;
    readonly name: string;
    readonly fullName: string;
    readonly fee: number;
    readonly isAsync: boolean;
    readonly dynamicGas: boolean;
    constructor({ code, name, fullName, fee, isAsync, dynamicGas, }: {
        code: number;
        name: string;
        fullName: string;
        fee: number;
        isAsync: boolean;
        dynamicGas: boolean;
    });
}
export declare type OpcodeList = Map<number, Opcode>;
declare type OpcodeContext = {
    dynamicGasHandlers: Map<number, AsyncDynamicGasHandler | SyncDynamicGasHandler>;
    handlers: Map<number, OpHandler>;
    opcodes: OpcodeList;
};
/**
 * Get suitable opcodes for the required hardfork.
 *
 * @param common {Common} Ethereumjs Common metadata object.
 * @param customOpcodes List with custom opcodes (see EVM `customOpcodes` option description).
 * @returns {OpcodeList} Opcodes dictionary object.
 */
export declare function getOpcodesForHF(common: Common, customOpcodes?: CustomOpcode[]): OpcodeContext;
export {};
//# sourceMappingURL=codes.d.ts.map