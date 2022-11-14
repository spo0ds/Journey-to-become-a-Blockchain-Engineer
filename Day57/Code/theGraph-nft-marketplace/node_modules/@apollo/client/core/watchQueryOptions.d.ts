import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { FetchResult } from '../link/core';
import { DefaultContext, MutationQueryReducersMap, OperationVariables, MutationUpdaterFunction, OnQueryUpdated, InternalRefetchQueriesInclude } from './types';
import { ApolloCache } from '../cache';
import { ObservableQuery } from './ObservableQuery';
export declare type FetchPolicy = 'cache-first' | 'network-only' | 'cache-only' | 'no-cache' | 'standby';
export declare type WatchQueryFetchPolicy = FetchPolicy | 'cache-and-network';
export declare type MutationFetchPolicy = Extract<FetchPolicy, 'network-only' | 'no-cache'>;
export declare type RefetchWritePolicy = "merge" | "overwrite";
export declare type ErrorPolicy = 'none' | 'ignore' | 'all';
export interface QueryOptions<TVariables = OperationVariables, TData = any> {
    query: DocumentNode | TypedDocumentNode<TData, TVariables>;
    variables?: TVariables;
    errorPolicy?: ErrorPolicy;
    context?: any;
    fetchPolicy?: FetchPolicy;
    pollInterval?: number;
    notifyOnNetworkStatusChange?: boolean;
    returnPartialData?: boolean;
    partialRefetch?: boolean;
    canonizeResults?: boolean;
}
export interface WatchQueryOptions<TVariables = OperationVariables, TData = any> extends Omit<QueryOptions<TVariables, TData>, 'fetchPolicy'> {
    fetchPolicy?: WatchQueryFetchPolicy;
    nextFetchPolicy?: WatchQueryFetchPolicy | ((this: WatchQueryOptions<TVariables, TData>, currentFetchPolicy: WatchQueryFetchPolicy, context: NextFetchPolicyContext<TData, TVariables>) => WatchQueryFetchPolicy);
    initialFetchPolicy?: WatchQueryFetchPolicy;
    refetchWritePolicy?: RefetchWritePolicy;
}
export interface NextFetchPolicyContext<TData, TVariables> {
    reason: "after-fetch" | "variables-changed";
    observable: ObservableQuery<TData, TVariables>;
    options: WatchQueryOptions<TVariables, TData>;
    initialFetchPolicy: WatchQueryFetchPolicy;
}
export interface FetchMoreQueryOptions<TVariables, TData = any> {
    query?: DocumentNode | TypedDocumentNode<TData, TVariables>;
    variables?: Partial<TVariables>;
    context?: any;
}
export declare type UpdateQueryFn<TData = any, TSubscriptionVariables = OperationVariables, TSubscriptionData = TData> = (previousQueryResult: TData, options: {
    subscriptionData: {
        data: TSubscriptionData;
    };
    variables?: TSubscriptionVariables;
}) => TData;
export declare type SubscribeToMoreOptions<TData = any, TSubscriptionVariables = OperationVariables, TSubscriptionData = TData> = {
    document: DocumentNode | TypedDocumentNode<TSubscriptionData, TSubscriptionVariables>;
    variables?: TSubscriptionVariables;
    updateQuery?: UpdateQueryFn<TData, TSubscriptionVariables, TSubscriptionData>;
    onError?: (error: Error) => void;
    context?: DefaultContext;
};
export interface SubscriptionOptions<TVariables = OperationVariables, TData = any> {
    query: DocumentNode | TypedDocumentNode<TData, TVariables>;
    variables?: TVariables;
    fetchPolicy?: FetchPolicy;
    errorPolicy?: ErrorPolicy;
    context?: DefaultContext;
}
export interface MutationBaseOptions<TData = any, TVariables = OperationVariables, TContext = DefaultContext, TCache extends ApolloCache<any> = ApolloCache<any>> {
    optimisticResponse?: TData | ((vars: TVariables) => TData);
    updateQueries?: MutationQueryReducersMap<TData>;
    refetchQueries?: ((result: FetchResult<TData>) => InternalRefetchQueriesInclude) | InternalRefetchQueriesInclude;
    awaitRefetchQueries?: boolean;
    update?: MutationUpdaterFunction<TData, TVariables, TContext, TCache>;
    onQueryUpdated?: OnQueryUpdated<any>;
    errorPolicy?: ErrorPolicy;
    variables?: TVariables;
    context?: TContext;
}
export interface MutationOptions<TData = any, TVariables = OperationVariables, TContext = DefaultContext, TCache extends ApolloCache<any> = ApolloCache<any>> extends MutationBaseOptions<TData, TVariables, TContext, TCache> {
    mutation: DocumentNode | TypedDocumentNode<TData, TVariables>;
    fetchPolicy?: MutationFetchPolicy;
    keepRootFields?: boolean;
}
//# sourceMappingURL=watchQueryOptions.d.ts.map