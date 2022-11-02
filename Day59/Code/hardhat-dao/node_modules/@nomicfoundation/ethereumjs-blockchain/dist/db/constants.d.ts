/// <reference types="node" />
declare const HEADS_KEY = "heads";
/**
 * Current canonical head for light sync
 */
declare const HEAD_HEADER_KEY = "LastHeader";
/**
 * Current canonical head for full sync
 */
declare const HEAD_BLOCK_KEY = "LastBlock";
/**
 * Convert bigint to big endian Buffer
 */
declare const bufBE8: (n: bigint) => Buffer;
declare const tdKey: (n: bigint, hash: Buffer) => Buffer;
declare const headerKey: (n: bigint, hash: Buffer) => Buffer;
declare const bodyKey: (n: bigint, hash: Buffer) => Buffer;
declare const numberToHashKey: (n: bigint) => Buffer;
declare const hashToNumberKey: (hash: Buffer) => Buffer;
/**
 * @hidden
 */
export { bodyKey, bufBE8, hashToNumberKey, HEAD_BLOCK_KEY, HEAD_HEADER_KEY, headerKey, HEADS_KEY, numberToHashKey, tdKey, };
//# sourceMappingURL=constants.d.ts.map