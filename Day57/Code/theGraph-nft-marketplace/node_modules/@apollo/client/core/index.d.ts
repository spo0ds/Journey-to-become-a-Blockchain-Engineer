export { ApolloClient, ApolloClientOptions, DefaultOptions, mergeOptions, } from './ApolloClient';
export { ObservableQuery, FetchMoreOptions, UpdateQueryOptions, } from './ObservableQuery';
export { QueryOptions, WatchQueryOptions, MutationOptions, SubscriptionOptions, FetchPolicy, WatchQueryFetchPolicy, ErrorPolicy, FetchMoreQueryOptions, SubscribeToMoreOptions, } from './watchQueryOptions';
export { NetworkStatus } from './networkStatus';
export * from './types';
export { Resolver, FragmentMatcher, } from './LocalState';
export { isApolloError, ApolloError } from '../errors';
export { Cache, ApolloCache, Transaction, DataProxy, InMemoryCache, InMemoryCacheConfig, MissingFieldError, defaultDataIdFromObject, ReactiveVar, makeVar, TypePolicies, TypePolicy, FieldPolicy, FieldReadFunction, FieldMergeFunction, FieldFunctionOptions, PossibleTypesMap, } from '../cache';
export * from '../cache/inmemory/types';
export * from '../link/core';
export * from '../link/http';
export { fromError, toPromise, fromPromise, ServerError, throwServerError, } from '../link/utils';
export { Observable, Observer, ObservableSubscription, Reference, isReference, makeReference, StoreObject, } from '../utilities';
import { setVerbosity } from "ts-invariant";
export { setVerbosity as setLogVerbosity };
export { gql, resetCaches, disableFragmentWarnings, enableExperimentalFragmentVariables, disableExperimentalFragmentVariables, } from 'graphql-tag';
//# sourceMappingURL=index.d.ts.map