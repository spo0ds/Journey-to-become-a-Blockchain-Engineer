/**
 * Maximum. max(a,b)==a if a>=b. max(a,b)==b if a<b
 *
 * @param a
 * @param b
 *
 * @returns Maximum of numbers a and b
 */
export function max (a: number|bigint, b: number|bigint): number|bigint {
  return (a >= b) ? a : b
}
