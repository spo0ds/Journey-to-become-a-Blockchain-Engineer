/// <reference types="node" />
import type { BatchDBOp, Checkpoint, DB } from '../types';
/**
 * DB is a thin wrapper around the underlying levelup db,
 * which validates inputs and sets encoding type.
 */
export declare class CheckpointDB implements DB {
    checkpoints: Checkpoint[];
    db: DB;
    /**
     * Initialize a DB instance.
     */
    constructor(db: DB);
    /**
     * Flush the checkpoints and use the given checkpoints instead.
     * @param {Checkpoint[]} checkpoints
     */
    setCheckpoints(checkpoints: Checkpoint[]): void;
    /**
     * Is the DB during a checkpoint phase?
     */
    hasCheckpoints(): boolean;
    /**
     * Adds a new checkpoint to the stack
     * @param root
     */
    checkpoint(root: Buffer): void;
    /**
     * Commits the latest checkpoint
     */
    commit(): Promise<void>;
    /**
     * Reverts the latest checkpoint
     */
    revert(): Promise<Buffer>;
    /**
     * @inheritDoc
     */
    get(key: Buffer): Promise<Buffer | null>;
    /**
     * @inheritDoc
     */
    put(key: Buffer, val: Buffer): Promise<void>;
    /**
     * @inheritDoc
     */
    del(key: Buffer): Promise<void>;
    /**
     * @inheritDoc
     */
    batch(opStack: BatchDBOp[]): Promise<void>;
    /**
     * @inheritDoc
     */
    copy(): CheckpointDB;
}
//# sourceMappingURL=checkpoint.d.ts.map