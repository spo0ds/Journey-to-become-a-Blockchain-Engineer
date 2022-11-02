'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

exports.abs = abs;
exports.bitLength = bitLength;
exports.eGcd = eGcd;
exports.gcd = gcd;
exports.lcm = lcm;
exports.max = max;
exports.min = min;
exports.modInv = modInv;
exports.modPow = modPow;
exports.toZn = toZn;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubm9kZS5janMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cy9hYnMudHMiLCIuLi8uLi9zcmMvdHMvYml0TGVuZ3RoLnRzIiwiLi4vLi4vc3JjL3RzL2VnY2QudHMiLCIuLi8uLi9zcmMvdHMvZ2NkLnRzIiwiLi4vLi4vc3JjL3RzL2xjbS50cyIsIi4uLy4uL3NyYy90cy9tYXgudHMiLCIuLi8uLi9zcmMvdHMvbWluLnRzIiwiLi4vLi4vc3JjL3RzL3RvWm4udHMiLCIuLi8uLi9zcmMvdHMvbW9kSW52LnRzIiwiLi4vLi4vc3JjL3RzL21vZFBvdy50cyJdLCJzb3VyY2VzQ29udGVudCI6bnVsbCwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7QUFNRztBQUNHLFNBQVUsR0FBRyxDQUFFLENBQWdCLEVBQUE7QUFDbkMsSUFBQSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDMUI7O0FDVEE7Ozs7O0FBS0c7QUFDRyxTQUFVLFNBQVMsQ0FBRSxDQUFnQixFQUFBO0lBQ3pDLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUTtBQUFFLFFBQUEsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUV4QyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUU7QUFBRSxRQUFBLE9BQU8sQ0FBQyxDQUFBO0FBQUUsS0FBQTtJQUMxQixJQUFJLElBQUksR0FBRyxDQUFDLENBQUE7SUFDWixHQUFHO0FBQ0QsUUFBQSxJQUFJLEVBQUUsQ0FBQTtBQUNQLEtBQUEsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFDO0FBQ3pCLElBQUEsT0FBTyxJQUFJLENBQUE7QUFDYjs7QUNWQTs7Ozs7Ozs7OztBQVVHO0FBQ2EsU0FBQSxJQUFJLENBQUUsQ0FBZ0IsRUFBRSxDQUFnQixFQUFBO0lBQ3RELElBQUksT0FBTyxDQUFDLEtBQUssUUFBUTtBQUFFLFFBQUEsQ0FBQyxHQUFHLE1B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LFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxLQUFBO1NBQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFO0FBQ25CLFFBQUEsT0FBTyxFQUFFLENBQUE7QUFDVixLQUFBO0FBRUQsSUFBQSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUVkLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtBQUNWLFFBQUEsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDdkMsS0FBQTtJQUVELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNaLFFBQUEsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO0FBQ25CLFlBQUEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ2QsU0FBQTtBQUNELFFBQUEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDVixRQUFBLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNoQixLQUFBO0FBQ0QsSUFBQSxPQUFPLENBQUMsQ0FBQTtBQUNWOzs7Ozs7Ozs7Ozs7OyJ9
