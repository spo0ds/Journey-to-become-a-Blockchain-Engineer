import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { MutationHookOptions, MutationTuple } from '../types/types';
import { ApolloCache, DefaultContext, OperationVariables } from '../../core';
export declare function useMutation<TData = any, TVariables = OperationVariables, TContext = DefaultContext, TCache extends ApolloCache<any> = ApolloCache<any>>(mutation: DocumentNode | TypedDocumentNode<TData, TVariables>, options?: MutationHookOptions<TData, TVariables, TContext>): MutationTuple<TData, TVariables, TContext, TCache>;
//# sourceMappingURL=useMutation.d.ts.map