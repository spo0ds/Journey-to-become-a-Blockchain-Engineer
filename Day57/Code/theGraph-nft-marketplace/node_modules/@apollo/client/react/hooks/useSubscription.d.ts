import '../../utilities/globals';
import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { SubscriptionHookOptions, SubscriptionResult } from '../types/types';
import { OperationVariables } from '../../core';
export declare function useSubscription<TData = any, TVariables = OperationVariables>(subscription: DocumentNode | TypedDocumentNode<TData, TVariables>, options?: SubscriptionHookOptions<TData, TVariables>): SubscriptionResult<TData, any>;
//# sourceMappingURL=useSubscription.d.ts.map