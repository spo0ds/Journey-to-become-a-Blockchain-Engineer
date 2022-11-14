import * as React from 'react';
import { DocumentNode } from 'graphql';
import { DefaultContext } from '../../core/types';
import { OperationOption, MutateProps } from './types';
import { ApolloCache } from '../../core';
export declare function withMutation<TProps extends TGraphQLVariables | {} = {}, TData extends Record<string, any> = {}, TGraphQLVariables = {}, TChildProps = MutateProps<TData, TGraphQLVariables>, TContext = DefaultContext, TCache extends ApolloCache<any> = ApolloCache<any>>(document: DocumentNode, operationOptions?: OperationOption<TProps, TData, TGraphQLVariables, TChildProps>): (WrappedComponent: React.ComponentType<TProps & TChildProps>) => React.ComponentClass<TProps>;
//# sourceMappingURL=mutation-hoc.d.ts.map