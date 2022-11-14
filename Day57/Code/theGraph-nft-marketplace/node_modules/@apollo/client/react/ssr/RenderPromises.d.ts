/// <reference types="react" />
import { ObservableQuery } from '../../core';
import { QueryDataOptions } from '../types/types';
interface QueryData {
    getOptions(): any;
    fetchData(): Promise<void>;
}
export declare class RenderPromises {
    private queryPromises;
    private queryInfoTrie;
    private stopped;
    stop(): void;
    registerSSRObservable<TData, TVariables>(observable: ObservableQuery<any, TVariables>): void;
    getSSRObservable<TData, TVariables>(props: QueryDataOptions<TData, TVariables>): ObservableQuery<any, TVariables> | null;
    addQueryPromise(queryInstance: QueryData, finish?: () => React.ReactNode): React.ReactNode;
    addObservableQueryPromise<TData, TVariables>(obsQuery: ObservableQuery<TData, TVariables>): import("react").ReactNode;
    hasPromises(): boolean;
    consumeAndAwaitPromises(): Promise<any[]>;
    private lookupQueryInfo;
}
export {};
//# sourceMappingURL=RenderPromises.d.ts.map