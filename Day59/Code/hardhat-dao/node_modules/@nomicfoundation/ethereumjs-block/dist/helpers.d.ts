import type { BlockHeaderBuffer, HeaderData } from './types';
/**
 * Returns a 0x-prefixed hex number string from a hex string or string integer.
 * @param {string} input string to check, convert, and return
 */
export declare const numberToHex: (input?: string) => string | undefined;
export declare function valuesArrayToHeaderData(values: BlockHeaderBuffer): HeaderData;
export declare function getDifficulty(headerData: HeaderData): bigint | null;
//# sourceMappingURL=helpers.d.ts.map