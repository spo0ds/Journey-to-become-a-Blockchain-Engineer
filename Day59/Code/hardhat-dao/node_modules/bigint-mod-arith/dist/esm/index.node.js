/**
 * Absolute value. abs(a)==a if a>=0. abs(a)==-a if a<0
 *
 * @param a
 *
 * @returns The absolute value of a
 */
function abs(a) {
    return (a >= 0) ? a : -a;
}

/**
 * Returns the (minimum) length of a number expressed in bits.
 *
 * @param a
 * @returns The bit length
 */
function bitLength(a) {
    if (typeof a === 'number')
        a = BigInt(a);
    if (a === 1n) {
        return 1;
    }
    let bits = 1;
    do {
        bits++;
    } while ((a >>= 1n) > 1n);
    return bits;
}

/**
 * An iterative implementation of the extended euclidean algorithm or extended greatest common divisor algorithm.
 * Take positive integers a, b as input, and return a triple (g, x, y), such that ax + by = g = gcd(a, b).
 *
 * @param a
 * @param b
 *
 * @throws {@link RangeError} if a or b are <= 0
 *
 * @returns A triple (g, x, y), such that ax + by = g = gcd(a, b).
 */
function eGcd(a, b) {
    if (typeof a === 'number')
        a = BigInt(a);
    if (typeof b === 'number')
        b = BigInt(b);
    if (a <= 0n || b <= 0n)
        throw new RangeError('a and b MUST be > 0'); // a and b MUST be positive
    let x = 0n;
    let y = 1n;
    let u = 1n;
    let v = 0n;
    while (a !== 0n) {
        const q = b / a;
        const r = b % a;
        const m = x - (u * q);
        const n = y - (v * q);
        b = a;
        a = r;
        x = u;
        y = v;
        u = m;
        v = n;
    }
    return {
        g: b,
        x: x,
        y: y
    };
}

/**
 * Greatest common divisor of two integers based on the iterative binary algorithm.
 *
 * @param a
 * @param b
 *
 * @returns The greatest common divisor of a and b
 */
function gcd(a, b) {
    let aAbs = (typeof a === 'number') ? BigInt(abs(a)) : abs(a);
    let bAbs = (typeof b === 'number') ? BigInt(abs(b)) : abs(b);
    if (aAbs === 0n) {
        return bAbs;
    }
    else if (bAbs === 0n) {
        return aAbs;
    }
    let shift = 0n;
    while (((aAbs | bAbs) & 1n) === 0n) {
        aAbs >>= 1n;
        bAbs >>= 1n;
        shift++;
    }
    while ((aAbs & 1n) === 0n)
        aAbs >>= 1n;
    do {
        while ((bAbs & 1n) === 0n)
            bAbs >>= 1n;
        if (aAbs > bAbs) {
            const x = aAbs;
            aAbs = bAbs;
            bAbs = x;
        }
        bAbs -= aAbs;
    } while (bAbs !== 0n);
    // rescale
    return aAbs << shift;
}

/**
 * The least common multiple computed as abs(a*b)/gcd(a,b)
 * @param a
 * @param b
 *
 * @returns The least common multiple of a and b
 */
function lcm(a, b) {
    if (typeof a === 'number')
        a = BigInt(a);
    if (typeof b === 'number')
        b = BigInt(b);
    if (a === 0n && b === 0n)
        return BigInt(0);
    // return abs(a * b) as bigint / gcd(a, b)
    return abs((a / gcd(a, b)) * b);
}

/**
 * Maximum. max(a,b)==a if a>=b. max(a,b)==b if a<b
 *
 * @param a
 * @param b
 *
 * @returns Maximum of numbers a and b
 */
function max(a, b) {
    return (a >= b) ? a : b;
}

/**
 * Minimum. min(a,b)==b if a>=b. min(a,b)==a if a<b
 *
 * @param a
 * @param b
 *
 * @returns Minimum of numbers a and b
 */
function min(a, b) {
    return (a >= b) ? b : a;
}

