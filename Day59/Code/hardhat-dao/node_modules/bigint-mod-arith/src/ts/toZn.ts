/**
 * Finds the smallest positive element that is congruent to a in modulo n
 *
 * @remarks
 * a and b must be the same type, either number or bigint
 *
 * @param a - An integer
 * @param n - The modulo
 *
 * @throws {@link RangeError} if n <= 0
 *
 * @returns A bigint with the smallest positive representation of a modulo n
 */
export function toZn (a: number|bigint, n: number|bigint): bigint {
  if (typeof a === 'number') a = BigInt(a)
  if (typeof n === 'number') n = BigInt(n)

  if (n <= 0n) {
    throw new RangeError('n must be > 0')
  }

  const aZn = a % n
  return (aZn < 0n) ? aZn + n : aZn
}
