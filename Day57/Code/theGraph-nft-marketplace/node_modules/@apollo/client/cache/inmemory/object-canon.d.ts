import "../../utilities/globals";
export declare class ObjectCanon {
    private known;
    private pool;
    isKnown(value: any): boolean;
    private passes;
    pass<T>(value: T): T;
    admit<T>(value: T): T;
    private sortedKeys;
    private keysByJSON;
    readonly empty: {};
}
export declare const canonicalStringify: ((value: any) => string) & {
    reset: typeof resetCanonicalStringify;
};
declare function resetCanonicalStringify(): void;
export {};
//# sourceMappingURL=object-canon.d.ts.map