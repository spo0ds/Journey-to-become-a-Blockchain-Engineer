# noble-ed25519 ![Node CI](https://github.com/paulmillr/noble-ed25519/workflows/Node%20CI/badge.svg) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

[Fastest](#speed) JS implementation of [ed25519](https://en.wikipedia.org/wiki/EdDSA),
an elliptic curve that could be used for EDDSA signature scheme and X25519 ECDH key agreement.

Conforms to [RFC7748](https://datatracker.ietf.org/doc/html/rfc7748), [RFC8032](https://tools.ietf.org/html/rfc8032) and [ZIP215](https://zips.z.cash/zip-0215). Includes support for [ristretto255](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-ristretto255-decaf448): a technique for constructing prime order elliptic curve groups with non-malleable encodings.

[**Audited**](#security) by an independent security firm: no vulnerabilities have been found. Check out [the online demo](https://paulmillr.com/noble/).

### This library belongs to _noble_ crypto

> **noble-crypto** — high-security, easily auditable set of contained cryptographic libraries and tools.

- No dependencies, one small file
- Easily auditable TypeScript/JS code
- Supported in all major browsers and stable node.js versions
- All releases are signed with PGP keys
- Check out [homepage](https://paulmillr.com/noble/) & all libraries:
  [secp256k1](https://github.com/paulmillr/noble-secp256k1),
  [ed25519](https://github.com/paulmillr/noble-ed25519),
  [bls12-381](https://github.com/paulmillr/noble-bls12-381),
  [hashes](https://github.com/paulmillr/noble-hashes)

## Usage

Use NPM in node.js / browser, or include single file from
[GitHub's releases page](https://github.com/paulmillr/noble-ed25519/releases):

> npm install @noble/ed25519

```js
// Common.js and ECMAScript Modules (ESM)
import * as ed from '@noble/ed25519';
// If you're using single file, use global variable instead: `window.nobleEd25519`

// Supports both async and sync methods, see docs
(async () => {
  // keys, messages & other inputs can be Uint8Arrays or hex strings
  // Uint8Array.from([0xde, 0xad, 0xbe, 0xef]) === 'deadbeef'
  const privateKey = ed.utils.randomPrivateKey();
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const publicKey = await ed.getPublicKey(privateKey);
  const signature = await ed.sign(message, privateKey);
  const isValid = await ed.verify(signature, message, publicKey);
})();
```

To use the module with [Deno](https://deno.land),
you will need [import map](https://deno.land/manual/linking_to_external_code/import_maps):

- `deno run --import-map=imports.json app.ts`
- app.ts: `import * as ed from "https://deno.land/x/ed25519/mod.ts";`
- imports.json: `{"imports": {"crypto": "https://deno.land/std@0.153.0/node/crypto.ts"}}`

## API

- [`getPublicKey(privateKey)`](#getpublickeyprivatekey)
- [`sign(message, privateKey)`](#signmessage-privatekey)
- [`verify(signature, message, publicKey)`](#verifysignature-message-publickey)
- [`getSharedSecret(privateKey, publicKey)`](#getsharedsecretprivatekey-publickey)
- [X25519 and curve25519](#x25519-and-curve25519)
- [ristretto255](#ristretto255)
- [Synchronous methods](#synchronous-methods)
- [Utilities](#utilities)

##### `getPublicKey(privateKey)`

```typescript
function getPublicKey(privateKey: Uint8Array | string | bigint): Promise<Uint8Array>;
```

- `privateKey: Uint8Array | string | bigint` will be used to generate public key. If you want to pass bigints,
  ensure they are Big-Endian.
- Returns `Promise<Uint8Array>`. Uses **promises**, because ed25519 uses SHA internally; and we're using built-in browser `window.crypto`, which returns `Promise`. Synchronous non-promise method is available for this and others: [see below](#synchronous-methods).

To generate ed25519 public key:

1. private key is hashed with sha512, then first 32 bytes are taken from the hash
2. 3 least significant bits of the first byte are cleared

- Use `Point.fromPrivateKey(privateKey)` if you want `Point` instance instead
- Use `Point.fromHex(publicKey)` if you want to convert hex / bytes into Point.
  It will use decompression algorithm 5.1.3 of RFC 8032.
- Use `utils.getExtendedPublicKey` if you need full SHA512 hash of seed

##### `sign(message, privateKey)`

```typescript
function sign(message: Uint8Array | string, privateKey: Uint8Array | string): Promise<Uint8Array>;
```

- `message: Uint8Array | string` - message (not message hash) which would be signed
- `privateKey: Uint8Array | string` - private key which will sign the hash
- Returns EdDSA signature. You can consume it with `Signature.fromHex()` method:
  - `Signature.fromHex(ed25519.sign(hash, privateKey))`

##### `verify(signature, message, publicKey)`

```typescript
function verify(
  signature: Uint8Array | string | Signature,
  message: Uint8Array | string,
  publicKey: Uint8Array | string | Point
): Promise<boolean>;
```

- `signature: Uint8Array | string | Signature` - returned by the `sign` function
- `message: Uint8Array | string` - message that needs to be verified
- `publicKey: Uint8Array | string | Point` - e.g. that was generated from `privateKey` by `getPublicKey`
- Returns `Promise<boolean>`

Verifies signature. Compatible with [ZIP215](https://zips.z.cash/zip-0215), accepts:

- `0 <= sig.R/publicKey < 2**256` (can be `>= curve.P` aka non-canonical encoding)
- `0 <= sig.s < l`

_Not compatible with RFC8032_ because rfc encorces canonical encoding of R/publicKey. There is no security risk in ZIP behavior, and there is no effect on honestly generated signatures. For additional info about verification strictness, check out [It’s 255:19AM](https://hdevalence.ca/blog/2020-10-04-its-25519am).

##### `getSharedSecret(privateKey, publicKey)`

```typescript
function getSharedSecret(
  privateKey: Uint8Array | string | bigint,
  publicKey: Uint8Array | string
): Promise<Uint8Array>;
```

Converts ed25519 private / public keys to Curve25519 and calculates
Elliptic Curve Diffie Hellman (ECDH) with X25519.
Conforms to [RFC7748](https://datatracker.ietf.org/doc/html/rfc7748).

### X25519 and curve25519

```js
const pub = ed25519.curve25519.scalarMultBase(privateKey);
const shared = ed25519.curve25519.scalarMult(privateKeyA, publicKeyB);
```

The library includes namespace `curve25519` that you could use to calculate
Curve25519 keys. It uses Montgomery Ladder specified in [RFC7748](https://datatracker.ietf.org/doc/html/rfc7748).

You cannot use ed25519 keys, because they are hashed with sha512. However, you can use
`Point#toX25519()` method on ed25519 public keys. See implementation of `ed25519.getSharedSecret` for details.

### Ristretto255

Each Point in ed25519 has 8 different equivalent points. This can be a great pain for some algorithms
e.g. ring signatures. In Tor, Ed25519 public key malleability would mean that every v3 onion service
has eight different addresses, causing mismatches with user expectations and potential gotchas for service operators.
Fixing this required expensive runtime checks in the v3 onion services protocol, requiring a full scalar multiplication,
point compression, and equality check. This check must be called in several places to validate that the onion service's
key does not contain a small torsion component.

No matter which one of these 8 equivalent points you give the Ristretto algorithm,
it will give you exactly the same one. The other 7 points are no longer representable. Two caveats:

1. Always use `RistrettoPoint.fromHex()` and `RistrettoPoint#toHex()`
2. Never mix `ExtendedPoint` & `RistrettoPoint`: ristretto is not a subgroup of ed25519.
   `ExtendedPoint` you are mixing with, may not be the representative for the set of possible points.

```typescript
import { RistrettoPoint } from '@noble/ed25519';

// Decode a byte-string representing a compressed Ristretto point.
// Not compatible with Point.toHex()
RistrettoPoint.fromHex(hex: Uint8Array | string): RistrettoPoint;

// Encode a Ristretto point represented by the point (X:Y:Z:T) to Uint8Array
RistrettoPoint#toHex(): Uint8Array;

// Takes uniform output of 64-bit hash function like sha512 and converts it to RistrettoPoint
// **Note:** this is one-way map, there is no conversion from point to hash.
RistrettoPoint.hashToCurve(hash: Uint8Array | string): RistrettoPoint;
```

It extends Mike Hamburg's Decaf approach to cofactor elimination to support cofactor-8 curves such as Curve25519.

In particular, this allows an existing Curve25519 library to implement a prime-order group with only a thin abstraction layer, and makes it possible for systems using Ed25519 signatures to be safely extended with zero-knowledge protocols, with no additional cryptographic assumptions and minimal code changes.

For more information on the topic, check out:

- [Ristretto website](https://ristretto.group)
- [irtf-cfrg-ristretto255-decaf448](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-ristretto255-decaf448) standard draft
- [Exploiting Low Order Generators in One-Time Ring Signatures](https://jonasnick.github.io/blog/2017/05/23/exploiting-low-order-generators-in-one-time-ring-signatures/)
- [Details of ristretto internals](https://monero.stackexchange.com/a/12171)
- [Rust implementation with lots of comments](https://github.com/dalek-cryptography/curve25519-dalek/blob/967d8b6c0e67100401ad66125b7399ccf509ae22/src/ristretto.rs)

### Synchronous methods

The library is using built-in async hash functions by default in order to follow its 0-dependency approach.

This means, built-in `getPublicKey`, `sync` and others are asynchronous. Some use-cases require
sync versions of those. You can use them: all you need to do is make sure ed25519 knows
how to hash synchronously. Redefining `ed.utils.sha512Sync` is enough:

```ts
import { sha512 } from '@noble/hashes/sha512';
ed.utils.sha512Sync = (...m) => sha512(ed.utils.concatBytes(...m));
const { getPublicKey, sign, verify, getExtendedPublicKey } = ed.sync;
// Use it freely
getPublicKey(privKey);
```

### Utilities

We provide a bunch of useful utils and expose some internal classes.

```typescript
// Returns cryptographically secure random `Uint8Array` that could be used as private key
utils.randomPrivateKey();

// Native sha512 calculation
utils.sha512(message: Uint8Array): Promise<Uint8Array>;

// Modular division
utils.mod(number: bigint, modulo = CURVE.P): bigint;

// Inverses number over modulo
utils.invert(number: bigint, modulo = CURVE.P): bigint;

// Convert Uint8Array to hex string
utils.bytesToHex(bytes: Uint8Array): string;

// returns { head, prefix, scalar, point, pointBytes }
utils.getExtendedPublicKey(privateKey);

// Call it without arguments if you want your first calculation of public key to take normal time instead of ~20ms
utils.precompute(W = 8, point = Point.BASE)

// Elliptic curve point in Affine (x, y) coordinates.
class Point {
  constructor(x: bigint, y: bigint);
  static fromHex(hash: string);
  static fromPrivateKey(privateKey: string | Uint8Array);
  toX25519(): Uint8Array; // Converts to Curve25519 u coordinate in LE form
  toRawBytes(): Uint8Array;
  toHex(): string; // Compact representation of a Point
  isTorsionFree(): boolean; // Multiplies the point by curve order
  equals(other: Point): boolean;
  negate(): Point;
  add(other: Point): Point;
  subtract(other: Point): Point;
  multiply(scalar: bigint): Point;
}
// Elliptic curve point in Extended (x, y, z, t) coordinates.
class ExtendedPoint {
  constructor(x: bigint, y: bigint, z: bigint, t: bigint);
  static fromAffine(point: Point): ExtendedPoint;
  toAffine(): Point;
  equals(other: ExtendedPoint): boolean;
  // Note: It does not check whether the `other` point is valid point on curve.
  add(other: ExtendedPoint): ExtendedPoint;
  subtract(other: ExtendedPoint): ExtendedPoint;
  multiply(scalar: bigint): ExtendedPoint;
  multiplyUnsafe(scalar: bigint): ExtendedPoint;
}
// Also (x, y, z, t)
class RistrettoPoint {
  static hashToCurve(hex: Hex): RistrettoPoint;
  static fromHex(hex: Hex): RistrettoPoint;
  toRawBytes(): Uint8Array;
  toHex(): string;
  equals(other: RistrettoPoint): boolean;
  add(other: RistrettoPoint): RistrettoPoint;
  subtract(other: RistrettoPoint): RistrettoPoint;
  multiply(scalar: number | bigint): RistrettoPoint;
}
class Signature {
  constructor(r: bigint, s: bigint);
  static fromHex(hex: Hex): Signature;
  toRawBytes(): Uint8Array;
  toHex(): string;
}

// Curve params
ed25519.CURVE.P // 2 ** 255 - 19
ed25519.CURVE.l // 2 ** 252 + 27742317777372353535851937790883648493
ed25519.Point.BASE // new ed25519.Point(Gx, Gy) where
// Gx = 15112221349535400772501151409588531511454012693041857206046113283949847762202n
// Gy = 46316835694926478169428394003475163141307993866256225615783033603165251855960n;

ed25519.utils.TORSION_SUBGROUP; // The 8-torsion subgroup ℰ8.
```

## Security

Noble is production-ready.

1. The library has been audited by an independent security firm cure53: [PDF](https://cure53.de/pentest-report_ed25519.pdf). No vulnerabilities have been found. See [changes since audit](https://github.com/paulmillr/noble-ed25519/compare/1.6.0..main).
2. The library has also been fuzzed by [Guido Vranken's cryptofuzz](https://github.com/guidovranken/cryptofuzz). You can run the fuzzer by yourself to check it.

We're using built-in JS `BigInt`, which is "unsuitable for use in cryptography" as [per official spec](https://github.com/tc39/proposal-bigint#cryptography). This means that the lib is potentially vulnerable to [timing attacks](https://en.wikipedia.org/wiki/Timing_attack). But, _JIT-compiler_ and _Garbage Collector_ make "constant time" extremely hard to achieve in a scripting language. Which means _any other JS library doesn't use constant-time bigints_. Including bn.js or anything else. Even statically typed Rust, a language without GC, [makes it harder to achieve constant-time](https://www.chosenplaintext.ca/open-source/rust-timing-shield/security) for some cases. If your goal is absolute security, don't use any JS lib — including bindings to native ones. Use low-level libraries & languages. Nonetheless we've hardened implementation of ec curve multiplication to be algorithmically constant time.

We however consider infrastructure attacks like rogue NPM modules very important; that's why it's crucial to minimize the amount of 3rd-party dependencies & native bindings. If your app uses 500 dependencies, any dep could get hacked and you'll be downloading malware with every `npm install`. Our goal is to minimize this attack vector.

## Speed

Benchmarks done with Apple M2 on macOS 12 with Node.js 18.

    getPublicKey(utils.randomPrivateKey()) x 8,627 ops/sec @ 115μs/op
    sign x 4,355 ops/sec @ 229μs/op
    verify x 852 ops/sec @ 1ms/op
    verify (no decompression) x 975 ops/sec @ 1ms/op
    Point.fromHex decompression x 13,512 ops/sec @ 74μs/op
    ristretto255#hashToCurve x 6,419 ops/sec @ 155μs/op
    ristretto255 round x 6,451 ops/sec @ 155μs/op
    curve25519.scalarMultBase x 1,273 ops/sec @ 785μs/op
    ed25519.getSharedSecret x 968 ops/sec @ 1ms/op

Compare to alternative implementations:

    ristretto255 x 669 ops/sec @ 1ms/op ± 1.41% (min: 1ms, max: 8ms)
    sodium-native x 82,925 ops/sec @ 12μs/op

    # tweetnacl@1.0.3 (fast)
    getPublicKey x 2,087 ops/sec @ 479μs/op # aka scalarMultBase
    sign x 667 ops/sec @ 1ms/op

    # ristretto255@0.1.2
    getPublicKey x 669 ops/sec @ 1ms/op ± 1.41% (min: 1ms, max: 8ms)

    # sodium-native@3.4.1
    # native bindings to libsodium, **node.js-only**
    sign x 82,925 ops/sec @ 12μs/op

## Contributing

1. Clone the repository
2. `npm install` to install build dependencies like TypeScript
3. `npm run build` to compile TypeScript code
4. `npm run test` to run jest on `test/index.ts`

## License

MIT (c) 2019 Paul Miller [(https://paulmillr.com)](https://paulmillr.com), see LICENSE file.
