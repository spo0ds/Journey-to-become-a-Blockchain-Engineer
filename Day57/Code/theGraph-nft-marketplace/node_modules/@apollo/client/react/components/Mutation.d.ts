/// <reference types="react" />
import * as PropTypes from 'prop-types';
import { OperationVariables } from '../../core';
import { MutationComponentOptions } from './types';
export declare function Mutation<TData = any, TVariables = OperationVariables>(props: MutationComponentOptions<TData, TVariables>): JSX.Element | null;
export declare namespace Mutation {
    var propTypes: PropTypes.InferProps<MutationComponentOptions<any, any, import("../../core").DefaultContext, import("../../core").ApolloCache<any>>>;
}
export interface Mutation<TData, TVariables> {
    propTypes: PropTypes.InferProps<MutationComponentOptions<TData, TVariables>>;
}
//# sourceMappingURL=Mutation.d.ts.map