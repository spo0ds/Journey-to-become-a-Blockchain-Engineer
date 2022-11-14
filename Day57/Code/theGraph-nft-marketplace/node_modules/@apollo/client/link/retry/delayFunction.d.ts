import { Operation } from '../core';
export interface DelayFunction {
    (count: number, operation: Operation, error: any): number;
}
export interface DelayFunctionOptions {
    initial?: number;
    max?: number;
    jitter?: boolean;
}
export declare function buildDelayFunction(delayOptions?: DelayFunctionOptions): DelayFunction;
//# sourceMappingURL=delayFunction.d.ts.map