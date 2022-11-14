export declare class Cache<K = any, V = any> {
    private max;
    dispose: (value: V, key: K) => void;
    private map;
    private newest;
    private oldest;
    constructor(max?: number, dispose?: (value: V, key: K) => void);
    has(key: K): boolean;
    get(key: K): V | undefined;
    private getNode;
    set(key: K, value: V): V;
    clean(): void;
    delete(key: K): boolean;
}
