/**
 * Converts `null` or `undefined` values to `undefined`
 * Optionally, the value gets transformed by the second argument
 */
export declare function maybe<Value>(value: Value | null | undefined): Value | undefined;
export declare function maybe<Value, Output>(value: Value | null | undefined, transform: (value: Value) => Output): Output | undefined;
//# sourceMappingURL=maybe.d.ts.map