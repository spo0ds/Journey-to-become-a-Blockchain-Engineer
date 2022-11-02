export interface Egcd {
  g: bigint
  x: bigint
  y: bigint
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
export function eGcd (a: number|bigint, b: number|bigint): Egcd {
  if (typeof a === 'number') a = BigInt(a)
  if (typeof b === 'number') b = BigInt(b)

  if (a <= 0n || b <= 0n) throw new RangeError('a and b MUST be > 0') // a and b MUST be positive

  let x = 0n
  let y = 1n
  let u = 1n
  let v = 0n

  while (a !== 0n) {
    const q = b / a
    const r: bigint = b % a
    const m = x - (u * q)
    const n = y - (v * q)
    b = a
    a = r
    x = u
    y = v
    u = m
    v = n
  }
  return {
    g: b,
    x: x,
    y: y
  }
}
