import { AnyEntry } from "./entry";
import { OptimisticWrapOptions } from "./index";
import { Unsubscribable } from "./helpers";
declare type EntryMethodName = keyof typeof EntryMethods;
declare const EntryMethods: {
    setDirty: boolean;
    dispose: boolean;
    forget: boolean;
};
export declare type OptimisticDependencyFunction<TKey> = ((key: TKey) => void) & {
    dirty: (key: TKey, entryMethodName?: EntryMethodName) => void;
};
export declare type Dep<TKey> = Set<AnyEntry> & {
    subscribe: OptimisticWrapOptions<[TKey]>["subscribe"];
} & Unsubscribable;
export declare function dep<TKey>(options?: {
    subscribe: Dep<TKey>["subscribe"];
}): OptimisticDependencyFunction<TKey>;
export {};
