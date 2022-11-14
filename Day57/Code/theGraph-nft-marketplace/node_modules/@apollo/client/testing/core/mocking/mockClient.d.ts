import { DocumentNode } from 'graphql';
import { ApolloClient } from '../../../core';
import { NormalizedCacheObject } from '../../../cache';
export declare function createMockClient<TData>(data: TData, query: DocumentNode, variables?: {}): ApolloClient<NormalizedCacheObject>;
//# sourceMappingURL=mockClient.d.ts.map