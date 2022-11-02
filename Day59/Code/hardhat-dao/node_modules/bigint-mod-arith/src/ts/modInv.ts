import { eGcd } from './egcd'
import { toZn } from './toZn'
/**
 * Modular inverse.
 *
 * @param a The number to find an inverse for
 * @param n The modulo
 *
 * @throws {@link RangeError} if a does not have inverse modulo n
 *
 * @returns The inverse modulo n
 */
export function modInv (a: number|bigint, n: number|bigint): bigint {
  const egcd = eGcd(toZn(a, n), n)
  if (egcd.g !== 1n) {
    throw new RangeError(`${a.toString()} does not have inverse modulo ${n.toString()}`) // modular inverse does not exist
  } else {
    return toZn(egcd.x, n)
  }
}
