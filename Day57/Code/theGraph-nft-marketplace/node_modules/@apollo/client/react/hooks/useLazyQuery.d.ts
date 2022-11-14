import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { OperationVariables } from '../../core';
import { LazyQueryHookOptions, LazyQueryResultTuple } from '../types/types';
export declare function useLazyQuery<TData = any, TVariables = OperationVariables>(query: DocumentNode | TypedDocumentNode<TData, TVariables>, options?: LazyQueryHookOptions<TData, TVariables>): LazyQueryResultTuple<TData, TVariables>;
//# sourceMappingURL=useLazyQuery.d.ts.map