/**
 * Finds the smallest positive element that is congruent to a in modulo n
 *
 * @remarks
 * a and b must be the same type, either number or bigint
 *
 * @param a - An integer
 * @param n - The modulo
 *
 * @throws {@link RangeError} if n <= 0
 *
 * @returns A bigint with the smallest positive representation of a modulo n
 */
function toZn(a, n) {
    if (typeof a === 'number')
        a = BigInt(a);
    if (typeof n === 'number')
        n = BigInt(n);
    if (n <= 0n) {
        throw new RangeError('n must be > 0');
    }
    const aZn = a % n;
    return (aZn < 0n) ? aZn + n : aZn;
}

/**
 * Modular inverse.
 *
 * @param a The number to find an inverse for
 * @param n The modulo
 *
 * @throws {@link RangeError} if a does not have inverse modulo n
 *
 * @returns The inverse modulo n
 */
function modInv(a, n) {
    const egcd = eGcd(toZn(a, n), n);
    if (egcd.g !== 1n) {
        throw new RangeError(`${a.toString()} does not have inverse modulo ${n.toString()}`); // modular inverse does not exist
    }
    else {
        return toZn(egcd.x, n);
    }
}

/**
 * Modular exponentiation b**e mod n. Currently using the right-to-left binary method
 *
 * @param b base
 * @param e exponent
 * @param n modulo
 *
 * @throws {@link RangeError} if n <= 0
 *
 * @returns b**e mod n
 */
function modPow(b, e, n) {
    if (typeof b === 'number')
        b = BigInt(b);
    if (typeof e === 'number')
        e = BigInt(e);
    if (typeof n === 'number')
        n = BigInt(n);
    if (n <= 0n) {
        throw new RangeError('n must be > 0');
    }
    else if (n === 1n) {
        return 0n;
    }
    b = toZn(b, n);
    if (e < 0n) {
        return modInv(modPow(b, abs(e), n), n);
    }
    let r = 1n;
    while (e > 0) {
        if ((e % 2n) === 1n) {
            r = r * b % n;
        }
        e = e / 2n;
        b = b ** 2n % n;
    }
    return r;
}

export { abs, bitLength, eGcd, gcd, lcm, max, min, modInv, modPow, toZn };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubm9kZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL2Ficy50cyIsIi4uLy4uL3NyYy90cy9iaXRMZW5ndGgudHMiLCIuLi8uLi9zcmMvdHMvZWdjZC50cyIsIi4uLy4uL3NyYy90cy9nY2QudHMiLCIuLi8uLi9zcmMvdHMvbGNtLnRzIiwiLi4vLi4vc3JjL3RzL21heC50cyIsIi4uLy4uL3NyYy90cy9taW4udHMiLCIuLi8uLi9zcmMvdHMvdG9abi50cyIsIi4uLy4uL3NyYy90cy9tb2RJbnYudHMiLCIuLi8uLi9zcmMvdHMvbW9kUG93LnRzIl0sInNvdXJjZXNDb250ZW50IjpudWxsLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FBTUc7QUFDRyxTQUFVLEdBQUcsQ0FBRSxDQUFnQixFQUFBO0FBQ25DLElBQUEsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQzFCOztBQ1RBOzs7OztBQUtHO0FBQ0csU0FBVSxTQUFTLENBQUUsQ0FBZ0IsRUFBQTtJQUN6QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVE7QUFBRSxRQUFBLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFeEMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFO0FBQUUsUUFBQSxPQUFPLENBQUMsQ0FBQTtBQUFFLEtBQUE7SUFDMUIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFBO0lBQ1osR0FBRztBQUNELFFBQUEsSUFBSSxFQUFFLENBQUE7QUFDUCxLQUFBLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBQztBQUN6QixJQUFBLE9BQU8sSUFBSSxDQUFBO0FBQ2I7O0FDVkE7Ozs7Ozs7Ozs7QUFVRztBQUNhLFNBQUEsSUFBSSxDQUFFLENBQWdCLEVBQUUsQ0FBZ0IsRUFBQTtJQUN0RCxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVE7QUFBRSxRQUFBLENBQUMsR0FBRyxNQUFNLENB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
