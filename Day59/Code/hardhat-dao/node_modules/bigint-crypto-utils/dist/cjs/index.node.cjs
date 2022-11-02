'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index_node = {};

Object.defineProperty(index_node, '__esModule', { value: true });

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

var abs_1 = index_node.abs = abs;
var bitLength_1 = index_node.bitLength = bitLength;
var eGcd_1 = index_node.eGcd = eGcd;
var gcd_1 = index_node.gcd = gcd;
var lcm_1 = index_node.lcm = lcm;
var max_1 = index_node.max = max;
var min_1 = index_node.min = min;
var modInv_1 = index_node.modInv = modInv;
var modPow_1 = index_node.modPow = modPow;
var toZn_1 = index_node.toZn = toZn;

function fromBuffer(buf) {
    let ret = 0n;
    for (const i of buf.values()) {
        const bi = BigInt(i);
        ret = (ret << 8n) + bi;
    }
    return ret;
}

var crypto = require('crypto'); // eslint-disable-line no-var
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
function randBytes(byteLength, forceLength = false) {
    if (byteLength < 1)
        throw new RangeError('byteLength MUST be > 0');
    return new Promise(function (resolve, reject) {
        {
            crypto.randomBytes(byteLength, function (err, buf) {
                if (err !== null)
                    reject(err);
                // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
                if (forceLength)
                    buf[0] = buf[0] | 128;
                resolve(buf);
            });
        }
    });
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
function randBytesSync(byteLength, forceLength = false) {
    if (byteLength < 1)
        throw new RangeError('byteLength MUST be > 0');
    /* eslint-disable no-lone-blocks */
    { // node
        const buf = crypto.randomBytes(byteLength);
        // If fixed length is required we put the first bit to 1 -> to get the necessary bitLength
        if (forceLength)
            buf[0] = buf[0] | 128;
        return buf;
    }
    /* eslint-enable no-lone-blocks */
}

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
function randBits(bitLength, forceLength = false) {
    if (bitLength < 1)
        throw new RangeError('bitLength MUST be > 0');
    const byteLength = Math.ceil(bitLength / 8);
    const bitLengthMod8 = bitLength % 8;
    return new Promise((resolve, reject) => {
        randBytes(byteLength, false).then(function (rndBytes) {
            if (bitLengthMod8 !== 0) {
                // Fill with 0's the extra bits
                rndBytes[0] = rndBytes[0] & (2 ** bitLengthMod8 - 1);
            }
            if (forceLength) {
                const mask = (bitLengthMod8 !== 0) ? 2 ** (bitLengthMod8 - 1) : 128;
                rndBytes[0] = rndBytes[0] | mask;
            }
            resolve(rndBytes);
        });
    });
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
function randBitsSync(bitLength, forceLength = false) {
    if (bitLength < 1)
        throw new RangeError('bitLength MUST be > 0');
    const byteLength = Math.ceil(bitLength / 8);
    const rndBytes = randBytesSync(byteLength, false);
    const bitLengthMod8 = bitLength % 8;
    if (bitLengthMod8 !== 0) {
        // Fill with 0's the extra bits
        rndBytes[0] = rndBytes[0] & (2 ** bitLengthMod8 - 1);
    }
    if (forceLength) {
        const mask = (bitLengthMod8 !== 0) ? 2 ** (bitLengthMod8 - 1) : 128;
        rndBytes[0] = rndBytes[0] | mask;
    }
    return rndBytes;
}

/**
 * Returns a cryptographically secure random integer between [min,max].
 * @param max Returned value will be <= max
 * @param min Returned value will be >= min
 *
 * @throws {@link RangeError} if max <= min
 *
 * @returns A cryptographically secure random bigint between [min,max]
 */
function randBetween(max, min = 1n) {
    if (max <= min)
        throw new RangeError('Arguments MUST be: max > min');
    const interval = max - min;
    const bitLen = bitLength_1(interval);
    let rnd;
    do {
        const buf = randBitsSync(bitLen);
        rnd = fromBuffer(buf);
    } while (rnd > interval);
    return rnd + min;
}

let _useWorkers = false; // The following is just to check whether we can use workers
/* eslint-disable no-lone-blocks */
{ // Node.js
    try {
        require('worker_threads');
        _useWorkers = true;
    } /* c8 ignore start */
    catch (e) {
        console.log(`[bigint-crypto-utils] WARNING:
This node version doesn't support worker_threads. You should enable them in order to greatly speedup the generation of big prime numbers.
  · With Node >=11 it is enabled by default (consider upgrading).
  · With Node 10, starting with 10.5.0, you can enable worker_threads at runtime executing node --experimental-worker `);
    }
    /* c8 ignore stop */
}

/**
 * The test first tries if any of the first 250 small primes are a factor of the input number and then passes several
 * iterations of Miller-Rabin Probabilistic Primality Test (FIPS 186-4 C.3.1)
 *
 * @param w - A positive integer to be tested for primality
 * @param iterations - The number of iterations for the primality test. The value shall be consistent with Table C.1, C.2 or C.3 of FIPS 186-4
 * @param disableWorkers - Disable the use of workers for the primality test
 *
 * @throws {@link RangeError} if w<0
 *
 * @returns A promise that resolves to a boolean that is either true (a probably prime number) or false (definitely composite)
 */
function isProbablyPrime(w, iterations = 16, disableWorkers = false) {
    if (typeof w === 'number') {
        w = BigInt(w);
    }
    if (w < 0n)
        throw RangeError('w MUST be >= 0');
    { // Node.js
        if (!disableWorkers && _useWorkers) {
            return new Promise((resolve, reject) => {
                const worker = new workerThreads$1.Worker(__filename);
                worker.on('message', (data) => {
                    if (data?._bcu?.isPrime !== undefined) {
                        worker.terminate().catch(reject);
                        resolve(data._bcu.isPrime);
                    }
                });
                worker.on('error', reject);
                const msg = {
                    _bcu: {
                        rnd: w,
                        iterations: iterations,
                        id: 0
                    }
                };
                worker.postMessage(msg);
            });
        }
        else {
            return new Promise((resolve) => {
                resolve(_isProbablyPrime(w, iterations));
            });
        }
    }
}
function _isProbablyPrime(w, iterations) {
    /*
    PREFILTERING. Even values but 2 are not primes, so don't test.
    1 is not a prime and the M-R algorithm needs w>1.
    */
    if (w === 2n)
        return true;
    else if ((w & 1n) === 0n || w === 1n)
        return false;
    /*
      Test if any of the first 250 small primes are a factor of w. 2 is not tested because it was already tested above.
      */
    const firstPrimes = [
        3n,
        5n,
        7n,
        11n,
        13n,
        17n,
        19n,
        23n,
        29n,
        31n,
        37n,
        41n,
        43n,
        47n,
        53n,
        59n,
        61n,
        67n,
        71n,
        73n,
        79n,
        83n,
        89n,
        97n,
        101n,
        103n,
        107n,
        109n,
        113n,
        127n,
        131n,
        137n,
        139n,
        149n,
        151n,
        157n,
        163n,
        167n,
        173n,
        179n,
        181n,
        191n,
        193n,
        197n,
        199n,
        211n,
        223n,
        227n,
        229n,
        233n,
        239n,
        241n,
        251n,
        257n,
        263n,
        269n,
        271n,
        277n,
        281n,
        283n,
        293n,
        307n,
        311n,
        313n,
        317n,
        331n,
        337n,
        347n,
        349n,
        353n,
        359n,
        367n,
        373n,
        379n,
        383n,
        389n,
        397n,
        401n,
        409n,
        419n,
        421n,
        431n,
        433n,
        439n,
        443n,
        449n,
        457n,
        461n,
        463n,
        467n,
        479n,
        487n,
        491n,
        499n,
        503n,
        509n,
        521n,
        523n,
        541n,
        547n,
        557n,
        563n,
        569n,
        571n,
        577n,
        587n,
        593n,
        599n,
        601n,
        607n,
        613n,
        617n,
        619n,
        631n,
        641n,
        643n,
        647n,
        653n,
        659n,
        661n,
        673n,
        677n,
        683n,
        691n,
        701n,
        709n,
        719n,
        727n,
        733n,
        739n,
        743n,
        751n,
        757n,
        761n,
        769n,
        773n,
        787n,
        797n,
        809n,
        811n,
        821n,
        823n,
        827n,
        829n,
        839n,
        853n,
        857n,
        859n,
        863n,
        877n,
        881n,
        883n,
        887n,
        907n,
        911n,
        919n,
        929n,
        937n,
        941n,
        947n,
        953n,
        967n,
        971n,
        977n,
        983n,
        991n,
        997n,
        1009n,
        1013n,
        1019n,
        1021n,
        1031n,
        1033n,
        1039n,
        1049n,
        1051n,
        1061n,
        1063n,
        1069n,
        1087n,
        1091n,
        1093n,
        1097n,
        1103n,
        1109n,
        1117n,
        1123n,
        1129n,
        1151n,
        1153n,
        1163n,
        1171n,
        1181n,
        1187n,
        1193n,
        1201n,
        1213n,
        1217n,
        1223n,
        1229n,
        1231n,
        1237n,
        1249n,
        1259n,
        1277n,
        1279n,
        1283n,
        1289n,
        1291n,
        1297n,
        1301n,
        1303n,
        1307n,
        1319n,
        1321n,
        1327n,
        1361n,
        1367n,
        1373n,
        1381n,
        1399n,
        1409n,
        1423n,
        1427n,
        1429n,
        1433n,
        1439n,
        1447n,
        1451n,
        1453n,
        1459n,
        1471n,
        1481n,
        1483n,
        1487n,
        1489n,
        1493n,
        1499n,
        1511n,
        1523n,
        1531n,
        1543n,
        1549n,
        1553n,
        1559n,
        1567n,
        1571n,
        1579n,
        1583n,
        1597n
    ];
    for (let i = 0; i < firstPrimes.length && (firstPrimes[i] <= w); i++) {
        const p = firstPrimes[i];
        if (w === p)
            return true;
        else if (w % p === 0n)
            return false;
    }
    /*
      1. Let a be the largest integer such that 2**a divides w−1.
      2. m = (w−1) / 2**a.
      3. wlen = len (w).
      4. For i = 1 to iterations do
          4.1 Obtain a string b of wlen bits from an RBG.
          Comment: Ensure that 1 < b < w−1.
          4.2 If ((b ≤ 1) or (b ≥ w−1)), then go to step 4.1.
          4.3 z = b**m mod w.
          4.4 If ((z = 1) or (z = w − 1)), then go to step 4.7.
          4.5 For j = 1 to a − 1 do.
          4.5.1 z = z**2 mod w.
          4.5.2 If (z = w−1), then go to step 4.7.
          4.5.3 If (z = 1), then go to step 4.6.
          4.6 Return COMPOSITE.
          4.7 Continue.
          Comment: Increment i for the do-loop in step 4.
      5. Return PROBABLY PRIME.
      */
    let a = 0n;
    const d = w - 1n;
    let aux = d;
    while (aux % 2n === 0n) {
        aux /= 2n;
        ++a;
    }
    const m = d / (2n ** a);
    do {
        const b = randBetween(d, 2n);
        let z = modPow_1(b, m, w);
        if (z === 1n || z === d)
            continue;
        let j = 1;
        while (j < a) {
            z = modPow_1(z, 2n, w);
            if (z === d)
                break;
            if (z === 1n)
                return false;
            j++;
        }
        if (z !== d)
            return false;
    } while (--iterations !== 0);
    return true;
}
if (_useWorkers) { // node.js with support for workers
    try {
        var workerThreads$1 = require('worker_threads'); // eslint-disable-line no-var
        const isWorker = !(workerThreads$1.isMainThread);
        if (isWorker && workerThreads$1.parentPort !== null) { // worker
            const parentPort = workerThreads$1.parentPort;
            parentPort.on('message', function (data) {
                if (data?._bcu?.iterations !== undefined && data?._bcu?.rnd !== undefined) {
                    const isPrime = _isProbablyPrime(data._bcu.rnd, data._bcu.iterations);
                    const msg = {
                        _bcu: {
                            isPrime: isPrime,
                            value: data._bcu.rnd,
                            id: data._bcu.id
                        }
                    };
                    parentPort.postMessage(msg);
                }
            });
        }
    }
    catch (error) { }
}

var os = require('os'); // eslint-disable-line no-var
{
    try {
        var workerThreads = require('worker_threads'); // eslint-disable-line no-var
    }
    catch { }
}
/**
 * A probably-prime (Miller-Rabin), cryptographically-secure, random-number generator.
 * The browser version uses web workers to parallelise prime look up. Therefore, it does not lock the UI
 * main process, and it can be much faster (if several cores or cpu are available).
 * The node version can also use worker_threads if they are available (enabled by default with Node 11 and
 * and can be enabled at runtime executing node --experimental-worker with node >=10.5.0).
 *
 * @param bitLength - The required bit length for the generated prime
 * @param iterations - The number of iterations for the Miller-Rabin Probabilistic Primality Test
 *
 * @throws {@link RangeError} if bitLength < 1
 *
 * @returns A promise that resolves to a bigint probable prime of bitLength bits.
 */
function prime(bitLength, iterations = 16) {
    if (bitLength < 1)
        throw new RangeError('bitLength MUST be > 0');
    /* c8 ignore start */
    if (!_useWorkers) { // If there is no support for workers
        let rnd = 0n;
        do {
            rnd = fromBuffer(randBitsSync(bitLength, true));
        } while (!_isProbablyPrime(rnd, iterations));
        return new Promise((resolve) => { resolve(rnd); });
    }
    /* c8 ignore stop */
    return new Promise((resolve, reject) => {
        const workerList = [];
        const _onmessage = (msg, newWorker) => {
            if (msg._bcu.isPrime) {
                // if a prime number has been found, stop all the workers, and return it
                for (let j = 0; j < workerList.length; j++) {
                    workerList[j].terminate(); // eslint-disable-line @typescript-eslint/no-floating-promises
                }
                while (workerList.length > 0) {
                    workerList.pop();
                }
                resolve(msg._bcu.value);
            }
            else { // if a composite is found, make the worker test another random number
                const buf = randBitsSync(bitLength, true);
                const rnd = fromBuffer(buf);
                try {
                    const msgToWorker = {
                        _bcu: {
                            rnd: rnd,
                            iterations: iterations,
                            id: msg._bcu.id
                        }
                    };
                    newWorker.postMessage(msgToWorker);
                }
                catch (error) {
                    // The worker has already terminated. There is nothing to handle here
                }
            }
        };
        { // Node.js
            for (let i = 0; i < os.cpus().length - 1; i++) {
                const newWorker = new workerThreads.Worker(__filename);
                newWorker.on('message', (msg) => _onmessage(msg, newWorker));
                workerList.push(newWorker);
            }
        }
        for (let i = 0; i < workerList.length; i++) {
            randBits(bitLength, true).then(function (buf) {
                const rnd = fromBuffer(buf);
                workerList[i].postMessage({
                    _bcu: {
                        rnd: rnd,
                        iterations: iterations,
                        id: i
                    }
                });
            }).catch(reject);
        }
    });
}
/**
 * A probably-prime (Miller-Rabin), cryptographically-secure, random-number generator.
 * The sync version is NOT RECOMMENDED since it won't use workers and thus it'll be slower and may freeze thw window in browser's javascript. Please consider using prime() instead.
 *
 * @param bitLength - The required bit length for the generated prime
 * @param iterations - The number of iterations for the Miller-Rabin Probabilistic Primality Test
 *
 * @throws {@link RangeError} if bitLength < 1
 *
 * @returns A bigint probable prime of bitLength bits.
 */
function primeSync(bitLength, iterations = 16) {
    if (bitLength < 1)
        throw new RangeError('bitLength MUST be > 0');
    let rnd = 0n;
    do {
        rnd = fromBuffer(randBitsSync(bitLength, true));
    } while (!_isProbablyPrime(rnd, iterations));
    return rnd;
}

exports.abs = abs_1;
exports.bitLength = bitLength_1;
exports.eGcd = eGcd_1;
exports.gcd = gcd_1;
exports.isProbablyPrime = isProbablyPrime;
exports.lcm = lcm_1;
exports.max = max_1;
exports.min = min_1;
exports.modInv = modInv_1;
exports.modPow = modPow_1;
exports.prime = prime;
exports.primeSync = primeSync;
exports.randBetween = randBetween;
exports.randBits = randBits;
exports.randBitsSync = randBitsSync;
exports.randBytes = randBytes;
exports.randBytesSync = randBytesSync;
exports.toZn = toZn_1;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubm9kZS5janMiLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9iaWdpbnQtbW9kLWFyaXRoL2Rpc3QvY2pzL2luZGV4Lm5vZGUuY2pzIiwiLi4vLi4vc3JjL3RzL2Zyb21CdWZmZXIudHMiLCIuLi8uLi9zcmMvdHMvcmFuZEJ5dGVzLnRzIiwiLi4vLi4vc3JjL3RzL3JhbmRCaXRzLnRzIiwiLi4vLi4vc3JjL3RzL3JhbmRCZXR3ZWVuLnRzIiwiLi4vLi4vc3JjL3RzL3dvcmtlclV0aWxzLnRzIiwiLi4vLi4vc3JjL3RzL2lzUHJvYmFibHlQcmltZS50cyIsIi4uLy4uL3NyYy90cy9wcmltZS50cyJdLCJzb3VyY2VzQ29udGVudCI6bnVsbCwibmFtZXMiOlsiYml0TGVuZ3RoIiwid29ya2VyVGhyZWFkcyIsIm1vZFBvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNoQixJQUFJLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUU7QUFDdEIsSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVE7QUFDN0IsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFO0FBQ2xCLFFBQVEsT0FBTyxDQUFDLENBQUM7QUFDakIsS0FBSztBQUNMLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLElBQUksR0FBRztB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SUFBSSxDQUFDLEtBQUssRUFBRTtBQUFFLFFBQUEsT0FBTyxJQUFJLENBQUE7U0FDcEIsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQUUsUUFBQSxPQUFPLEtBQUssQ0FBQTtBQUVsRDs7QUFFSTtBQUNKLElBQUEsTUFBTSxXQUFXLEdBQUc7UUFDbEIsRUFBRTtRQUNGLEVBQUU7UUFDRixFQUFFO1FBQ0YsR0FBRztRQUNILEdBQUc7UUFDSCxHQUFHO1FBQ0gsR0FBRztRQUNILEdBQUc7UUFDSCxHQUFHO1FBQ0gsR0FBRztRQUNILEdBQUc7UUFDSCxHQUFHO1FBQ0gsR0FBRztRQUNILEdBQUc7UUFDSCxHQUFHO1FBQ0gsR0FBRztRQUNILEdBQUc7UUFDSCxHQUFHO1FBQ0gsR0FBRztRQUNILEdBQUc7UUFDSCxHQUFHO1FBQ0gsR0FBRztRQUNILEdBQUc7UUFDSCxHQUFHO1FBQ0gsSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztLQUNOLENBQUE7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEUsUUFBQSxNQUFNLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUFFLFlBQUEsT0FBTyxJQUFJLENBQUE7QUFDbkIsYUFBQSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRTtBQUFFLFlBQUEsT0FBTyxLQUFLLENBQUE7QUFDcEMsS0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkk7SUFDSixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDVixJQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDaEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBO0FBQ1gsSUFBQSxPQUFPLEdBQUcsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3RCLEdBQUcsSUFBSSxFQUFFLENBQUE7QUFDVCxRQUFBLEVBQUUsQ0FBQyxDQUFBO0FBQ0osS0FBQTtJQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFFdkIsR0FBRztRQUNELE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDNUIsSUFBSSxDQUFDLEdBQUdDLFFBQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3ZCLFFBQUEsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsU0FBUTtRQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDWixDQUFDLEdBQUdBLFFBQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQUUsTUFBSztZQUNsQixJQUFJLENBQUMsS0FBSyxFQUFFO0FBQUUsZ0JBQUEsT0FBTyxLQUFLLENBQUE7QUFDMUIsWUFBQSxDQUFDLEVBQUUsQ0FBQTtBQUNKLFNBQUE7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQUUsWUFBQSxPQUFPLEtBQUssQ0FBQTtBQUMxQixLQUFBLFFBQVEsRUFBRSxVQUFVLEtBQUssQ0FBQyxFQUFDO0FBRTVCLElBQUEsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDO0FBa0NELElBQW1CLFdBQVcsRUFBRTtJQUM5QixJQUFJO1FBQ0YsSUFBSUQsZUFBYSxHQUFHLE9BQWEsQ0FBQSxnQkFBZ0IsQ0FBQyxDQUFBO1FBQ2xELE1BQU0sUUFBUSxHQUFHLEVBQUVBLGVBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUM5QyxJQUFJLFFBQVEsSUFBSUEsZUFBYSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUU7QUFDakQsWUFBQSxNQUFNLFVBQVUsR0FBR0EsZUFBYSxDQUFDLFVBQVUsQ0FBQTtBQUMzQyxZQUFBLFVBQVUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsSUFBMkIsRUFBQTtBQUM1RCxnQkFBQSxJQUFJLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxLQUFLLFNBQVMsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsS0FBSyxTQUFTLEVBQUU7QUFDekUsb0JBQUEsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNyRSxvQkFBQSxNQUFNLEdBQUcsR0FBb0I7QUFDM0Isd0JBQUEsSUFBSSxFQUFFO0FBQ0osNEJBQUEsT0FBTyxFQUFFLE9BQU87QUFDaEIsNEJBQUEsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRztBQUNwQiw0QkFBQSxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2pCLHlCQUFBO3FCQUNGLENBQUE7QUFDRCxvQkFBQSxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzVCLGlCQUFBO0FBQ0gsYUFBQyxDQUFDLENBQUE7QUFDSCxTQUFBO0FBQ0YsS0FBQTtJQUFDLE9BQU8sS0FBSyxFQUFFLEdBQUU7QUFDbkI7O0FDM2JnQixJQUFJLEVBQUUsR0FBRyxPQUFhLENBQUEsSUFBSSxDQUFDLENBQUE7QUFDM0I7SUFDZixJQUFJO1FBQ0YsSUFBSSxhQUFhLEdBQUcsT0FBYSxDQUFBLGdCQUFnQixDQUFDLENBQUE7QUFDbkQsS0FBQTtBQUFDLElBQUEsTUFBTSxHQUFFO0FBQ1gsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7O0FBYUc7U0FDYSxLQUFLLENBQUUsU0FBaUIsRUFBRSxhQUFxQixFQUFFLEVBQUE7SUFDL0QsSUFBSSxTQUFTLEdBQUcsQ0FBQztBQUFFLFFBQUEsTUFBTSxJQUFJLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBOztBQUdoRSxJQUFBLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDaEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFBO1FBQ1osR0FBRztZQUNELEdBQUcsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQ2hELFNBQUEsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsRUFBQztBQUM1QyxRQUFBLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEtBQUksRUFBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUEsRUFBRSxDQUFDLENBQUE7QUFDbEQsS0FBQTs7SUFFRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sS0FBSTtRQUNyQyxNQUFNLFVBQVUsR0FBK0IsRUFBRSxDQUFBO0FBQ2pELFFBQUEsTUFBTSxVQUFVLEdBQUcsQ0FBQyxHQUFvQixFQUFFLFNBQThCLEtBQVU7QUFDaEYsWUFBQSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFOztBQUVwQixnQkFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDMUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQzFCLGlCQUFBO0FBQ0QsZ0JBQUEsT0FBTyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDNUIsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ2pCLGlCQUFBO0FBQ0QsZ0JBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDeEIsYUFBQTtBQUFNLGlCQUFBO2dCQUNMLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDekMsZ0JBQUEsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUMzQixJQUFJO0FBQ0Ysb0JBQUEsTUFBTSxXQUFXLEdBQW9CO0FBQ25DLHdCQUFBLElBQUksRUFBRTtBQUNKLDRCQUFBLEdBQUcsRUFBRSxHQUFHO0FBQ1IsNEJBQUEsVUFBVSxFQUFFLFVBQVU7QUFDdEIsNEJBQUEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoQix5QkFBQTtxQkFDRixDQUFBO0FBQ0Qsb0JBQUEsU0FBUyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNuQyxpQkFBQTtBQUFDLGdCQUFBLE9BQU8sS0FBSyxFQUFFOztBQUVmLGlCQUFBO0FBQ0YsYUFBQTtBQUNILFNBQUMsQ0FBQTtRQVFNO0FBQ0wsWUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLE1BQU0sU0FBUyxHQUFHLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUN0RCxnQkFBQSxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQW9CLEtBQUssVUFBVSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFBO0FBQzdFLGdCQUFBLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDM0IsYUFBQTtBQUNGLFNBQUE7QUFDRCxRQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBc0IsRUFBQTtBQUM3RCxnQkFBQSxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDM0IsZ0JBQUEsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztBQUN4QixvQkFBQSxJQUFJLEVBQUU7QUFDSix3QkFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLHdCQUFBLFVBQVUsRUFBRSxVQUFVO0FBQ3RCLHdCQUFBLEVBQUUsRUFBRSxDQUFDO0FBQ04scUJBQUE7QUFDRixpQkFBQSxDQUFDLENBQUE7QUFDSixhQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDakIsU0FBQTtBQUNILEtBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVEOzs7Ozs7Ozs7O0FBVUc7U0FDYSxTQUFTLENBQUUsU0FBaUIsRUFBRSxhQUFxQixFQUFFLEVBQUE7SUFDbkUsSUFBSSxTQUFTLEdBQUcsQ0FBQztBQUFFLFFBQUEsTUFBTSxJQUFJLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO0lBQ2hFLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQTtJQUNaLEdBQUc7UUFDRCxHQUFHLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUNoRCxLQUFBLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEVBQUM7QUFDNUMsSUFBQSxPQUFPLEdBQUcsQ0FBQTtBQUNaOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
