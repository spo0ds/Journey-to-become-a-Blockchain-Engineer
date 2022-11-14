import { FetchResult, NextLink, Operation } from '../core';
import { Observable } from '../../utilities';
export declare type BatchHandler = (operations: Operation[], forward?: (NextLink | undefined)[]) => Observable<FetchResult[]> | null;
export interface BatchableRequest {
    operation: Operation;
    forward?: NextLink;
}
export declare class OperationBatcher {
    private batchesByKey;
    private scheduledBatchTimer;
    private batchDebounce?;
    private batchInterval?;
    private batchMax;
    private batchHandler;
    private batchKey;
    constructor({ batchDebounce, batchInterval, batchMax, batchHandler, batchKey, }: {
        batchDebounce?: boolean;
        batchInterval?: number;
        batchMax?: number;
        batchHandler: BatchHandler;
        batchKey?: (operation: Operation) => string;
    });
    enqueueRequest(request: BatchableRequest): Observable<FetchResult>;
    consumeQueue(key?: string): (Observable<FetchResult> | undefined)[] | undefined;
    private scheduleQueueConsumption;
}
//# sourceMappingURL=batching.d.ts.map