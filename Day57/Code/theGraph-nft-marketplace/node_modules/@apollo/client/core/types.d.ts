import { DocumentNode, GraphQLError } from 'graphql';
import { ApolloCache } from '../cache';
import { FetchResult } from '../link/core';
import { ApolloError } from '../errors';
import { QueryInfo } from './QueryInfo';
import { NetworkStatus } from './networkStatus';
import { Resolver } from './LocalState';
import { ObservableQuery } from './ObservableQuery';
import { QueryOptions } from './watchQueryOptions';
import { Cache } from '../cache';
import { IsStrictlyAny } from '../utilities';
export { TypedDocumentNode } from '@graphql-typed-document-node/core';
export declare type DefaultContext = Record<string, any>;
export declare type QueryListener = (queryInfo: QueryInfo) => void;
export declare type OnQueryUpdated<TResult> = (observableQuery: ObservableQuery<any>, diff: Cache.DiffResult<any>, lastDiff: Cache.DiffResult<any> | undefined) => boolean | TResult;
export declare type RefetchQueryDescriptor = string | DocumentNode;
export declare type InternalRefetchQueryDescriptor = RefetchQueryDescriptor | QueryOptions;
declare type RefetchQueriesIncludeShorthand = "all" | "active";
export declare type RefetchQueriesInclude = RefetchQueryDescriptor[] | RefetchQueriesIncludeShorthand;
export declare type InternalRefetchQueriesInclude = InternalRefetchQueryDescriptor[] | RefetchQueriesIncludeShorthand;
export interface RefetchQueriesOptions<TCache extends ApolloCache<any>, TResult> {
    updateCache?: (cache: TCache) => void;
    include?: RefetchQueriesInclude;
    optimistic?: boolean;
    onQueryUpdated?: OnQueryUpdated<TResult> | null;
}
export declare type RefetchQueriesPromiseResults<TResult> = IsStrictlyAny<TResult> extends true ? any[] : TResult extends boolean ? ApolloQueryResult<any>[] : TResult extends PromiseLike<infer U> ? U[] : TResult[];
export interface RefetchQueriesResult<TResult> extends Promise<RefetchQueriesPromiseResults<TResult>> {
    queries: ObservableQuery<any>[];
    results: InternalRefetchQueriesResult<TResult>[];
}
export interface InternalRefetchQueriesOptions<TCache extends ApolloCache<any>, TResult> extends Omit<RefetchQueriesOptions<TCache, TResult>, "include"> {
    include?: InternalRefetchQueriesInclude;
    removeOptimistic?: string;
}
export declare type InternalRefetchQueriesResult<TResult> = TResult extends boolean ? Promise<ApolloQueryResult<any>> : TResult;
export declare type InternalRefetchQueriesMap<TResult> = Map<ObservableQuery<any>, InternalRefetchQueriesResult<TResult>>;
export type { QueryOptions as PureQueryOptions };
export declare type OperationVariables = Record<string, any>;
export declare type ApolloQueryResult<T> = {
    data: T;
    errors?: ReadonlyArray<GraphQLError>;
    error?: ApolloError;
    loading: boolean;
    networkStatus: NetworkStatus;
    partial?: boolean;
};
export declare type MutationQueryReducer<T> = (previousResult: Record<string, any>, options: {
    mutationResult: FetchResult<T>;
    queryName: string | undefined;
    queryVariables: Record<string, any>;
}) => Record<string, any>;
export declare type MutationQueryReducersMap<T = {
    [key: string]: any;
}> = {
    [queryName: string]: MutationQueryReducer<T>;
};
export declare type MutationUpdaterFn<T = {
    [key: string]: any;
}> = (cache: ApolloCache<T>, mutationResult: FetchResult<T>) => void;
export declare type MutationUpdaterFunction<TData, TVariables, TContext, TCache extends ApolloCache<any>> = (cache: TCache, result: Omit<FetchResult<TData>, 'context'>, options: {
    context?: TContext;
    variables?: TVariables;
}) => void;
export interface Resolvers {
    [key: string]: {
        [field: string]: Resolver;
    };
}
//# sourceMappingURL=types.d.ts.map