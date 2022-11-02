import { randBytes, randBytesSync } from './randBytes'

/**
 * Secure random bits for both node and browsers. Node version uses crypto.randomFill() and browser one self.crypto.getRandomValues()
 *
 * @param bitLength - The desired number of random bits
 * @param forceLength - Set to true if you want to force the output to have a specific bit length. It basically forces the msb to be 1
 *
 * @throws {@link RangeError} if bitLength < 1
 *
 * @returns A Promise that resolves to a UInt8Array/Buffer (Browser/Node.js) filled with cryptographically secure random bits
 */
export function randBits (bitLength: number, forceLength: boolean = false): Promise<Uint8Array|Buffer> { // eslint-disable-line
  if (bitLength < 1) throw new RangeError('bitLength MUST be > 0')

  const byteLength = Math.ceil(bitLength / 8)
  const bitLengthMod8 = bitLength % 8

  return new Promise((resolve, reject) => {
    randBytes(byteLength, false).then(function (rndBytes) { // eslint-disable-line
      if (bitLengthMod8 !== 0) {
        // Fill with 0's the extra bits
        rndBytes[0] = rndBytes[0] & (2 ** bitLengthMod8 - 1)
      }
      if (forceLength) {
        const mask = (bitLengthMod8 !== 0) ? 2 ** (bitLengthMod8 - 1) : 128
        rndBytes[0] = rndBytes[0] | mask
      }
      resolve(rndBytes)
    })
  })
}

/**
 * Secure random bits for both node and browsers. Node version uses crypto.randomFill() and browser one self.crypto.getRandomValues()
 * @param bitLength - The desired number of random bits
 * @param forceLength - Set to true if you want to force the output to have a specific bit length. It basically forces the msb to be 1
 *
 * @throws {@link RangeError} if bitLength < 1
 *
 * @returns A Uint8Array/Buffer (Browser/Node.js) filled with cryptographically secure random bits
 */
export function randBitsSync (bitLength: number, forceLength: boolean = false): Uint8Array|Buffer {
  if (bitLength < 1) throw new RangeError('bitLength MUST be > 0')

  const byteLength = Math.ceil(bitLength / 8)
  const rndBytes = randBytesSync(byteLength, false)
  const bitLengthMod8 = bitLength % 8
  if (bitLengthMod8 !== 0) {
    // Fill with 0's the extra bits
    rndBytes[0] = rndBytes[0] & (2 ** bitLengthMod8 - 1)
  }
  if (forceLength) {
    const mask = (bitLengthMod8 !== 0) ? 2 ** (bitLengthMod8 - 1) : 128
    rndBytes[0] = rndBytes[0] | mask
  }
  return rndBytes
}
