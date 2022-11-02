/// <reference types="node" />
import { CheckpointDB } from '../db';
import { Lock } from '../util/lock';
import { TrieReadStream as ReadStream } from '../util/readStream';
import type { BatchDBOp, DB, EmbeddedNode, FoundNodeFunction, Nibbles, Proof, TrieNode, TrieOpts } from '../types';
interface Path {
    node: TrieNode | null;
    remaining: Nibbles;
    stack: TrieNode[];
}
/**
 * The basic trie interface, use with `import { Trie } from '@nomicfoundation/ethereumjs-trie'`.
 * In Ethereum applications stick with the {@link SecureTrie} overlay.
 * The API for the base and the secure interface are about the same.
 */
export declare class Trie {
    private readonly _opts;
    /** The root for an empty trie */
    EMPTY_TRIE_ROOT: Buffer;
    /** The backend DB */
    protected _db: CheckpointDB;
    protected _hashLen: number;
    protected _lock: Lock;
    protected _root: Buffer;
    /**
     * Create a new trie
     * @param opts Options for instantiating the trie
     */
    constructor(opts?: TrieOpts);
    static create(opts?: TrieOpts): Promise<Trie>;
    database(db?: DB): CheckpointDB;
    /**
     * Gets and/or Sets the current root of the `trie`
     */
    root(value?: Buffer | null): Buffer;
    /**
     * Checks if a given root exists.
     */
    checkRoot(root: Buffer): Promise<boolean>;
    /**
     * Gets a value given a `key`
     * @param key - the key to search for
     * @param throwIfMissing - if true, throws if any nodes are missing. Used for verifying proofs. (default: false)
     * @returns A Promise that resolves to `Buffer` if a value was found or `null` if no value was found.
     */
    get(key: Buffer, throwIfMissing?: boolean): Promise<Buffer | null>;
    /**
     * Stores a given `value` at the given `key` or do a delete if `value` is empty
     * (delete operations are only executed on DB with `deleteFromDB` set to `true`)
     * @param key
     * @param value
     * @returns A Promise that resolves once value is stored.
     */
    put(key: Buffer, value: Buffer): Promise<void>;
    /**
     * Deletes a value given a `key` from the trie
     * (delete operations are only executed on DB with `deleteFromDB` set to `true`)
     * @param key
     * @returns A Promise that resolves once value is deleted.
     */
    del(key: Buffer): Promise<void>;
    /**
     * Tries to find a path to the node for the given key.
     * It returns a `stack` of nodes to the closest node.
     * @param key - the search key
     * @param throwIfMissing - if true, throws if any nodes are missing. Used for verifying proofs. (default: false)
     */
    findPath(key: Buffer, throwIfMissing?: boolean): Promise<Path>;
    /**
     * Walks a trie until finished.
     * @param root
     * @param onFound - callback to call when a node is found. This schedules new tasks. If no tasks are available, the Promise resolves.
     * @returns Resolves when finished walking trie.
     */
    walkTrie(root: Buffer, onFound: FoundNodeFunction): Promise<void>;
    /**
     * Creates the initial node from an empty tree.
     * @private
     */
    _createInitialNode(key: Buffer, value: Buffer): Promise<void>;
    /**
     * Retrieves a node from db by hash.
     */
    lookupNode(node: Buffer | Buffer[]): Promise<TrieNode | null>;
    /**
     * Updates a node.
     * @private
     * @param key
     * @param value
     * @param keyRemainder
     * @param stack
     */
    _updateNode(k: Buffer, value: Buffer, keyRemainder: Nibbles, stack: TrieNode[]): Promise<void>;
    /**
     * Deletes a node from the trie.
     * @private
     */
    _deleteNode(k: Buffer, stack: TrieNode[]): Promise<void>;
    /**
     * Saves a stack of nodes to the database.
     * @private
     * @param key - the key. Should follow the stack
     * @param stack - a stack of nodes to the value given by the key
     * @param opStack - a stack of levelup operations to commit at the end of this funciton
     */
    _saveStack(key: Nibbles, stack: TrieNode[], opStack: BatchDBOp[]): Promise<void>;
    /**
     * Formats node to be saved by `levelup.batch`.
     * @private
     * @param node - the node to format.
     * @param topLevel - if the node is at the top level.
     * @param opStack - the opStack to push the node's data.
     * @param remove - whether to remove the node
     * @returns The node's hash used as the key or the rawNode.
     */
    _formatNode(node: TrieNode, topLevel: boolean, opStack: BatchDBOp[], remove?: boolean): Buffer | (EmbeddedNode | null)[];
    /**
     * The given hash of operations (key additions or deletions) are executed on the trie
     * (delete operations are only executed on DB with `deleteFromDB` set to `true`)
     * @example
     * const ops = [
     *    { type: 'del', key: Buffer.from('father') }
     *  , { type: 'put', key: Buffer.from('name'), value: Buffer.from('Yuri Irsenovich Kim') }
     *  , { type: 'put', key: Buffer.from('dob'), value: Buffer.from('16 February 1941') }
     *  , { type: 'put', key: Buffer.from('spouse'), value: Buffer.from('Kim Young-sook') }
     *  , { type: 'put', key: Buffer.from('occupation'), value: Buffer.from('Clown') }
     * ]
     * await trie.batch(ops)
     * @param ops
     */
    batch(ops: BatchDBOp[]): Promise<void>;
    /**
     * Saves the nodes from a proof into the trie.
     * @param proof
     */
    fromProof(proof: Proof): Promise<void>;
    /**
     * Creates a proof from a trie and key that can be verified using {@link Trie.verifyProof}.
     * @param key
     */
    createProof(key: Buffer): Promise<Proof>;
    /**
     * Verifies a proof.
     * @param rootHash
     * @param key
     * @param proof
     * @throws If proof is found to be invalid.
     * @returns The value from the key, or null if valid proof of non-existence.
     */
    verifyProof(rootHash: Buffer, key: Buffer, proof: Proof): Promise<Buffer | null>;
    /**
     * {@link verifyRangeProof}
     */
    verifyRangeProof(rootHash: Buffer, firstKey: Buffer | null, lastKey: Buffer | null, keys: Buffer[], values: Buffer[], proof: Buffer[] | null): Promise<boolean>;
    verifyPrunedIntegrity(): Promise<boolean>;
    /**
     * The `data` event is given an `Object` that has two properties; the `key` and the `value`. Both should be Buffers.
     * @return Returns a [stream](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_class_stream_readable) of the contents of the `trie`
     */
    createReadStream(): ReadStream;
    /**
     * Returns a copy of the underlying trie.
     * @param includeCheckpoints - If true and during a checkpoint, the copy will contain the checkpointing metadata and will use the same scratch as underlying db.
     */
    copy(includeCheckpoints?: boolean): Trie;
    /**
     * Persists the root hash in the underlying database
     */
    persistRoot(): Promise<void>;
    /**
     * Finds all nodes that are stored directly in the db
     * (some nodes are stored raw inside other nodes)
     * called by {@link ScratchReadStream}
     * @private
     */
    _findDbNodes(onFound: FoundNodeFunction): Promise<void>;
    /**
     * Returns the key practically applied for trie construction
     * depending on the `useKeyHashing` option being set or not.
     * @param key
     */
    protected appliedKey(key: Buffer): Buffer;
    protected hash(msg: Uint8Array): Buffer;
    /**
     * Is the trie during a checkpoint phase?
     */
    hasCheckpoints(): boolean;
    /**
     * Creates a checkpoint that can later be reverted to or committed.
     * After this is called, all changes can be reverted until `commit` is called.
     */
    checkpoint(): void;
    /**
     * Commits a checkpoint to disk, if current checkpoint is not nested.
     * If nested, only sets the parent checkpoint as current checkpoint.
     * @throws If not during a checkpoint phase
     */
    commit(): Promise<void>;
    /**
     * Reverts the trie to the state it was at when `checkpoint` was first called.
     * If during a nested checkpoint, sets root to most recent checkpoint, and sets
     * parent checkpoint as current.
     */
    revert(): Promise<void>;
    /**
     * Flushes all checkpoints, restoring the initial checkpoint state.
     */
    flushCheckpoints(): void;
}
export {};
//# sourceMappingURL=trie.d.ts.map