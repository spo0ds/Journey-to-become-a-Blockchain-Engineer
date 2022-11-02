export interface Egcd {
    g: bigint;
    x: bigint;
    y: bigint;
}
/**
 * An iterative implementation of the extended euclidean algorithm or extended greatest common divisor algorithm.
 * Take positive integers a, b as input, and return a triple (g, x, y), such that ax + by = g = gcd(a, b).
 *
 * @param a
 * @param b
 *
 * @throws {@link RangeError} if a or b are <= 0
 *
 * @returns A triple (g, x, y), such that ax + by = g = gcd(a, b).
 */
export declare function eGcd(a: number | bigint, b: number | bigint): Egcd;
//# sourceMappingURL=egcd.d.ts.map