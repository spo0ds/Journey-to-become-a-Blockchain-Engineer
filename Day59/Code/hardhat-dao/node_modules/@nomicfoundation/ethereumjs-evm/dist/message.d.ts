/// <reference types="node" />
import { Address } from '@nomicfoundation/ethereumjs-util';
import type { PrecompileFunc } from './precompiles';
interface MessageOpts {
    to?: Address;
    value?: bigint;
    caller?: Address;
    gasLimit: bigint;
    data?: Buffer;
    depth?: number;
    code?: Buffer | PrecompileFunc;
    codeAddress?: Address;
    isStatic?: boolean;
    isCompiled?: boolean;
    salt?: Buffer;
    /**
     * A map of addresses to selfdestruct, see {@link Message.selfdestruct}
     */
    selfdestruct?: {
        [key: string]: boolean;
    } | {
        [key: string]: Buffer;
    };
    delegatecall?: boolean;
    authcallOrigin?: Address;
    gasRefund?: bigint;
}
export declare class Message {
    to?: Address;
    value: bigint;
    caller: Address;
    gasLimit: bigint;
    data: Buffer;
    depth: number;
    code?: Buffer | PrecompileFunc;
    _codeAddress?: Address;
    isStatic: boolean;
    isCompiled: boolean;
    salt?: Buffer;
    /**
     * Map of addresses to selfdestruct. Key is the unprefixed address.
     * Value is a boolean when marked for destruction and replaced with a Buffer containing the address where the remaining funds are sent.
     */
    selfdestruct?: {
        [key: string]: boolean;
    } | {
        [key: string]: Buffer;
    };
    delegatecall: boolean;
    /**
     * This is used to store the origin of the AUTHCALL,
     * the purpose is to figure out where `value` should be taken from (not from `caller`)
     */
    authcallOrigin?: Address;
    gasRefund: bigint;
    constructor(opts: MessageOpts);
    /**
     * Note: should only be called in instances where `_codeAddress` or `to` is defined.
     */
    get codeAddress(): Address;
}
export declare type MessageWithTo = Message & Pick<Required<MessageOpts>, 'to'>;
export {};
//# sourceMappingURL=message.d.ts.map