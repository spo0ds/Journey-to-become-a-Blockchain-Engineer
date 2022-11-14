import { ApolloLink, Operation, FetchResult, NextLink } from '../core';
import { Observable } from '../../utilities';
import { DelayFunction, DelayFunctionOptions } from './delayFunction';
import { RetryFunction, RetryFunctionOptions } from './retryFunction';
export declare namespace RetryLink {
    interface Options {
        delay?: DelayFunctionOptions | DelayFunction;
        attempts?: RetryFunctionOptions | RetryFunction;
    }
}
export declare class RetryLink extends ApolloLink {
    private delayFor;
    private retryIf;
    constructor(options?: RetryLink.Options);
    request(operation: Operation, nextLink: NextLink): Observable<FetchResult>;
}
//# sourceMappingURL=retryLink.d.ts.map