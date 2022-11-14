import type { QueryOptions, WatchQueryOptions, MutationOptions } from "../../core";
declare type OptionsUnion<TData, TVariables, TContext> = WatchQueryOptions<TVariables, TData> | QueryOptions<TVariables, TData> | MutationOptions<TData, TVariables, TContext>;
export declare function mergeOptions<TOptions extends OptionsUnion<any, any, any>>(defaults: TOptions | Partial<TOptions> | undefined, options: TOptions | Partial<TOptions>): TOptions;
export {};
//# sourceMappingURL=mergeOptions.d.ts.map