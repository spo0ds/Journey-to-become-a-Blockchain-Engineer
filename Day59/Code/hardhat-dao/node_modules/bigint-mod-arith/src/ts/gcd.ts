import { abs } from './abs'
/**
 * Greatest common divisor of two integers based on the iterative binary algorithm.
 *
 * @param a
 * @param b
 *
 * @returns The greatest common divisor of a and b
 */
export function gcd (a: number|bigint, b: number|bigint): bigint {
  let aAbs = (typeof a === 'number') ? BigInt(abs(a)) : abs(a) as bigint
  let bAbs = (typeof b === 'number') ? BigInt(abs(b)) : abs(b) as bigint

  if (aAbs === 0n) {
    return bAbs
  } else if (bAbs === 0n) {
    return aAbs
  }

  let shift = 0n
  while (((aAbs | bAbs) & 1n) === 0n) {
    aAbs >>= 1n
    bAbs >>= 1n
    shift++
  }
  while ((aAbs & 1n) === 0n) aAbs >>= 1n
  do {
    while ((bAbs & 1n) === 0n) bAbs >>= 1n
    if (aAbs > bAbs) {
      const x = aAbs
      aAbs = bAbs
      bAbs = x
    }
    bAbs -= aAbs
  } while (bAbs !== 0n)

  // rescale
  return aAbs << shift
}
