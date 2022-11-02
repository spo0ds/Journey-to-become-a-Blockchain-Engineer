import { Readable } from 'readable-stream';
import type { Trie } from '../trie';
import type { FoundNodeFunction } from '../types';
export declare class TrieReadStream extends Readable {
    private trie;
    private _started;
    constructor(trie: Trie);
    _read(): Promise<void>;
    /**
     * Finds all nodes that store k,v values
     * called by {@link TrieReadStream}
     * @private
     */
    _findValueNodes(onFound: FoundNodeFunction): Promise<void>;
}
//# sourceMappingURL=readStream.d.ts.map