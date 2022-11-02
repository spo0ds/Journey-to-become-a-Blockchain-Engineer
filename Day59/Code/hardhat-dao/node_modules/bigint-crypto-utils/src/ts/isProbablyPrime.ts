import { eGcd, modInv, modPow, toZn, bitLength } from 'bigint-mod-arith'
import { fromBuffer } from './fromBuffer'
import { randBetween } from './randBetween'
import { randBitsSync } from './randBits'
import { randBytesSync } from './randBytes'
import { _useWorkers, _workerUrl, WorkerToMainMsg, MainToWorkerMsg } from './workerUtils'

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
export function isProbablyPrime (w: number|bigint, iterations: number = 16, disableWorkers: boolean = false): Promise<boolean> { // eslint-disable-line
  if (typeof w === 'number') {
    w = BigInt(w)
  }
  if (w < 0n) throw RangeError('w MUST be >= 0')

  if (!IS_BROWSER) { // Node.js
    if (!disableWorkers && _useWorkers) {
      return new Promise((resolve, reject) => {
        const worker = new workerThreads.Worker(__filename)

        worker.on('message', (data?: WorkerToMainMsg) => {
          if (data?._bcu?.isPrime !== undefined) {
            worker.terminate().catch(reject)
            resolve(data._bcu.isPrime)
          }
        })

        worker.on('error', reject)

        const msg: MainToWorkerMsg = {
          _bcu: {
            rnd: w as bigint,
            iterations: iterations,
            id: 0
          }
        }
        worker.postMessage(msg)
      })
    } else {
      return new Promise((resolve) => {
        resolve(_isProbablyPrime(w as bigint, iterations))
      })
    }
  } else { // browser
    return new Promise((resolve, reject) => {
      const worker = new Worker(_isProbablyPrimeWorkerUrl())

      worker.onmessage = (event) => {
        if (event?.data?._bcu?.isPrime !== undefined) {
          worker.terminate()
          resolve(event.data._bcu.isPrime)
        }
      }

      worker.onmessageerror = (event) => {
        reject(event)
      }

      const msg: MainToWorkerMsg = {
        _bcu: {
          rnd: w as bigint,
          iterations: iterations,
          id: 0
        }
      }
      worker.postMessage(msg)
    })
  }
}

export function _isProbablyPrime (w: bigint, iterations: number): boolean {
  /*
  PREFILTERING. Even values but 2 are not primes, so don't test.
  1 is not a prime and the M-R algorithm needs w>1.
  */
  if (w === 2n) return true
  else if ((w & 1n) === 0n || w === 1n) return false

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
  ]

  for (let i = 0; i < firstPrimes.length && (firstPrimes[i] <= w); i++) {
    const p = firstPrimes[i]
    if (w === p) return true
    else if (w % p === 0n) return false
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
  let a = 0n
  const d = w - 1n
  let aux = d
  while (aux % 2n === 0n) {
    aux /= 2n
    ++a
  }

  const m = d / (2n ** a)

  do {
    const b = randBetween(d, 2n)
    let z = modPow(b, m, w)
    if (z === 1n || z === d) continue
    let j = 1
    while (j < a) {
      z = modPow(z, 2n, w)
      if (z === d) break
      if (z === 1n) return false
      j++
    }
    if (z !== d) return false
  } while (--iterations !== 0)

  return true
}

export function _isProbablyPrimeWorkerUrl (): string {
  // Let's us first add all the required functions
  let workerCode = `
  'use strict';
  const ${eGcd.name} = ${eGcd.toString()};
  const ${modInv.name} = ${modInv.toString()};
  const ${modPow.name} = ${modPow.toString()};
  const ${toZn.name} = ${toZn.toString()};
  const ${randBitsSync.name} = ${randBitsSync.toString()};
  const ${randBytesSync.name} = ${randBytesSync.toString()};
  const ${randBetween.name} = ${randBetween.toString()};
  const ${isProbablyPrime.name} = ${_isProbablyPrime.toString()};
  ${bitLength.toString()};
  ${fromBuffer.toString()};`

  workerCode += `
  onmessage = async function(msg) {
    if (msg !== undefined && msg.data !== undefined && msg.data._bcu !== undefined && msg.data._bcu.id !== undefined && msg.data._bcu.iterations !== undefined && msg.data._bcu.rnd !== undefined) {
      const msgToParent = {
        _bcu: {
          isPrime: await ${isProbablyPrime.name}(msg.data._bcu.rnd, msg.data._bcu.iterations),
          value: msg.data._bcu.rnd,
          id: msg.data._bcu.id
        }
      };
      postMessage(msgToParent);
    }
  }`

  return _workerUrl(workerCode)
}

if (!IS_BROWSER && _useWorkers) { // node.js with support for workers
  try {
    var workerThreads = await import('worker_threads') // eslint-disable-line no-var
    const isWorker = !(workerThreads.isMainThread)
    if (isWorker && workerThreads.parentPort !== null) { // worker
      const parentPort = workerThreads.parentPort
      parentPort.on('message', function (data: MainToWorkerMsg | any) { // Let's start once we are called
        if (data?._bcu?.iterations !== undefined && data?._bcu?.rnd !== undefined) {
          const isPrime = _isProbablyPrime(data._bcu.rnd, data._bcu.iterations)
          const msg: WorkerToMainMsg = {
            _bcu: {
              isPrime: isPrime,
              value: data._bcu.rnd,
              id: data._bcu.id
            }
          }
          parentPort.postMessage(msg)
        }
      })
    }
  } catch (error) {}
}
