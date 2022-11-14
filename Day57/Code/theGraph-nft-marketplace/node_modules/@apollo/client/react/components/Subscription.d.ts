/// <reference types="react" />
import * as PropTypes from 'prop-types';
import { OperationVariables } from '../../core';
import { SubscriptionComponentOptions } from './types';
export declare function Subscription<TData = any, TVariables = OperationVariables>(props: SubscriptionComponentOptions<TData, TVariables>): JSX.Element | null;
export declare namespace Subscription {
    var propTypes: PropTypes.InferProps<SubscriptionComponentOptions<any, any>>;
}
export interface Subscription<TData, TVariables> {
    propTypes: PropTypes.InferProps<SubscriptionComponentOptions<TData, TVariables>>;
}
//# sourceMappingURL=Subscription.d.ts.map