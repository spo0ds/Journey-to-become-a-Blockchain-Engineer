/**
 * A probably-prime (Miller-Rabin), cryptographically-secure, random-number generator.
 * The browser version uses web workers to parallelise prime look up. Therefore, it does not lock the UI
 * main process, and it can be much faster (if several cores or cpu are available).
 * The node version can also use worker_threads if they are available (enabled by default with Node 11 and
 * and can be enabled at runtime executing node --experimental-worker with node >=10.5.0).
 *
 * @param bitLength - The required bit length for the generated prime
 * @param iterations - The number of iterations for the Miller-Rabin Probabilistic Primality Test
 *
 * @throws {@link RangeError} if bitLength < 1
 *
 * @returns A promise that resolves to a bigint probable prime of bitLength bits.
 */
export declare function prime(bitLength: number, iterations?: number): Promise<bigint>;
/**
 * A probably-prime (Miller-Rabin), cryptographically-secure, random-number generator.
 * The sync version is NOT RECOMMENDED since it won't use workers and thus it'll be slower and may freeze thw window in browser's javascript. Please consider using prime() instead.
 *
 * @param bitLength - The required bit length for the generated prime
 * @param iterations - The number of iterations for the Miller-Rabin Probabilistic Primality Test
 *
 * @throws {@link RangeError} if bitLength < 1
 *
 * @returns A bigint probable prime of bitLength bits.
 */
export declare function primeSync(bitLength: number, iterations?: number): bigint;
//# sourceMappingURL=prime.d.ts.map