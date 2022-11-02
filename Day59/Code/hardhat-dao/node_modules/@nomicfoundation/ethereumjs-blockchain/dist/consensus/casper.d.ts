import { ConsensusAlgorithm } from '@nomicfoundation/ethereumjs-common';
import type { Consensus } from './interface';
import type { BlockHeader } from '@nomicfoundation/ethereumjs-block';
/**
 * This class encapsulates Casper-related consensus functionality when used with the Blockchain class.
 */
export declare class CasperConsensus implements Consensus {
    algorithm: ConsensusAlgorithm;
    constructor();
    genesisInit(): Promise<void>;
    setup(): Promise<void>;
    validateConsensus(): Promise<void>;
    validateDifficulty(header: BlockHeader): Promise<void>;
    newBlock(): Promise<void>;
}
//# sourceMappingURL=casper.d.ts.map