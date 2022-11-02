/**
 * Minimum. min(a,b)==b if a>=b. min(a,b)==a if a<b
 *
 * @param a
 * @param b
 *
 * @returns Minimum of numbers a and b
 */
export function min (a: number|bigint, b: number|bigint): number|bigint {
  return (a >= b) ? b : a
}
