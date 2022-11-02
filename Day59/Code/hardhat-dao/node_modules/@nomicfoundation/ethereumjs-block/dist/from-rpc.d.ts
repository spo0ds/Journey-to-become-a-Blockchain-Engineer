import { Block } from './index';
import type { BlockOptions, JsonRpcBlock } from './index';
/**
 * Creates a new block object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param uncles - Optional list of Ethereum JSON RPC of uncles (eth_getUncleByBlockHashAndIndex)
 * @param options - An object describing the blockchain
 */
export declare function blockFromRpc(blockParams: JsonRpcBlock, uncles?: any[], options?: BlockOptions): Block;
//# sourceMappingURL=from-rpc.d.ts.map