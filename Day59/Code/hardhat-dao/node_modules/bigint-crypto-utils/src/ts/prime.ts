import { fromBuffer } from './fromBuffer'
import { _isProbablyPrime, _isProbablyPrimeWorkerUrl } from './isProbablyPrime'
import { randBits, randBitsSync } from './randBits'
import { _useWorkers, WorkerToMainMsg, MainToWorkerMsg } from './workerUtils'
import type { Worker as NodeWorker } from 'worker_threads'

if (!IS_BROWSER) var os = await import('os') // eslint-disable-line no-var
if (!IS_BROWSER) {
  try {
    var workerThreads = await import('worker_threads') // eslint-disable-line no-var
  } catch {}
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
export function prime (bitLength: number, iterations: number = 16): Promise<bigint> { // eslint-disable-line
  if (bitLength < 1) throw new RangeError('bitLength MUST be > 0')

  /* c8 ignore start */
  if (!_useWorkers) { // If there is no support for workers
    let rnd = 0n
    do {
      rnd = fromBuffer(randBitsSync(bitLength, true))
    } while (!_isProbablyPrime(rnd, iterations))
    return new Promise((resolve) => { resolve(rnd) })
  }
  /* c8 ignore stop */
  return new Promise((resolve, reject) => {
    const workerList: Array<NodeWorker | Worker> = []
    const _onmessage = (msg: WorkerToMainMsg, newWorker: Worker | NodeWorker): void => {
      if (msg._bcu.isPrime) {
        // if a prime number has been found, stop all the workers, and return it
        for (let j = 0; j < workerList.length; j++) {
          workerList[j].terminate() // eslint-disable-line @typescript-eslint/no-floating-promises
        }
        while (workerList.length > 0) {
          workerList.pop()
        }
        resolve(msg._bcu.value)
      } else { // if a composite is found, make the worker test another random number
        const buf = randBitsSync(bitLength, true)
        const rnd = fromBuffer(buf)
        try {
          const msgToWorker: MainToWorkerMsg = {
            _bcu: {
              rnd: rnd,
              iterations: iterations,
              id: msg._bcu.id
            }
          }
          newWorker.postMessage(msgToWorker)
        } catch (error) {
          // The worker has already terminated. There is nothing to handle here
        }
      }
    }
    if (IS_BROWSER) { // browser
      const workerURL = _isProbablyPrimeWorkerUrl()
      for (let i = 0; i < self.navigator.hardwareConcurrency - 1; i++) {
        const newWorker = new Worker(workerURL)
        newWorker.onmessage = (event) => _onmessage(event.data, newWorker)
        workerList.push(newWorker)
      }
    } else { // Node.js
      for (let i = 0; i < os.cpus().length - 1; i++) {
        const newWorker = new workerThreads.Worker(__filename)
        newWorker.on('message', (msg: WorkerToMainMsg) => _onmessage(msg, newWorker))
        workerList.push(newWorker)
      }
    }
    for (let i = 0; i < workerList.length; i++) {
      randBits(bitLength, true).then(function (buf: Uint8Array|Buffer) {
        const rnd = fromBuffer(buf)
        workerList[i].postMessage({
          _bcu: {
            rnd: rnd,
            iterations: iterations,
            id: i
          }
        })
      }).catch(reject)
    }
  })
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
export function primeSync (bitLength: number, iterations: number = 16): bigint {
  if (bitLength < 1) throw new RangeError('bitLength MUST be > 0')
  let rnd = 0n
  do {
    rnd = fromBuffer(randBitsSync(bitLength, true))
  } while (!_isProbablyPrime(rnd, iterations))
  return rnd
}
