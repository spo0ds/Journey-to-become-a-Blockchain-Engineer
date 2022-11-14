import { ApolloLink, Operation, FetchResult, NextLink } from '../core';
import { Observable } from '../../utilities';
import { BatchHandler } from './batching';
export { OperationBatcher, BatchableRequest, BatchHandler } from './batching';
export declare namespace BatchLink {
    interface Options {
        batchInterval?: number;
        batchDebounce?: boolean;
        batchMax?: number;
        batchHandler?: BatchHandler;
        batchKey?: (operation: Operation) => string;
    }
}
export declare class BatchLink extends ApolloLink {
    private batcher;
    constructor(fetchParams?: BatchLink.Options);
    request(operation: Operation, forward?: NextLink): Observable<FetchResult> | null;
}
//# sourceMappingURL=batchLink.d.ts.map