/// <reference types="node" />
/**
 * Secure random bytes for both node and browsers. Node version uses crypto.randomBytes() and browser one self.crypto.getRandomValues()
 *
 * @param byteLength - The desired number of random bytes
 * @param forceLength - Set to true if you want to force the output to have a bit length of 8*byteLength. It basically forces the msb to be 1
 *
 * @throws {@link RangeError} if byteLength < 1
 *
 * @returns A promise that resolves to a UInt8Array/Buffer (Browser/Node.js) filled with cryptographically secure random bytes
 */
export declare function randBytes(byteLength: number, forceLength?: boolean): Promise<Uint8Array | Buffer>;
/**
 * Secure random bytes for both node and browsers. Node version uses crypto.randomFill() and browser one self.crypto.getRandomValues()
 * This is the synchronous version, consider using the asynchronous one for improved efficiency.
 *
 * @param byteLength - The desired number of random bytes
 * @param forceLength - Set to true if you want to force the output to have a bit length of 8*byteLength. It basically forces the msb to be 1
 *
 * @throws {@link RangeError} if byteLength < 1
 *
 * @returns A UInt8Array/Buffer (Browser/Node.js) filled with cryptographically secure random bytes
 */
export declare function randBytesSync(byteLength: number, forceLength?: boolean): Uint8Array | Buffer;
//# sourceMappingURL=randBytes.d.ts.map