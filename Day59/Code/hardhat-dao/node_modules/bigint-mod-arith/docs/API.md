# bigint-mod-arith - v3.1.2

Some common functions for modular arithmetic using native JS implementation of BigInt

## Table of contents

### Interfaces

- [Egcd](interfaces/Egcd.md)

### Functions

- [abs](API.md#abs)
- [bitLength](API.md#bitlength)
- [eGcd](API.md#egcd)
- [gcd](API.md#gcd)
- [lcm](API.md#lcm)
- [max](API.md#max)
- [min](API.md#min)
- [modInv](API.md#modinv)
- [modPow](API.md#modpow)
- [toZn](API.md#tozn)

## Functions

### abs

▸ **abs**(`a`): `number` \| `bigint`

Absolute value. abs(a)==a if a>=0. abs(a)==-a if a<0

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` \| `bigint` |

#### Returns

`number` \| `bigint`

The absolute value of a

#### Defined in

[abs.ts:8](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/abs.ts#L8)

___

### bitLength

▸ **bitLength**(`a`): `number`

Returns the (minimum) length of a number expressed in bits.

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` \| `bigint` |

#### Returns

`number`

The bit length

#### Defined in

[bitLength.ts:7](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/bitLength.ts#L7)

___

### eGcd

▸ **eGcd**(`a`, `b`): [`Egcd`](interfaces/Egcd.md)

An iterative implementation of the extended euclidean algorithm or extended greatest common divisor algorithm.
Take positive integers a, b as input, and return a triple (g, x, y), such that ax + by = g = gcd(a, b).

**`Throws`**

RangeError if a or b are <= 0

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` \| `bigint` |
| `b` | `number` \| `bigint` |

#### Returns

[`Egcd`](interfaces/Egcd.md)

A triple (g, x, y), such that ax + by = g = gcd(a, b).

#### Defined in

[egcd.ts:17](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/egcd.ts#L17)

___

### gcd

▸ **gcd**(`a`, `b`): `bigint`

Greatest common divisor of two integers based on the iterative binary algorithm.

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` \| `bigint` |
| `b` | `number` \| `bigint` |

#### Returns

`bigint`

The greatest common divisor of a and b

#### Defined in

[gcd.ts:10](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/gcd.ts#L10)

___

### lcm

▸ **lcm**(`a`, `b`): `bigint`

The least common multiple computed as abs(a*b)/gcd(a,b)

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` \| `bigint` |
| `b` | `number` \| `bigint` |

#### Returns

`bigint`

The least common multiple of a and b

#### Defined in

[lcm.ts:10](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/lcm.ts#L10)

___

### max

▸ **max**(`a`, `b`): `number` \| `bigint`

Maximum. max(a,b)==a if a>=b. max(a,b)==b if a<b

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` \| `bigint` |
| `b` | `number` \| `bigint` |

#### Returns

`number` \| `bigint`

Maximum of numbers a and b

#### Defined in

[max.ts:9](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/max.ts#L9)

___

### min

▸ **min**(`a`, `b`): `number` \| `bigint`

Minimum. min(a,b)==b if a>=b. min(a,b)==a if a<b

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `number` \| `bigint` |
| `b` | `number` \| `bigint` |

#### Returns

`number` \| `bigint`

Minimum of numbers a and b

#### Defined in

[min.ts:9](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/min.ts#L9)

___

### modInv

▸ **modInv**(`a`, `n`): `bigint`

Modular inverse.

**`Throws`**

RangeError if a does not have inverse modulo n

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | `number` \| `bigint` | The number to find an inverse for |
| `n` | `number` \| `bigint` | The modulo |

#### Returns

`bigint`

The inverse modulo n

#### Defined in

[modInv.ts:13](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/modInv.ts#L13)

___

### modPow

▸ **modPow**(`b`, `e`, `n`): `bigint`

Modular exponentiation b**e mod n. Currently using the right-to-left binary method

**`Throws`**

RangeError if n <= 0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `b` | `number` \| `bigint` | base |
| `e` | `number` \| `bigint` | exponent |
| `n` | `number` \| `bigint` | modulo |

#### Returns

`bigint`

b**e mod n

#### Defined in

[modPow.ts:15](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/modPow.ts#L15)

___

### toZn

▸ **toZn**(`a`, `n`): `bigint`

Finds the smallest positive element that is congruent to a in modulo n

**`Remarks`**

a and b must be the same type, either number or bigint

**`Throws`**

RangeError if n <= 0

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | `number` \| `bigint` | An integer |
| `n` | `number` \| `bigint` | The modulo |

#### Returns

`bigint`

A bigint with the smallest positive representation of a modulo n

#### Defined in

[toZn.ts:14](https://github.com/juanelas/bigint-mod-arith/blob/fc5e3c5/src/ts/toZn.ts#L14)
