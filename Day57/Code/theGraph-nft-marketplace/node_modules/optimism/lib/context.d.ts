import { AnyEntry } from "./entry";
export declare const parentEntrySlot: {
    readonly id: string;
    hasValue(): boolean;
    getValue(): AnyEntry | undefined;
    withValue<TResult, TArgs extends any[], TThis = any>(value: AnyEntry, callback: (this: TThis, ...args: TArgs) => TResult, args?: TArgs | undefined, thisArg?: TThis | undefined): TResult;
};
export { bind as bindContext, noContext, setTimeout, asyncFromGen, } from "@wry/context";
