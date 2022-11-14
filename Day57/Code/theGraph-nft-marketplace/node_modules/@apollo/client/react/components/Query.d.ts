/// <reference types="react" />
import * as PropTypes from 'prop-types';
import { OperationVariables } from '../../core';
import { QueryComponentOptions } from './types';
export declare function Query<TData = any, TVariables = OperationVariables>(props: QueryComponentOptions<TData, TVariables>): JSX.Element | null;
export declare namespace Query {
    var propTypes: PropTypes.InferProps<QueryComponentOptions<any, any>>;
}
export interface Query<TData, TVariables> {
    propTypes: PropTypes.InferProps<QueryComponentOptions<TData, TVariables>>;
}
//# sourceMappingURL=Query.d.ts.map