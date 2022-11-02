export function fromBuffer (buf: Uint8Array|Buffer): bigint {
  let ret = 0n
  for (const i of buf.values()) {
    const bi = BigInt(i)
    ret = (ret << 8n) + bi
  }
  return ret
}
