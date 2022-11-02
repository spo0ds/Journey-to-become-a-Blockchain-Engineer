/**
 * The test first tries if any of the first 250 small primes are a factor of the input number and then passes several
 * iterations of Miller-Rabin Probabilistic Primality Test (FIPS 186-4 C.3.1)
 *
 * @param w - A positive integer to be tested for primality
 * @param iterations - The number of iterations for the primality test. The value shall be consistent with Table C.1, C.2 or C.3 of FIPS 186-4
 * @param disableWorkers - Disable the use of workers for the primality test
 *
 * @throws {@link RangeError} if w<0
 *
 * @returns A promise that resolves to a boolean that is either true (a probably prime number) or false (definitely composite)
 */
export declare function isProbablyPrime(w: number | bigint, iterations?: number, disableWorkers?: boolean): Promise<boolean>;
export declare function _isProbablyPrime(w: bigint, iterations: number): boolean;
export declare function _isProbablyPrimeWorkerUrl(): string;
//# sourceMappingURL=isProbablyPrime.d.ts.map