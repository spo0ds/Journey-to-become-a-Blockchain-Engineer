import { abs } from './abs'
import { gcd } from './gcd'
/**
 * The least common multiple computed as abs(a*b)/gcd(a,b)
 * @param a
 * @param b
 *
 * @returns The least common multiple of a and b
 */
export function lcm (a: number|bigint, b: number|bigint): bigint {
  if (typeof a === 'number') a = BigInt(a)
  if (typeof b === 'number') b = BigInt(b)

  if (a === 0n && b === 0n) return BigInt(0)
  // return abs(a * b) as bigint / gcd(a, b)
  return abs((a / gcd(a, b)) * b) as bigint
}
