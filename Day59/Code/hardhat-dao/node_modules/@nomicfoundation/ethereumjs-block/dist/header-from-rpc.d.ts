import { BlockHeader } from './header';
import type { BlockOptions, JsonRpcBlock } from './types';
/**
 * Creates a new block header object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param options - An object describing the blockchain
 */
export declare function blockHeaderFromRpc(blockParams: JsonRpcBlock, options?: BlockOptions): BlockHeader;
//# sourceMappingURL=header-from-rpc.d.ts.map