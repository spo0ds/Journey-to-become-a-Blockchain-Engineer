if (!IS_BROWSER) var crypto = await import('crypto') // eslint-disable-line no-var

/**
 * Secure random bytes for both node and browsers. Node version uses crypto.randomBytes() and browser one self.crypto.getRandomValues()
 *
 * @param byteLength - The desired number of random bytes
 * @param forceLength - Set to true if you want to force the output to have a bit length of 8*byteLength. It basically forces the msb to be 1
 *
 * @throws {@link RangeError} if byteLength < 1
 *
 * @returns A promise that resolves to a UInt8Array/Buffer (Browser/Node.js) filled with cryptographically secure random bytes
 */
export function randBytes (byteLength: number, forceLength = false): Promise<Uint8Array|Buffer> { // eslint-disable-line
  if (byteLength < 1) throw new RangeError('byteLength MUST be > 0')

  return new Promise(function (resolve, reject) {
    if (!IS_BROWSER) {
      crypto.randomBytes(byteLength, function (err, buf: Buffer) {
        if (err !== null) reject(err)
        // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
        if (forceLength) buf[0] = buf[0] | 128
        resolve(buf)
      })
    } else { // browser
      const buf = new Uint8Array(byteLength)
      self.crypto.getRandomValues(buf)
      // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
      if (forceLength) buf[0] = buf[0] | 128
      resolve(buf)
    }
  })
}

/**
 * Secure random bytes for both node and browsers. Node version uses crypto.randomFill() and browser one self.crypto.getRandomValues()
 * This is the synchronous version, consider using the asynchronous one for improved efficiency.
 *
 * @param byteLength - The desired number of random bytes
 * @param forceLength - Set to true if you want to force the output to have a bit length of 8*byteLength. It basically forces the msb to be 1
 *
 * @throws {@link RangeError} if byteLength < 1
 *
 * @returns A UInt8Array/Buffer (Browser/Node.js) filled with cryptographically secure random bytes
 */
export function randBytesSync (byteLength: number, forceLength: boolean = false): Uint8Array|Buffer {
  if (byteLength < 1) throw new RangeError('byteLength MUST be > 0')

  /* eslint-disable no-lone-blocks */
  if (!IS_BROWSER) { // node
    const buf = crypto.randomBytes(byteLength)
    // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
    if (forceLength) buf[0] = buf[0] | 128
    return buf
  } else { // browser
    const buf = new Uint8Array(byteLength)
    self.crypto.getRandomValues(buf)
    // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
    if (forceLength) buf[0] = buf[0] | 128
    return buf
  }
  /* eslint-enable no-lone-blocks */
}
