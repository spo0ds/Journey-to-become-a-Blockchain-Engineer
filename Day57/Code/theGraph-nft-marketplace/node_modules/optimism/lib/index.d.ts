import { Trie } from "@wry/trie";
export { bindContext, noContext, setTimeout, asyncFromGen, } from "./context";
export { dep, OptimisticDependencyFunction } from "./dep";
export declare const defaultMakeCacheKey: (...args: any[]) => any;
export { Trie as KeyTrie };
export declare type OptimisticWrapperFunction<TArgs extends any[], TResult, TKeyArgs extends any[] = TArgs, TCacheKey = any> = ((...args: TArgs) => TResult) & {
    readonly size: number;
    dirty: (...args: TKeyArgs) => void;
    dirtyKey: (key: TCacheKey) => void;
    peek: (...args: TKeyArgs) => TResult | undefined;
    peekKey: (key: TCacheKey) => TResult | undefined;
    forget: (...args: TKeyArgs) => boolean;
    forgetKey: (key: TCacheKey) => boolean;
    getKey: (...args: TArgs) => TCacheKey;
    makeCacheKey: (...args: TKeyArgs) => TCacheKey;
};
export declare type OptimisticWrapOptions<TArgs extends any[], TKeyArgs extends any[] = TArgs, TCacheKey = any> = {
    max?: number;
    keyArgs?: (...args: TArgs) => TKeyArgs;
    makeCacheKey?: (...args: TKeyArgs) => TCacheKey;
    subscribe?: (...args: TArgs) => void | (() => any);
};
export declare function wrap<TArgs extends any[], TResult, TKeyArgs extends any[] = TArgs, TCacheKey = any>(originalFunction: (...args: TArgs) => TResult, options?: OptimisticWrapOptions<TArgs, TKeyArgs>): OptimisticWrapperFunction<TArgs, TResult, TKeyArgs, TCacheKey>;
