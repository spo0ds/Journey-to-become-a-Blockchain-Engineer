import { ConsensusAlgorithm } from '@nomicfoundation/ethereumjs-common';
import { Ethash } from '@nomicfoundation/ethereumjs-ethash';
import type { Blockchain } from '..';
import type { Consensus, ConsensusOptions } from './interface';
import type { Block, BlockHeader } from '@nomicfoundation/ethereumjs-block';
/**
 * This class encapsulates Ethash-related consensus functionality when used with the Blockchain class.
 */
export declare class EthashConsensus implements Consensus {
    blockchain: Blockchain | undefined;
    algorithm: ConsensusAlgorithm;
    _ethash: Ethash | undefined;
    constructor();
    validateConsensus(block: Block): Promise<void>;
    /**
     * Checks that the block's `difficulty` matches the canonical difficulty of the parent header.
     * @param header - header of block to be checked
     */
    validateDifficulty(header: BlockHeader): Promise<void>;
    genesisInit(): Promise<void>;
    setup({ blockchain }: ConsensusOptions): Promise<void>;
    newBlock(): Promise<void>;
}
//# sourceMappingURL=ethash.d.ts.map