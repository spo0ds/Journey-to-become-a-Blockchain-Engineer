import { ApolloLink, Operation, FetchResult } from '../core';
import { Observable } from '../../utilities';
import { HttpOptions } from '../http';
import { BatchLink } from '../batch';
export declare namespace BatchHttpLink {
    type Options = Pick<BatchLink.Options, 'batchMax' | 'batchDebounce' | 'batchInterval' | 'batchKey'> & HttpOptions;
}
export declare class BatchHttpLink extends ApolloLink {
    private batchDebounce?;
    private batchInterval;
    private batchMax;
    private batcher;
    constructor(fetchParams?: BatchHttpLink.Options);
    request(operation: Operation): Observable<FetchResult> | null;
}
//# sourceMappingURL=batchHttpLink.d.ts.map