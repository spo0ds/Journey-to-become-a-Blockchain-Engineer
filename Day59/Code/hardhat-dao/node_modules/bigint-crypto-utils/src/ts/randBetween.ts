import { bitLength } from 'bigint-mod-arith'
import { fromBuffer } from './fromBuffer'
import { randBitsSync } from './randBits'

/**
 * Returns a cryptographically secure random integer between [min,max].
 * @param max Returned value will be <= max
 * @param min Returned value will be >= min
 *
 * @throws {@link RangeError} if max <= min
 *
 * @returns A cryptographically secure random bigint between [min,max]
 */
export function randBetween (max: bigint, min: bigint = 1n): bigint {
  if (max <= min) throw new RangeError('Arguments MUST be: max > min')
  const interval = max - min
  const bitLen = bitLength(interval)
  let rnd
  do {
    const buf = randBitsSync(bitLen)
    rnd = fromBuffer(buf)
  } while (rnd > interval)
  return rnd + min
}
