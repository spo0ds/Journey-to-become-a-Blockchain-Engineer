/// <reference types="node" />
/**
 * Secure random bits for both node and browsers. Node version uses crypto.randomFill() and browser one self.crypto.getRandomValues()
 *
 * @param bitLength - The desired number of random bits
 * @param forceLength - Set to true if you want to force the output to have a specific bit length. It basically forces the msb to be 1
 *
 * @throws {@link RangeError} if bitLength < 1
 *
 * @returns A Promise that resolves to a UInt8Array/Buffer (Browser/Node.js) filled with cryptographically secure random bits
 */
export declare function randBits(bitLength: number, forceLength?: boolean): Promise<Uint8Array | Buffer>;
/**
 * Secure random bits for both node and browsers. Node version uses crypto.randomFill() and browser one self.crypto.getRandomValues()
 * @param bitLength - The desired number of random bits
 * @param forceLength - Set to true if you want to force the output to have a specific bit length. It basically forces the msb to be 1
 *
 * @throws {@link RangeError} if bitLength < 1
 *
 * @returns A Uint8Array/Buffer (Browser/Node.js) filled with cryptographically secure random bits
 */
export declare function randBitsSync(bitLength: number, forceLength?: boolean): Uint8Array | Buffer;
//# sourceMappingURL=randBits.d.ts.map