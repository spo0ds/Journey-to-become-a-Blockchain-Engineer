/**
 * Absolute value. abs(a)==a if a>=0. abs(a)==-a if a<0
 *
 * @param a
 *
 * @returns The absolute value of a
 */
export function abs (a: number|bigint): number|bigint {
  return (a >= 0) ? a : -a
}
