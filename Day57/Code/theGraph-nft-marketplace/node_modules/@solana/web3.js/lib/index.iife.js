var solanaWeb3 = (function (exports) {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
	  var f = n.default;
		if (typeof f == "function") {
			var a = function () {
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var buffer = {};

	var base64Js = {};

	base64Js.byteLength = byteLength;
	base64Js.toByteArray = toByteArray;
	base64Js.fromByteArray = fromByteArray;

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	for (var i$1 = 0, len = code.length; i$1 < len; ++i$1) {
	  lookup[i$1] = code[i$1];
	  revLookup[code.charCodeAt(i$1)] = i$1;
	}

	// Support decoding URL-safe base64 strings, as Node.js does.
	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
	revLookup['-'.charCodeAt(0)] = 62;
	revLookup['_'.charCodeAt(0)] = 63;

	function getLens (b64) {
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // Trim off extra bytes after placeholder bytes are found
	  // See: https://github.com/beatgammit/base64-js/issues/42
	  var validLen = b64.indexOf('=');
	  if (validLen === -1) validLen = len;

	  var placeHoldersLen = validLen === len
	    ? 0
	    : 4 - (validLen % 4);

	  return [validLen, placeHoldersLen]
	}

	// base64 is 4/3 + up to two characters of the original data
	function byteLength (b64) {
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function _byteLength (b64, validLen, placeHoldersLen) {
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function toByteArray (b64) {
	  var tmp;
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];

	  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

	  var curByte = 0;

	  // if there are placeholders, only get up to the last complete 4 chars
	  var len = placeHoldersLen > 0
	    ? validLen - 4
	    : validLen;

	  var i;
	  for (i = 0; i < len; i += 4) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 18) |
	      (revLookup[b64.charCodeAt(i + 1)] << 12) |
	      (revLookup[b64.charCodeAt(i + 2)] << 6) |
	      revLookup[b64.charCodeAt(i + 3)];
	    arr[curByte++] = (tmp >> 16) & 0xFF;
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 2) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 2) |
	      (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 1) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 10) |
	      (revLookup[b64.charCodeAt(i + 1)] << 4) |
	      (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] +
	    lookup[num >> 12 & 0x3F] +
	    lookup[num >> 6 & 0x3F] +
	    lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp =
	      ((uint8[i] << 16) & 0xFF0000) +
	      ((uint8[i + 1] << 8) & 0xFF00) +
	      (uint8[i + 2] & 0xFF);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 2] +
	      lookup[(tmp << 4) & 0x3F] +
	      '=='
	    );
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 10] +
	      lookup[(tmp >> 4) & 0x3F] +
	      lookup[(tmp << 2) & 0x3F] +
	      '='
	    );
	  }

	  return parts.join('')
	}

	var ieee754 = {};

	/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */

	ieee754.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m;
	  var eLen = (nBytes * 8) - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = -7;
	  var i = isLE ? (nBytes - 1) : 0;
	  var d = isLE ? -1 : 1;
	  var s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	};

	ieee754.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c;
	  var eLen = (nBytes * 8) - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
	  var i = isLE ? 0 : (nBytes - 1);
	  var d = isLE ? 1 : -1;
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = ((value * c) - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128;
	};

	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <https://feross.org>
	 * @license  MIT
	 */

	(function (exports) {

		const base64 = base64Js;
		const ieee754$1 = ieee754;
		const customInspectSymbol =
		  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
		    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
		    : null;

		exports.Buffer = Buffer;
		exports.SlowBuffer = SlowBuffer;
		exports.INSPECT_MAX_BYTES = 50;

		const K_MAX_LENGTH = 0x7fffffff;
		exports.kMaxLength = K_MAX_LENGTH;

		/**
		 * If `Buffer.TYPED_ARRAY_SUPPORT`:
		 *   === true    Use Uint8Array implementation (fastest)
		 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
		 *               implementation (most compatible, even IE6)
		 *
		 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
		 * Opera 11.6+, iOS 4.2+.
		 *
		 * We report that the browser does not support typed arrays if the are not subclassable
		 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
		 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
		 * for __proto__ and has a buggy typed array implementation.
		 */
		Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

		if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
		    typeof console.error === 'function') {
		  console.error(
		    'This browser lacks typed array (Uint8Array) support which is required by ' +
		    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
		  );
		}

		function typedArraySupport () {
		  // Can typed array instances can be augmented?
		  try {
		    const arr = new Uint8Array(1);
		    const proto = { foo: function () { return 42 } };
		    Object.setPrototypeOf(proto, Uint8Array.prototype);
		    Object.setPrototypeOf(arr, proto);
		    return arr.foo() === 42
		  } catch (e) {
		    return false
		  }
		}

		Object.defineProperty(Buffer.prototype, 'parent', {
		  enumerable: true,
		  get: function () {
		    if (!Buffer.isBuffer(this)) return undefined
		    return this.buffer
		  }
		});

		Object.defineProperty(Buffer.prototype, 'offset', {
		  enumerable: true,
		  get: function () {
		    if (!Buffer.isBuffer(this)) return undefined
		    return this.byteOffset
		  }
		});

		function createBuffer (length) {
		  if (length > K_MAX_LENGTH) {
		    throw new RangeError('The value "' + length + '" is invalid for option "size"')
		  }
		  // Return an augmented `Uint8Array` instance
		  const buf = new Uint8Array(length);
		  Object.setPrototypeOf(buf, Buffer.prototype);
		  return buf
		}

		/**
		 * The Buffer constructor returns instances of `Uint8Array` that have their
		 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
		 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
		 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
		 * returns a single octet.
		 *
		 * The `Uint8Array` prototype remains unmodified.
		 */

		function Buffer (arg, encodingOrOffset, length) {
		  // Common case.
		  if (typeof arg === 'number') {
		    if (typeof encodingOrOffset === 'string') {
		      throw new TypeError(
		        'The "string" argument must be of type string. Received type number'
		      )
		    }
		    return allocUnsafe(arg)
		  }
		  return from(arg, encodingOrOffset, length)
		}

		Buffer.poolSize = 8192; // not used by this implementation

		function from (value, encodingOrOffset, length) {
		  if (typeof value === 'string') {
		    return fromString(value, encodingOrOffset)
		  }

		  if (ArrayBuffer.isView(value)) {
		    return fromArrayView(value)
		  }

		  if (value == null) {
		    throw new TypeError(
		      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
		      'or Array-like Object. Received type ' + (typeof value)
		    )
		  }

		  if (isInstance(value, ArrayBuffer) ||
		      (value && isInstance(value.buffer, ArrayBuffer))) {
		    return fromArrayBuffer(value, encodingOrOffset, length)
		  }

		  if (typeof SharedArrayBuffer !== 'undefined' &&
		      (isInstance(value, SharedArrayBuffer) ||
		      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
		    return fromArrayBuffer(value, encodingOrOffset, length)
		  }

		  if (typeof value === 'number') {
		    throw new TypeError(
		      'The "value" argument must not be of type number. Received type number'
		    )
		  }

		  const valueOf = value.valueOf && value.valueOf();
		  if (valueOf != null && valueOf !== value) {
		    return Buffer.from(valueOf, encodingOrOffset, length)
		  }

		  const b = fromObject(value);
		  if (b) return b

		  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
		      typeof value[Symbol.toPrimitive] === 'function') {
		    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)
		  }

		  throw new TypeError(
		    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
		    'or Array-like Object. Received type ' + (typeof value)
		  )
		}

		/**
		 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
		 * if value is a number.
		 * Buffer.from(str[, encoding])
		 * Buffer.from(array)
		 * Buffer.from(buffer)
		 * Buffer.from(arrayBuffer[, byteOffset[, length]])
		 **/
		Buffer.from = function (value, encodingOrOffset, length) {
		  return from(value, encodingOrOffset, length)
		};

		// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
		// https://github.com/feross/buffer/pull/148
		Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
		Object.setPrototypeOf(Buffer, Uint8Array);

		function assertSize (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('"size" argument must be of type number')
		  } else if (size < 0) {
		    throw new RangeError('The value "' + size + '" is invalid for option "size"')
		  }
		}

		function alloc (size, fill, encoding) {
		  assertSize(size);
		  if (size <= 0) {
		    return createBuffer(size)
		  }
		  if (fill !== undefined) {
		    // Only pay attention to encoding if it's a string. This
		    // prevents accidentally sending in a number that would
		    // be interpreted as a start offset.
		    return typeof encoding === 'string'
		      ? createBuffer(size).fill(fill, encoding)
		      : createBuffer(size).fill(fill)
		  }
		  return createBuffer(size)
		}

		/**
		 * Creates a new filled Buffer instance.
		 * alloc(size[, fill[, encoding]])
		 **/
		Buffer.alloc = function (size, fill, encoding) {
		  return alloc(size, fill, encoding)
		};

		function allocUnsafe (size) {
		  assertSize(size);
		  return createBuffer(size < 0 ? 0 : checked(size) | 0)
		}

		/**
		 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
		 * */
		Buffer.allocUnsafe = function (size) {
		  return allocUnsafe(size)
		};
		/**
		 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
		 */
		Buffer.allocUnsafeSlow = function (size) {
		  return allocUnsafe(size)
		};

		function fromString (string, encoding) {
		  if (typeof encoding !== 'string' || encoding === '') {
		    encoding = 'utf8';
		  }

		  if (!Buffer.isEncoding(encoding)) {
		    throw new TypeError('Unknown encoding: ' + encoding)
		  }

		  const length = byteLength(string, encoding) | 0;
		  let buf = createBuffer(length);

		  const actual = buf.write(string, encoding);

		  if (actual !== length) {
		    // Writing a hex string, for example, that contains invalid characters will
		    // cause everything after the first invalid character to be ignored. (e.g.
		    // 'abxxcd' will be treated as 'ab')
		    buf = buf.slice(0, actual);
		  }

		  return buf
		}

		function fromArrayLike (array) {
		  const length = array.length < 0 ? 0 : checked(array.length) | 0;
		  const buf = createBuffer(length);
		  for (let i = 0; i < length; i += 1) {
		    buf[i] = array[i] & 255;
		  }
		  return buf
		}

		function fromArrayView (arrayView) {
		  if (isInstance(arrayView, Uint8Array)) {
		    const copy = new Uint8Array(arrayView);
		    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
		  }
		  return fromArrayLike(arrayView)
		}

		function fromArrayBuffer (array, byteOffset, length) {
		  if (byteOffset < 0 || array.byteLength < byteOffset) {
		    throw new RangeError('"offset" is outside of buffer bounds')
		  }

		  if (array.byteLength < byteOffset + (length || 0)) {
		    throw new RangeError('"length" is outside of buffer bounds')
		  }

		  let buf;
		  if (byteOffset === undefined && length === undefined) {
		    buf = new Uint8Array(array);
		  } else if (length === undefined) {
		    buf = new Uint8Array(array, byteOffset);
		  } else {
		    buf = new Uint8Array(array, byteOffset, length);
		  }

		  // Return an augmented `Uint8Array` instance
		  Object.setPrototypeOf(buf, Buffer.prototype);

		  return buf
		}

		function fromObject (obj) {
		  if (Buffer.isBuffer(obj)) {
		    const len = checked(obj.length) | 0;
		    const buf = createBuffer(len);

		    if (buf.length === 0) {
		      return buf
		    }

		    obj.copy(buf, 0, 0, len);
		    return buf
		  }

		  if (obj.length !== undefined) {
		    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
		      return createBuffer(0)
		    }
		    return fromArrayLike(obj)
		  }

		  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
		    return fromArrayLike(obj.data)
		  }
		}

		function checked (length) {
		  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
		  // length is NaN (which is otherwise coerced to zero.)
		  if (length >= K_MAX_LENGTH) {
		    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
		                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
		  }
		  return length | 0
		}

		function SlowBuffer (length) {
		  if (+length != length) { // eslint-disable-line eqeqeq
		    length = 0;
		  }
		  return Buffer.alloc(+length)
		}

		Buffer.isBuffer = function isBuffer (b) {
		  return b != null && b._isBuffer === true &&
		    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
		};

		Buffer.compare = function compare (a, b) {
		  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
		  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
		  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
		    throw new TypeError(
		      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
		    )
		  }

		  if (a === b) return 0

		  let x = a.length;
		  let y = b.length;

		  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
		    if (a[i] !== b[i]) {
		      x = a[i];
		      y = b[i];
		      break
		    }
		  }

		  if (x < y) return -1
		  if (y < x) return 1
		  return 0
		};

		Buffer.isEncoding = function isEncoding (encoding) {
		  switch (String(encoding).toLowerCase()) {
		    case 'hex':
		    case 'utf8':
		    case 'utf-8':
		    case 'ascii':
		    case 'latin1':
		    case 'binary':
		    case 'base64':
		    case 'ucs2':
		    case 'ucs-2':
		    case 'utf16le':
		    case 'utf-16le':
		      return true
		    default:
		      return false
		  }
		};

		Buffer.concat = function concat (list, length) {
		  if (!Array.isArray(list)) {
		    throw new TypeError('"list" argument must be an Array of Buffers')
		  }

		  if (list.length === 0) {
		    return Buffer.alloc(0)
		  }

		  let i;
		  if (length === undefined) {
		    length = 0;
		    for (i = 0; i < list.length; ++i) {
		      length += list[i].length;
		    }
		  }

		  const buffer = Buffer.allocUnsafe(length);
		  let pos = 0;
		  for (i = 0; i < list.length; ++i) {
		    let buf = list[i];
		    if (isInstance(buf, Uint8Array)) {
		      if (pos + buf.length > buffer.length) {
		        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
		        buf.copy(buffer, pos);
		      } else {
		        Uint8Array.prototype.set.call(
		          buffer,
		          buf,
		          pos
		        );
		      }
		    } else if (!Buffer.isBuffer(buf)) {
		      throw new TypeError('"list" argument must be an Array of Buffers')
		    } else {
		      buf.copy(buffer, pos);
		    }
		    pos += buf.length;
		  }
		  return buffer
		};

		function byteLength (string, encoding) {
		  if (Buffer.isBuffer(string)) {
		    return string.length
		  }
		  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
		    return string.byteLength
		  }
		  if (typeof string !== 'string') {
		    throw new TypeError(
		      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
		      'Received type ' + typeof string
		    )
		  }

		  const len = string.length;
		  const mustMatch = (arguments.length > 2 && arguments[2] === true);
		  if (!mustMatch && len === 0) return 0

		  // Use a for loop to avoid recursion
		  let loweredCase = false;
		  for (;;) {
		    switch (encoding) {
		      case 'ascii':
		      case 'latin1':
		      case 'binary':
		        return len
		      case 'utf8':
		      case 'utf-8':
		        return utf8ToBytes(string).length
		      case 'ucs2':
		      case 'ucs-2':
		      case 'utf16le':
		      case 'utf-16le':
		        return len * 2
		      case 'hex':
		        return len >>> 1
		      case 'base64':
		        return base64ToBytes(string).length
		      default:
		        if (loweredCase) {
		          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
		        }
		        encoding = ('' + encoding).toLowerCase();
		        loweredCase = true;
		    }
		  }
		}
		Buffer.byteLength = byteLength;

		function slowToString (encoding, start, end) {
		  let loweredCase = false;

		  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
		  // property of a typed array.

		  // This behaves neither like String nor Uint8Array in that we set start/end
		  // to their upper/lower bounds if the value passed is out of range.
		  // undefined is handled specially as per ECMA-262 6th Edition,
		  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
		  if (start === undefined || start < 0) {
		    start = 0;
		  }
		  // Return early if start > this.length. Done here to prevent potential uint32
		  // coercion fail below.
		  if (start > this.length) {
		    return ''
		  }

		  if (end === undefined || end > this.length) {
		    end = this.length;
		  }

		  if (end <= 0) {
		    return ''
		  }

		  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
		  end >>>= 0;
		  start >>>= 0;

		  if (end <= start) {
		    return ''
		  }

		  if (!encoding) encoding = 'utf8';

		  while (true) {
		    switch (encoding) {
		      case 'hex':
		        return hexSlice(this, start, end)

		      case 'utf8':
		      case 'utf-8':
		        return utf8Slice(this, start, end)

		      case 'ascii':
		        return asciiSlice(this, start, end)

		      case 'latin1':
		      case 'binary':
		        return latin1Slice(this, start, end)

		      case 'base64':
		        return base64Slice(this, start, end)

		      case 'ucs2':
		      case 'ucs-2':
		      case 'utf16le':
		      case 'utf-16le':
		        return utf16leSlice(this, start, end)

		      default:
		        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
		        encoding = (encoding + '').toLowerCase();
		        loweredCase = true;
		    }
		  }
		}

		// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
		// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
		// reliably in a browserify context because there could be multiple different
		// copies of the 'buffer' package in use. This method works even for Buffer
		// instances that were created from another copy of the `buffer` package.
		// See: https://github.com/feross/buffer/issues/154
		Buffer.prototype._isBuffer = true;

		function swap (b, n, m) {
		  const i = b[n];
		  b[n] = b[m];
		  b[m] = i;
		}

		Buffer.prototype.swap16 = function swap16 () {
		  const len = this.length;
		  if (len % 2 !== 0) {
		    throw new RangeError('Buffer size must be a multiple of 16-bits')
		  }
		  for (let i = 0; i < len; i += 2) {
		    swap(this, i, i + 1);
		  }
		  return this
		};

		Buffer.prototype.swap32 = function swap32 () {
		  const len = this.length;
		  if (len % 4 !== 0) {
		    throw new RangeError('Buffer size must be a multiple of 32-bits')
		  }
		  for (let i = 0; i < len; i += 4) {
		    swap(this, i, i + 3);
		    swap(this, i + 1, i + 2);
		  }
		  return this
		};

		Buffer.prototype.swap64 = function swap64 () {
		  const len = this.length;
		  if (len % 8 !== 0) {
		    throw new RangeError('Buffer size must be a multiple of 64-bits')
		  }
		  for (let i = 0; i < len; i += 8) {
		    swap(this, i, i + 7);
		    swap(this, i + 1, i + 6);
		    swap(this, i + 2, i + 5);
		    swap(this, i + 3, i + 4);
		  }
		  return this
		};

		Buffer.prototype.toString = function toString () {
		  const length = this.length;
		  if (length === 0) return ''
		  if (arguments.length === 0) return utf8Slice(this, 0, length)
		  return slowToString.apply(this, arguments)
		};

		Buffer.prototype.toLocaleString = Buffer.prototype.toString;

		Buffer.prototype.equals = function equals (b) {
		  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
		  if (this === b) return true
		  return Buffer.compare(this, b) === 0
		};

		Buffer.prototype.inspect = function inspect () {
		  let str = '';
		  const max = exports.INSPECT_MAX_BYTES;
		  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
		  if (this.length > max) str += ' ... ';
		  return '<Buffer ' + str + '>'
		};
		if (customInspectSymbol) {
		  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
		}

		Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
		  if (isInstance(target, Uint8Array)) {
		    target = Buffer.from(target, target.offset, target.byteLength);
		  }
		  if (!Buffer.isBuffer(target)) {
		    throw new TypeError(
		      'The "target" argument must be one of type Buffer or Uint8Array. ' +
		      'Received type ' + (typeof target)
		    )
		  }

		  if (start === undefined) {
		    start = 0;
		  }
		  if (end === undefined) {
		    end = target ? target.length : 0;
		  }
		  if (thisStart === undefined) {
		    thisStart = 0;
		  }
		  if (thisEnd === undefined) {
		    thisEnd = this.length;
		  }

		  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
		    throw new RangeError('out of range index')
		  }

		  if (thisStart >= thisEnd && start >= end) {
		    return 0
		  }
		  if (thisStart >= thisEnd) {
		    return -1
		  }
		  if (start >= end) {
		    return 1
		  }

		  start >>>= 0;
		  end >>>= 0;
		  thisStart >>>= 0;
		  thisEnd >>>= 0;

		  if (this === target) return 0

		  let x = thisEnd - thisStart;
		  let y = end - start;
		  const len = Math.min(x, y);

		  const thisCopy = this.slice(thisStart, thisEnd);
		  const targetCopy = target.slice(start, end);

		  for (let i = 0; i < len; ++i) {
		    if (thisCopy[i] !== targetCopy[i]) {
		      x = thisCopy[i];
		      y = targetCopy[i];
		      break
		    }
		  }

		  if (x < y) return -1
		  if (y < x) return 1
		  return 0
		};

		// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
		// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
		//
		// Arguments:
		// - buffer - a Buffer to search
		// - val - a string, Buffer, or number
		// - byteOffset - an index into `buffer`; will be clamped to an int32
		// - encoding - an optional encoding, relevant is val is a string
		// - dir - true for indexOf, false for lastIndexOf
		function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
		  // Empty buffer means no match
		  if (buffer.length === 0) return -1

		  // Normalize byteOffset
		  if (typeof byteOffset === 'string') {
		    encoding = byteOffset;
		    byteOffset = 0;
		  } else if (byteOffset > 0x7fffffff) {
		    byteOffset = 0x7fffffff;
		  } else if (byteOffset < -0x80000000) {
		    byteOffset = -0x80000000;
		  }
		  byteOffset = +byteOffset; // Coerce to Number.
		  if (numberIsNaN(byteOffset)) {
		    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
		    byteOffset = dir ? 0 : (buffer.length - 1);
		  }

		  // Normalize byteOffset: negative offsets start from the end of the buffer
		  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
		  if (byteOffset >= buffer.length) {
		    if (dir) return -1
		    else byteOffset = buffer.length - 1;
		  } else if (byteOffset < 0) {
		    if (dir) byteOffset = 0;
		    else return -1
		  }

		  // Normalize val
		  if (typeof val === 'string') {
		    val = Buffer.from(val, encoding);
		  }

		  // Finally, search either indexOf (if dir is true) or lastIndexOf
		  if (Buffer.isBuffer(val)) {
		    // Special case: looking for empty string/buffer always fails
		    if (val.length === 0) {
		      return -1
		    }
		    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
		  } else if (typeof val === 'number') {
		    val = val & 0xFF; // Search for a byte value [0-255]
		    if (typeof Uint8Array.prototype.indexOf === 'function') {
		      if (dir) {
		        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
		      } else {
		        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
		      }
		    }
		    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
		  }

		  throw new TypeError('val must be string, number or Buffer')
		}

		function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
		  let indexSize = 1;
		  let arrLength = arr.length;
		  let valLength = val.length;

		  if (encoding !== undefined) {
		    encoding = String(encoding).toLowerCase();
		    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
		        encoding === 'utf16le' || encoding === 'utf-16le') {
		      if (arr.length < 2 || val.length < 2) {
		        return -1
		      }
		      indexSize = 2;
		      arrLength /= 2;
		      valLength /= 2;
		      byteOffset /= 2;
		    }
		  }

		  function read (buf, i) {
		    if (indexSize === 1) {
		      return buf[i]
		    } else {
		      return buf.readUInt16BE(i * indexSize)
		    }
		  }

		  let i;
		  if (dir) {
		    let foundIndex = -1;
		    for (i = byteOffset; i < arrLength; i++) {
		      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
		        if (foundIndex === -1) foundIndex = i;
		        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
		      } else {
		        if (foundIndex !== -1) i -= i - foundIndex;
		        foundIndex = -1;
		      }
		    }
		  } else {
		    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
		    for (i = byteOffset; i >= 0; i--) {
		      let found = true;
		      for (let j = 0; j < valLength; j++) {
		        if (read(arr, i + j) !== read(val, j)) {
		          found = false;
		          break
		        }
		      }
		      if (found) return i
		    }
		  }

		  return -1
		}

		Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
		  return this.indexOf(val, byteOffset, encoding) !== -1
		};

		Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
		  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
		};

		Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
		  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
		};

		function hexWrite (buf, string, offset, length) {
		  offset = Number(offset) || 0;
		  const remaining = buf.length - offset;
		  if (!length) {
		    length = remaining;
		  } else {
		    length = Number(length);
		    if (length > remaining) {
		      length = remaining;
		    }
		  }

		  const strLen = string.length;

		  if (length > strLen / 2) {
		    length = strLen / 2;
		  }
		  let i;
		  for (i = 0; i < length; ++i) {
		    const parsed = parseInt(string.substr(i * 2, 2), 16);
		    if (numberIsNaN(parsed)) return i
		    buf[offset + i] = parsed;
		  }
		  return i
		}

		function utf8Write (buf, string, offset, length) {
		  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
		}

		function asciiWrite (buf, string, offset, length) {
		  return blitBuffer(asciiToBytes(string), buf, offset, length)
		}

		function base64Write (buf, string, offset, length) {
		  return blitBuffer(base64ToBytes(string), buf, offset, length)
		}

		function ucs2Write (buf, string, offset, length) {
		  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
		}

		Buffer.prototype.write = function write (string, offset, length, encoding) {
		  // Buffer#write(string)
		  if (offset === undefined) {
		    encoding = 'utf8';
		    length = this.length;
		    offset = 0;
		  // Buffer#write(string, encoding)
		  } else if (length === undefined && typeof offset === 'string') {
		    encoding = offset;
		    length = this.length;
		    offset = 0;
		  // Buffer#write(string, offset[, length][, encoding])
		  } else if (isFinite(offset)) {
		    offset = offset >>> 0;
		    if (isFinite(length)) {
		      length = length >>> 0;
		      if (encoding === undefined) encoding = 'utf8';
		    } else {
		      encoding = length;
		      length = undefined;
		    }
		  } else {
		    throw new Error(
		      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
		    )
		  }

		  const remaining = this.length - offset;
		  if (length === undefined || length > remaining) length = remaining;

		  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
		    throw new RangeError('Attempt to write outside buffer bounds')
		  }

		  if (!encoding) encoding = 'utf8';

		  let loweredCase = false;
		  for (;;) {
		    switch (encoding) {
		      case 'hex':
		        return hexWrite(this, string, offset, length)

		      case 'utf8':
		      case 'utf-8':
		        return utf8Write(this, string, offset, length)

		      case 'ascii':
		      case 'latin1':
		      case 'binary':
		        return asciiWrite(this, string, offset, length)

		      case 'base64':
		        // Warning: maxLength not taken into account in base64Write
		        return base64Write(this, string, offset, length)

		      case 'ucs2':
		      case 'ucs-2':
		      case 'utf16le':
		      case 'utf-16le':
		        return ucs2Write(this, string, offset, length)

		      default:
		        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
		        encoding = ('' + encoding).toLowerCase();
		        loweredCase = true;
		    }
		  }
		};

		Buffer.prototype.toJSON = function toJSON () {
		  return {
		    type: 'Buffer',
		    data: Array.prototype.slice.call(this._arr || this, 0)
		  }
		};

		function base64Slice (buf, start, end) {
		  if (start === 0 && end === buf.length) {
		    return base64.fromByteArray(buf)
		  } else {
		    return base64.fromByteArray(buf.slice(start, end))
		  }
		}

		function utf8Slice (buf, start, end) {
		  end = Math.min(buf.length, end);
		  const res = [];

		  let i = start;
		  while (i < end) {
		    const firstByte = buf[i];
		    let codePoint = null;
		    let bytesPerSequence = (firstByte > 0xEF)
		      ? 4
		      : (firstByte > 0xDF)
		          ? 3
		          : (firstByte > 0xBF)
		              ? 2
		              : 1;

		    if (i + bytesPerSequence <= end) {
		      let secondByte, thirdByte, fourthByte, tempCodePoint;

		      switch (bytesPerSequence) {
		        case 1:
		          if (firstByte < 0x80) {
		            codePoint = firstByte;
		          }
		          break
		        case 2:
		          secondByte = buf[i + 1];
		          if ((secondByte & 0xC0) === 0x80) {
		            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
		            if (tempCodePoint > 0x7F) {
		              codePoint = tempCodePoint;
		            }
		          }
		          break
		        case 3:
		          secondByte = buf[i + 1];
		          thirdByte = buf[i + 2];
		          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
		            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
		            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
		              codePoint = tempCodePoint;
		            }
		          }
		          break
		        case 4:
		          secondByte = buf[i + 1];
		          thirdByte = buf[i + 2];
		          fourthByte = buf[i + 3];
		          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
		            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
		            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
		              codePoint = tempCodePoint;
		            }
		          }
		      }
		    }

		    if (codePoint === null) {
		      // we did not generate a valid codePoint so insert a
		      // replacement char (U+FFFD) and advance only 1 byte
		      codePoint = 0xFFFD;
		      bytesPerSequence = 1;
		    } else if (codePoint > 0xFFFF) {
		      // encode to utf16 (surrogate pair dance)
		      codePoint -= 0x10000;
		      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
		      codePoint = 0xDC00 | codePoint & 0x3FF;
		    }

		    res.push(codePoint);
		    i += bytesPerSequence;
		  }

		  return decodeCodePointsArray(res)
		}

		// Based on http://stackoverflow.com/a/22747272/680742, the browser with
		// the lowest limit is Chrome, with 0x10000 args.
		// We go 1 magnitude less, for safety
		const MAX_ARGUMENTS_LENGTH = 0x1000;

		function decodeCodePointsArray (codePoints) {
		  const len = codePoints.length;
		  if (len <= MAX_ARGUMENTS_LENGTH) {
		    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
		  }

		  // Decode in chunks to avoid "call stack size exceeded".
		  let res = '';
		  let i = 0;
		  while (i < len) {
		    res += String.fromCharCode.apply(
		      String,
		      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
		    );
		  }
		  return res
		}

		function asciiSlice (buf, start, end) {
		  let ret = '';
		  end = Math.min(buf.length, end);

		  for (let i = start; i < end; ++i) {
		    ret += String.fromCharCode(buf[i] & 0x7F);
		  }
		  return ret
		}

		function latin1Slice (buf, start, end) {
		  let ret = '';
		  end = Math.min(buf.length, end);

		  for (let i = start; i < end; ++i) {
		    ret += String.fromCharCode(buf[i]);
		  }
		  return ret
		}

		function hexSlice (buf, start, end) {
		  const len = buf.length;

		  if (!start || start < 0) start = 0;
		  if (!end || end < 0 || end > len) end = len;

		  let out = '';
		  for (let i = start; i < end; ++i) {
		    out += hexSliceLookupTable[buf[i]];
		  }
		  return out
		}

		function utf16leSlice (buf, start, end) {
		  const bytes = buf.slice(start, end);
		  let res = '';
		  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
		  for (let i = 0; i < bytes.length - 1; i += 2) {
		    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256));
		  }
		  return res
		}

		Buffer.prototype.slice = function slice (start, end) {
		  const len = this.length;
		  start = ~~start;
		  end = end === undefined ? len : ~~end;

		  if (start < 0) {
		    start += len;
		    if (start < 0) start = 0;
		  } else if (start > len) {
		    start = len;
		  }

		  if (end < 0) {
		    end += len;
		    if (end < 0) end = 0;
		  } else if (end > len) {
		    end = len;
		  }

		  if (end < start) end = start;

		  const newBuf = this.subarray(start, end);
		  // Return an augmented `Uint8Array` instance
		  Object.setPrototypeOf(newBuf, Buffer.prototype);

		  return newBuf
		};

		/*
		 * Need to make sure that buffer isn't trying to write out of bounds.
		 */
		function checkOffset (offset, ext, length) {
		  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
		  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
		}

		Buffer.prototype.readUintLE =
		Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) checkOffset(offset, byteLength, this.length);

		  let val = this[offset];
		  let mul = 1;
		  let i = 0;
		  while (++i < byteLength && (mul *= 0x100)) {
		    val += this[offset + i] * mul;
		  }

		  return val
		};

		Buffer.prototype.readUintBE =
		Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) {
		    checkOffset(offset, byteLength, this.length);
		  }

		  let val = this[offset + --byteLength];
		  let mul = 1;
		  while (byteLength > 0 && (mul *= 0x100)) {
		    val += this[offset + --byteLength] * mul;
		  }

		  return val
		};

		Buffer.prototype.readUint8 =
		Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 1, this.length);
		  return this[offset]
		};

		Buffer.prototype.readUint16LE =
		Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 2, this.length);
		  return this[offset] | (this[offset + 1] << 8)
		};

		Buffer.prototype.readUint16BE =
		Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 2, this.length);
		  return (this[offset] << 8) | this[offset + 1]
		};

		Buffer.prototype.readUint32LE =
		Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);

		  return ((this[offset]) |
		      (this[offset + 1] << 8) |
		      (this[offset + 2] << 16)) +
		      (this[offset + 3] * 0x1000000)
		};

		Buffer.prototype.readUint32BE =
		Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);

		  return (this[offset] * 0x1000000) +
		    ((this[offset + 1] << 16) |
		    (this[offset + 2] << 8) |
		    this[offset + 3])
		};

		Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE (offset) {
		  offset = offset >>> 0;
		  validateNumber(offset, 'offset');
		  const first = this[offset];
		  const last = this[offset + 7];
		  if (first === undefined || last === undefined) {
		    boundsError(offset, this.length - 8);
		  }

		  const lo = first +
		    this[++offset] * 2 ** 8 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 24;

		  const hi = this[++offset] +
		    this[++offset] * 2 ** 8 +
		    this[++offset] * 2 ** 16 +
		    last * 2 ** 24;

		  return BigInt(lo) + (BigInt(hi) << BigInt(32))
		});

		Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE (offset) {
		  offset = offset >>> 0;
		  validateNumber(offset, 'offset');
		  const first = this[offset];
		  const last = this[offset + 7];
		  if (first === undefined || last === undefined) {
		    boundsError(offset, this.length - 8);
		  }

		  const hi = first * 2 ** 24 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 8 +
		    this[++offset];

		  const lo = this[++offset] * 2 ** 24 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 8 +
		    last;

		  return (BigInt(hi) << BigInt(32)) + BigInt(lo)
		});

		Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) checkOffset(offset, byteLength, this.length);

		  let val = this[offset];
		  let mul = 1;
		  let i = 0;
		  while (++i < byteLength && (mul *= 0x100)) {
		    val += this[offset + i] * mul;
		  }
		  mul *= 0x80;

		  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

		  return val
		};

		Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) checkOffset(offset, byteLength, this.length);

		  let i = byteLength;
		  let mul = 1;
		  let val = this[offset + --i];
		  while (i > 0 && (mul *= 0x100)) {
		    val += this[offset + --i] * mul;
		  }
		  mul *= 0x80;

		  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

		  return val
		};

		Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 1, this.length);
		  if (!(this[offset] & 0x80)) return (this[offset])
		  return ((0xff - this[offset] + 1) * -1)
		};

		Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 2, this.length);
		  const val = this[offset] | (this[offset + 1] << 8);
		  return (val & 0x8000) ? val | 0xFFFF0000 : val
		};

		Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 2, this.length);
		  const val = this[offset + 1] | (this[offset] << 8);
		  return (val & 0x8000) ? val | 0xFFFF0000 : val
		};

		Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);

		  return (this[offset]) |
		    (this[offset + 1] << 8) |
		    (this[offset + 2] << 16) |
		    (this[offset + 3] << 24)
		};

		Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);

		  return (this[offset] << 24) |
		    (this[offset + 1] << 16) |
		    (this[offset + 2] << 8) |
		    (this[offset + 3])
		};

		Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE (offset) {
		  offset = offset >>> 0;
		  validateNumber(offset, 'offset');
		  const first = this[offset];
		  const last = this[offset + 7];
		  if (first === undefined || last === undefined) {
		    boundsError(offset, this.length - 8);
		  }

		  const val = this[offset + 4] +
		    this[offset + 5] * 2 ** 8 +
		    this[offset + 6] * 2 ** 16 +
		    (last << 24); // Overflow

		  return (BigInt(val) << BigInt(32)) +
		    BigInt(first +
		    this[++offset] * 2 ** 8 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 24)
		});

		Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE (offset) {
		  offset = offset >>> 0;
		  validateNumber(offset, 'offset');
		  const first = this[offset];
		  const last = this[offset + 7];
		  if (first === undefined || last === undefined) {
		    boundsError(offset, this.length - 8);
		  }

		  const val = (first << 24) + // Overflow
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 8 +
		    this[++offset];

		  return (BigInt(val) << BigInt(32)) +
		    BigInt(this[++offset] * 2 ** 24 +
		    this[++offset] * 2 ** 16 +
		    this[++offset] * 2 ** 8 +
		    last)
		});

		Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);
		  return ieee754$1.read(this, offset, true, 23, 4)
		};

		Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 4, this.length);
		  return ieee754$1.read(this, offset, false, 23, 4)
		};

		Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 8, this.length);
		  return ieee754$1.read(this, offset, true, 52, 8)
		};

		Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
		  offset = offset >>> 0;
		  if (!noAssert) checkOffset(offset, 8, this.length);
		  return ieee754$1.read(this, offset, false, 52, 8)
		};

		function checkInt (buf, value, offset, ext, max, min) {
		  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
		  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
		  if (offset + ext > buf.length) throw new RangeError('Index out of range')
		}

		Buffer.prototype.writeUintLE =
		Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) {
		    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
		    checkInt(this, value, offset, byteLength, maxBytes, 0);
		  }

		  let mul = 1;
		  let i = 0;
		  this[offset] = value & 0xFF;
		  while (++i < byteLength && (mul *= 0x100)) {
		    this[offset + i] = (value / mul) & 0xFF;
		  }

		  return offset + byteLength
		};

		Buffer.prototype.writeUintBE =
		Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  byteLength = byteLength >>> 0;
		  if (!noAssert) {
		    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
		    checkInt(this, value, offset, byteLength, maxBytes, 0);
		  }

		  let i = byteLength - 1;
		  let mul = 1;
		  this[offset + i] = value & 0xFF;
		  while (--i >= 0 && (mul *= 0x100)) {
		    this[offset + i] = (value / mul) & 0xFF;
		  }

		  return offset + byteLength
		};

		Buffer.prototype.writeUint8 =
		Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
		  this[offset] = (value & 0xff);
		  return offset + 1
		};

		Buffer.prototype.writeUint16LE =
		Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
		  this[offset] = (value & 0xff);
		  this[offset + 1] = (value >>> 8);
		  return offset + 2
		};

		Buffer.prototype.writeUint16BE =
		Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
		  this[offset] = (value >>> 8);
		  this[offset + 1] = (value & 0xff);
		  return offset + 2
		};

		Buffer.prototype.writeUint32LE =
		Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
		  this[offset + 3] = (value >>> 24);
		  this[offset + 2] = (value >>> 16);
		  this[offset + 1] = (value >>> 8);
		  this[offset] = (value & 0xff);
		  return offset + 4
		};

		Buffer.prototype.writeUint32BE =
		Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
		  this[offset] = (value >>> 24);
		  this[offset + 1] = (value >>> 16);
		  this[offset + 2] = (value >>> 8);
		  this[offset + 3] = (value & 0xff);
		  return offset + 4
		};

		function wrtBigUInt64LE (buf, value, offset, min, max) {
		  checkIntBI(value, min, max, buf, offset, 7);

		  let lo = Number(value & BigInt(0xffffffff));
		  buf[offset++] = lo;
		  lo = lo >> 8;
		  buf[offset++] = lo;
		  lo = lo >> 8;
		  buf[offset++] = lo;
		  lo = lo >> 8;
		  buf[offset++] = lo;
		  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
		  buf[offset++] = hi;
		  hi = hi >> 8;
		  buf[offset++] = hi;
		  hi = hi >> 8;
		  buf[offset++] = hi;
		  hi = hi >> 8;
		  buf[offset++] = hi;
		  return offset
		}

		function wrtBigUInt64BE (buf, value, offset, min, max) {
		  checkIntBI(value, min, max, buf, offset, 7);

		  let lo = Number(value & BigInt(0xffffffff));
		  buf[offset + 7] = lo;
		  lo = lo >> 8;
		  buf[offset + 6] = lo;
		  lo = lo >> 8;
		  buf[offset + 5] = lo;
		  lo = lo >> 8;
		  buf[offset + 4] = lo;
		  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
		  buf[offset + 3] = hi;
		  hi = hi >> 8;
		  buf[offset + 2] = hi;
		  hi = hi >> 8;
		  buf[offset + 1] = hi;
		  hi = hi >> 8;
		  buf[offset] = hi;
		  return offset + 8
		}

		Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE (value, offset = 0) {
		  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
		});

		Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE (value, offset = 0) {
		  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
		});

		Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) {
		    const limit = Math.pow(2, (8 * byteLength) - 1);

		    checkInt(this, value, offset, byteLength, limit - 1, -limit);
		  }

		  let i = 0;
		  let mul = 1;
		  let sub = 0;
		  this[offset] = value & 0xFF;
		  while (++i < byteLength && (mul *= 0x100)) {
		    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
		      sub = 1;
		    }
		    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
		  }

		  return offset + byteLength
		};

		Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) {
		    const limit = Math.pow(2, (8 * byteLength) - 1);

		    checkInt(this, value, offset, byteLength, limit - 1, -limit);
		  }

		  let i = byteLength - 1;
		  let mul = 1;
		  let sub = 0;
		  this[offset + i] = value & 0xFF;
		  while (--i >= 0 && (mul *= 0x100)) {
		    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
		      sub = 1;
		    }
		    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
		  }

		  return offset + byteLength
		};

		Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
		  if (value < 0) value = 0xff + value + 1;
		  this[offset] = (value & 0xff);
		  return offset + 1
		};

		Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
		  this[offset] = (value & 0xff);
		  this[offset + 1] = (value >>> 8);
		  return offset + 2
		};

		Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
		  this[offset] = (value >>> 8);
		  this[offset + 1] = (value & 0xff);
		  return offset + 2
		};

		Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
		  this[offset] = (value & 0xff);
		  this[offset + 1] = (value >>> 8);
		  this[offset + 2] = (value >>> 16);
		  this[offset + 3] = (value >>> 24);
		  return offset + 4
		};

		Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
		  if (value < 0) value = 0xffffffff + value + 1;
		  this[offset] = (value >>> 24);
		  this[offset + 1] = (value >>> 16);
		  this[offset + 2] = (value >>> 8);
		  this[offset + 3] = (value & 0xff);
		  return offset + 4
		};

		Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE (value, offset = 0) {
		  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
		});

		Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE (value, offset = 0) {
		  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
		});

		function checkIEEE754 (buf, value, offset, ext, max, min) {
		  if (offset + ext > buf.length) throw new RangeError('Index out of range')
		  if (offset < 0) throw new RangeError('Index out of range')
		}

		function writeFloat (buf, value, offset, littleEndian, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) {
		    checkIEEE754(buf, value, offset, 4);
		  }
		  ieee754$1.write(buf, value, offset, littleEndian, 23, 4);
		  return offset + 4
		}

		Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
		  return writeFloat(this, value, offset, true, noAssert)
		};

		Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
		  return writeFloat(this, value, offset, false, noAssert)
		};

		function writeDouble (buf, value, offset, littleEndian, noAssert) {
		  value = +value;
		  offset = offset >>> 0;
		  if (!noAssert) {
		    checkIEEE754(buf, value, offset, 8);
		  }
		  ieee754$1.write(buf, value, offset, littleEndian, 52, 8);
		  return offset + 8
		}

		Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
		  return writeDouble(this, value, offset, true, noAssert)
		};

		Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
		  return writeDouble(this, value, offset, false, noAssert)
		};

		// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
		Buffer.prototype.copy = function copy (target, targetStart, start, end) {
		  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
		  if (!start) start = 0;
		  if (!end && end !== 0) end = this.length;
		  if (targetStart >= target.length) targetStart = target.length;
		  if (!targetStart) targetStart = 0;
		  if (end > 0 && end < start) end = start;

		  // Copy 0 bytes; we're done
		  if (end === start) return 0
		  if (target.length === 0 || this.length === 0) return 0

		  // Fatal error conditions
		  if (targetStart < 0) {
		    throw new RangeError('targetStart out of bounds')
		  }
		  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
		  if (end < 0) throw new RangeError('sourceEnd out of bounds')

		  // Are we oob?
		  if (end > this.length) end = this.length;
		  if (target.length - targetStart < end - start) {
		    end = target.length - targetStart + start;
		  }

		  const len = end - start;

		  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
		    // Use built-in when available, missing from IE11
		    this.copyWithin(targetStart, start, end);
		  } else {
		    Uint8Array.prototype.set.call(
		      target,
		      this.subarray(start, end),
		      targetStart
		    );
		  }

		  return len
		};

		// Usage:
		//    buffer.fill(number[, offset[, end]])
		//    buffer.fill(buffer[, offset[, end]])
		//    buffer.fill(string[, offset[, end]][, encoding])
		Buffer.prototype.fill = function fill (val, start, end, encoding) {
		  // Handle string cases:
		  if (typeof val === 'string') {
		    if (typeof start === 'string') {
		      encoding = start;
		      start = 0;
		      end = this.length;
		    } else if (typeof end === 'string') {
		      encoding = end;
		      end = this.length;
		    }
		    if (encoding !== undefined && typeof encoding !== 'string') {
		      throw new TypeError('encoding must be a string')
		    }
		    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
		      throw new TypeError('Unknown encoding: ' + encoding)
		    }
		    if (val.length === 1) {
		      const code = val.charCodeAt(0);
		      if ((encoding === 'utf8' && code < 128) ||
		          encoding === 'latin1') {
		        // Fast path: If `val` fits into a single byte, use that numeric value.
		        val = code;
		      }
		    }
		  } else if (typeof val === 'number') {
		    val = val & 255;
		  } else if (typeof val === 'boolean') {
		    val = Number(val);
		  }

		  // Invalid ranges are not set to a default, so can range check early.
		  if (start < 0 || this.length < start || this.length < end) {
		    throw new RangeError('Out of range index')
		  }

		  if (end <= start) {
		    return this
		  }

		  start = start >>> 0;
		  end = end === undefined ? this.length : end >>> 0;

		  if (!val) val = 0;

		  let i;
		  if (typeof val === 'number') {
		    for (i = start; i < end; ++i) {
		      this[i] = val;
		    }
		  } else {
		    const bytes = Buffer.isBuffer(val)
		      ? val
		      : Buffer.from(val, encoding);
		    const len = bytes.length;
		    if (len === 0) {
		      throw new TypeError('The value "' + val +
		        '" is invalid for argument "value"')
		    }
		    for (i = 0; i < end - start; ++i) {
		      this[i + start] = bytes[i % len];
		    }
		  }

		  return this
		};

		// CUSTOM ERRORS
		// =============

		// Simplified versions from Node, changed for Buffer-only usage
		const errors = {};
		function E (sym, getMessage, Base) {
		  errors[sym] = class NodeError extends Base {
		    constructor () {
		      super();

		      Object.defineProperty(this, 'message', {
		        value: getMessage.apply(this, arguments),
		        writable: true,
		        configurable: true
		      });

		      // Add the error code to the name to include it in the stack trace.
		      this.name = `${this.name} [${sym}]`;
		      // Access the stack to generate the error message including the error code
		      // from the name.
		      this.stack; // eslint-disable-line no-unused-expressions
		      // Reset the name to the actual name.
		      delete this.name;
		    }

		    get code () {
		      return sym
		    }

		    set code (value) {
		      Object.defineProperty(this, 'code', {
		        configurable: true,
		        enumerable: true,
		        value,
		        writable: true
		      });
		    }

		    toString () {
		      return `${this.name} [${sym}]: ${this.message}`
		    }
		  };
		}

		E('ERR_BUFFER_OUT_OF_BOUNDS',
		  function (name) {
		    if (name) {
		      return `${name} is outside of buffer bounds`
		    }

		    return 'Attempt to access memory outside buffer bounds'
		  }, RangeError);
		E('ERR_INVALID_ARG_TYPE',
		  function (name, actual) {
		    return `The "${name}" argument must be of type number. Received type ${typeof actual}`
		  }, TypeError);
		E('ERR_OUT_OF_RANGE',
		  function (str, range, input) {
		    let msg = `The value of "${str}" is out of range.`;
		    let received = input;
		    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
		      received = addNumericalSeparator(String(input));
		    } else if (typeof input === 'bigint') {
		      received = String(input);
		      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
		        received = addNumericalSeparator(received);
		      }
		      received += 'n';
		    }
		    msg += ` It must be ${range}. Received ${received}`;
		    return msg
		  }, RangeError);

		function addNumericalSeparator (val) {
		  let res = '';
		  let i = val.length;
		  const start = val[0] === '-' ? 1 : 0;
		  for (; i >= start + 4; i -= 3) {
		    res = `_${val.slice(i - 3, i)}${res}`;
		  }
		  return `${val.slice(0, i)}${res}`
		}

		// CHECK FUNCTIONS
		// ===============

		function checkBounds (buf, offset, byteLength) {
		  validateNumber(offset, 'offset');
		  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
		    boundsError(offset, buf.length - (byteLength + 1));
		  }
		}

		function checkIntBI (value, min, max, buf, offset, byteLength) {
		  if (value > max || value < min) {
		    const n = typeof min === 'bigint' ? 'n' : '';
		    let range;
		    if (byteLength > 3) {
		      if (min === 0 || min === BigInt(0)) {
		        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`;
		      } else {
		        range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +
		                `${(byteLength + 1) * 8 - 1}${n}`;
		      }
		    } else {
		      range = `>= ${min}${n} and <= ${max}${n}`;
		    }
		    throw new errors.ERR_OUT_OF_RANGE('value', range, value)
		  }
		  checkBounds(buf, offset, byteLength);
		}

		function validateNumber (value, name) {
		  if (typeof value !== 'number') {
		    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value)
		  }
		}

		function boundsError (value, length, type) {
		  if (Math.floor(value) !== value) {
		    validateNumber(value, type);
		    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)
		  }

		  if (length < 0) {
		    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
		  }

		  throw new errors.ERR_OUT_OF_RANGE(type || 'offset',
		                                    `>= ${type ? 1 : 0} and <= ${length}`,
		                                    value)
		}

		// HELPER FUNCTIONS
		// ================

		const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

		function base64clean (str) {
		  // Node takes equal signs as end of the Base64 encoding
		  str = str.split('=')[0];
		  // Node strips out invalid characters like \n and \t from the string, base64-js does not
		  str = str.trim().replace(INVALID_BASE64_RE, '');
		  // Node converts strings with length < 2 to ''
		  if (str.length < 2) return ''
		  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
		  while (str.length % 4 !== 0) {
		    str = str + '=';
		  }
		  return str
		}

		function utf8ToBytes (string, units) {
		  units = units || Infinity;
		  let codePoint;
		  const length = string.length;
		  let leadSurrogate = null;
		  const bytes = [];

		  for (let i = 0; i < length; ++i) {
		    codePoint = string.charCodeAt(i);

		    // is surrogate component
		    if (codePoint > 0xD7FF && codePoint < 0xE000) {
		      // last char was a lead
		      if (!leadSurrogate) {
		        // no lead yet
		        if (codePoint > 0xDBFF) {
		          // unexpected trail
		          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		          continue
		        } else if (i + 1 === length) {
		          // unpaired lead
		          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		          continue
		        }

		        // valid lead
		        leadSurrogate = codePoint;

		        continue
		      }

		      // 2 leads in a row
		      if (codePoint < 0xDC00) {
		        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		        leadSurrogate = codePoint;
		        continue
		      }

		      // valid surrogate pair
		      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
		    } else if (leadSurrogate) {
		      // valid bmp char, but last char was a lead
		      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
		    }

		    leadSurrogate = null;

		    // encode utf8
		    if (codePoint < 0x80) {
		      if ((units -= 1) < 0) break
		      bytes.push(codePoint);
		    } else if (codePoint < 0x800) {
		      if ((units -= 2) < 0) break
		      bytes.push(
		        codePoint >> 0x6 | 0xC0,
		        codePoint & 0x3F | 0x80
		      );
		    } else if (codePoint < 0x10000) {
		      if ((units -= 3) < 0) break
		      bytes.push(
		        codePoint >> 0xC | 0xE0,
		        codePoint >> 0x6 & 0x3F | 0x80,
		        codePoint & 0x3F | 0x80
		      );
		    } else if (codePoint < 0x110000) {
		      if ((units -= 4) < 0) break
		      bytes.push(
		        codePoint >> 0x12 | 0xF0,
		        codePoint >> 0xC & 0x3F | 0x80,
		        codePoint >> 0x6 & 0x3F | 0x80,
		        codePoint & 0x3F | 0x80
		      );
		    } else {
		      throw new Error('Invalid code point')
		    }
		  }

		  return bytes
		}

		function asciiToBytes (str) {
		  const byteArray = [];
		  for (let i = 0; i < str.length; ++i) {
		    // Node's code seems to be doing this and not & 0x7F..
		    byteArray.push(str.charCodeAt(i) & 0xFF);
		  }
		  return byteArray
		}

		function utf16leToBytes (str, units) {
		  let c, hi, lo;
		  const byteArray = [];
		  for (let i = 0; i < str.length; ++i) {
		    if ((units -= 2) < 0) break

		    c = str.charCodeAt(i);
		    hi = c >> 8;
		    lo = c % 256;
		    byteArray.push(lo);
		    byteArray.push(hi);
		  }

		  return byteArray
		}

		function base64ToBytes (str) {
		  return base64.toByteArray(base64clean(str))
		}

		function blitBuffer (src, dst, offset, length) {
		  let i;
		  for (i = 0; i < length; ++i) {
		    if ((i + offset >= dst.length) || (i >= src.length)) break
		    dst[i + offset] = src[i];
		  }
		  return i
		}

		// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
		// the `instanceof` check but they should be treated as of that type.
		// See: https://github.com/feross/buffer/issues/166
		function isInstance (obj, type) {
		  return obj instanceof type ||
		    (obj != null && obj.constructor != null && obj.constructor.name != null &&
		      obj.constructor.name === type.name)
		}
		function numberIsNaN (obj) {
		  // For IE11 support
		  return obj !== obj // eslint-disable-line no-self-compare
		}

		// Create lookup table for `toString('hex')`
		// See: https://github.com/feross/buffer/issues/219
		const hexSliceLookupTable = (function () {
		  const alphabet = '0123456789abcdef';
		  const table = new Array(256);
		  for (let i = 0; i < 16; ++i) {
		    const i16 = i * 16;
		    for (let j = 0; j < 16; ++j) {
		      table[i16 + j] = alphabet[i] + alphabet[j];
		    }
		  }
		  return table
		})();

		// Return not function with Error if BigInt not supported
		function defineBigIntMethod (fn) {
		  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn
		}

		function BufferBigIntNotDefined () {
		  throw new Error('BigInt not supported')
		}
	} (buffer));

	function number$1(n) {
	    if (!Number.isSafeInteger(n) || n < 0)
	        throw new Error(`Wrong positive integer: ${n}`);
	}
	function bool(b) {
	    if (typeof b !== 'boolean')
	        throw new Error(`Expected boolean, not ${b}`);
	}
	function bytes(b, ...lengths) {
	    if (!(b instanceof Uint8Array))
	        throw new TypeError('Expected Uint8Array');
	    if (lengths.length > 0 && !lengths.includes(b.length))
	        throw new TypeError(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
	}
	function hash(hash) {
	    if (typeof hash !== 'function' || typeof hash.create !== 'function')
	        throw new Error('Hash should be wrapped by utils.wrapConstructor');
	    number$1(hash.outputLen);
	    number$1(hash.blockLen);
	}
	function exists(instance, checkFinished = true) {
	    if (instance.destroyed)
	        throw new Error('Hash instance has been destroyed');
	    if (checkFinished && instance.finished)
	        throw new Error('Hash#digest() has already been called');
	}
	function output(out, instance) {
	    bytes(out);
	    const min = instance.outputLen;
	    if (out.length < min) {
	        throw new Error(`digestInto() expects output buffer of length at least ${min}`);
	    }
	}
	const assert$2 = {
	    number: number$1,
	    bool,
	    bytes,
	    hash,
	    exists,
	    output,
	};
	var assert$3 = assert$2;

	/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	const u32$1 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
	// Cast array to view
	const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
	// The rotate right (circular right shift) operation for uint32
	const rotr = (word, shift) => (word << (32 - shift)) | (word >>> shift);
	const isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
	// There is almost no big endian hardware, but js typed arrays uses platform specific endianness.
	// So, just to be sure not to corrupt anything.
	if (!isLE)
	    throw new Error('Non little-endian hardware is not supported');
	Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
	function utf8ToBytes(str) {
	    if (typeof str !== 'string') {
	        throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
	    }
	    return new TextEncoder().encode(str);
	}
	function toBytes(data) {
	    if (typeof data === 'string')
	        data = utf8ToBytes(data);
	    if (!(data instanceof Uint8Array))
	        throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
	    return data;
	}
	// For runtime check if class implements interface
	class Hash {
	    // Safe version that clones internal state
	    clone() {
	        return this._cloneInto();
	    }
	}
	function wrapConstructor(hashConstructor) {
	    const hashC = (message) => hashConstructor().update(toBytes(message)).digest();
	    const tmp = hashConstructor();
	    hashC.outputLen = tmp.outputLen;
	    hashC.blockLen = tmp.blockLen;
	    hashC.create = () => hashConstructor();
	    return hashC;
	}
	function wrapConstructorWithOpts(hashCons) {
	    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
	    const tmp = hashCons({});
	    hashC.outputLen = tmp.outputLen;
	    hashC.blockLen = tmp.blockLen;
	    hashC.create = (opts) => hashCons(opts);
	    return hashC;
	}

	// Polyfill for Safari 14
	function setBigUint64(view, byteOffset, value, isLE) {
	    if (typeof view.setBigUint64 === 'function')
	        return view.setBigUint64(byteOffset, value, isLE);
	    const _32n = BigInt(32);
	    const _u32_max = BigInt(0xffffffff);
	    const wh = Number((value >> _32n) & _u32_max);
	    const wl = Number(value & _u32_max);
	    const h = isLE ? 4 : 0;
	    const l = isLE ? 0 : 4;
	    view.setUint32(byteOffset + h, wh, isLE);
	    view.setUint32(byteOffset + l, wl, isLE);
	}
	// Base SHA2 class (RFC 6234)
	class SHA2 extends Hash {
	    constructor(blockLen, outputLen, padOffset, isLE) {
	        super();
	        this.blockLen = blockLen;
	        this.outputLen = outputLen;
	        this.padOffset = padOffset;
	        this.isLE = isLE;
	        this.finished = false;
	        this.length = 0;
	        this.pos = 0;
	        this.destroyed = false;
	        this.buffer = new Uint8Array(blockLen);
	        this.view = createView(this.buffer);
	    }
	    update(data) {
	        assert$3.exists(this);
	        const { view, buffer, blockLen } = this;
	        data = toBytes(data);
	        const len = data.length;
	        for (let pos = 0; pos < len;) {
	            const take = Math.min(blockLen - this.pos, len - pos);
	            // Fast path: we have at least one block in input, cast it to view and process
	            if (take === blockLen) {
	                const dataView = createView(data);
	                for (; blockLen <= len - pos; pos += blockLen)
	                    this.process(dataView, pos);
	                continue;
	            }
	            buffer.set(data.subarray(pos, pos + take), this.pos);
	            this.pos += take;
	            pos += take;
	            if (this.pos === blockLen) {
	                this.process(view, 0);
	                this.pos = 0;
	            }
	        }
	        this.length += data.length;
	        this.roundClean();
	        return this;
	    }
	    digestInto(out) {
	        assert$3.exists(this);
	        assert$3.output(out, this);
	        this.finished = true;
	        // Padding
	        // We can avoid allocation of buffer for padding completely if it
	        // was previously not allocated here. But it won't change performance.
	        const { buffer, view, blockLen, isLE } = this;
	        let { pos } = this;
	        // append the bit '1' to the message
	        buffer[pos++] = 0b10000000;
	        this.buffer.subarray(pos).fill(0);
	        // we have less than padOffset left in buffer, so we cannot put length in current block, need process it and pad again
	        if (this.padOffset > blockLen - pos) {
	            this.process(view, 0);
	            pos = 0;
	        }
	        // Pad until full block byte with zeros
	        for (let i = pos; i < blockLen; i++)
	            buffer[i] = 0;
	        // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
	        // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
	        // So we just write lowest 64 bits of that value.
	        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
	        this.process(view, 0);
	        const oview = createView(out);
	        this.get().forEach((v, i) => oview.setUint32(4 * i, v, isLE));
	    }
	    digest() {
	        const { buffer, outputLen } = this;
	        this.digestInto(buffer);
	        const res = buffer.slice(0, outputLen);
	        this.destroy();
	        return res;
	    }
	    _cloneInto(to) {
	        to || (to = new this.constructor());
	        to.set(...this.get());
	        const { blockLen, buffer, length, finished, destroyed, pos } = this;
	        to.length = length;
	        to.pos = pos;
	        to.finished = finished;
	        to.destroyed = destroyed;
	        if (length % blockLen)
	            to.buffer.set(buffer);
	        return to;
	    }
	}

	const U32_MASK64 = BigInt(2 ** 32 - 1);
	const _32n = BigInt(32);
	// We are not using BigUint64Array, because they are extremely slow as per 2022
	function fromBig(n, le = false) {
	    if (le)
	        return { h: Number(n & U32_MASK64), l: Number((n >> _32n) & U32_MASK64) };
	    return { h: Number((n >> _32n) & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
	}
	function split(lst, le = false) {
	    let Ah = new Uint32Array(lst.length);
	    let Al = new Uint32Array(lst.length);
	    for (let i = 0; i < lst.length; i++) {
	        const { h, l } = fromBig(lst[i], le);
	        [Ah[i], Al[i]] = [h, l];
	    }
	    return [Ah, Al];
	}
	const toBig = (h, l) => (BigInt(h >>> 0) << _32n) | BigInt(l >>> 0);
	// for Shift in [0, 32)
	const shrSH = (h, l, s) => h >>> s;
	const shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
	// Right rotate for Shift in [1, 32)
	const rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s));
	const rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
	// Right rotate for Shift in (32, 64), NOTE: 32 is special case.
	const rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32));
	const rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s));
	// Right rotate for shift===32 (just swaps l&h)
	const rotr32H = (h, l) => l;
	const rotr32L = (h, l) => h;
	// Left rotate for Shift in [1, 32)
	const rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s));
	const rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s));
	// Left rotate for Shift in (32, 64), NOTE: 32 is special case.
	const rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s));
	const rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s));
	// JS uses 32-bit signed integers for bitwise operations which means we cannot
	// simple take carry out of low bit sum by shift, we need to use division.
	// Removing "export" has 5% perf penalty -_-
	function add(Ah, Al, Bh, Bl) {
	    const l = (Al >>> 0) + (Bl >>> 0);
	    return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 };
	}
	// Addition with more than 2 elements
	const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
	const add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0;
	const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
	const add4H = (low, Ah, Bh, Ch, Dh) => (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0;
	const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
	const add5H = (low, Ah, Bh, Ch, Dh, Eh) => (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0;
	// prettier-ignore
	const u64$1 = {
	    fromBig, split, toBig,
	    shrSH, shrSL,
	    rotrSH, rotrSL, rotrBH, rotrBL,
	    rotr32H, rotr32L,
	    rotlSH, rotlSL, rotlBH, rotlBL,
	    add, add3L, add3H, add4L, add4H, add5H, add5L,
	};
	var u64$2 = u64$1;

	// Round contants (first 32 bits of the fractional parts of the cube roots of the first 80 primes 2..409):
	// prettier-ignore
	const [SHA512_Kh, SHA512_Kl] = u64$2.split([
	    '0x428a2f98d728ae22', '0x7137449123ef65cd', '0xb5c0fbcfec4d3b2f', '0xe9b5dba58189dbbc',
	    '0x3956c25bf348b538', '0x59f111f1b605d019', '0x923f82a4af194f9b', '0xab1c5ed5da6d8118',
	    '0xd807aa98a3030242', '0x12835b0145706fbe', '0x243185be4ee4b28c', '0x550c7dc3d5ffb4e2',
	    '0x72be5d74f27b896f', '0x80deb1fe3b1696b1', '0x9bdc06a725c71235', '0xc19bf174cf692694',
	    '0xe49b69c19ef14ad2', '0xefbe4786384f25e3', '0x0fc19dc68b8cd5b5', '0x240ca1cc77ac9c65',
	    '0x2de92c6f592b0275', '0x4a7484aa6ea6e483', '0x5cb0a9dcbd41fbd4', '0x76f988da831153b5',
	    '0x983e5152ee66dfab', '0xa831c66d2db43210', '0xb00327c898fb213f', '0xbf597fc7beef0ee4',
	    '0xc6e00bf33da88fc2', '0xd5a79147930aa725', '0x06ca6351e003826f', '0x142929670a0e6e70',
	    '0x27b70a8546d22ffc', '0x2e1b21385c26c926', '0x4d2c6dfc5ac42aed', '0x53380d139d95b3df',
	    '0x650a73548baf63de', '0x766a0abb3c77b2a8', '0x81c2c92e47edaee6', '0x92722c851482353b',
	    '0xa2bfe8a14cf10364', '0xa81a664bbc423001', '0xc24b8b70d0f89791', '0xc76c51a30654be30',
	    '0xd192e819d6ef5218', '0xd69906245565a910', '0xf40e35855771202a', '0x106aa07032bbd1b8',
	    '0x19a4c116b8d2d0c8', '0x1e376c085141ab53', '0x2748774cdf8eeb99', '0x34b0bcb5e19b48a8',
	    '0x391c0cb3c5c95a63', '0x4ed8aa4ae3418acb', '0x5b9cca4f7763e373', '0x682e6ff3d6b2b8a3',
	    '0x748f82ee5defb2fc', '0x78a5636f43172f60', '0x84c87814a1f0ab72', '0x8cc702081a6439ec',
	    '0x90befffa23631e28', '0xa4506cebde82bde9', '0xbef9a3f7b2c67915', '0xc67178f2e372532b',
	    '0xca273eceea26619c', '0xd186b8c721c0c207', '0xeada7dd6cde0eb1e', '0xf57d4f7fee6ed178',
	    '0x06f067aa72176fba', '0x0a637dc5a2c898a6', '0x113f9804bef90dae', '0x1b710b35131c471b',
	    '0x28db77f523047d84', '0x32caab7b40c72493', '0x3c9ebe0a15c9bebc', '0x431d67c49c100d4c',
	    '0x4cc5d4becb3e42b6', '0x597f299cfc657e2a', '0x5fcb6fab3ad6faec', '0x6c44198c4a475817'
	].map(n => BigInt(n)));
	// Temporary buffer, not used to store anything between runs
	const SHA512_W_H = new Uint32Array(80);
	const SHA512_W_L = new Uint32Array(80);
	class SHA512 extends SHA2 {
	    constructor() {
	        super(128, 64, 16, false);
	        // We cannot use array here since array allows indexing by variable which means optimizer/compiler cannot use registers.
	        // Also looks cleaner and easier to verify with spec.
	        // Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
	        // h -- high 32 bits, l -- low 32 bits
	        this.Ah = 0x6a09e667 | 0;
	        this.Al = 0xf3bcc908 | 0;
	        this.Bh = 0xbb67ae85 | 0;
	        this.Bl = 0x84caa73b | 0;
	        this.Ch = 0x3c6ef372 | 0;
	        this.Cl = 0xfe94f82b | 0;
	        this.Dh = 0xa54ff53a | 0;
	        this.Dl = 0x5f1d36f1 | 0;
	        this.Eh = 0x510e527f | 0;
	        this.El = 0xade682d1 | 0;
	        this.Fh = 0x9b05688c | 0;
	        this.Fl = 0x2b3e6c1f | 0;
	        this.Gh = 0x1f83d9ab | 0;
	        this.Gl = 0xfb41bd6b | 0;
	        this.Hh = 0x5be0cd19 | 0;
	        this.Hl = 0x137e2179 | 0;
	    }
	    // prettier-ignore
	    get() {
	        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
	        return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
	    }
	    // prettier-ignore
	    set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
	        this.Ah = Ah | 0;
	        this.Al = Al | 0;
	        this.Bh = Bh | 0;
	        this.Bl = Bl | 0;
	        this.Ch = Ch | 0;
	        this.Cl = Cl | 0;
	        this.Dh = Dh | 0;
	        this.Dl = Dl | 0;
	        this.Eh = Eh | 0;
	        this.El = El | 0;
	        this.Fh = Fh | 0;
	        this.Fl = Fl | 0;
	        this.Gh = Gh | 0;
	        this.Gl = Gl | 0;
	        this.Hh = Hh | 0;
	        this.Hl = Hl | 0;
	    }
	    process(view, offset) {
	        // Extend the first 16 words into the remaining 64 words w[16..79] of the message schedule array
	        for (let i = 0; i < 16; i++, offset += 4) {
	            SHA512_W_H[i] = view.getUint32(offset);
	            SHA512_W_L[i] = view.getUint32((offset += 4));
	        }
	        for (let i = 16; i < 80; i++) {
	            // s0 := (w[i-15] rightrotate 1) xor (w[i-15] rightrotate 8) xor (w[i-15] rightshift 7)
	            const W15h = SHA512_W_H[i - 15] | 0;
	            const W15l = SHA512_W_L[i - 15] | 0;
	            const s0h = u64$2.rotrSH(W15h, W15l, 1) ^ u64$2.rotrSH(W15h, W15l, 8) ^ u64$2.shrSH(W15h, W15l, 7);
	            const s0l = u64$2.rotrSL(W15h, W15l, 1) ^ u64$2.rotrSL(W15h, W15l, 8) ^ u64$2.shrSL(W15h, W15l, 7);
	            // s1 := (w[i-2] rightrotate 19) xor (w[i-2] rightrotate 61) xor (w[i-2] rightshift 6)
	            const W2h = SHA512_W_H[i - 2] | 0;
	            const W2l = SHA512_W_L[i - 2] | 0;
	            const s1h = u64$2.rotrSH(W2h, W2l, 19) ^ u64$2.rotrBH(W2h, W2l, 61) ^ u64$2.shrSH(W2h, W2l, 6);
	            const s1l = u64$2.rotrSL(W2h, W2l, 19) ^ u64$2.rotrBL(W2h, W2l, 61) ^ u64$2.shrSL(W2h, W2l, 6);
	            // SHA256_W[i] = s0 + s1 + SHA256_W[i - 7] + SHA256_W[i - 16];
	            const SUMl = u64$2.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
	            const SUMh = u64$2.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
	            SHA512_W_H[i] = SUMh | 0;
	            SHA512_W_L[i] = SUMl | 0;
	        }
	        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
	        // Compression function main loop, 80 rounds
	        for (let i = 0; i < 80; i++) {
	            // S1 := (e rightrotate 14) xor (e rightrotate 18) xor (e rightrotate 41)
	            const sigma1h = u64$2.rotrSH(Eh, El, 14) ^ u64$2.rotrSH(Eh, El, 18) ^ u64$2.rotrBH(Eh, El, 41);
	            const sigma1l = u64$2.rotrSL(Eh, El, 14) ^ u64$2.rotrSL(Eh, El, 18) ^ u64$2.rotrBL(Eh, El, 41);
	            //const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
	            const CHIh = (Eh & Fh) ^ (~Eh & Gh);
	            const CHIl = (El & Fl) ^ (~El & Gl);
	            // T1 = H + sigma1 + Chi(E, F, G) + SHA512_K[i] + SHA512_W[i]
	            // prettier-ignore
	            const T1ll = u64$2.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
	            const T1h = u64$2.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
	            const T1l = T1ll | 0;
	            // S0 := (a rightrotate 28) xor (a rightrotate 34) xor (a rightrotate 39)
	            const sigma0h = u64$2.rotrSH(Ah, Al, 28) ^ u64$2.rotrBH(Ah, Al, 34) ^ u64$2.rotrBH(Ah, Al, 39);
	            const sigma0l = u64$2.rotrSL(Ah, Al, 28) ^ u64$2.rotrBL(Ah, Al, 34) ^ u64$2.rotrBL(Ah, Al, 39);
	            const MAJh = (Ah & Bh) ^ (Ah & Ch) ^ (Bh & Ch);
	            const MAJl = (Al & Bl) ^ (Al & Cl) ^ (Bl & Cl);
	            Hh = Gh | 0;
	            Hl = Gl | 0;
	            Gh = Fh | 0;
	            Gl = Fl | 0;
	            Fh = Eh | 0;
	            Fl = El | 0;
	            ({ h: Eh, l: El } = u64$2.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
	            Dh = Ch | 0;
	            Dl = Cl | 0;
	            Ch = Bh | 0;
	            Cl = Bl | 0;
	            Bh = Ah | 0;
	            Bl = Al | 0;
	            const All = u64$2.add3L(T1l, sigma0l, MAJl);
	            Ah = u64$2.add3H(All, T1h, sigma0h, MAJh);
	            Al = All | 0;
	        }
	        // Add the compressed chunk to the current hash value
	        ({ h: Ah, l: Al } = u64$2.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
	        ({ h: Bh, l: Bl } = u64$2.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
	        ({ h: Ch, l: Cl } = u64$2.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
	        ({ h: Dh, l: Dl } = u64$2.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
	        ({ h: Eh, l: El } = u64$2.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
	        ({ h: Fh, l: Fl } = u64$2.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
	        ({ h: Gh, l: Gl } = u64$2.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
	        ({ h: Hh, l: Hl } = u64$2.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
	        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
	    }
	    roundClean() {
	        SHA512_W_H.fill(0);
	        SHA512_W_L.fill(0);
	    }
	    destroy() {
	        this.buffer.fill(0);
	        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	    }
	}
	class SHA512_256 extends SHA512 {
	    constructor() {
	        super();
	        // h -- high 32 bits, l -- low 32 bits
	        this.Ah = 0x22312194 | 0;
	        this.Al = 0xfc2bf72c | 0;
	        this.Bh = 0x9f555fa3 | 0;
	        this.Bl = 0xc84c64c2 | 0;
	        this.Ch = 0x2393b86b | 0;
	        this.Cl = 0x6f53b151 | 0;
	        this.Dh = 0x96387719 | 0;
	        this.Dl = 0x5940eabd | 0;
	        this.Eh = 0x96283ee2 | 0;
	        this.El = 0xa88effe3 | 0;
	        this.Fh = 0xbe5e1e25 | 0;
	        this.Fl = 0x53863992 | 0;
	        this.Gh = 0x2b0199fc | 0;
	        this.Gl = 0x2c85b8aa | 0;
	        this.Hh = 0x0eb72ddc | 0;
	        this.Hl = 0x81c52ca2 | 0;
	        this.outputLen = 32;
	    }
	}
	class SHA384 extends SHA512 {
	    constructor() {
	        super();
	        // h -- high 32 bits, l -- low 32 bits
	        this.Ah = 0xcbbb9d5d | 0;
	        this.Al = 0xc1059ed8 | 0;
	        this.Bh = 0x629a292a | 0;
	        this.Bl = 0x367cd507 | 0;
	        this.Ch = 0x9159015a | 0;
	        this.Cl = 0x3070dd17 | 0;
	        this.Dh = 0x152fecd8 | 0;
	        this.Dl = 0xf70e5939 | 0;
	        this.Eh = 0x67332667 | 0;
	        this.El = 0xffc00b31 | 0;
	        this.Fh = 0x8eb44a87 | 0;
	        this.Fl = 0x68581511 | 0;
	        this.Gh = 0xdb0c2e0d | 0;
	        this.Gl = 0x64f98fa7 | 0;
	        this.Hh = 0x47b5481d | 0;
	        this.Hl = 0xbefa4fa4 | 0;
	        this.outputLen = 48;
	    }
	}
	const sha512 = wrapConstructor(() => new SHA512());
	wrapConstructor(() => new SHA512_256());
	wrapConstructor(() => new SHA384());

	var _nodeResolve_empty = {};

	var nodeCrypto = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': _nodeResolve_empty
	});

	/*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
	const _0n$2 = BigInt(0);
	const _1n$2 = BigInt(1);
	const _2n$2 = BigInt(2);
	const _255n = BigInt(255);
	const CURVE_ORDER = _2n$2 ** BigInt(252) + BigInt('27742317777372353535851937790883648493');
	const CURVE$1 = Object.freeze({
	    a: BigInt(-1),
	    d: BigInt('37095705934669439343138083508754565189542113879843219016388785533085940283555'),
	    P: _2n$2 ** _255n - BigInt(19),
	    l: CURVE_ORDER,
	    n: CURVE_ORDER,
	    h: BigInt(8),
	    Gx: BigInt('15112221349535400772501151409588531511454012693041857206046113283949847762202'),
	    Gy: BigInt('46316835694926478169428394003475163141307993866256225615783033603165251855960'),
	});
	const MAX_256B = _2n$2 ** BigInt(256);
	const SQRT_M1 = BigInt('19681161376707505956807079304988542015446066515923890162744021073123829784752');
	BigInt('6853475219497561581579357271197624642482790079785650197046958215289687604742');
	BigInt('25063068953384623474111414158702152701244531502492656460079210482610430750235');
	BigInt('54469307008909316920995813868745141605393597292927456921205312896311721017578');
	BigInt('1159843021668779879193775521855586647937357759715417654439879720876111806838');
	BigInt('40440834346308536858101042469323190826248399146238708352240133220865137265952');
	class ExtendedPoint {
	    constructor(x, y, z, t) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	        this.t = t;
	    }
	    static fromAffine(p) {
	        if (!(p instanceof Point$1)) {
	            throw new TypeError('ExtendedPoint#fromAffine: expected Point');
	        }
	        if (p.equals(Point$1.ZERO))
	            return ExtendedPoint.ZERO;
	        return new ExtendedPoint(p.x, p.y, _1n$2, mod$1(p.x * p.y));
	    }
	    static toAffineBatch(points) {
	        const toInv = invertBatch$1(points.map((p) => p.z));
	        return points.map((p, i) => p.toAffine(toInv[i]));
	    }
	    static normalizeZ(points) {
	        return this.toAffineBatch(points).map(this.fromAffine);
	    }
	    equals(other) {
	        assertExtPoint(other);
	        const { x: X1, y: Y1, z: Z1 } = this;
	        const { x: X2, y: Y2, z: Z2 } = other;
	        const X1Z2 = mod$1(X1 * Z2);
	        const X2Z1 = mod$1(X2 * Z1);
	        const Y1Z2 = mod$1(Y1 * Z2);
	        const Y2Z1 = mod$1(Y2 * Z1);
	        return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
	    }
	    negate() {
	        return new ExtendedPoint(mod$1(-this.x), this.y, this.z, mod$1(-this.t));
	    }
	    double() {
	        const { x: X1, y: Y1, z: Z1 } = this;
	        const { a } = CURVE$1;
	        const A = mod$1(X1 ** _2n$2);
	        const B = mod$1(Y1 ** _2n$2);
	        const C = mod$1(_2n$2 * mod$1(Z1 ** _2n$2));
	        const D = mod$1(a * A);
	        const E = mod$1(mod$1((X1 + Y1) ** _2n$2) - A - B);
	        const G = D + B;
	        const F = G - C;
	        const H = D - B;
	        const X3 = mod$1(E * F);
	        const Y3 = mod$1(G * H);
	        const T3 = mod$1(E * H);
	        const Z3 = mod$1(F * G);
	        return new ExtendedPoint(X3, Y3, Z3, T3);
	    }
	    add(other) {
	        assertExtPoint(other);
	        const { x: X1, y: Y1, z: Z1, t: T1 } = this;
	        const { x: X2, y: Y2, z: Z2, t: T2 } = other;
	        const A = mod$1((Y1 - X1) * (Y2 + X2));
	        const B = mod$1((Y1 + X1) * (Y2 - X2));
	        const F = mod$1(B - A);
	        if (F === _0n$2)
	            return this.double();
	        const C = mod$1(Z1 * _2n$2 * T2);
	        const D = mod$1(T1 * _2n$2 * Z2);
	        const E = D + C;
	        const G = B + A;
	        const H = D - C;
	        const X3 = mod$1(E * F);
	        const Y3 = mod$1(G * H);
	        const T3 = mod$1(E * H);
	        const Z3 = mod$1(F * G);
	        return new ExtendedPoint(X3, Y3, Z3, T3);
	    }
	    subtract(other) {
	        return this.add(other.negate());
	    }
	    precomputeWindow(W) {
	        const windows = 1 + 256 / W;
	        const points = [];
	        let p = this;
	        let base = p;
	        for (let window = 0; window < windows; window++) {
	            base = p;
	            points.push(base);
	            for (let i = 1; i < 2 ** (W - 1); i++) {
	                base = base.add(p);
	                points.push(base);
	            }
	            p = base.double();
	        }
	        return points;
	    }
	    wNAF(n, affinePoint) {
	        if (!affinePoint && this.equals(ExtendedPoint.BASE))
	            affinePoint = Point$1.BASE;
	        const W = (affinePoint && affinePoint._WINDOW_SIZE) || 1;
	        if (256 % W) {
	            throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
	        }
	        let precomputes = affinePoint && pointPrecomputes$1.get(affinePoint);
	        if (!precomputes) {
	            precomputes = this.precomputeWindow(W);
	            if (affinePoint && W !== 1) {
	                precomputes = ExtendedPoint.normalizeZ(precomputes);
	                pointPrecomputes$1.set(affinePoint, precomputes);
	            }
	        }
	        let p = ExtendedPoint.ZERO;
	        let f = ExtendedPoint.ZERO;
	        const windows = 1 + 256 / W;
	        const windowSize = 2 ** (W - 1);
	        const mask = BigInt(2 ** W - 1);
	        const maxNumber = 2 ** W;
	        const shiftBy = BigInt(W);
	        for (let window = 0; window < windows; window++) {
	            const offset = window * windowSize;
	            let wbits = Number(n & mask);
	            n >>= shiftBy;
	            if (wbits > windowSize) {
	                wbits -= maxNumber;
	                n += _1n$2;
	            }
	            if (wbits === 0) {
	                let pr = precomputes[offset];
	                if (window % 2)
	                    pr = pr.negate();
	                f = f.add(pr);
	            }
	            else {
	                let cached = precomputes[offset + Math.abs(wbits) - 1];
	                if (wbits < 0)
	                    cached = cached.negate();
	                p = p.add(cached);
	            }
	        }
	        return ExtendedPoint.normalizeZ([p, f])[0];
	    }
	    multiply(scalar, affinePoint) {
	        return this.wNAF(normalizeScalar$1(scalar, CURVE$1.l), affinePoint);
	    }
	    multiplyUnsafe(scalar) {
	        let n = normalizeScalar$1(scalar, CURVE$1.l, false);
	        const G = ExtendedPoint.BASE;
	        const P0 = ExtendedPoint.ZERO;
	        if (n === _0n$2)
	            return P0;
	        if (this.equals(P0) || n === _1n$2)
	            return this;
	        if (this.equals(G))
	            return this.wNAF(n);
	        let p = P0;
	        let d = this;
	        while (n > _0n$2) {
	            if (n & _1n$2)
	                p = p.add(d);
	            d = d.double();
	            n >>= _1n$2;
	        }
	        return p;
	    }
	    isSmallOrder() {
	        return this.multiplyUnsafe(CURVE$1.h).equals(ExtendedPoint.ZERO);
	    }
	    isTorsionFree() {
	        return this.multiplyUnsafe(CURVE$1.l).equals(ExtendedPoint.ZERO);
	    }
	    toAffine(invZ = invert$1(this.z)) {
	        const { x, y, z } = this;
	        const ax = mod$1(x * invZ);
	        const ay = mod$1(y * invZ);
	        const zz = mod$1(z * invZ);
	        if (zz !== _1n$2)
	            throw new Error('invZ was invalid');
	        return new Point$1(ax, ay);
	    }
	    fromRistrettoBytes() {
	        legacyRist();
	    }
	    toRistrettoBytes() {
	        legacyRist();
	    }
	    fromRistrettoHash() {
	        legacyRist();
	    }
	}
	ExtendedPoint.BASE = new ExtendedPoint(CURVE$1.Gx, CURVE$1.Gy, _1n$2, mod$1(CURVE$1.Gx * CURVE$1.Gy));
	ExtendedPoint.ZERO = new ExtendedPoint(_0n$2, _1n$2, _1n$2, _0n$2);
	function assertExtPoint(other) {
	    if (!(other instanceof ExtendedPoint))
	        throw new TypeError('ExtendedPoint expected');
	}
	function legacyRist() {
	    throw new Error('Legacy method: switch to RistrettoPoint');
	}
	const pointPrecomputes$1 = new WeakMap();
	class Point$1 {
	    constructor(x, y) {
	        this.x = x;
	        this.y = y;
	    }
	    _setWindowSize(windowSize) {
	        this._WINDOW_SIZE = windowSize;
	        pointPrecomputes$1.delete(this);
	    }
	    static fromHex(hex, strict = true) {
	        const { d, P } = CURVE$1;
	        hex = ensureBytes$1(hex, 32);
	        const normed = hex.slice();
	        normed[31] = hex[31] & ~0x80;
	        const y = bytesToNumberLE(normed);
	        if (strict && y >= P)
	            throw new Error('Expected 0 < hex < P');
	        if (!strict && y >= MAX_256B)
	            throw new Error('Expected 0 < hex < 2**256');
	        const y2 = mod$1(y * y);
	        const u = mod$1(y2 - _1n$2);
	        const v = mod$1(d * y2 + _1n$2);
	        let { isValid, value: x } = uvRatio(u, v);
	        if (!isValid)
	            throw new Error('Point.fromHex: invalid y coordinate');
	        const isXOdd = (x & _1n$2) === _1n$2;
	        const isLastByteOdd = (hex[31] & 0x80) !== 0;
	        if (isLastByteOdd !== isXOdd) {
	            x = mod$1(-x);
	        }
	        return new Point$1(x, y);
	    }
	    static async fromPrivateKey(privateKey) {
	        return (await getExtendedPublicKey(privateKey)).point;
	    }
	    toRawBytes() {
	        const bytes = numberTo32BytesLE(this.y);
	        bytes[31] |= this.x & _1n$2 ? 0x80 : 0;
	        return bytes;
	    }
	    toHex() {
	        return bytesToHex$1(this.toRawBytes());
	    }
	    toX25519() {
	        const { y } = this;
	        const u = mod$1((_1n$2 + y) * invert$1(_1n$2 - y));
	        return numberTo32BytesLE(u);
	    }
	    isTorsionFree() {
	        return ExtendedPoint.fromAffine(this).isTorsionFree();
	    }
	    equals(other) {
	        return this.x === other.x && this.y === other.y;
	    }
	    negate() {
	        return new Point$1(mod$1(-this.x), this.y);
	    }
	    add(other) {
	        return ExtendedPoint.fromAffine(this).add(ExtendedPoint.fromAffine(other)).toAffine();
	    }
	    subtract(other) {
	        return this.add(other.negate());
	    }
	    multiply(scalar) {
	        return ExtendedPoint.fromAffine(this).multiply(scalar, this).toAffine();
	    }
	}
	Point$1.BASE = new Point$1(CURVE$1.Gx, CURVE$1.Gy);
	Point$1.ZERO = new Point$1(_0n$2, _1n$2);
	class Signature$1 {
	    constructor(r, s) {
	        this.r = r;
	        this.s = s;
	        this.assertValidity();
	    }
	    static fromHex(hex) {
	        const bytes = ensureBytes$1(hex, 64);
	        const r = Point$1.fromHex(bytes.slice(0, 32), false);
	        const s = bytesToNumberLE(bytes.slice(32, 64));
	        return new Signature$1(r, s);
	    }
	    assertValidity() {
	        const { r, s } = this;
	        if (!(r instanceof Point$1))
	            throw new Error('Expected Point instance');
	        normalizeScalar$1(s, CURVE$1.l, false);
	        return this;
	    }
	    toRawBytes() {
	        const u8 = new Uint8Array(64);
	        u8.set(this.r.toRawBytes());
	        u8.set(numberTo32BytesLE(this.s), 32);
	        return u8;
	    }
	    toHex() {
	        return bytesToHex$1(this.toRawBytes());
	    }
	}
	function concatBytes$1(...arrays) {
	    if (!arrays.every((a) => a instanceof Uint8Array))
	        throw new Error('Expected Uint8Array list');
	    if (arrays.length === 1)
	        return arrays[0];
	    const length = arrays.reduce((a, arr) => a + arr.length, 0);
	    const result = new Uint8Array(length);
	    for (let i = 0, pad = 0; i < arrays.length; i++) {
	        const arr = arrays[i];
	        result.set(arr, pad);
	        pad += arr.length;
	    }
	    return result;
	}
	const hexes$1 = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
	function bytesToHex$1(uint8a) {
	    if (!(uint8a instanceof Uint8Array))
	        throw new Error('Uint8Array expected');
	    let hex = '';
	    for (let i = 0; i < uint8a.length; i++) {
	        hex += hexes$1[uint8a[i]];
	    }
	    return hex;
	}
	function hexToBytes$1(hex) {
	    if (typeof hex !== 'string') {
	        throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
	    }
	    if (hex.length % 2)
	        throw new Error('hexToBytes: received invalid unpadded hex');
	    const array = new Uint8Array(hex.length / 2);
	    for (let i = 0; i < array.length; i++) {
	        const j = i * 2;
	        const hexByte = hex.slice(j, j + 2);
	        const byte = Number.parseInt(hexByte, 16);
	        if (Number.isNaN(byte) || byte < 0)
	            throw new Error('Invalid byte sequence');
	        array[i] = byte;
	    }
	    return array;
	}
	function numberTo32BytesBE(num) {
	    const length = 32;
	    const hex = num.toString(16).padStart(length * 2, '0');
	    return hexToBytes$1(hex);
	}
	function numberTo32BytesLE(num) {
	    return numberTo32BytesBE(num).reverse();
	}
	function edIsNegative(num) {
	    return (mod$1(num) & _1n$2) === _1n$2;
	}
	function bytesToNumberLE(uint8a) {
	    if (!(uint8a instanceof Uint8Array))
	        throw new Error('Expected Uint8Array');
	    return BigInt('0x' + bytesToHex$1(Uint8Array.from(uint8a).reverse()));
	}
	function mod$1(a, b = CURVE$1.P) {
	    const res = a % b;
	    return res >= _0n$2 ? res : b + res;
	}
	function invert$1(number, modulo = CURVE$1.P) {
	    if (number === _0n$2 || modulo <= _0n$2) {
	        throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
	    }
	    let a = mod$1(number, modulo);
	    let b = modulo;
	    let x = _0n$2, u = _1n$2;
	    while (a !== _0n$2) {
	        const q = b / a;
	        const r = b % a;
	        const m = x - u * q;
	        b = a, a = r, x = u, u = m;
	    }
	    const gcd = b;
	    if (gcd !== _1n$2)
	        throw new Error('invert: does not exist');
	    return mod$1(x, modulo);
	}
	function invertBatch$1(nums, p = CURVE$1.P) {
	    const tmp = new Array(nums.length);
	    const lastMultiplied = nums.reduce((acc, num, i) => {
	        if (num === _0n$2)
	            return acc;
	        tmp[i] = acc;
	        return mod$1(acc * num, p);
	    }, _1n$2);
	    const inverted = invert$1(lastMultiplied, p);
	    nums.reduceRight((acc, num, i) => {
	        if (num === _0n$2)
	            return acc;
	        tmp[i] = mod$1(acc * tmp[i], p);
	        return mod$1(acc * num, p);
	    }, inverted);
	    return tmp;
	}
	function pow2$1(x, power) {
	    const { P } = CURVE$1;
	    let res = x;
	    while (power-- > _0n$2) {
	        res *= res;
	        res %= P;
	    }
	    return res;
	}
	function pow_2_252_3(x) {
	    const { P } = CURVE$1;
	    const _5n = BigInt(5);
	    const _10n = BigInt(10);
	    const _20n = BigInt(20);
	    const _40n = BigInt(40);
	    const _80n = BigInt(80);
	    const x2 = (x * x) % P;
	    const b2 = (x2 * x) % P;
	    const b4 = (pow2$1(b2, _2n$2) * b2) % P;
	    const b5 = (pow2$1(b4, _1n$2) * x) % P;
	    const b10 = (pow2$1(b5, _5n) * b5) % P;
	    const b20 = (pow2$1(b10, _10n) * b10) % P;
	    const b40 = (pow2$1(b20, _20n) * b20) % P;
	    const b80 = (pow2$1(b40, _40n) * b40) % P;
	    const b160 = (pow2$1(b80, _80n) * b80) % P;
	    const b240 = (pow2$1(b160, _80n) * b80) % P;
	    const b250 = (pow2$1(b240, _10n) * b10) % P;
	    const pow_p_5_8 = (pow2$1(b250, _2n$2) * x) % P;
	    return { pow_p_5_8, b2 };
	}
	function uvRatio(u, v) {
	    const v3 = mod$1(v * v * v);
	    const v7 = mod$1(v3 * v3 * v);
	    const pow = pow_2_252_3(u * v7).pow_p_5_8;
	    let x = mod$1(u * v3 * pow);
	    const vx2 = mod$1(v * x * x);
	    const root1 = x;
	    const root2 = mod$1(x * SQRT_M1);
	    const useRoot1 = vx2 === u;
	    const useRoot2 = vx2 === mod$1(-u);
	    const noRoot = vx2 === mod$1(-u * SQRT_M1);
	    if (useRoot1)
	        x = root1;
	    if (useRoot2 || noRoot)
	        x = root2;
	    if (edIsNegative(x))
	        x = mod$1(-x);
	    return { isValid: useRoot1 || useRoot2, value: x };
	}
	function modlLE(hash) {
	    return mod$1(bytesToNumberLE(hash), CURVE$1.l);
	}
	function ensureBytes$1(hex, expectedLength) {
	    const bytes = hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes$1(hex);
	    if (typeof expectedLength === 'number' && bytes.length !== expectedLength)
	        throw new Error(`Expected ${expectedLength} bytes`);
	    return bytes;
	}
	function normalizeScalar$1(num, max, strict = true) {
	    if (!max)
	        throw new TypeError('Specify max value');
	    if (typeof num === 'number' && Number.isSafeInteger(num))
	        num = BigInt(num);
	    if (typeof num === 'bigint' && num < max) {
	        if (strict) {
	            if (_0n$2 < num)
	                return num;
	        }
	        else {
	            if (_0n$2 <= num)
	                return num;
	        }
	    }
	    throw new TypeError('Expected valid scalar: 0 < scalar < max');
	}
	function adjustBytes25519(bytes) {
	    bytes[0] &= 248;
	    bytes[31] &= 127;
	    bytes[31] |= 64;
	    return bytes;
	}
	function checkPrivateKey(key) {
	    key =
	        typeof key === 'bigint' || typeof key === 'number'
	            ? numberTo32BytesBE(normalizeScalar$1(key, MAX_256B))
	            : ensureBytes$1(key);
	    if (key.length !== 32)
	        throw new Error(`Expected 32 bytes`);
	    return key;
	}
	function getKeyFromHash(hashed) {
	    const head = adjustBytes25519(hashed.slice(0, 32));
	    const prefix = hashed.slice(32, 64);
	    const scalar = modlLE(head);
	    const point = Point$1.BASE.multiply(scalar);
	    const pointBytes = point.toRawBytes();
	    return { head, prefix, scalar, point, pointBytes };
	}
	let _sha512Sync;
	function sha512s(...m) {
	    if (typeof _sha512Sync !== 'function')
	        throw new Error('utils.sha512Sync must be set to use sync methods');
	    return _sha512Sync(...m);
	}
	async function getExtendedPublicKey(key) {
	    return getKeyFromHash(await utils$1.sha512(checkPrivateKey(key)));
	}
	function getExtendedPublicKeySync(key) {
	    return getKeyFromHash(sha512s(checkPrivateKey(key)));
	}
	function getPublicKeySync(privateKey) {
	    return getExtendedPublicKeySync(privateKey).pointBytes;
	}
	function signSync$1(message, privateKey) {
	    message = ensureBytes$1(message);
	    const { prefix, scalar, pointBytes } = getExtendedPublicKeySync(privateKey);
	    const r = modlLE(sha512s(prefix, message));
	    const R = Point$1.BASE.multiply(r);
	    const k = modlLE(sha512s(R.toRawBytes(), pointBytes, message));
	    const s = mod$1(r + k * scalar, CURVE$1.l);
	    return new Signature$1(R, s).toRawBytes();
	}
	function prepareVerification(sig, message, publicKey) {
	    message = ensureBytes$1(message);
	    if (!(publicKey instanceof Point$1))
	        publicKey = Point$1.fromHex(publicKey, false);
	    const { r, s } = sig instanceof Signature$1 ? sig.assertValidity() : Signature$1.fromHex(sig);
	    const SB = ExtendedPoint.BASE.multiplyUnsafe(s);
	    return { r, s, SB, pub: publicKey, msg: message };
	}
	function finishVerification(publicKey, r, SB, hashed) {
	    const k = modlLE(hashed);
	    const kA = ExtendedPoint.fromAffine(publicKey).multiplyUnsafe(k);
	    const RkA = ExtendedPoint.fromAffine(r).add(kA);
	    return RkA.subtract(SB).multiplyUnsafe(CURVE$1.h).equals(ExtendedPoint.ZERO);
	}
	function verifySync(sig, message, publicKey) {
	    const { r, SB, msg, pub } = prepareVerification(sig, message, publicKey);
	    const hashed = sha512s(r.toRawBytes(), pub.toRawBytes(), msg);
	    return finishVerification(pub, r, SB, hashed);
	}
	const sync = {
	    getExtendedPublicKey: getExtendedPublicKeySync,
	    getPublicKey: getPublicKeySync,
	    sign: signSync$1,
	    verify: verifySync,
	};
	Point$1.BASE._setWindowSize(8);
	const crypto$2 = {
	    node: nodeCrypto,
	    web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined,
	};
	const utils$1 = {
	    TORSION_SUBGROUP: [
	        '0100000000000000000000000000000000000000000000000000000000000000',
	        'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a',
	        '0000000000000000000000000000000000000000000000000000000000000080',
	        '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05',
	        'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f',
	        '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85',
	        '0000000000000000000000000000000000000000000000000000000000000000',
	        'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa',
	    ],
	    bytesToHex: bytesToHex$1,
	    hexToBytes: hexToBytes$1,
	    concatBytes: concatBytes$1,
	    getExtendedPublicKey,
	    mod: mod$1,
	    invert: invert$1,
	    hashToPrivateScalar: (hash) => {
	        hash = ensureBytes$1(hash);
	        if (hash.length < 40 || hash.length > 1024)
	            throw new Error('Expected 40-1024 bytes of private key as per FIPS 186');
	        return mod$1(bytesToNumberLE(hash), CURVE$1.l - _1n$2) + _1n$2;
	    },
	    randomBytes: (bytesLength = 32) => {
	        if (crypto$2.web) {
	            return crypto$2.web.getRandomValues(new Uint8Array(bytesLength));
	        }
	        else if (crypto$2.node) {
	            const { randomBytes } = crypto$2.node;
	            return new Uint8Array(randomBytes(bytesLength).buffer);
	        }
	        else {
	            throw new Error("The environment doesn't have randomBytes function");
	        }
	    },
	    randomPrivateKey: () => {
	        return utils$1.randomBytes(32);
	    },
	    sha512: async (...messages) => {
	        const message = concatBytes$1(...messages);
	        if (crypto$2.web) {
	            const buffer = await crypto$2.web.subtle.digest('SHA-512', message.buffer);
	            return new Uint8Array(buffer);
	        }
	        else if (crypto$2.node) {
	            return Uint8Array.from(crypto$2.node.createHash('sha512').update(message).digest());
	        }
	        else {
	            throw new Error("The environment doesn't have sha512 function");
	        }
	    },
	    precompute(windowSize = 8, point = Point$1.BASE) {
	        const cached = point.equals(Point$1.BASE) ? point : new Point$1(point.x, point.y);
	        cached._setWindowSize(windowSize);
	        cached.multiply(_2n$2);
	        return cached;
	    },
	    sha512Sync: undefined,
	};
	Object.defineProperties(utils$1, {
	    sha512Sync: {
	        configurable: false,
	        get() {
	            return _sha512Sync;
	        },
	        set(val) {
	            if (!_sha512Sync)
	                _sha512Sync = val;
	        },
	    },
	});

	/**
	 * A 64 byte secret key, the first 32 bytes of which is the
	 * private scalar and the last 32 bytes is the public key.
	 * Read more: https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/
	 */

	utils$1.sha512Sync = (...m) => sha512(utils$1.concatBytes(...m));

	const generatePrivateKey = utils$1.randomPrivateKey;
	const generateKeypair = () => {
	  const privateScalar = utils$1.randomPrivateKey();
	  const publicKey = getPublicKey$1(privateScalar);
	  const secretKey = new Uint8Array(64);
	  secretKey.set(privateScalar);
	  secretKey.set(publicKey, 32);
	  return {
	    publicKey,
	    secretKey
	  };
	};
	const getPublicKey$1 = sync.getPublicKey;
	function isOnCurve(publicKey) {
	  try {
	    Point$1.fromHex(publicKey, true
	    /* strict */
	    );
	    return true;
	  } catch {
	    return false;
	  }
	}
	const sign = (message, secretKey) => sync.sign(message, secretKey.slice(0, 32));
	const verify = sync.verify;

	const toBuffer = arr => {
	  if (buffer.Buffer.isBuffer(arr)) {
	    return arr;
	  } else if (arr instanceof Uint8Array) {
	    return buffer.Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
	  } else {
	    return buffer.Buffer.from(arr);
	  }
	};

	var bn = {exports: {}};

	var require$$0$1 = /*@__PURE__*/getAugmentedNamespace(nodeCrypto);

	(function (module) {
		(function (module, exports) {

		  // Utils
		  function assert (val, msg) {
		    if (!val) throw new Error(msg || 'Assertion failed');
		  }

		  // Could use `inherits` module, but don't want to move from single file
		  // architecture yet.
		  function inherits (ctor, superCtor) {
		    ctor.super_ = superCtor;
		    var TempCtor = function () {};
		    TempCtor.prototype = superCtor.prototype;
		    ctor.prototype = new TempCtor();
		    ctor.prototype.constructor = ctor;
		  }

		  // BN

		  function BN (number, base, endian) {
		    if (BN.isBN(number)) {
		      return number;
		    }

		    this.negative = 0;
		    this.words = null;
		    this.length = 0;

		    // Reduction context
		    this.red = null;

		    if (number !== null) {
		      if (base === 'le' || base === 'be') {
		        endian = base;
		        base = 10;
		      }

		      this._init(number || 0, base || 10, endian || 'be');
		    }
		  }
		  if (typeof module === 'object') {
		    module.exports = BN;
		  } else {
		    exports.BN = BN;
		  }

		  BN.BN = BN;
		  BN.wordSize = 26;

		  var Buffer;
		  try {
		    if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
		      Buffer = window.Buffer;
		    } else {
		      Buffer = require$$0$1.Buffer;
		    }
		  } catch (e) {
		  }

		  BN.isBN = function isBN (num) {
		    if (num instanceof BN) {
		      return true;
		    }

		    return num !== null && typeof num === 'object' &&
		      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
		  };

		  BN.max = function max (left, right) {
		    if (left.cmp(right) > 0) return left;
		    return right;
		  };

		  BN.min = function min (left, right) {
		    if (left.cmp(right) < 0) return left;
		    return right;
		  };

		  BN.prototype._init = function init (number, base, endian) {
		    if (typeof number === 'number') {
		      return this._initNumber(number, base, endian);
		    }

		    if (typeof number === 'object') {
		      return this._initArray(number, base, endian);
		    }

		    if (base === 'hex') {
		      base = 16;
		    }
		    assert(base === (base | 0) && base >= 2 && base <= 36);

		    number = number.toString().replace(/\s+/g, '');
		    var start = 0;
		    if (number[0] === '-') {
		      start++;
		      this.negative = 1;
		    }

		    if (start < number.length) {
		      if (base === 16) {
		        this._parseHex(number, start, endian);
		      } else {
		        this._parseBase(number, base, start);
		        if (endian === 'le') {
		          this._initArray(this.toArray(), base, endian);
		        }
		      }
		    }
		  };

		  BN.prototype._initNumber = function _initNumber (number, base, endian) {
		    if (number < 0) {
		      this.negative = 1;
		      number = -number;
		    }
		    if (number < 0x4000000) {
		      this.words = [number & 0x3ffffff];
		      this.length = 1;
		    } else if (number < 0x10000000000000) {
		      this.words = [
		        number & 0x3ffffff,
		        (number / 0x4000000) & 0x3ffffff
		      ];
		      this.length = 2;
		    } else {
		      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
		      this.words = [
		        number & 0x3ffffff,
		        (number / 0x4000000) & 0x3ffffff,
		        1
		      ];
		      this.length = 3;
		    }

		    if (endian !== 'le') return;

		    // Reverse the bytes
		    this._initArray(this.toArray(), base, endian);
		  };

		  BN.prototype._initArray = function _initArray (number, base, endian) {
		    // Perhaps a Uint8Array
		    assert(typeof number.length === 'number');
		    if (number.length <= 0) {
		      this.words = [0];
		      this.length = 1;
		      return this;
		    }

		    this.length = Math.ceil(number.length / 3);
		    this.words = new Array(this.length);
		    for (var i = 0; i < this.length; i++) {
		      this.words[i] = 0;
		    }

		    var j, w;
		    var off = 0;
		    if (endian === 'be') {
		      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
		        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
		        this.words[j] |= (w << off) & 0x3ffffff;
		        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
		        off += 24;
		        if (off >= 26) {
		          off -= 26;
		          j++;
		        }
		      }
		    } else if (endian === 'le') {
		      for (i = 0, j = 0; i < number.length; i += 3) {
		        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
		        this.words[j] |= (w << off) & 0x3ffffff;
		        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
		        off += 24;
		        if (off >= 26) {
		          off -= 26;
		          j++;
		        }
		      }
		    }
		    return this._strip();
		  };

		  function parseHex4Bits (string, index) {
		    var c = string.charCodeAt(index);
		    // '0' - '9'
		    if (c >= 48 && c <= 57) {
		      return c - 48;
		    // 'A' - 'F'
		    } else if (c >= 65 && c <= 70) {
		      return c - 55;
		    // 'a' - 'f'
		    } else if (c >= 97 && c <= 102) {
		      return c - 87;
		    } else {
		      assert(false, 'Invalid character in ' + string);
		    }
		  }

		  function parseHexByte (string, lowerBound, index) {
		    var r = parseHex4Bits(string, index);
		    if (index - 1 >= lowerBound) {
		      r |= parseHex4Bits(string, index - 1) << 4;
		    }
		    return r;
		  }

		  BN.prototype._parseHex = function _parseHex (number, start, endian) {
		    // Create possibly bigger array to ensure that it fits the number
		    this.length = Math.ceil((number.length - start) / 6);
		    this.words = new Array(this.length);
		    for (var i = 0; i < this.length; i++) {
		      this.words[i] = 0;
		    }

		    // 24-bits chunks
		    var off = 0;
		    var j = 0;

		    var w;
		    if (endian === 'be') {
		      for (i = number.length - 1; i >= start; i -= 2) {
		        w = parseHexByte(number, start, i) << off;
		        this.words[j] |= w & 0x3ffffff;
		        if (off >= 18) {
		          off -= 18;
		          j += 1;
		          this.words[j] |= w >>> 26;
		        } else {
		          off += 8;
		        }
		      }
		    } else {
		      var parseLength = number.length - start;
		      for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
		        w = parseHexByte(number, start, i) << off;
		        this.words[j] |= w & 0x3ffffff;
		        if (off >= 18) {
		          off -= 18;
		          j += 1;
		          this.words[j] |= w >>> 26;
		        } else {
		          off += 8;
		        }
		      }
		    }

		    this._strip();
		  };

		  function parseBase (str, start, end, mul) {
		    var r = 0;
		    var b = 0;
		    var len = Math.min(str.length, end);
		    for (var i = start; i < len; i++) {
		      var c = str.charCodeAt(i) - 48;

		      r *= mul;

		      // 'a'
		      if (c >= 49) {
		        b = c - 49 + 0xa;

		      // 'A'
		      } else if (c >= 17) {
		        b = c - 17 + 0xa;

		      // '0' - '9'
		      } else {
		        b = c;
		      }
		      assert(c >= 0 && b < mul, 'Invalid character');
		      r += b;
		    }
		    return r;
		  }

		  BN.prototype._parseBase = function _parseBase (number, base, start) {
		    // Initialize as zero
		    this.words = [0];
		    this.length = 1;

		    // Find length of limb in base
		    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
		      limbLen++;
		    }
		    limbLen--;
		    limbPow = (limbPow / base) | 0;

		    var total = number.length - start;
		    var mod = total % limbLen;
		    var end = Math.min(total, total - mod) + start;

		    var word = 0;
		    for (var i = start; i < end; i += limbLen) {
		      word = parseBase(number, i, i + limbLen, base);

		      this.imuln(limbPow);
		      if (this.words[0] + word < 0x4000000) {
		        this.words[0] += word;
		      } else {
		        this._iaddn(word);
		      }
		    }

		    if (mod !== 0) {
		      var pow = 1;
		      word = parseBase(number, i, number.length, base);

		      for (i = 0; i < mod; i++) {
		        pow *= base;
		      }

		      this.imuln(pow);
		      if (this.words[0] + word < 0x4000000) {
		        this.words[0] += word;
		      } else {
		        this._iaddn(word);
		      }
		    }

		    this._strip();
		  };

		  BN.prototype.copy = function copy (dest) {
		    dest.words = new Array(this.length);
		    for (var i = 0; i < this.length; i++) {
		      dest.words[i] = this.words[i];
		    }
		    dest.length = this.length;
		    dest.negative = this.negative;
		    dest.red = this.red;
		  };

		  function move (dest, src) {
		    dest.words = src.words;
		    dest.length = src.length;
		    dest.negative = src.negative;
		    dest.red = src.red;
		  }

		  BN.prototype._move = function _move (dest) {
		    move(dest, this);
		  };

		  BN.prototype.clone = function clone () {
		    var r = new BN(null);
		    this.copy(r);
		    return r;
		  };

		  BN.prototype._expand = function _expand (size) {
		    while (this.length < size) {
		      this.words[this.length++] = 0;
		    }
		    return this;
		  };

		  // Remove leading `0` from `this`
		  BN.prototype._strip = function strip () {
		    while (this.length > 1 && this.words[this.length - 1] === 0) {
		      this.length--;
		    }
		    return this._normSign();
		  };

		  BN.prototype._normSign = function _normSign () {
		    // -0 = 0
		    if (this.length === 1 && this.words[0] === 0) {
		      this.negative = 0;
		    }
		    return this;
		  };

		  // Check Symbol.for because not everywhere where Symbol defined
		  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility
		  if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
		    try {
		      BN.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspect;
		    } catch (e) {
		      BN.prototype.inspect = inspect;
		    }
		  } else {
		    BN.prototype.inspect = inspect;
		  }

		  function inspect () {
		    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
		  }

		  /*

		  var zeros = [];
		  var groupSizes = [];
		  var groupBases = [];

		  var s = '';
		  var i = -1;
		  while (++i < BN.wordSize) {
		    zeros[i] = s;
		    s += '0';
		  }
		  groupSizes[0] = 0;
		  groupSizes[1] = 0;
		  groupBases[0] = 0;
		  groupBases[1] = 0;
		  var base = 2 - 1;
		  while (++base < 36 + 1) {
		    var groupSize = 0;
		    var groupBase = 1;
		    while (groupBase < (1 << BN.wordSize) / base) {
		      groupBase *= base;
		      groupSize += 1;
		    }
		    groupSizes[base] = groupSize;
		    groupBases[base] = groupBase;
		  }

		  */

		  var zeros = [
		    '',
		    '0',
		    '00',
		    '000',
		    '0000',
		    '00000',
		    '000000',
		    '0000000',
		    '00000000',
		    '000000000',
		    '0000000000',
		    '00000000000',
		    '000000000000',
		    '0000000000000',
		    '00000000000000',
		    '000000000000000',
		    '0000000000000000',
		    '00000000000000000',
		    '000000000000000000',
		    '0000000000000000000',
		    '00000000000000000000',
		    '000000000000000000000',
		    '0000000000000000000000',
		    '00000000000000000000000',
		    '000000000000000000000000',
		    '0000000000000000000000000'
		  ];

		  var groupSizes = [
		    0, 0,
		    25, 16, 12, 11, 10, 9, 8,
		    8, 7, 7, 7, 7, 6, 6,
		    6, 6, 6, 6, 6, 5, 5,
		    5, 5, 5, 5, 5, 5, 5,
		    5, 5, 5, 5, 5, 5, 5
		  ];

		  var groupBases = [
		    0, 0,
		    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
		    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
		    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
		    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
		    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
		  ];

		  BN.prototype.toString = function toString (base, padding) {
		    base = base || 10;
		    padding = padding | 0 || 1;

		    var out;
		    if (base === 16 || base === 'hex') {
		      out = '';
		      var off = 0;
		      var carry = 0;
		      for (var i = 0; i < this.length; i++) {
		        var w = this.words[i];
		        var word = (((w << off) | carry) & 0xffffff).toString(16);
		        carry = (w >>> (24 - off)) & 0xffffff;
		        if (carry !== 0 || i !== this.length - 1) {
		          out = zeros[6 - word.length] + word + out;
		        } else {
		          out = word + out;
		        }
		        off += 2;
		        if (off >= 26) {
		          off -= 26;
		          i--;
		        }
		      }
		      if (carry !== 0) {
		        out = carry.toString(16) + out;
		      }
		      while (out.length % padding !== 0) {
		        out = '0' + out;
		      }
		      if (this.negative !== 0) {
		        out = '-' + out;
		      }
		      return out;
		    }

		    if (base === (base | 0) && base >= 2 && base <= 36) {
		      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
		      var groupSize = groupSizes[base];
		      // var groupBase = Math.pow(base, groupSize);
		      var groupBase = groupBases[base];
		      out = '';
		      var c = this.clone();
		      c.negative = 0;
		      while (!c.isZero()) {
		        var r = c.modrn(groupBase).toString(base);
		        c = c.idivn(groupBase);

		        if (!c.isZero()) {
		          out = zeros[groupSize - r.length] + r + out;
		        } else {
		          out = r + out;
		        }
		      }
		      if (this.isZero()) {
		        out = '0' + out;
		      }
		      while (out.length % padding !== 0) {
		        out = '0' + out;
		      }
		      if (this.negative !== 0) {
		        out = '-' + out;
		      }
		      return out;
		    }

		    assert(false, 'Base should be between 2 and 36');
		  };

		  BN.prototype.toNumber = function toNumber () {
		    var ret = this.words[0];
		    if (this.length === 2) {
		      ret += this.words[1] * 0x4000000;
		    } else if (this.length === 3 && this.words[2] === 0x01) {
		      // NOTE: at this stage it is known that the top bit is set
		      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
		    } else if (this.length > 2) {
		      assert(false, 'Number can only safely store up to 53 bits');
		    }
		    return (this.negative !== 0) ? -ret : ret;
		  };

		  BN.prototype.toJSON = function toJSON () {
		    return this.toString(16, 2);
		  };

		  if (Buffer) {
		    BN.prototype.toBuffer = function toBuffer (endian, length) {
		      return this.toArrayLike(Buffer, endian, length);
		    };
		  }

		  BN.prototype.toArray = function toArray (endian, length) {
		    return this.toArrayLike(Array, endian, length);
		  };

		  var allocate = function allocate (ArrayType, size) {
		    if (ArrayType.allocUnsafe) {
		      return ArrayType.allocUnsafe(size);
		    }
		    return new ArrayType(size);
		  };

		  BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
		    this._strip();

		    var byteLength = this.byteLength();
		    var reqLength = length || Math.max(1, byteLength);
		    assert(byteLength <= reqLength, 'byte array longer than desired length');
		    assert(reqLength > 0, 'Requested array length <= 0');

		    var res = allocate(ArrayType, reqLength);
		    var postfix = endian === 'le' ? 'LE' : 'BE';
		    this['_toArrayLike' + postfix](res, byteLength);
		    return res;
		  };

		  BN.prototype._toArrayLikeLE = function _toArrayLikeLE (res, byteLength) {
		    var position = 0;
		    var carry = 0;

		    for (var i = 0, shift = 0; i < this.length; i++) {
		      var word = (this.words[i] << shift) | carry;

		      res[position++] = word & 0xff;
		      if (position < res.length) {
		        res[position++] = (word >> 8) & 0xff;
		      }
		      if (position < res.length) {
		        res[position++] = (word >> 16) & 0xff;
		      }

		      if (shift === 6) {
		        if (position < res.length) {
		          res[position++] = (word >> 24) & 0xff;
		        }
		        carry = 0;
		        shift = 0;
		      } else {
		        carry = word >>> 24;
		        shift += 2;
		      }
		    }

		    if (position < res.length) {
		      res[position++] = carry;

		      while (position < res.length) {
		        res[position++] = 0;
		      }
		    }
		  };

		  BN.prototype._toArrayLikeBE = function _toArrayLikeBE (res, byteLength) {
		    var position = res.length - 1;
		    var carry = 0;

		    for (var i = 0, shift = 0; i < this.length; i++) {
		      var word = (this.words[i] << shift) | carry;

		      res[position--] = word & 0xff;
		      if (position >= 0) {
		        res[position--] = (word >> 8) & 0xff;
		      }
		      if (position >= 0) {
		        res[position--] = (word >> 16) & 0xff;
		      }

		      if (shift === 6) {
		        if (position >= 0) {
		          res[position--] = (word >> 24) & 0xff;
		        }
		        carry = 0;
		        shift = 0;
		      } else {
		        carry = word >>> 24;
		        shift += 2;
		      }
		    }

		    if (position >= 0) {
		      res[position--] = carry;

		      while (position >= 0) {
		        res[position--] = 0;
		      }
		    }
		  };

		  if (Math.clz32) {
		    BN.prototype._countBits = function _countBits (w) {
		      return 32 - Math.clz32(w);
		    };
		  } else {
		    BN.prototype._countBits = function _countBits (w) {
		      var t = w;
		      var r = 0;
		      if (t >= 0x1000) {
		        r += 13;
		        t >>>= 13;
		      }
		      if (t >= 0x40) {
		        r += 7;
		        t >>>= 7;
		      }
		      if (t >= 0x8) {
		        r += 4;
		        t >>>= 4;
		      }
		      if (t >= 0x02) {
		        r += 2;
		        t >>>= 2;
		      }
		      return r + t;
		    };
		  }

		  BN.prototype._zeroBits = function _zeroBits (w) {
		    // Short-cut
		    if (w === 0) return 26;

		    var t = w;
		    var r = 0;
		    if ((t & 0x1fff) === 0) {
		      r += 13;
		      t >>>= 13;
		    }
		    if ((t & 0x7f) === 0) {
		      r += 7;
		      t >>>= 7;
		    }
		    if ((t & 0xf) === 0) {
		      r += 4;
		      t >>>= 4;
		    }
		    if ((t & 0x3) === 0) {
		      r += 2;
		      t >>>= 2;
		    }
		    if ((t & 0x1) === 0) {
		      r++;
		    }
		    return r;
		  };

		  // Return number of used bits in a BN
		  BN.prototype.bitLength = function bitLength () {
		    var w = this.words[this.length - 1];
		    var hi = this._countBits(w);
		    return (this.length - 1) * 26 + hi;
		  };

		  function toBitArray (num) {
		    var w = new Array(num.bitLength());

		    for (var bit = 0; bit < w.length; bit++) {
		      var off = (bit / 26) | 0;
		      var wbit = bit % 26;

		      w[bit] = (num.words[off] >>> wbit) & 0x01;
		    }

		    return w;
		  }

		  // Number of trailing zero bits
		  BN.prototype.zeroBits = function zeroBits () {
		    if (this.isZero()) return 0;

		    var r = 0;
		    for (var i = 0; i < this.length; i++) {
		      var b = this._zeroBits(this.words[i]);
		      r += b;
		      if (b !== 26) break;
		    }
		    return r;
		  };

		  BN.prototype.byteLength = function byteLength () {
		    return Math.ceil(this.bitLength() / 8);
		  };

		  BN.prototype.toTwos = function toTwos (width) {
		    if (this.negative !== 0) {
		      return this.abs().inotn(width).iaddn(1);
		    }
		    return this.clone();
		  };

		  BN.prototype.fromTwos = function fromTwos (width) {
		    if (this.testn(width - 1)) {
		      return this.notn(width).iaddn(1).ineg();
		    }
		    return this.clone();
		  };

		  BN.prototype.isNeg = function isNeg () {
		    return this.negative !== 0;
		  };

		  // Return negative clone of `this`
		  BN.prototype.neg = function neg () {
		    return this.clone().ineg();
		  };

		  BN.prototype.ineg = function ineg () {
		    if (!this.isZero()) {
		      this.negative ^= 1;
		    }

		    return this;
		  };

		  // Or `num` with `this` in-place
		  BN.prototype.iuor = function iuor (num) {
		    while (this.length < num.length) {
		      this.words[this.length++] = 0;
		    }

		    for (var i = 0; i < num.length; i++) {
		      this.words[i] = this.words[i] | num.words[i];
		    }

		    return this._strip();
		  };

		  BN.prototype.ior = function ior (num) {
		    assert((this.negative | num.negative) === 0);
		    return this.iuor(num);
		  };

		  // Or `num` with `this`
		  BN.prototype.or = function or (num) {
		    if (this.length > num.length) return this.clone().ior(num);
		    return num.clone().ior(this);
		  };

		  BN.prototype.uor = function uor (num) {
		    if (this.length > num.length) return this.clone().iuor(num);
		    return num.clone().iuor(this);
		  };

		  // And `num` with `this` in-place
		  BN.prototype.iuand = function iuand (num) {
		    // b = min-length(num, this)
		    var b;
		    if (this.length > num.length) {
		      b = num;
		    } else {
		      b = this;
		    }

		    for (var i = 0; i < b.length; i++) {
		      this.words[i] = this.words[i] & num.words[i];
		    }

		    this.length = b.length;

		    return this._strip();
		  };

		  BN.prototype.iand = function iand (num) {
		    assert((this.negative | num.negative) === 0);
		    return this.iuand(num);
		  };

		  // And `num` with `this`
		  BN.prototype.and = function and (num) {
		    if (this.length > num.length) return this.clone().iand(num);
		    return num.clone().iand(this);
		  };

		  BN.prototype.uand = function uand (num) {
		    if (this.length > num.length) return this.clone().iuand(num);
		    return num.clone().iuand(this);
		  };

		  // Xor `num` with `this` in-place
		  BN.prototype.iuxor = function iuxor (num) {
		    // a.length > b.length
		    var a;
		    var b;
		    if (this.length > num.length) {
		      a = this;
		      b = num;
		    } else {
		      a = num;
		      b = this;
		    }

		    for (var i = 0; i < b.length; i++) {
		      this.words[i] = a.words[i] ^ b.words[i];
		    }

		    if (this !== a) {
		      for (; i < a.length; i++) {
		        this.words[i] = a.words[i];
		      }
		    }

		    this.length = a.length;

		    return this._strip();
		  };

		  BN.prototype.ixor = function ixor (num) {
		    assert((this.negative | num.negative) === 0);
		    return this.iuxor(num);
		  };

		  // Xor `num` with `this`
		  BN.prototype.xor = function xor (num) {
		    if (this.length > num.length) return this.clone().ixor(num);
		    return num.clone().ixor(this);
		  };

		  BN.prototype.uxor = function uxor (num) {
		    if (this.length > num.length) return this.clone().iuxor(num);
		    return num.clone().iuxor(this);
		  };

		  // Not ``this`` with ``width`` bitwidth
		  BN.prototype.inotn = function inotn (width) {
		    assert(typeof width === 'number' && width >= 0);

		    var bytesNeeded = Math.ceil(width / 26) | 0;
		    var bitsLeft = width % 26;

		    // Extend the buffer with leading zeroes
		    this._expand(bytesNeeded);

		    if (bitsLeft > 0) {
		      bytesNeeded--;
		    }

		    // Handle complete words
		    for (var i = 0; i < bytesNeeded; i++) {
		      this.words[i] = ~this.words[i] & 0x3ffffff;
		    }

		    // Handle the residue
		    if (bitsLeft > 0) {
		      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
		    }

		    // And remove leading zeroes
		    return this._strip();
		  };

		  BN.prototype.notn = function notn (width) {
		    return this.clone().inotn(width);
		  };

		  // Set `bit` of `this`
		  BN.prototype.setn = function setn (bit, val) {
		    assert(typeof bit === 'number' && bit >= 0);

		    var off = (bit / 26) | 0;
		    var wbit = bit % 26;

		    this._expand(off + 1);

		    if (val) {
		      this.words[off] = this.words[off] | (1 << wbit);
		    } else {
		      this.words[off] = this.words[off] & ~(1 << wbit);
		    }

		    return this._strip();
		  };

		  // Add `num` to `this` in-place
		  BN.prototype.iadd = function iadd (num) {
		    var r;

		    // negative + positive
		    if (this.negative !== 0 && num.negative === 0) {
		      this.negative = 0;
		      r = this.isub(num);
		      this.negative ^= 1;
		      return this._normSign();

		    // positive + negative
		    } else if (this.negative === 0 && num.negative !== 0) {
		      num.negative = 0;
		      r = this.isub(num);
		      num.negative = 1;
		      return r._normSign();
		    }

		    // a.length > b.length
		    var a, b;
		    if (this.length > num.length) {
		      a = this;
		      b = num;
		    } else {
		      a = num;
		      b = this;
		    }

		    var carry = 0;
		    for (var i = 0; i < b.length; i++) {
		      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
		      this.words[i] = r & 0x3ffffff;
		      carry = r >>> 26;
		    }
		    for (; carry !== 0 && i < a.length; i++) {
		      r = (a.words[i] | 0) + carry;
		      this.words[i] = r & 0x3ffffff;
		      carry = r >>> 26;
		    }

		    this.length = a.length;
		    if (carry !== 0) {
		      this.words[this.length] = carry;
		      this.length++;
		    // Copy the rest of the words
		    } else if (a !== this) {
		      for (; i < a.length; i++) {
		        this.words[i] = a.words[i];
		      }
		    }

		    return this;
		  };

		  // Add `num` to `this`
		  BN.prototype.add = function add (num) {
		    var res;
		    if (num.negative !== 0 && this.negative === 0) {
		      num.negative = 0;
		      res = this.sub(num);
		      num.negative ^= 1;
		      return res;
		    } else if (num.negative === 0 && this.negative !== 0) {
		      this.negative = 0;
		      res = num.sub(this);
		      this.negative = 1;
		      return res;
		    }

		    if (this.length > num.length) return this.clone().iadd(num);

		    return num.clone().iadd(this);
		  };

		  // Subtract `num` from `this` in-place
		  BN.prototype.isub = function isub (num) {
		    // this - (-num) = this + num
		    if (num.negative !== 0) {
		      num.negative = 0;
		      var r = this.iadd(num);
		      num.negative = 1;
		      return r._normSign();

		    // -this - num = -(this + num)
		    } else if (this.negative !== 0) {
		      this.negative = 0;
		      this.iadd(num);
		      this.negative = 1;
		      return this._normSign();
		    }

		    // At this point both numbers are positive
		    var cmp = this.cmp(num);

		    // Optimization - zeroify
		    if (cmp === 0) {
		      this.negative = 0;
		      this.length = 1;
		      this.words[0] = 0;
		      return this;
		    }

		    // a > b
		    var a, b;
		    if (cmp > 0) {
		      a = this;
		      b = num;
		    } else {
		      a = num;
		      b = this;
		    }

		    var carry = 0;
		    for (var i = 0; i < b.length; i++) {
		      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
		      carry = r >> 26;
		      this.words[i] = r & 0x3ffffff;
		    }
		    for (; carry !== 0 && i < a.length; i++) {
		      r = (a.words[i] | 0) + carry;
		      carry = r >> 26;
		      this.words[i] = r & 0x3ffffff;
		    }

		    // Copy rest of the words
		    if (carry === 0 && i < a.length && a !== this) {
		      for (; i < a.length; i++) {
		        this.words[i] = a.words[i];
		      }
		    }

		    this.length = Math.max(this.length, i);

		    if (a !== this) {
		      this.negative = 1;
		    }

		    return this._strip();
		  };

		  // Subtract `num` from `this`
		  BN.prototype.sub = function sub (num) {
		    return this.clone().isub(num);
		  };

		  function smallMulTo (self, num, out) {
		    out.negative = num.negative ^ self.negative;
		    var len = (self.length + num.length) | 0;
		    out.length = len;
		    len = (len - 1) | 0;

		    // Peel one iteration (compiler can't do it, because of code complexity)
		    var a = self.words[0] | 0;
		    var b = num.words[0] | 0;
		    var r = a * b;

		    var lo = r & 0x3ffffff;
		    var carry = (r / 0x4000000) | 0;
		    out.words[0] = lo;

		    for (var k = 1; k < len; k++) {
		      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
		      // note that ncarry could be >= 0x3ffffff
		      var ncarry = carry >>> 26;
		      var rword = carry & 0x3ffffff;
		      var maxJ = Math.min(k, num.length - 1);
		      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
		        var i = (k - j) | 0;
		        a = self.words[i] | 0;
		        b = num.words[j] | 0;
		        r = a * b + rword;
		        ncarry += (r / 0x4000000) | 0;
		        rword = r & 0x3ffffff;
		      }
		      out.words[k] = rword | 0;
		      carry = ncarry | 0;
		    }
		    if (carry !== 0) {
		      out.words[k] = carry | 0;
		    } else {
		      out.length--;
		    }

		    return out._strip();
		  }

		  // TODO(indutny): it may be reasonable to omit it for users who don't need
		  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
		  // multiplication (like elliptic secp256k1).
		  var comb10MulTo = function comb10MulTo (self, num, out) {
		    var a = self.words;
		    var b = num.words;
		    var o = out.words;
		    var c = 0;
		    var lo;
		    var mid;
		    var hi;
		    var a0 = a[0] | 0;
		    var al0 = a0 & 0x1fff;
		    var ah0 = a0 >>> 13;
		    var a1 = a[1] | 0;
		    var al1 = a1 & 0x1fff;
		    var ah1 = a1 >>> 13;
		    var a2 = a[2] | 0;
		    var al2 = a2 & 0x1fff;
		    var ah2 = a2 >>> 13;
		    var a3 = a[3] | 0;
		    var al3 = a3 & 0x1fff;
		    var ah3 = a3 >>> 13;
		    var a4 = a[4] | 0;
		    var al4 = a4 & 0x1fff;
		    var ah4 = a4 >>> 13;
		    var a5 = a[5] | 0;
		    var al5 = a5 & 0x1fff;
		    var ah5 = a5 >>> 13;
		    var a6 = a[6] | 0;
		    var al6 = a6 & 0x1fff;
		    var ah6 = a6 >>> 13;
		    var a7 = a[7] | 0;
		    var al7 = a7 & 0x1fff;
		    var ah7 = a7 >>> 13;
		    var a8 = a[8] | 0;
		    var al8 = a8 & 0x1fff;
		    var ah8 = a8 >>> 13;
		    var a9 = a[9] | 0;
		    var al9 = a9 & 0x1fff;
		    var ah9 = a9 >>> 13;
		    var b0 = b[0] | 0;
		    var bl0 = b0 & 0x1fff;
		    var bh0 = b0 >>> 13;
		    var b1 = b[1] | 0;
		    var bl1 = b1 & 0x1fff;
		    var bh1 = b1 >>> 13;
		    var b2 = b[2] | 0;
		    var bl2 = b2 & 0x1fff;
		    var bh2 = b2 >>> 13;
		    var b3 = b[3] | 0;
		    var bl3 = b3 & 0x1fff;
		    var bh3 = b3 >>> 13;
		    var b4 = b[4] | 0;
		    var bl4 = b4 & 0x1fff;
		    var bh4 = b4 >>> 13;
		    var b5 = b[5] | 0;
		    var bl5 = b5 & 0x1fff;
		    var bh5 = b5 >>> 13;
		    var b6 = b[6] | 0;
		    var bl6 = b6 & 0x1fff;
		    var bh6 = b6 >>> 13;
		    var b7 = b[7] | 0;
		    var bl7 = b7 & 0x1fff;
		    var bh7 = b7 >>> 13;
		    var b8 = b[8] | 0;
		    var bl8 = b8 & 0x1fff;
		    var bh8 = b8 >>> 13;
		    var b9 = b[9] | 0;
		    var bl9 = b9 & 0x1fff;
		    var bh9 = b9 >>> 13;

		    out.negative = self.negative ^ num.negative;
		    out.length = 19;
		    /* k = 0 */
		    lo = Math.imul(al0, bl0);
		    mid = Math.imul(al0, bh0);
		    mid = (mid + Math.imul(ah0, bl0)) | 0;
		    hi = Math.imul(ah0, bh0);
		    var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
		    w0 &= 0x3ffffff;
		    /* k = 1 */
		    lo = Math.imul(al1, bl0);
		    mid = Math.imul(al1, bh0);
		    mid = (mid + Math.imul(ah1, bl0)) | 0;
		    hi = Math.imul(ah1, bh0);
		    lo = (lo + Math.imul(al0, bl1)) | 0;
		    mid = (mid + Math.imul(al0, bh1)) | 0;
		    mid = (mid + Math.imul(ah0, bl1)) | 0;
		    hi = (hi + Math.imul(ah0, bh1)) | 0;
		    var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
		    w1 &= 0x3ffffff;
		    /* k = 2 */
		    lo = Math.imul(al2, bl0);
		    mid = Math.imul(al2, bh0);
		    mid = (mid + Math.imul(ah2, bl0)) | 0;
		    hi = Math.imul(ah2, bh0);
		    lo = (lo + Math.imul(al1, bl1)) | 0;
		    mid = (mid + Math.imul(al1, bh1)) | 0;
		    mid = (mid + Math.imul(ah1, bl1)) | 0;
		    hi = (hi + Math.imul(ah1, bh1)) | 0;
		    lo = (lo + Math.imul(al0, bl2)) | 0;
		    mid = (mid + Math.imul(al0, bh2)) | 0;
		    mid = (mid + Math.imul(ah0, bl2)) | 0;
		    hi = (hi + Math.imul(ah0, bh2)) | 0;
		    var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
		    w2 &= 0x3ffffff;
		    /* k = 3 */
		    lo = Math.imul(al3, bl0);
		    mid = Math.imul(al3, bh0);
		    mid = (mid + Math.imul(ah3, bl0)) | 0;
		    hi = Math.imul(ah3, bh0);
		    lo = (lo + Math.imul(al2, bl1)) | 0;
		    mid = (mid + Math.imul(al2, bh1)) | 0;
		    mid = (mid + Math.imul(ah2, bl1)) | 0;
		    hi = (hi + Math.imul(ah2, bh1)) | 0;
		    lo = (lo + Math.imul(al1, bl2)) | 0;
		    mid = (mid + Math.imul(al1, bh2)) | 0;
		    mid = (mid + Math.imul(ah1, bl2)) | 0;
		    hi = (hi + Math.imul(ah1, bh2)) | 0;
		    lo = (lo + Math.imul(al0, bl3)) | 0;
		    mid = (mid + Math.imul(al0, bh3)) | 0;
		    mid = (mid + Math.imul(ah0, bl3)) | 0;
		    hi = (hi + Math.imul(ah0, bh3)) | 0;
		    var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
		    w3 &= 0x3ffffff;
		    /* k = 4 */
		    lo = Math.imul(al4, bl0);
		    mid = Math.imul(al4, bh0);
		    mid = (mid + Math.imul(ah4, bl0)) | 0;
		    hi = Math.imul(ah4, bh0);
		    lo = (lo + Math.imul(al3, bl1)) | 0;
		    mid = (mid + Math.imul(al3, bh1)) | 0;
		    mid = (mid + Math.imul(ah3, bl1)) | 0;
		    hi = (hi + Math.imul(ah3, bh1)) | 0;
		    lo = (lo + Math.imul(al2, bl2)) | 0;
		    mid = (mid + Math.imul(al2, bh2)) | 0;
		    mid = (mid + Math.imul(ah2, bl2)) | 0;
		    hi = (hi + Math.imul(ah2, bh2)) | 0;
		    lo = (lo + Math.imul(al1, bl3)) | 0;
		    mid = (mid + Math.imul(al1, bh3)) | 0;
		    mid = (mid + Math.imul(ah1, bl3)) | 0;
		    hi = (hi + Math.imul(ah1, bh3)) | 0;
		    lo = (lo + Math.imul(al0, bl4)) | 0;
		    mid = (mid + Math.imul(al0, bh4)) | 0;
		    mid = (mid + Math.imul(ah0, bl4)) | 0;
		    hi = (hi + Math.imul(ah0, bh4)) | 0;
		    var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
		    w4 &= 0x3ffffff;
		    /* k = 5 */
		    lo = Math.imul(al5, bl0);
		    mid = Math.imul(al5, bh0);
		    mid = (mid + Math.imul(ah5, bl0)) | 0;
		    hi = Math.imul(ah5, bh0);
		    lo = (lo + Math.imul(al4, bl1)) | 0;
		    mid = (mid + Math.imul(al4, bh1)) | 0;
		    mid = (mid + Math.imul(ah4, bl1)) | 0;
		    hi = (hi + Math.imul(ah4, bh1)) | 0;
		    lo = (lo + Math.imul(al3, bl2)) | 0;
		    mid = (mid + Math.imul(al3, bh2)) | 0;
		    mid = (mid + Math.imul(ah3, bl2)) | 0;
		    hi = (hi + Math.imul(ah3, bh2)) | 0;
		    lo = (lo + Math.imul(al2, bl3)) | 0;
		    mid = (mid + Math.imul(al2, bh3)) | 0;
		    mid = (mid + Math.imul(ah2, bl3)) | 0;
		    hi = (hi + Math.imul(ah2, bh3)) | 0;
		    lo = (lo + Math.imul(al1, bl4)) | 0;
		    mid = (mid + Math.imul(al1, bh4)) | 0;
		    mid = (mid + Math.imul(ah1, bl4)) | 0;
		    hi = (hi + Math.imul(ah1, bh4)) | 0;
		    lo = (lo + Math.imul(al0, bl5)) | 0;
		    mid = (mid + Math.imul(al0, bh5)) | 0;
		    mid = (mid + Math.imul(ah0, bl5)) | 0;
		    hi = (hi + Math.imul(ah0, bh5)) | 0;
		    var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
		    w5 &= 0x3ffffff;
		    /* k = 6 */
		    lo = Math.imul(al6, bl0);
		    mid = Math.imul(al6, bh0);
		    mid = (mid + Math.imul(ah6, bl0)) | 0;
		    hi = Math.imul(ah6, bh0);
		    lo = (lo + Math.imul(al5, bl1)) | 0;
		    mid = (mid + Math.imul(al5, bh1)) | 0;
		    mid = (mid + Math.imul(ah5, bl1)) | 0;
		    hi = (hi + Math.imul(ah5, bh1)) | 0;
		    lo = (lo + Math.imul(al4, bl2)) | 0;
		    mid = (mid + Math.imul(al4, bh2)) | 0;
		    mid = (mid + Math.imul(ah4, bl2)) | 0;
		    hi = (hi + Math.imul(ah4, bh2)) | 0;
		    lo = (lo + Math.imul(al3, bl3)) | 0;
		    mid = (mid + Math.imul(al3, bh3)) | 0;
		    mid = (mid + Math.imul(ah3, bl3)) | 0;
		    hi = (hi + Math.imul(ah3, bh3)) | 0;
		    lo = (lo + Math.imul(al2, bl4)) | 0;
		    mid = (mid + Math.imul(al2, bh4)) | 0;
		    mid = (mid + Math.imul(ah2, bl4)) | 0;
		    hi = (hi + Math.imul(ah2, bh4)) | 0;
		    lo = (lo + Math.imul(al1, bl5)) | 0;
		    mid = (mid + Math.imul(al1, bh5)) | 0;
		    mid = (mid + Math.imul(ah1, bl5)) | 0;
		    hi = (hi + Math.imul(ah1, bh5)) | 0;
		    lo = (lo + Math.imul(al0, bl6)) | 0;
		    mid = (mid + Math.imul(al0, bh6)) | 0;
		    mid = (mid + Math.imul(ah0, bl6)) | 0;
		    hi = (hi + Math.imul(ah0, bh6)) | 0;
		    var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
		    w6 &= 0x3ffffff;
		    /* k = 7 */
		    lo = Math.imul(al7, bl0);
		    mid = Math.imul(al7, bh0);
		    mid = (mid + Math.imul(ah7, bl0)) | 0;
		    hi = Math.imul(ah7, bh0);
		    lo = (lo + Math.imul(al6, bl1)) | 0;
		    mid = (mid + Math.imul(al6, bh1)) | 0;
		    mid = (mid + Math.imul(ah6, bl1)) | 0;
		    hi = (hi + Math.imul(ah6, bh1)) | 0;
		    lo = (lo + Math.imul(al5, bl2)) | 0;
		    mid = (mid + Math.imul(al5, bh2)) | 0;
		    mid = (mid + Math.imul(ah5, bl2)) | 0;
		    hi = (hi + Math.imul(ah5, bh2)) | 0;
		    lo = (lo + Math.imul(al4, bl3)) | 0;
		    mid = (mid + Math.imul(al4, bh3)) | 0;
		    mid = (mid + Math.imul(ah4, bl3)) | 0;
		    hi = (hi + Math.imul(ah4, bh3)) | 0;
		    lo = (lo + Math.imul(al3, bl4)) | 0;
		    mid = (mid + Math.imul(al3, bh4)) | 0;
		    mid = (mid + Math.imul(ah3, bl4)) | 0;
		    hi = (hi + Math.imul(ah3, bh4)) | 0;
		    lo = (lo + Math.imul(al2, bl5)) | 0;
		    mid = (mid + Math.imul(al2, bh5)) | 0;
		    mid = (mid + Math.imul(ah2, bl5)) | 0;
		    hi = (hi + Math.imul(ah2, bh5)) | 0;
		    lo = (lo + Math.imul(al1, bl6)) | 0;
		    mid = (mid + Math.imul(al1, bh6)) | 0;
		    mid = (mid + Math.imul(ah1, bl6)) | 0;
		    hi = (hi + Math.imul(ah1, bh6)) | 0;
		    lo = (lo + Math.imul(al0, bl7)) | 0;
		    mid = (mid + Math.imul(al0, bh7)) | 0;
		    mid = (mid + Math.imul(ah0, bl7)) | 0;
		    hi = (hi + Math.imul(ah0, bh7)) | 0;
		    var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
		    w7 &= 0x3ffffff;
		    /* k = 8 */
		    lo = Math.imul(al8, bl0);
		    mid = Math.imul(al8, bh0);
		    mid = (mid + Math.imul(ah8, bl0)) | 0;
		    hi = Math.imul(ah8, bh0);
		    lo = (lo + Math.imul(al7, bl1)) | 0;
		    mid = (mid + Math.imul(al7, bh1)) | 0;
		    mid = (mid + Math.imul(ah7, bl1)) | 0;
		    hi = (hi + Math.imul(ah7, bh1)) | 0;
		    lo = (lo + Math.imul(al6, bl2)) | 0;
		    mid = (mid + Math.imul(al6, bh2)) | 0;
		    mid = (mid + Math.imul(ah6, bl2)) | 0;
		    hi = (hi + Math.imul(ah6, bh2)) | 0;
		    lo = (lo + Math.imul(al5, bl3)) | 0;
		    mid = (mid + Math.imul(al5, bh3)) | 0;
		    mid = (mid + Math.imul(ah5, bl3)) | 0;
		    hi = (hi + Math.imul(ah5, bh3)) | 0;
		    lo = (lo + Math.imul(al4, bl4)) | 0;
		    mid = (mid + Math.imul(al4, bh4)) | 0;
		    mid = (mid + Math.imul(ah4, bl4)) | 0;
		    hi = (hi + Math.imul(ah4, bh4)) | 0;
		    lo = (lo + Math.imul(al3, bl5)) | 0;
		    mid = (mid + Math.imul(al3, bh5)) | 0;
		    mid = (mid + Math.imul(ah3, bl5)) | 0;
		    hi = (hi + Math.imul(ah3, bh5)) | 0;
		    lo = (lo + Math.imul(al2, bl6)) | 0;
		    mid = (mid + Math.imul(al2, bh6)) | 0;
		    mid = (mid + Math.imul(ah2, bl6)) | 0;
		    hi = (hi + Math.imul(ah2, bh6)) | 0;
		    lo = (lo + Math.imul(al1, bl7)) | 0;
		    mid = (mid + Math.imul(al1, bh7)) | 0;
		    mid = (mid + Math.imul(ah1, bl7)) | 0;
		    hi = (hi + Math.imul(ah1, bh7)) | 0;
		    lo = (lo + Math.imul(al0, bl8)) | 0;
		    mid = (mid + Math.imul(al0, bh8)) | 0;
		    mid = (mid + Math.imul(ah0, bl8)) | 0;
		    hi = (hi + Math.imul(ah0, bh8)) | 0;
		    var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
		    w8 &= 0x3ffffff;
		    /* k = 9 */
		    lo = Math.imul(al9, bl0);
		    mid = Math.imul(al9, bh0);
		    mid = (mid + Math.imul(ah9, bl0)) | 0;
		    hi = Math.imul(ah9, bh0);
		    lo = (lo + Math.imul(al8, bl1)) | 0;
		    mid = (mid + Math.imul(al8, bh1)) | 0;
		    mid = (mid + Math.imul(ah8, bl1)) | 0;
		    hi = (hi + Math.imul(ah8, bh1)) | 0;
		    lo = (lo + Math.imul(al7, bl2)) | 0;
		    mid = (mid + Math.imul(al7, bh2)) | 0;
		    mid = (mid + Math.imul(ah7, bl2)) | 0;
		    hi = (hi + Math.imul(ah7, bh2)) | 0;
		    lo = (lo + Math.imul(al6, bl3)) | 0;
		    mid = (mid + Math.imul(al6, bh3)) | 0;
		    mid = (mid + Math.imul(ah6, bl3)) | 0;
		    hi = (hi + Math.imul(ah6, bh3)) | 0;
		    lo = (lo + Math.imul(al5, bl4)) | 0;
		    mid = (mid + Math.imul(al5, bh4)) | 0;
		    mid = (mid + Math.imul(ah5, bl4)) | 0;
		    hi = (hi + Math.imul(ah5, bh4)) | 0;
		    lo = (lo + Math.imul(al4, bl5)) | 0;
		    mid = (mid + Math.imul(al4, bh5)) | 0;
		    mid = (mid + Math.imul(ah4, bl5)) | 0;
		    hi = (hi + Math.imul(ah4, bh5)) | 0;
		    lo = (lo + Math.imul(al3, bl6)) | 0;
		    mid = (mid + Math.imul(al3, bh6)) | 0;
		    mid = (mid + Math.imul(ah3, bl6)) | 0;
		    hi = (hi + Math.imul(ah3, bh6)) | 0;
		    lo = (lo + Math.imul(al2, bl7)) | 0;
		    mid = (mid + Math.imul(al2, bh7)) | 0;
		    mid = (mid + Math.imul(ah2, bl7)) | 0;
		    hi = (hi + Math.imul(ah2, bh7)) | 0;
		    lo = (lo + Math.imul(al1, bl8)) | 0;
		    mid = (mid + Math.imul(al1, bh8)) | 0;
		    mid = (mid + Math.imul(ah1, bl8)) | 0;
		    hi = (hi + Math.imul(ah1, bh8)) | 0;
		    lo = (lo + Math.imul(al0, bl9)) | 0;
		    mid = (mid + Math.imul(al0, bh9)) | 0;
		    mid = (mid + Math.imul(ah0, bl9)) | 0;
		    hi = (hi + Math.imul(ah0, bh9)) | 0;
		    var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
		    w9 &= 0x3ffffff;
		    /* k = 10 */
		    lo = Math.imul(al9, bl1);
		    mid = Math.imul(al9, bh1);
		    mid = (mid + Math.imul(ah9, bl1)) | 0;
		    hi = Math.imul(ah9, bh1);
		    lo = (lo + Math.imul(al8, bl2)) | 0;
		    mid = (mid + Math.imul(al8, bh2)) | 0;
		    mid = (mid + Math.imul(ah8, bl2)) | 0;
		    hi = (hi + Math.imul(ah8, bh2)) | 0;
		    lo = (lo + Math.imul(al7, bl3)) | 0;
		    mid = (mid + Math.imul(al7, bh3)) | 0;
		    mid = (mid + Math.imul(ah7, bl3)) | 0;
		    hi = (hi + Math.imul(ah7, bh3)) | 0;
		    lo = (lo + Math.imul(al6, bl4)) | 0;
		    mid = (mid + Math.imul(al6, bh4)) | 0;
		    mid = (mid + Math.imul(ah6, bl4)) | 0;
		    hi = (hi + Math.imul(ah6, bh4)) | 0;
		    lo = (lo + Math.imul(al5, bl5)) | 0;
		    mid = (mid + Math.imul(al5, bh5)) | 0;
		    mid = (mid + Math.imul(ah5, bl5)) | 0;
		    hi = (hi + Math.imul(ah5, bh5)) | 0;
		    lo = (lo + Math.imul(al4, bl6)) | 0;
		    mid = (mid + Math.imul(al4, bh6)) | 0;
		    mid = (mid + Math.imul(ah4, bl6)) | 0;
		    hi = (hi + Math.imul(ah4, bh6)) | 0;
		    lo = (lo + Math.imul(al3, bl7)) | 0;
		    mid = (mid + Math.imul(al3, bh7)) | 0;
		    mid = (mid + Math.imul(ah3, bl7)) | 0;
		    hi = (hi + Math.imul(ah3, bh7)) | 0;
		    lo = (lo + Math.imul(al2, bl8)) | 0;
		    mid = (mid + Math.imul(al2, bh8)) | 0;
		    mid = (mid + Math.imul(ah2, bl8)) | 0;
		    hi = (hi + Math.imul(ah2, bh8)) | 0;
		    lo = (lo + Math.imul(al1, bl9)) | 0;
		    mid = (mid + Math.imul(al1, bh9)) | 0;
		    mid = (mid + Math.imul(ah1, bl9)) | 0;
		    hi = (hi + Math.imul(ah1, bh9)) | 0;
		    var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
		    w10 &= 0x3ffffff;
		    /* k = 11 */
		    lo = Math.imul(al9, bl2);
		    mid = Math.imul(al9, bh2);
		    mid = (mid + Math.imul(ah9, bl2)) | 0;
		    hi = Math.imul(ah9, bh2);
		    lo = (lo + Math.imul(al8, bl3)) | 0;
		    mid = (mid + Math.imul(al8, bh3)) | 0;
		    mid = (mid + Math.imul(ah8, bl3)) | 0;
		    hi = (hi + Math.imul(ah8, bh3)) | 0;
		    lo = (lo + Math.imul(al7, bl4)) | 0;
		    mid = (mid + Math.imul(al7, bh4)) | 0;
		    mid = (mid + Math.imul(ah7, bl4)) | 0;
		    hi = (hi + Math.imul(ah7, bh4)) | 0;
		    lo = (lo + Math.imul(al6, bl5)) | 0;
		    mid = (mid + Math.imul(al6, bh5)) | 0;
		    mid = (mid + Math.imul(ah6, bl5)) | 0;
		    hi = (hi + Math.imul(ah6, bh5)) | 0;
		    lo = (lo + Math.imul(al5, bl6)) | 0;
		    mid = (mid + Math.imul(al5, bh6)) | 0;
		    mid = (mid + Math.imul(ah5, bl6)) | 0;
		    hi = (hi + Math.imul(ah5, bh6)) | 0;
		    lo = (lo + Math.imul(al4, bl7)) | 0;
		    mid = (mid + Math.imul(al4, bh7)) | 0;
		    mid = (mid + Math.imul(ah4, bl7)) | 0;
		    hi = (hi + Math.imul(ah4, bh7)) | 0;
		    lo = (lo + Math.imul(al3, bl8)) | 0;
		    mid = (mid + Math.imul(al3, bh8)) | 0;
		    mid = (mid + Math.imul(ah3, bl8)) | 0;
		    hi = (hi + Math.imul(ah3, bh8)) | 0;
		    lo = (lo + Math.imul(al2, bl9)) | 0;
		    mid = (mid + Math.imul(al2, bh9)) | 0;
		    mid = (mid + Math.imul(ah2, bl9)) | 0;
		    hi = (hi + Math.imul(ah2, bh9)) | 0;
		    var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
		    w11 &= 0x3ffffff;
		    /* k = 12 */
		    lo = Math.imul(al9, bl3);
		    mid = Math.imul(al9, bh3);
		    mid = (mid + Math.imul(ah9, bl3)) | 0;
		    hi = Math.imul(ah9, bh3);
		    lo = (lo + Math.imul(al8, bl4)) | 0;
		    mid = (mid + Math.imul(al8, bh4)) | 0;
		    mid = (mid + Math.imul(ah8, bl4)) | 0;
		    hi = (hi + Math.imul(ah8, bh4)) | 0;
		    lo = (lo + Math.imul(al7, bl5)) | 0;
		    mid = (mid + Math.imul(al7, bh5)) | 0;
		    mid = (mid + Math.imul(ah7, bl5)) | 0;
		    hi = (hi + Math.imul(ah7, bh5)) | 0;
		    lo = (lo + Math.imul(al6, bl6)) | 0;
		    mid = (mid + Math.imul(al6, bh6)) | 0;
		    mid = (mid + Math.imul(ah6, bl6)) | 0;
		    hi = (hi + Math.imul(ah6, bh6)) | 0;
		    lo = (lo + Math.imul(al5, bl7)) | 0;
		    mid = (mid + Math.imul(al5, bh7)) | 0;
		    mid = (mid + Math.imul(ah5, bl7)) | 0;
		    hi = (hi + Math.imul(ah5, bh7)) | 0;
		    lo = (lo + Math.imul(al4, bl8)) | 0;
		    mid = (mid + Math.imul(al4, bh8)) | 0;
		    mid = (mid + Math.imul(ah4, bl8)) | 0;
		    hi = (hi + Math.imul(ah4, bh8)) | 0;
		    lo = (lo + Math.imul(al3, bl9)) | 0;
		    mid = (mid + Math.imul(al3, bh9)) | 0;
		    mid = (mid + Math.imul(ah3, bl9)) | 0;
		    hi = (hi + Math.imul(ah3, bh9)) | 0;
		    var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
		    w12 &= 0x3ffffff;
		    /* k = 13 */
		    lo = Math.imul(al9, bl4);
		    mid = Math.imul(al9, bh4);
		    mid = (mid + Math.imul(ah9, bl4)) | 0;
		    hi = Math.imul(ah9, bh4);
		    lo = (lo + Math.imul(al8, bl5)) | 0;
		    mid = (mid + Math.imul(al8, bh5)) | 0;
		    mid = (mid + Math.imul(ah8, bl5)) | 0;
		    hi = (hi + Math.imul(ah8, bh5)) | 0;
		    lo = (lo + Math.imul(al7, bl6)) | 0;
		    mid = (mid + Math.imul(al7, bh6)) | 0;
		    mid = (mid + Math.imul(ah7, bl6)) | 0;
		    hi = (hi + Math.imul(ah7, bh6)) | 0;
		    lo = (lo + Math.imul(al6, bl7)) | 0;
		    mid = (mid + Math.imul(al6, bh7)) | 0;
		    mid = (mid + Math.imul(ah6, bl7)) | 0;
		    hi = (hi + Math.imul(ah6, bh7)) | 0;
		    lo = (lo + Math.imul(al5, bl8)) | 0;
		    mid = (mid + Math.imul(al5, bh8)) | 0;
		    mid = (mid + Math.imul(ah5, bl8)) | 0;
		    hi = (hi + Math.imul(ah5, bh8)) | 0;
		    lo = (lo + Math.imul(al4, bl9)) | 0;
		    mid = (mid + Math.imul(al4, bh9)) | 0;
		    mid = (mid + Math.imul(ah4, bl9)) | 0;
		    hi = (hi + Math.imul(ah4, bh9)) | 0;
		    var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
		    w13 &= 0x3ffffff;
		    /* k = 14 */
		    lo = Math.imul(al9, bl5);
		    mid = Math.imul(al9, bh5);
		    mid = (mid + Math.imul(ah9, bl5)) | 0;
		    hi = Math.imul(ah9, bh5);
		    lo = (lo + Math.imul(al8, bl6)) | 0;
		    mid = (mid + Math.imul(al8, bh6)) | 0;
		    mid = (mid + Math.imul(ah8, bl6)) | 0;
		    hi = (hi + Math.imul(ah8, bh6)) | 0;
		    lo = (lo + Math.imul(al7, bl7)) | 0;
		    mid = (mid + Math.imul(al7, bh7)) | 0;
		    mid = (mid + Math.imul(ah7, bl7)) | 0;
		    hi = (hi + Math.imul(ah7, bh7)) | 0;
		    lo = (lo + Math.imul(al6, bl8)) | 0;
		    mid = (mid + Math.imul(al6, bh8)) | 0;
		    mid = (mid + Math.imul(ah6, bl8)) | 0;
		    hi = (hi + Math.imul(ah6, bh8)) | 0;
		    lo = (lo + Math.imul(al5, bl9)) | 0;
		    mid = (mid + Math.imul(al5, bh9)) | 0;
		    mid = (mid + Math.imul(ah5, bl9)) | 0;
		    hi = (hi + Math.imul(ah5, bh9)) | 0;
		    var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
		    w14 &= 0x3ffffff;
		    /* k = 15 */
		    lo = Math.imul(al9, bl6);
		    mid = Math.imul(al9, bh6);
		    mid = (mid + Math.imul(ah9, bl6)) | 0;
		    hi = Math.imul(ah9, bh6);
		    lo = (lo + Math.imul(al8, bl7)) | 0;
		    mid = (mid + Math.imul(al8, bh7)) | 0;
		    mid = (mid + Math.imul(ah8, bl7)) | 0;
		    hi = (hi + Math.imul(ah8, bh7)) | 0;
		    lo = (lo + Math.imul(al7, bl8)) | 0;
		    mid = (mid + Math.imul(al7, bh8)) | 0;
		    mid = (mid + Math.imul(ah7, bl8)) | 0;
		    hi = (hi + Math.imul(ah7, bh8)) | 0;
		    lo = (lo + Math.imul(al6, bl9)) | 0;
		    mid = (mid + Math.imul(al6, bh9)) | 0;
		    mid = (mid + Math.imul(ah6, bl9)) | 0;
		    hi = (hi + Math.imul(ah6, bh9)) | 0;
		    var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
		    w15 &= 0x3ffffff;
		    /* k = 16 */
		    lo = Math.imul(al9, bl7);
		    mid = Math.imul(al9, bh7);
		    mid = (mid + Math.imul(ah9, bl7)) | 0;
		    hi = Math.imul(ah9, bh7);
		    lo = (lo + Math.imul(al8, bl8)) | 0;
		    mid = (mid + Math.imul(al8, bh8)) | 0;
		    mid = (mid + Math.imul(ah8, bl8)) | 0;
		    hi = (hi + Math.imul(ah8, bh8)) | 0;
		    lo = (lo + Math.imul(al7, bl9)) | 0;
		    mid = (mid + Math.imul(al7, bh9)) | 0;
		    mid = (mid + Math.imul(ah7, bl9)) | 0;
		    hi = (hi + Math.imul(ah7, bh9)) | 0;
		    var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
		    w16 &= 0x3ffffff;
		    /* k = 17 */
		    lo = Math.imul(al9, bl8);
		    mid = Math.imul(al9, bh8);
		    mid = (mid + Math.imul(ah9, bl8)) | 0;
		    hi = Math.imul(ah9, bh8);
		    lo = (lo + Math.imul(al8, bl9)) | 0;
		    mid = (mid + Math.imul(al8, bh9)) | 0;
		    mid = (mid + Math.imul(ah8, bl9)) | 0;
		    hi = (hi + Math.imul(ah8, bh9)) | 0;
		    var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
		    w17 &= 0x3ffffff;
		    /* k = 18 */
		    lo = Math.imul(al9, bl9);
		    mid = Math.imul(al9, bh9);
		    mid = (mid + Math.imul(ah9, bl9)) | 0;
		    hi = Math.imul(ah9, bh9);
		    var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
		    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
		    w18 &= 0x3ffffff;
		    o[0] = w0;
		    o[1] = w1;
		    o[2] = w2;
		    o[3] = w3;
		    o[4] = w4;
		    o[5] = w5;
		    o[6] = w6;
		    o[7] = w7;
		    o[8] = w8;
		    o[9] = w9;
		    o[10] = w10;
		    o[11] = w11;
		    o[12] = w12;
		    o[13] = w13;
		    o[14] = w14;
		    o[15] = w15;
		    o[16] = w16;
		    o[17] = w17;
		    o[18] = w18;
		    if (c !== 0) {
		      o[19] = c;
		      out.length++;
		    }
		    return out;
		  };

		  // Polyfill comb
		  if (!Math.imul) {
		    comb10MulTo = smallMulTo;
		  }

		  function bigMulTo (self, num, out) {
		    out.negative = num.negative ^ self.negative;
		    out.length = self.length + num.length;

		    var carry = 0;
		    var hncarry = 0;
		    for (var k = 0; k < out.length - 1; k++) {
		      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
		      // note that ncarry could be >= 0x3ffffff
		      var ncarry = hncarry;
		      hncarry = 0;
		      var rword = carry & 0x3ffffff;
		      var maxJ = Math.min(k, num.length - 1);
		      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
		        var i = k - j;
		        var a = self.words[i] | 0;
		        var b = num.words[j] | 0;
		        var r = a * b;

		        var lo = r & 0x3ffffff;
		        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
		        lo = (lo + rword) | 0;
		        rword = lo & 0x3ffffff;
		        ncarry = (ncarry + (lo >>> 26)) | 0;

		        hncarry += ncarry >>> 26;
		        ncarry &= 0x3ffffff;
		      }
		      out.words[k] = rword;
		      carry = ncarry;
		      ncarry = hncarry;
		    }
		    if (carry !== 0) {
		      out.words[k] = carry;
		    } else {
		      out.length--;
		    }

		    return out._strip();
		  }

		  function jumboMulTo (self, num, out) {
		    // Temporary disable, see https://github.com/indutny/bn.js/issues/211
		    // var fftm = new FFTM();
		    // return fftm.mulp(self, num, out);
		    return bigMulTo(self, num, out);
		  }

		  BN.prototype.mulTo = function mulTo (num, out) {
		    var res;
		    var len = this.length + num.length;
		    if (this.length === 10 && num.length === 10) {
		      res = comb10MulTo(this, num, out);
		    } else if (len < 63) {
		      res = smallMulTo(this, num, out);
		    } else if (len < 1024) {
		      res = bigMulTo(this, num, out);
		    } else {
		      res = jumboMulTo(this, num, out);
		    }

		    return res;
		  };

		  // Multiply `this` by `num`
		  BN.prototype.mul = function mul (num) {
		    var out = new BN(null);
		    out.words = new Array(this.length + num.length);
		    return this.mulTo(num, out);
		  };

		  // Multiply employing FFT
		  BN.prototype.mulf = function mulf (num) {
		    var out = new BN(null);
		    out.words = new Array(this.length + num.length);
		    return jumboMulTo(this, num, out);
		  };

		  // In-place Multiplication
		  BN.prototype.imul = function imul (num) {
		    return this.clone().mulTo(num, this);
		  };

		  BN.prototype.imuln = function imuln (num) {
		    var isNegNum = num < 0;
		    if (isNegNum) num = -num;

		    assert(typeof num === 'number');
		    assert(num < 0x4000000);

		    // Carry
		    var carry = 0;
		    for (var i = 0; i < this.length; i++) {
		      var w = (this.words[i] | 0) * num;
		      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
		      carry >>= 26;
		      carry += (w / 0x4000000) | 0;
		      // NOTE: lo is 27bit maximum
		      carry += lo >>> 26;
		      this.words[i] = lo & 0x3ffffff;
		    }

		    if (carry !== 0) {
		      this.words[i] = carry;
		      this.length++;
		    }

		    return isNegNum ? this.ineg() : this;
		  };

		  BN.prototype.muln = function muln (num) {
		    return this.clone().imuln(num);
		  };

		  // `this` * `this`
		  BN.prototype.sqr = function sqr () {
		    return this.mul(this);
		  };

		  // `this` * `this` in-place
		  BN.prototype.isqr = function isqr () {
		    return this.imul(this.clone());
		  };

		  // Math.pow(`this`, `num`)
		  BN.prototype.pow = function pow (num) {
		    var w = toBitArray(num);
		    if (w.length === 0) return new BN(1);

		    // Skip leading zeroes
		    var res = this;
		    for (var i = 0; i < w.length; i++, res = res.sqr()) {
		      if (w[i] !== 0) break;
		    }

		    if (++i < w.length) {
		      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
		        if (w[i] === 0) continue;

		        res = res.mul(q);
		      }
		    }

		    return res;
		  };

		  // Shift-left in-place
		  BN.prototype.iushln = function iushln (bits) {
		    assert(typeof bits === 'number' && bits >= 0);
		    var r = bits % 26;
		    var s = (bits - r) / 26;
		    var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
		    var i;

		    if (r !== 0) {
		      var carry = 0;

		      for (i = 0; i < this.length; i++) {
		        var newCarry = this.words[i] & carryMask;
		        var c = ((this.words[i] | 0) - newCarry) << r;
		        this.words[i] = c | carry;
		        carry = newCarry >>> (26 - r);
		      }

		      if (carry) {
		        this.words[i] = carry;
		        this.length++;
		      }
		    }

		    if (s !== 0) {
		      for (i = this.length - 1; i >= 0; i--) {
		        this.words[i + s] = this.words[i];
		      }

		      for (i = 0; i < s; i++) {
		        this.words[i] = 0;
		      }

		      this.length += s;
		    }

		    return this._strip();
		  };

		  BN.prototype.ishln = function ishln (bits) {
		    // TODO(indutny): implement me
		    assert(this.negative === 0);
		    return this.iushln(bits);
		  };

		  // Shift-right in-place
		  // NOTE: `hint` is a lowest bit before trailing zeroes
		  // NOTE: if `extended` is present - it will be filled with destroyed bits
		  BN.prototype.iushrn = function iushrn (bits, hint, extended) {
		    assert(typeof bits === 'number' && bits >= 0);
		    var h;
		    if (hint) {
		      h = (hint - (hint % 26)) / 26;
		    } else {
		      h = 0;
		    }

		    var r = bits % 26;
		    var s = Math.min((bits - r) / 26, this.length);
		    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
		    var maskedWords = extended;

		    h -= s;
		    h = Math.max(0, h);

		    // Extended mode, copy masked part
		    if (maskedWords) {
		      for (var i = 0; i < s; i++) {
		        maskedWords.words[i] = this.words[i];
		      }
		      maskedWords.length = s;
		    }

		    if (s === 0) ; else if (this.length > s) {
		      this.length -= s;
		      for (i = 0; i < this.length; i++) {
		        this.words[i] = this.words[i + s];
		      }
		    } else {
		      this.words[0] = 0;
		      this.length = 1;
		    }

		    var carry = 0;
		    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
		      var word = this.words[i] | 0;
		      this.words[i] = (carry << (26 - r)) | (word >>> r);
		      carry = word & mask;
		    }

		    // Push carried bits as a mask
		    if (maskedWords && carry !== 0) {
		      maskedWords.words[maskedWords.length++] = carry;
		    }

		    if (this.length === 0) {
		      this.words[0] = 0;
		      this.length = 1;
		    }

		    return this._strip();
		  };

		  BN.prototype.ishrn = function ishrn (bits, hint, extended) {
		    // TODO(indutny): implement me
		    assert(this.negative === 0);
		    return this.iushrn(bits, hint, extended);
		  };

		  // Shift-left
		  BN.prototype.shln = function shln (bits) {
		    return this.clone().ishln(bits);
		  };

		  BN.prototype.ushln = function ushln (bits) {
		    return this.clone().iushln(bits);
		  };

		  // Shift-right
		  BN.prototype.shrn = function shrn (bits) {
		    return this.clone().ishrn(bits);
		  };

		  BN.prototype.ushrn = function ushrn (bits) {
		    return this.clone().iushrn(bits);
		  };

		  // Test if n bit is set
		  BN.prototype.testn = function testn (bit) {
		    assert(typeof bit === 'number' && bit >= 0);
		    var r = bit % 26;
		    var s = (bit - r) / 26;
		    var q = 1 << r;

		    // Fast case: bit is much higher than all existing words
		    if (this.length <= s) return false;

		    // Check bit and return
		    var w = this.words[s];

		    return !!(w & q);
		  };

		  // Return only lowers bits of number (in-place)
		  BN.prototype.imaskn = function imaskn (bits) {
		    assert(typeof bits === 'number' && bits >= 0);
		    var r = bits % 26;
		    var s = (bits - r) / 26;

		    assert(this.negative === 0, 'imaskn works only with positive numbers');

		    if (this.length <= s) {
		      return this;
		    }

		    if (r !== 0) {
		      s++;
		    }
		    this.length = Math.min(s, this.length);

		    if (r !== 0) {
		      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
		      this.words[this.length - 1] &= mask;
		    }

		    return this._strip();
		  };

		  // Return only lowers bits of number
		  BN.prototype.maskn = function maskn (bits) {
		    return this.clone().imaskn(bits);
		  };

		  // Add plain number `num` to `this`
		  BN.prototype.iaddn = function iaddn (num) {
		    assert(typeof num === 'number');
		    assert(num < 0x4000000);
		    if (num < 0) return this.isubn(-num);

		    // Possible sign change
		    if (this.negative !== 0) {
		      if (this.length === 1 && (this.words[0] | 0) <= num) {
		        this.words[0] = num - (this.words[0] | 0);
		        this.negative = 0;
		        return this;
		      }

		      this.negative = 0;
		      this.isubn(num);
		      this.negative = 1;
		      return this;
		    }

		    // Add without checks
		    return this._iaddn(num);
		  };

		  BN.prototype._iaddn = function _iaddn (num) {
		    this.words[0] += num;

		    // Carry
		    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
		      this.words[i] -= 0x4000000;
		      if (i === this.length - 1) {
		        this.words[i + 1] = 1;
		      } else {
		        this.words[i + 1]++;
		      }
		    }
		    this.length = Math.max(this.length, i + 1);

		    return this;
		  };

		  // Subtract plain number `num` from `this`
		  BN.prototype.isubn = function isubn (num) {
		    assert(typeof num === 'number');
		    assert(num < 0x4000000);
		    if (num < 0) return this.iaddn(-num);

		    if (this.negative !== 0) {
		      this.negative = 0;
		      this.iaddn(num);
		      this.negative = 1;
		      return this;
		    }

		    this.words[0] -= num;

		    if (this.length === 1 && this.words[0] < 0) {
		      this.words[0] = -this.words[0];
		      this.negative = 1;
		    } else {
		      // Carry
		      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
		        this.words[i] += 0x4000000;
		        this.words[i + 1] -= 1;
		      }
		    }

		    return this._strip();
		  };

		  BN.prototype.addn = function addn (num) {
		    return this.clone().iaddn(num);
		  };

		  BN.prototype.subn = function subn (num) {
		    return this.clone().isubn(num);
		  };

		  BN.prototype.iabs = function iabs () {
		    this.negative = 0;

		    return this;
		  };

		  BN.prototype.abs = function abs () {
		    return this.clone().iabs();
		  };

		  BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
		    var len = num.length + shift;
		    var i;

		    this._expand(len);

		    var w;
		    var carry = 0;
		    for (i = 0; i < num.length; i++) {
		      w = (this.words[i + shift] | 0) + carry;
		      var right = (num.words[i] | 0) * mul;
		      w -= right & 0x3ffffff;
		      carry = (w >> 26) - ((right / 0x4000000) | 0);
		      this.words[i + shift] = w & 0x3ffffff;
		    }
		    for (; i < this.length - shift; i++) {
		      w = (this.words[i + shift] | 0) + carry;
		      carry = w >> 26;
		      this.words[i + shift] = w & 0x3ffffff;
		    }

		    if (carry === 0) return this._strip();

		    // Subtraction overflow
		    assert(carry === -1);
		    carry = 0;
		    for (i = 0; i < this.length; i++) {
		      w = -(this.words[i] | 0) + carry;
		      carry = w >> 26;
		      this.words[i] = w & 0x3ffffff;
		    }
		    this.negative = 1;

		    return this._strip();
		  };

		  BN.prototype._wordDiv = function _wordDiv (num, mode) {
		    var shift = this.length - num.length;

		    var a = this.clone();
		    var b = num;

		    // Normalize
		    var bhi = b.words[b.length - 1] | 0;
		    var bhiBits = this._countBits(bhi);
		    shift = 26 - bhiBits;
		    if (shift !== 0) {
		      b = b.ushln(shift);
		      a.iushln(shift);
		      bhi = b.words[b.length - 1] | 0;
		    }

		    // Initialize quotient
		    var m = a.length - b.length;
		    var q;

		    if (mode !== 'mod') {
		      q = new BN(null);
		      q.length = m + 1;
		      q.words = new Array(q.length);
		      for (var i = 0; i < q.length; i++) {
		        q.words[i] = 0;
		      }
		    }

		    var diff = a.clone()._ishlnsubmul(b, 1, m);
		    if (diff.negative === 0) {
		      a = diff;
		      if (q) {
		        q.words[m] = 1;
		      }
		    }

		    for (var j = m - 1; j >= 0; j--) {
		      var qj = (a.words[b.length + j] | 0) * 0x4000000 +
		        (a.words[b.length + j - 1] | 0);

		      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
		      // (0x7ffffff)
		      qj = Math.min((qj / bhi) | 0, 0x3ffffff);

		      a._ishlnsubmul(b, qj, j);
		      while (a.negative !== 0) {
		        qj--;
		        a.negative = 0;
		        a._ishlnsubmul(b, 1, j);
		        if (!a.isZero()) {
		          a.negative ^= 1;
		        }
		      }
		      if (q) {
		        q.words[j] = qj;
		      }
		    }
		    if (q) {
		      q._strip();
		    }
		    a._strip();

		    // Denormalize
		    if (mode !== 'div' && shift !== 0) {
		      a.iushrn(shift);
		    }

		    return {
		      div: q || null,
		      mod: a
		    };
		  };

		  // NOTE: 1) `mode` can be set to `mod` to request mod only,
		  //       to `div` to request div only, or be absent to
		  //       request both div & mod
		  //       2) `positive` is true if unsigned mod is requested
		  BN.prototype.divmod = function divmod (num, mode, positive) {
		    assert(!num.isZero());

		    if (this.isZero()) {
		      return {
		        div: new BN(0),
		        mod: new BN(0)
		      };
		    }

		    var div, mod, res;
		    if (this.negative !== 0 && num.negative === 0) {
		      res = this.neg().divmod(num, mode);

		      if (mode !== 'mod') {
		        div = res.div.neg();
		      }

		      if (mode !== 'div') {
		        mod = res.mod.neg();
		        if (positive && mod.negative !== 0) {
		          mod.iadd(num);
		        }
		      }

		      return {
		        div: div,
		        mod: mod
		      };
		    }

		    if (this.negative === 0 && num.negative !== 0) {
		      res = this.divmod(num.neg(), mode);

		      if (mode !== 'mod') {
		        div = res.div.neg();
		      }

		      return {
		        div: div,
		        mod: res.mod
		      };
		    }

		    if ((this.negative & num.negative) !== 0) {
		      res = this.neg().divmod(num.neg(), mode);

		      if (mode !== 'div') {
		        mod = res.mod.neg();
		        if (positive && mod.negative !== 0) {
		          mod.isub(num);
		        }
		      }

		      return {
		        div: res.div,
		        mod: mod
		      };
		    }

		    // Both numbers are positive at this point

		    // Strip both numbers to approximate shift value
		    if (num.length > this.length || this.cmp(num) < 0) {
		      return {
		        div: new BN(0),
		        mod: this
		      };
		    }

		    // Very short reduction
		    if (num.length === 1) {
		      if (mode === 'div') {
		        return {
		          div: this.divn(num.words[0]),
		          mod: null
		        };
		      }

		      if (mode === 'mod') {
		        return {
		          div: null,
		          mod: new BN(this.modrn(num.words[0]))
		        };
		      }

		      return {
		        div: this.divn(num.words[0]),
		        mod: new BN(this.modrn(num.words[0]))
		      };
		    }

		    return this._wordDiv(num, mode);
		  };

		  // Find `this` / `num`
		  BN.prototype.div = function div (num) {
		    return this.divmod(num, 'div', false).div;
		  };

		  // Find `this` % `num`
		  BN.prototype.mod = function mod (num) {
		    return this.divmod(num, 'mod', false).mod;
		  };

		  BN.prototype.umod = function umod (num) {
		    return this.divmod(num, 'mod', true).mod;
		  };

		  // Find Round(`this` / `num`)
		  BN.prototype.divRound = function divRound (num) {
		    var dm = this.divmod(num);

		    // Fast case - exact division
		    if (dm.mod.isZero()) return dm.div;

		    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

		    var half = num.ushrn(1);
		    var r2 = num.andln(1);
		    var cmp = mod.cmp(half);

		    // Round down
		    if (cmp < 0 || (r2 === 1 && cmp === 0)) return dm.div;

		    // Round up
		    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
		  };

		  BN.prototype.modrn = function modrn (num) {
		    var isNegNum = num < 0;
		    if (isNegNum) num = -num;

		    assert(num <= 0x3ffffff);
		    var p = (1 << 26) % num;

		    var acc = 0;
		    for (var i = this.length - 1; i >= 0; i--) {
		      acc = (p * acc + (this.words[i] | 0)) % num;
		    }

		    return isNegNum ? -acc : acc;
		  };

		  // WARNING: DEPRECATED
		  BN.prototype.modn = function modn (num) {
		    return this.modrn(num);
		  };

		  // In-place division by number
		  BN.prototype.idivn = function idivn (num) {
		    var isNegNum = num < 0;
		    if (isNegNum) num = -num;

		    assert(num <= 0x3ffffff);

		    var carry = 0;
		    for (var i = this.length - 1; i >= 0; i--) {
		      var w = (this.words[i] | 0) + carry * 0x4000000;
		      this.words[i] = (w / num) | 0;
		      carry = w % num;
		    }

		    this._strip();
		    return isNegNum ? this.ineg() : this;
		  };

		  BN.prototype.divn = function divn (num) {
		    return this.clone().idivn(num);
		  };

		  BN.prototype.egcd = function egcd (p) {
		    assert(p.negative === 0);
		    assert(!p.isZero());

		    var x = this;
		    var y = p.clone();

		    if (x.negative !== 0) {
		      x = x.umod(p);
		    } else {
		      x = x.clone();
		    }

		    // A * x + B * y = x
		    var A = new BN(1);
		    var B = new BN(0);

		    // C * x + D * y = y
		    var C = new BN(0);
		    var D = new BN(1);

		    var g = 0;

		    while (x.isEven() && y.isEven()) {
		      x.iushrn(1);
		      y.iushrn(1);
		      ++g;
		    }

		    var yp = y.clone();
		    var xp = x.clone();

		    while (!x.isZero()) {
		      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
		      if (i > 0) {
		        x.iushrn(i);
		        while (i-- > 0) {
		          if (A.isOdd() || B.isOdd()) {
		            A.iadd(yp);
		            B.isub(xp);
		          }

		          A.iushrn(1);
		          B.iushrn(1);
		        }
		      }

		      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
		      if (j > 0) {
		        y.iushrn(j);
		        while (j-- > 0) {
		          if (C.isOdd() || D.isOdd()) {
		            C.iadd(yp);
		            D.isub(xp);
		          }

		          C.iushrn(1);
		          D.iushrn(1);
		        }
		      }

		      if (x.cmp(y) >= 0) {
		        x.isub(y);
		        A.isub(C);
		        B.isub(D);
		      } else {
		        y.isub(x);
		        C.isub(A);
		        D.isub(B);
		      }
		    }

		    return {
		      a: C,
		      b: D,
		      gcd: y.iushln(g)
		    };
		  };

		  // This is reduced incarnation of the binary EEA
		  // above, designated to invert members of the
		  // _prime_ fields F(p) at a maximal speed
		  BN.prototype._invmp = function _invmp (p) {
		    assert(p.negative === 0);
		    assert(!p.isZero());

		    var a = this;
		    var b = p.clone();

		    if (a.negative !== 0) {
		      a = a.umod(p);
		    } else {
		      a = a.clone();
		    }

		    var x1 = new BN(1);
		    var x2 = new BN(0);

		    var delta = b.clone();

		    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
		      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
		      if (i > 0) {
		        a.iushrn(i);
		        while (i-- > 0) {
		          if (x1.isOdd()) {
		            x1.iadd(delta);
		          }

		          x1.iushrn(1);
		        }
		      }

		      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
		      if (j > 0) {
		        b.iushrn(j);
		        while (j-- > 0) {
		          if (x2.isOdd()) {
		            x2.iadd(delta);
		          }

		          x2.iushrn(1);
		        }
		      }

		      if (a.cmp(b) >= 0) {
		        a.isub(b);
		        x1.isub(x2);
		      } else {
		        b.isub(a);
		        x2.isub(x1);
		      }
		    }

		    var res;
		    if (a.cmpn(1) === 0) {
		      res = x1;
		    } else {
		      res = x2;
		    }

		    if (res.cmpn(0) < 0) {
		      res.iadd(p);
		    }

		    return res;
		  };

		  BN.prototype.gcd = function gcd (num) {
		    if (this.isZero()) return num.abs();
		    if (num.isZero()) return this.abs();

		    var a = this.clone();
		    var b = num.clone();
		    a.negative = 0;
		    b.negative = 0;

		    // Remove common factor of two
		    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
		      a.iushrn(1);
		      b.iushrn(1);
		    }

		    do {
		      while (a.isEven()) {
		        a.iushrn(1);
		      }
		      while (b.isEven()) {
		        b.iushrn(1);
		      }

		      var r = a.cmp(b);
		      if (r < 0) {
		        // Swap `a` and `b` to make `a` always bigger than `b`
		        var t = a;
		        a = b;
		        b = t;
		      } else if (r === 0 || b.cmpn(1) === 0) {
		        break;
		      }

		      a.isub(b);
		    } while (true);

		    return b.iushln(shift);
		  };

		  // Invert number in the field F(num)
		  BN.prototype.invm = function invm (num) {
		    return this.egcd(num).a.umod(num);
		  };

		  BN.prototype.isEven = function isEven () {
		    return (this.words[0] & 1) === 0;
		  };

		  BN.prototype.isOdd = function isOdd () {
		    return (this.words[0] & 1) === 1;
		  };

		  // And first word and num
		  BN.prototype.andln = function andln (num) {
		    return this.words[0] & num;
		  };

		  // Increment at the bit position in-line
		  BN.prototype.bincn = function bincn (bit) {
		    assert(typeof bit === 'number');
		    var r = bit % 26;
		    var s = (bit - r) / 26;
		    var q = 1 << r;

		    // Fast case: bit is much higher than all existing words
		    if (this.length <= s) {
		      this._expand(s + 1);
		      this.words[s] |= q;
		      return this;
		    }

		    // Add bit and propagate, if needed
		    var carry = q;
		    for (var i = s; carry !== 0 && i < this.length; i++) {
		      var w = this.words[i] | 0;
		      w += carry;
		      carry = w >>> 26;
		      w &= 0x3ffffff;
		      this.words[i] = w;
		    }
		    if (carry !== 0) {
		      this.words[i] = carry;
		      this.length++;
		    }
		    return this;
		  };

		  BN.prototype.isZero = function isZero () {
		    return this.length === 1 && this.words[0] === 0;
		  };

		  BN.prototype.cmpn = function cmpn (num) {
		    var negative = num < 0;

		    if (this.negative !== 0 && !negative) return -1;
		    if (this.negative === 0 && negative) return 1;

		    this._strip();

		    var res;
		    if (this.length > 1) {
		      res = 1;
		    } else {
		      if (negative) {
		        num = -num;
		      }

		      assert(num <= 0x3ffffff, 'Number is too big');

		      var w = this.words[0] | 0;
		      res = w === num ? 0 : w < num ? -1 : 1;
		    }
		    if (this.negative !== 0) return -res | 0;
		    return res;
		  };

		  // Compare two numbers and return:
		  // 1 - if `this` > `num`
		  // 0 - if `this` == `num`
		  // -1 - if `this` < `num`
		  BN.prototype.cmp = function cmp (num) {
		    if (this.negative !== 0 && num.negative === 0) return -1;
		    if (this.negative === 0 && num.negative !== 0) return 1;

		    var res = this.ucmp(num);
		    if (this.negative !== 0) return -res | 0;
		    return res;
		  };

		  // Unsigned comparison
		  BN.prototype.ucmp = function ucmp (num) {
		    // At this point both numbers have the same sign
		    if (this.length > num.length) return 1;
		    if (this.length < num.length) return -1;

		    var res = 0;
		    for (var i = this.length - 1; i >= 0; i--) {
		      var a = this.words[i] | 0;
		      var b = num.words[i] | 0;

		      if (a === b) continue;
		      if (a < b) {
		        res = -1;
		      } else if (a > b) {
		        res = 1;
		      }
		      break;
		    }
		    return res;
		  };

		  BN.prototype.gtn = function gtn (num) {
		    return this.cmpn(num) === 1;
		  };

		  BN.prototype.gt = function gt (num) {
		    return this.cmp(num) === 1;
		  };

		  BN.prototype.gten = function gten (num) {
		    return this.cmpn(num) >= 0;
		  };

		  BN.prototype.gte = function gte (num) {
		    return this.cmp(num) >= 0;
		  };

		  BN.prototype.ltn = function ltn (num) {
		    return this.cmpn(num) === -1;
		  };

		  BN.prototype.lt = function lt (num) {
		    return this.cmp(num) === -1;
		  };

		  BN.prototype.lten = function lten (num) {
		    return this.cmpn(num) <= 0;
		  };

		  BN.prototype.lte = function lte (num) {
		    return this.cmp(num) <= 0;
		  };

		  BN.prototype.eqn = function eqn (num) {
		    return this.cmpn(num) === 0;
		  };

		  BN.prototype.eq = function eq (num) {
		    return this.cmp(num) === 0;
		  };

		  //
		  // A reduce context, could be using montgomery or something better, depending
		  // on the `m` itself.
		  //
		  BN.red = function red (num) {
		    return new Red(num);
		  };

		  BN.prototype.toRed = function toRed (ctx) {
		    assert(!this.red, 'Already a number in reduction context');
		    assert(this.negative === 0, 'red works only with positives');
		    return ctx.convertTo(this)._forceRed(ctx);
		  };

		  BN.prototype.fromRed = function fromRed () {
		    assert(this.red, 'fromRed works only with numbers in reduction context');
		    return this.red.convertFrom(this);
		  };

		  BN.prototype._forceRed = function _forceRed (ctx) {
		    this.red = ctx;
		    return this;
		  };

		  BN.prototype.forceRed = function forceRed (ctx) {
		    assert(!this.red, 'Already a number in reduction context');
		    return this._forceRed(ctx);
		  };

		  BN.prototype.redAdd = function redAdd (num) {
		    assert(this.red, 'redAdd works only with red numbers');
		    return this.red.add(this, num);
		  };

		  BN.prototype.redIAdd = function redIAdd (num) {
		    assert(this.red, 'redIAdd works only with red numbers');
		    return this.red.iadd(this, num);
		  };

		  BN.prototype.redSub = function redSub (num) {
		    assert(this.red, 'redSub works only with red numbers');
		    return this.red.sub(this, num);
		  };

		  BN.prototype.redISub = function redISub (num) {
		    assert(this.red, 'redISub works only with red numbers');
		    return this.red.isub(this, num);
		  };

		  BN.prototype.redShl = function redShl (num) {
		    assert(this.red, 'redShl works only with red numbers');
		    return this.red.shl(this, num);
		  };

		  BN.prototype.redMul = function redMul (num) {
		    assert(this.red, 'redMul works only with red numbers');
		    this.red._verify2(this, num);
		    return this.red.mul(this, num);
		  };

		  BN.prototype.redIMul = function redIMul (num) {
		    assert(this.red, 'redMul works only with red numbers');
		    this.red._verify2(this, num);
		    return this.red.imul(this, num);
		  };

		  BN.prototype.redSqr = function redSqr () {
		    assert(this.red, 'redSqr works only with red numbers');
		    this.red._verify1(this);
		    return this.red.sqr(this);
		  };

		  BN.prototype.redISqr = function redISqr () {
		    assert(this.red, 'redISqr works only with red numbers');
		    this.red._verify1(this);
		    return this.red.isqr(this);
		  };

		  // Square root over p
		  BN.prototype.redSqrt = function redSqrt () {
		    assert(this.red, 'redSqrt works only with red numbers');
		    this.red._verify1(this);
		    return this.red.sqrt(this);
		  };

		  BN.prototype.redInvm = function redInvm () {
		    assert(this.red, 'redInvm works only with red numbers');
		    this.red._verify1(this);
		    return this.red.invm(this);
		  };

		  // Return negative clone of `this` % `red modulo`
		  BN.prototype.redNeg = function redNeg () {
		    assert(this.red, 'redNeg works only with red numbers');
		    this.red._verify1(this);
		    return this.red.neg(this);
		  };

		  BN.prototype.redPow = function redPow (num) {
		    assert(this.red && !num.red, 'redPow(normalNum)');
		    this.red._verify1(this);
		    return this.red.pow(this, num);
		  };

		  // Prime numbers with efficient reduction
		  var primes = {
		    k256: null,
		    p224: null,
		    p192: null,
		    p25519: null
		  };

		  // Pseudo-Mersenne prime
		  function MPrime (name, p) {
		    // P = 2 ^ N - K
		    this.name = name;
		    this.p = new BN(p, 16);
		    this.n = this.p.bitLength();
		    this.k = new BN(1).iushln(this.n).isub(this.p);

		    this.tmp = this._tmp();
		  }

		  MPrime.prototype._tmp = function _tmp () {
		    var tmp = new BN(null);
		    tmp.words = new Array(Math.ceil(this.n / 13));
		    return tmp;
		  };

		  MPrime.prototype.ireduce = function ireduce (num) {
		    // Assumes that `num` is less than `P^2`
		    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
		    var r = num;
		    var rlen;

		    do {
		      this.split(r, this.tmp);
		      r = this.imulK(r);
		      r = r.iadd(this.tmp);
		      rlen = r.bitLength();
		    } while (rlen > this.n);

		    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
		    if (cmp === 0) {
		      r.words[0] = 0;
		      r.length = 1;
		    } else if (cmp > 0) {
		      r.isub(this.p);
		    } else {
		      if (r.strip !== undefined) {
		        // r is a BN v4 instance
		        r.strip();
		      } else {
		        // r is a BN v5 instance
		        r._strip();
		      }
		    }

		    return r;
		  };

		  MPrime.prototype.split = function split (input, out) {
		    input.iushrn(this.n, 0, out);
		  };

		  MPrime.prototype.imulK = function imulK (num) {
		    return num.imul(this.k);
		  };

		  function K256 () {
		    MPrime.call(
		      this,
		      'k256',
		      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
		  }
		  inherits(K256, MPrime);

		  K256.prototype.split = function split (input, output) {
		    // 256 = 9 * 26 + 22
		    var mask = 0x3fffff;

		    var outLen = Math.min(input.length, 9);
		    for (var i = 0; i < outLen; i++) {
		      output.words[i] = input.words[i];
		    }
		    output.length = outLen;

		    if (input.length <= 9) {
		      input.words[0] = 0;
		      input.length = 1;
		      return;
		    }

		    // Shift by 9 limbs
		    var prev = input.words[9];
		    output.words[output.length++] = prev & mask;

		    for (i = 10; i < input.length; i++) {
		      var next = input.words[i] | 0;
		      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
		      prev = next;
		    }
		    prev >>>= 22;
		    input.words[i - 10] = prev;
		    if (prev === 0 && input.length > 10) {
		      input.length -= 10;
		    } else {
		      input.length -= 9;
		    }
		  };

		  K256.prototype.imulK = function imulK (num) {
		    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
		    num.words[num.length] = 0;
		    num.words[num.length + 1] = 0;
		    num.length += 2;

		    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
		    var lo = 0;
		    for (var i = 0; i < num.length; i++) {
		      var w = num.words[i] | 0;
		      lo += w * 0x3d1;
		      num.words[i] = lo & 0x3ffffff;
		      lo = w * 0x40 + ((lo / 0x4000000) | 0);
		    }

		    // Fast length reduction
		    if (num.words[num.length - 1] === 0) {
		      num.length--;
		      if (num.words[num.length - 1] === 0) {
		        num.length--;
		      }
		    }
		    return num;
		  };

		  function P224 () {
		    MPrime.call(
		      this,
		      'p224',
		      'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
		  }
		  inherits(P224, MPrime);

		  function P192 () {
		    MPrime.call(
		      this,
		      'p192',
		      'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
		  }
		  inherits(P192, MPrime);

		  function P25519 () {
		    // 2 ^ 255 - 19
		    MPrime.call(
		      this,
		      '25519',
		      '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
		  }
		  inherits(P25519, MPrime);

		  P25519.prototype.imulK = function imulK (num) {
		    // K = 0x13
		    var carry = 0;
		    for (var i = 0; i < num.length; i++) {
		      var hi = (num.words[i] | 0) * 0x13 + carry;
		      var lo = hi & 0x3ffffff;
		      hi >>>= 26;

		      num.words[i] = lo;
		      carry = hi;
		    }
		    if (carry !== 0) {
		      num.words[num.length++] = carry;
		    }
		    return num;
		  };

		  // Exported mostly for testing purposes, use plain name instead
		  BN._prime = function prime (name) {
		    // Cached version of prime
		    if (primes[name]) return primes[name];

		    var prime;
		    if (name === 'k256') {
		      prime = new K256();
		    } else if (name === 'p224') {
		      prime = new P224();
		    } else if (name === 'p192') {
		      prime = new P192();
		    } else if (name === 'p25519') {
		      prime = new P25519();
		    } else {
		      throw new Error('Unknown prime ' + name);
		    }
		    primes[name] = prime;

		    return prime;
		  };

		  //
		  // Base reduction engine
		  //
		  function Red (m) {
		    if (typeof m === 'string') {
		      var prime = BN._prime(m);
		      this.m = prime.p;
		      this.prime = prime;
		    } else {
		      assert(m.gtn(1), 'modulus must be greater than 1');
		      this.m = m;
		      this.prime = null;
		    }
		  }

		  Red.prototype._verify1 = function _verify1 (a) {
		    assert(a.negative === 0, 'red works only with positives');
		    assert(a.red, 'red works only with red numbers');
		  };

		  Red.prototype._verify2 = function _verify2 (a, b) {
		    assert((a.negative | b.negative) === 0, 'red works only with positives');
		    assert(a.red && a.red === b.red,
		      'red works only with red numbers');
		  };

		  Red.prototype.imod = function imod (a) {
		    if (this.prime) return this.prime.ireduce(a)._forceRed(this);

		    move(a, a.umod(this.m)._forceRed(this));
		    return a;
		  };

		  Red.prototype.neg = function neg (a) {
		    if (a.isZero()) {
		      return a.clone();
		    }

		    return this.m.sub(a)._forceRed(this);
		  };

		  Red.prototype.add = function add (a, b) {
		    this._verify2(a, b);

		    var res = a.add(b);
		    if (res.cmp(this.m) >= 0) {
		      res.isub(this.m);
		    }
		    return res._forceRed(this);
		  };

		  Red.prototype.iadd = function iadd (a, b) {
		    this._verify2(a, b);

		    var res = a.iadd(b);
		    if (res.cmp(this.m) >= 0) {
		      res.isub(this.m);
		    }
		    return res;
		  };

		  Red.prototype.sub = function sub (a, b) {
		    this._verify2(a, b);

		    var res = a.sub(b);
		    if (res.cmpn(0) < 0) {
		      res.iadd(this.m);
		    }
		    return res._forceRed(this);
		  };

		  Red.prototype.isub = function isub (a, b) {
		    this._verify2(a, b);

		    var res = a.isub(b);
		    if (res.cmpn(0) < 0) {
		      res.iadd(this.m);
		    }
		    return res;
		  };

		  Red.prototype.shl = function shl (a, num) {
		    this._verify1(a);
		    return this.imod(a.ushln(num));
		  };

		  Red.prototype.imul = function imul (a, b) {
		    this._verify2(a, b);
		    return this.imod(a.imul(b));
		  };

		  Red.prototype.mul = function mul (a, b) {
		    this._verify2(a, b);
		    return this.imod(a.mul(b));
		  };

		  Red.prototype.isqr = function isqr (a) {
		    return this.imul(a, a.clone());
		  };

		  Red.prototype.sqr = function sqr (a) {
		    return this.mul(a, a);
		  };

		  Red.prototype.sqrt = function sqrt (a) {
		    if (a.isZero()) return a.clone();

		    var mod3 = this.m.andln(3);
		    assert(mod3 % 2 === 1);

		    // Fast case
		    if (mod3 === 3) {
		      var pow = this.m.add(new BN(1)).iushrn(2);
		      return this.pow(a, pow);
		    }

		    // Tonelli-Shanks algorithm (Totally unoptimized and slow)
		    //
		    // Find Q and S, that Q * 2 ^ S = (P - 1)
		    var q = this.m.subn(1);
		    var s = 0;
		    while (!q.isZero() && q.andln(1) === 0) {
		      s++;
		      q.iushrn(1);
		    }
		    assert(!q.isZero());

		    var one = new BN(1).toRed(this);
		    var nOne = one.redNeg();

		    // Find quadratic non-residue
		    // NOTE: Max is such because of generalized Riemann hypothesis.
		    var lpow = this.m.subn(1).iushrn(1);
		    var z = this.m.bitLength();
		    z = new BN(2 * z * z).toRed(this);

		    while (this.pow(z, lpow).cmp(nOne) !== 0) {
		      z.redIAdd(nOne);
		    }

		    var c = this.pow(z, q);
		    var r = this.pow(a, q.addn(1).iushrn(1));
		    var t = this.pow(a, q);
		    var m = s;
		    while (t.cmp(one) !== 0) {
		      var tmp = t;
		      for (var i = 0; tmp.cmp(one) !== 0; i++) {
		        tmp = tmp.redSqr();
		      }
		      assert(i < m);
		      var b = this.pow(c, new BN(1).iushln(m - i - 1));

		      r = r.redMul(b);
		      c = b.redSqr();
		      t = t.redMul(c);
		      m = i;
		    }

		    return r;
		  };

		  Red.prototype.invm = function invm (a) {
		    var inv = a._invmp(this.m);
		    if (inv.negative !== 0) {
		      inv.negative = 0;
		      return this.imod(inv).redNeg();
		    } else {
		      return this.imod(inv);
		    }
		  };

		  Red.prototype.pow = function pow (a, num) {
		    if (num.isZero()) return new BN(1).toRed(this);
		    if (num.cmpn(1) === 0) return a.clone();

		    var windowSize = 4;
		    var wnd = new Array(1 << windowSize);
		    wnd[0] = new BN(1).toRed(this);
		    wnd[1] = a;
		    for (var i = 2; i < wnd.length; i++) {
		      wnd[i] = this.mul(wnd[i - 1], a);
		    }

		    var res = wnd[0];
		    var current = 0;
		    var currentLen = 0;
		    var start = num.bitLength() % 26;
		    if (start === 0) {
		      start = 26;
		    }

		    for (i = num.length - 1; i >= 0; i--) {
		      var word = num.words[i];
		      for (var j = start - 1; j >= 0; j--) {
		        var bit = (word >> j) & 1;
		        if (res !== wnd[0]) {
		          res = this.sqr(res);
		        }

		        if (bit === 0 && current === 0) {
		          currentLen = 0;
		          continue;
		        }

		        current <<= 1;
		        current |= bit;
		        currentLen++;
		        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

		        res = this.mul(res, wnd[current]);
		        currentLen = 0;
		        current = 0;
		      }
		      start = 26;
		    }

		    return res;
		  };

		  Red.prototype.convertTo = function convertTo (num) {
		    var r = num.umod(this.m);

		    return r === num ? r.clone() : r;
		  };

		  Red.prototype.convertFrom = function convertFrom (num) {
		    var res = num.clone();
		    res.red = null;
		    return res;
		  };

		  //
		  // Montgomery method engine
		  //

		  BN.mont = function mont (num) {
		    return new Mont(num);
		  };

		  function Mont (m) {
		    Red.call(this, m);

		    this.shift = this.m.bitLength();
		    if (this.shift % 26 !== 0) {
		      this.shift += 26 - (this.shift % 26);
		    }

		    this.r = new BN(1).iushln(this.shift);
		    this.r2 = this.imod(this.r.sqr());
		    this.rinv = this.r._invmp(this.m);

		    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
		    this.minv = this.minv.umod(this.r);
		    this.minv = this.r.sub(this.minv);
		  }
		  inherits(Mont, Red);

		  Mont.prototype.convertTo = function convertTo (num) {
		    return this.imod(num.ushln(this.shift));
		  };

		  Mont.prototype.convertFrom = function convertFrom (num) {
		    var r = this.imod(num.mul(this.rinv));
		    r.red = null;
		    return r;
		  };

		  Mont.prototype.imul = function imul (a, b) {
		    if (a.isZero() || b.isZero()) {
		      a.words[0] = 0;
		      a.length = 1;
		      return a;
		    }

		    var t = a.imul(b);
		    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
		    var u = t.isub(c).iushrn(this.shift);
		    var res = u;

		    if (u.cmp(this.m) >= 0) {
		      res = u.isub(this.m);
		    } else if (u.cmpn(0) < 0) {
		      res = u.iadd(this.m);
		    }

		    return res._forceRed(this);
		  };

		  Mont.prototype.mul = function mul (a, b) {
		    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

		    var t = a.mul(b);
		    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
		    var u = t.isub(c).iushrn(this.shift);
		    var res = u;
		    if (u.cmp(this.m) >= 0) {
		      res = u.isub(this.m);
		    } else if (u.cmpn(0) < 0) {
		      res = u.iadd(this.m);
		    }

		    return res._forceRed(this);
		  };

		  Mont.prototype.invm = function invm (a) {
		    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
		    var res = this.imod(a._invmp(this.m).mul(this.r2));
		    return res._forceRed(this);
		  };
		})(module, commonjsGlobal);
	} (bn));

	var BN = bn.exports;

	var safeBuffer = {exports: {}};

	/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

	(function (module, exports) {
		/* eslint-disable node/no-deprecated-api */
		var buffer$1 = buffer;
		var Buffer = buffer$1.Buffer;

		// alternative to using Object.keys for old browsers
		function copyProps (src, dst) {
		  for (var key in src) {
		    dst[key] = src[key];
		  }
		}
		if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
		  module.exports = buffer$1;
		} else {
		  // Copy properties from require('buffer')
		  copyProps(buffer$1, exports);
		  exports.Buffer = SafeBuffer;
		}

		function SafeBuffer (arg, encodingOrOffset, length) {
		  return Buffer(arg, encodingOrOffset, length)
		}

		SafeBuffer.prototype = Object.create(Buffer.prototype);

		// Copy static methods from Buffer
		copyProps(Buffer, SafeBuffer);

		SafeBuffer.from = function (arg, encodingOrOffset, length) {
		  if (typeof arg === 'number') {
		    throw new TypeError('Argument must not be a number')
		  }
		  return Buffer(arg, encodingOrOffset, length)
		};

		SafeBuffer.alloc = function (size, fill, encoding) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  var buf = Buffer(size);
		  if (fill !== undefined) {
		    if (typeof encoding === 'string') {
		      buf.fill(fill, encoding);
		    } else {
		      buf.fill(fill);
		    }
		  } else {
		    buf.fill(0);
		  }
		  return buf
		};

		SafeBuffer.allocUnsafe = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return Buffer(size)
		};

		SafeBuffer.allocUnsafeSlow = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return buffer$1.SlowBuffer(size)
		};
	} (safeBuffer, safeBuffer.exports));

	// base-x encoding / decoding
	// Copyright (c) 2018 base-x contributors
	// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
	// Distributed under the MIT software license, see the accompanying
	// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
	// @ts-ignore
	var _Buffer = safeBuffer.exports.Buffer;
	function base (ALPHABET) {
	  if (ALPHABET.length >= 255) { throw new TypeError('Alphabet too long') }
	  var BASE_MAP = new Uint8Array(256);
	  for (var j = 0; j < BASE_MAP.length; j++) {
	    BASE_MAP[j] = 255;
	  }
	  for (var i = 0; i < ALPHABET.length; i++) {
	    var x = ALPHABET.charAt(i);
	    var xc = x.charCodeAt(0);
	    if (BASE_MAP[xc] !== 255) { throw new TypeError(x + ' is ambiguous') }
	    BASE_MAP[xc] = i;
	  }
	  var BASE = ALPHABET.length;
	  var LEADER = ALPHABET.charAt(0);
	  var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
	  var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
	  function encode (source) {
	    if (Array.isArray(source) || source instanceof Uint8Array) { source = _Buffer.from(source); }
	    if (!_Buffer.isBuffer(source)) { throw new TypeError('Expected Buffer') }
	    if (source.length === 0) { return '' }
	        // Skip & count leading zeroes.
	    var zeroes = 0;
	    var length = 0;
	    var pbegin = 0;
	    var pend = source.length;
	    while (pbegin !== pend && source[pbegin] === 0) {
	      pbegin++;
	      zeroes++;
	    }
	        // Allocate enough space in big-endian base58 representation.
	    var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
	    var b58 = new Uint8Array(size);
	        // Process the bytes.
	    while (pbegin !== pend) {
	      var carry = source[pbegin];
	            // Apply "b58 = b58 * 256 + ch".
	      var i = 0;
	      for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
	        carry += (256 * b58[it1]) >>> 0;
	        b58[it1] = (carry % BASE) >>> 0;
	        carry = (carry / BASE) >>> 0;
	      }
	      if (carry !== 0) { throw new Error('Non-zero carry') }
	      length = i;
	      pbegin++;
	    }
	        // Skip leading zeroes in base58 result.
	    var it2 = size - length;
	    while (it2 !== size && b58[it2] === 0) {
	      it2++;
	    }
	        // Translate the result into a string.
	    var str = LEADER.repeat(zeroes);
	    for (; it2 < size; ++it2) { str += ALPHABET.charAt(b58[it2]); }
	    return str
	  }
	  function decodeUnsafe (source) {
	    if (typeof source !== 'string') { throw new TypeError('Expected String') }
	    if (source.length === 0) { return _Buffer.alloc(0) }
	    var psz = 0;
	        // Skip and count leading '1's.
	    var zeroes = 0;
	    var length = 0;
	    while (source[psz] === LEADER) {
	      zeroes++;
	      psz++;
	    }
	        // Allocate enough space in big-endian base256 representation.
	    var size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
	    var b256 = new Uint8Array(size);
	        // Process the characters.
	    while (source[psz]) {
	            // Decode character
	      var carry = BASE_MAP[source.charCodeAt(psz)];
	            // Invalid character
	      if (carry === 255) { return }
	      var i = 0;
	      for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
	        carry += (BASE * b256[it3]) >>> 0;
	        b256[it3] = (carry % 256) >>> 0;
	        carry = (carry / 256) >>> 0;
	      }
	      if (carry !== 0) { throw new Error('Non-zero carry') }
	      length = i;
	      psz++;
	    }
	        // Skip leading zeroes in b256.
	    var it4 = size - length;
	    while (it4 !== size && b256[it4] === 0) {
	      it4++;
	    }
	    var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
	    vch.fill(0x00, 0, zeroes);
	    var j = zeroes;
	    while (it4 !== size) {
	      vch[j++] = b256[it4++];
	    }
	    return vch
	  }
	  function decode (string) {
	    var buffer = decodeUnsafe(string);
	    if (buffer) { return buffer }
	    throw new Error('Non-base' + BASE + ' character')
	  }
	  return {
	    encode: encode,
	    decodeUnsafe: decodeUnsafe,
	    decode: decode
	  }
	}
	var src = base;

	var basex = src;
	var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

	var bs58 = basex(ALPHABET);

	var bs58$1 = bs58;

	// Choice: a ? b : c
	const Chi = (a, b, c) => (a & b) ^ (~a & c);
	// Majority function, true if any two inpust is true
	const Maj = (a, b, c) => (a & b) ^ (a & c) ^ (b & c);
	// Round constants:
	// first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311)
	// prettier-ignore
	const SHA256_K = new Uint32Array([
	    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
	    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
	    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
	    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
	    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
	    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
	    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
	    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	]);
	// Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
	// prettier-ignore
	const IV = new Uint32Array([
	    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
	]);
	// Temporary buffer, not used to store anything between runs
	// Named this way because it matches specification.
	const SHA256_W = new Uint32Array(64);
	class SHA256 extends SHA2 {
	    constructor() {
	        super(64, 32, 8, false);
	        // We cannot use array here since array allows indexing by variable
	        // which means optimizer/compiler cannot use registers.
	        this.A = IV[0] | 0;
	        this.B = IV[1] | 0;
	        this.C = IV[2] | 0;
	        this.D = IV[3] | 0;
	        this.E = IV[4] | 0;
	        this.F = IV[5] | 0;
	        this.G = IV[6] | 0;
	        this.H = IV[7] | 0;
	    }
	    get() {
	        const { A, B, C, D, E, F, G, H } = this;
	        return [A, B, C, D, E, F, G, H];
	    }
	    // prettier-ignore
	    set(A, B, C, D, E, F, G, H) {
	        this.A = A | 0;
	        this.B = B | 0;
	        this.C = C | 0;
	        this.D = D | 0;
	        this.E = E | 0;
	        this.F = F | 0;
	        this.G = G | 0;
	        this.H = H | 0;
	    }
	    process(view, offset) {
	        // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
	        for (let i = 0; i < 16; i++, offset += 4)
	            SHA256_W[i] = view.getUint32(offset, false);
	        for (let i = 16; i < 64; i++) {
	            const W15 = SHA256_W[i - 15];
	            const W2 = SHA256_W[i - 2];
	            const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ (W15 >>> 3);
	            const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ (W2 >>> 10);
	            SHA256_W[i] = (s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16]) | 0;
	        }
	        // Compression function main loop, 64 rounds
	        let { A, B, C, D, E, F, G, H } = this;
	        for (let i = 0; i < 64; i++) {
	            const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
	            const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
	            const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
	            const T2 = (sigma0 + Maj(A, B, C)) | 0;
	            H = G;
	            G = F;
	            F = E;
	            E = (D + T1) | 0;
	            D = C;
	            C = B;
	            B = A;
	            A = (T1 + T2) | 0;
	        }
	        // Add the compressed chunk to the current hash value
	        A = (A + this.A) | 0;
	        B = (B + this.B) | 0;
	        C = (C + this.C) | 0;
	        D = (D + this.D) | 0;
	        E = (E + this.E) | 0;
	        F = (F + this.F) | 0;
	        G = (G + this.G) | 0;
	        H = (H + this.H) | 0;
	        this.set(A, B, C, D, E, F, G, H);
	    }
	    roundClean() {
	        SHA256_W.fill(0);
	    }
	    destroy() {
	        this.set(0, 0, 0, 0, 0, 0, 0, 0);
	        this.buffer.fill(0);
	    }
	}
	/**
	 * SHA2-256 hash function
	 * @param message - data that would be hashed
	 */
	const sha256 = wrapConstructor(() => new SHA256());

	var lib = {};

	var encoding_lib = {};

	// This is free and unencumbered software released into the public domain.
	// See LICENSE.md for more information.

	//
	// Utilities
	//

	/**
	 * @param {number} a The number to test.
	 * @param {number} min The minimum value in the range, inclusive.
	 * @param {number} max The maximum value in the range, inclusive.
	 * @return {boolean} True if a >= min and a <= max.
	 */
	function inRange(a, min, max) {
	  return min <= a && a <= max;
	}

	/**
	 * @param {*} o
	 * @return {Object}
	 */
	function ToDictionary(o) {
	  if (o === undefined) return {};
	  if (o === Object(o)) return o;
	  throw TypeError('Could not convert argument to dictionary');
	}

	/**
	 * @param {string} string Input string of UTF-16 code units.
	 * @return {!Array.<number>} Code points.
	 */
	function stringToCodePoints(string) {
	  // https://heycam.github.io/webidl/#dfn-obtain-unicode

	  // 1. Let S be the DOMString value.
	  var s = String(string);

	  // 2. Let n be the length of S.
	  var n = s.length;

	  // 3. Initialize i to 0.
	  var i = 0;

	  // 4. Initialize U to be an empty sequence of Unicode characters.
	  var u = [];

	  // 5. While i < n:
	  while (i < n) {

	    // 1. Let c be the code unit in S at index i.
	    var c = s.charCodeAt(i);

	    // 2. Depending on the value of c:

	    // c < 0xD800 or c > 0xDFFF
	    if (c < 0xD800 || c > 0xDFFF) {
	      // Append to U the Unicode character with code point c.
	      u.push(c);
	    }

	    // 0xDC00 ≤ c ≤ 0xDFFF
	    else if (0xDC00 <= c && c <= 0xDFFF) {
	      // Append to U a U+FFFD REPLACEMENT CHARACTER.
	      u.push(0xFFFD);
	    }

	    // 0xD800 ≤ c ≤ 0xDBFF
	    else if (0xD800 <= c && c <= 0xDBFF) {
	      // 1. If i = n−1, then append to U a U+FFFD REPLACEMENT
	      // CHARACTER.
	      if (i === n - 1) {
	        u.push(0xFFFD);
	      }
	      // 2. Otherwise, i < n−1:
	      else {
	        // 1. Let d be the code unit in S at index i+1.
	        var d = string.charCodeAt(i + 1);

	        // 2. If 0xDC00 ≤ d ≤ 0xDFFF, then:
	        if (0xDC00 <= d && d <= 0xDFFF) {
	          // 1. Let a be c & 0x3FF.
	          var a = c & 0x3FF;

	          // 2. Let b be d & 0x3FF.
	          var b = d & 0x3FF;

	          // 3. Append to U the Unicode character with code point
	          // 2^16+2^10*a+b.
	          u.push(0x10000 + (a << 10) + b);

	          // 4. Set i to i+1.
	          i += 1;
	        }

	        // 3. Otherwise, d < 0xDC00 or d > 0xDFFF. Append to U a
	        // U+FFFD REPLACEMENT CHARACTER.
	        else  {
	          u.push(0xFFFD);
	        }
	      }
	    }

	    // 3. Set i to i+1.
	    i += 1;
	  }

	  // 6. Return U.
	  return u;
	}

	/**
	 * @param {!Array.<number>} code_points Array of code points.
	 * @return {string} string String of UTF-16 code units.
	 */
	function codePointsToString(code_points) {
	  var s = '';
	  for (var i = 0; i < code_points.length; ++i) {
	    var cp = code_points[i];
	    if (cp <= 0xFFFF) {
	      s += String.fromCharCode(cp);
	    } else {
	      cp -= 0x10000;
	      s += String.fromCharCode((cp >> 10) + 0xD800,
	                               (cp & 0x3FF) + 0xDC00);
	    }
	  }
	  return s;
	}


	//
	// Implementation of Encoding specification
	// https://encoding.spec.whatwg.org/
	//

	//
	// 3. Terminology
	//

	/**
	 * End-of-stream is a special token that signifies no more tokens
	 * are in the stream.
	 * @const
	 */ var end_of_stream = -1;

	/**
	 * A stream represents an ordered sequence of tokens.
	 *
	 * @constructor
	 * @param {!(Array.<number>|Uint8Array)} tokens Array of tokens that provide the
	 * stream.
	 */
	function Stream(tokens) {
	  /** @type {!Array.<number>} */
	  this.tokens = [].slice.call(tokens);
	}

	Stream.prototype = {
	  /**
	   * @return {boolean} True if end-of-stream has been hit.
	   */
	  endOfStream: function() {
	    return !this.tokens.length;
	  },

	  /**
	   * When a token is read from a stream, the first token in the
	   * stream must be returned and subsequently removed, and
	   * end-of-stream must be returned otherwise.
	   *
	   * @return {number} Get the next token from the stream, or
	   * end_of_stream.
	   */
	   read: function() {
	    if (!this.tokens.length)
	      return end_of_stream;
	     return this.tokens.shift();
	   },

	  /**
	   * When one or more tokens are prepended to a stream, those tokens
	   * must be inserted, in given order, before the first token in the
	   * stream.
	   *
	   * @param {(number|!Array.<number>)} token The token(s) to prepend to the stream.
	   */
	  prepend: function(token) {
	    if (Array.isArray(token)) {
	      var tokens = /**@type {!Array.<number>}*/(token);
	      while (tokens.length)
	        this.tokens.unshift(tokens.pop());
	    } else {
	      this.tokens.unshift(token);
	    }
	  },

	  /**
	   * When one or more tokens are pushed to a stream, those tokens
	   * must be inserted, in given order, after the last token in the
	   * stream.
	   *
	   * @param {(number|!Array.<number>)} token The tokens(s) to prepend to the stream.
	   */
	  push: function(token) {
	    if (Array.isArray(token)) {
	      var tokens = /**@type {!Array.<number>}*/(token);
	      while (tokens.length)
	        this.tokens.push(tokens.shift());
	    } else {
	      this.tokens.push(token);
	    }
	  }
	};

	//
	// 4. Encodings
	//

	// 4.1 Encoders and decoders

	/** @const */
	var finished = -1;

	/**
	 * @param {boolean} fatal If true, decoding errors raise an exception.
	 * @param {number=} opt_code_point Override the standard fallback code point.
	 * @return {number} The code point to insert on a decoding error.
	 */
	function decoderError(fatal, opt_code_point) {
	  if (fatal)
	    throw TypeError('Decoder error');
	  return opt_code_point || 0xFFFD;
	}

	//
	// 7. API
	//

	/** @const */ var DEFAULT_ENCODING = 'utf-8';

	// 7.1 Interface TextDecoder

	/**
	 * @constructor
	 * @param {string=} encoding The label of the encoding;
	 *     defaults to 'utf-8'.
	 * @param {Object=} options
	 */
	function TextDecoder$1(encoding, options) {
	  if (!(this instanceof TextDecoder$1)) {
	    return new TextDecoder$1(encoding, options);
	  }
	  encoding = encoding !== undefined ? String(encoding).toLowerCase() : DEFAULT_ENCODING;
	  if (encoding !== DEFAULT_ENCODING) {
	    throw new Error('Encoding not supported. Only utf-8 is supported');
	  }
	  options = ToDictionary(options);

	  /** @private @type {boolean} */
	  this._streaming = false;
	  /** @private @type {boolean} */
	  this._BOMseen = false;
	  /** @private @type {?Decoder} */
	  this._decoder = null;
	  /** @private @type {boolean} */
	  this._fatal = Boolean(options['fatal']);
	  /** @private @type {boolean} */
	  this._ignoreBOM = Boolean(options['ignoreBOM']);

	  Object.defineProperty(this, 'encoding', {value: 'utf-8'});
	  Object.defineProperty(this, 'fatal', {value: this._fatal});
	  Object.defineProperty(this, 'ignoreBOM', {value: this._ignoreBOM});
	}

	TextDecoder$1.prototype = {
	  /**
	   * @param {ArrayBufferView=} input The buffer of bytes to decode.
	   * @param {Object=} options
	   * @return {string} The decoded string.
	   */
	  decode: function decode(input, options) {
	    var bytes;
	    if (typeof input === 'object' && input instanceof ArrayBuffer) {
	      bytes = new Uint8Array(input);
	    } else if (typeof input === 'object' && 'buffer' in input &&
	               input.buffer instanceof ArrayBuffer) {
	      bytes = new Uint8Array(input.buffer,
	                             input.byteOffset,
	                             input.byteLength);
	    } else {
	      bytes = new Uint8Array(0);
	    }

	    options = ToDictionary(options);

	    if (!this._streaming) {
	      this._decoder = new UTF8Decoder({fatal: this._fatal});
	      this._BOMseen = false;
	    }
	    this._streaming = Boolean(options['stream']);

	    var input_stream = new Stream(bytes);

	    var code_points = [];

	    /** @type {?(number|!Array.<number>)} */
	    var result;

	    while (!input_stream.endOfStream()) {
	      result = this._decoder.handler(input_stream, input_stream.read());
	      if (result === finished)
	        break;
	      if (result === null)
	        continue;
	      if (Array.isArray(result))
	        code_points.push.apply(code_points, /**@type {!Array.<number>}*/(result));
	      else
	        code_points.push(result);
	    }
	    if (!this._streaming) {
	      do {
	        result = this._decoder.handler(input_stream, input_stream.read());
	        if (result === finished)
	          break;
	        if (result === null)
	          continue;
	        if (Array.isArray(result))
	          code_points.push.apply(code_points, /**@type {!Array.<number>}*/(result));
	        else
	          code_points.push(result);
	      } while (!input_stream.endOfStream());
	      this._decoder = null;
	    }

	    if (code_points.length) {
	      // If encoding is one of utf-8, utf-16be, and utf-16le, and
	      // ignore BOM flag and BOM seen flag are unset, run these
	      // subsubsteps:
	      if (['utf-8'].indexOf(this.encoding) !== -1 &&
	          !this._ignoreBOM && !this._BOMseen) {
	        // If token is U+FEFF, set BOM seen flag.
	        if (code_points[0] === 0xFEFF) {
	          this._BOMseen = true;
	          code_points.shift();
	        } else {
	          // Otherwise, if token is not end-of-stream, set BOM seen
	          // flag and append token to output.
	          this._BOMseen = true;
	        }
	      }
	    }

	    return codePointsToString(code_points);
	  }
	};

	// 7.2 Interface TextEncoder

	/**
	 * @constructor
	 * @param {string=} encoding The label of the encoding;
	 *     defaults to 'utf-8'.
	 * @param {Object=} options
	 */
	function TextEncoder$1(encoding, options) {
	  if (!(this instanceof TextEncoder$1))
	    return new TextEncoder$1(encoding, options);
	  encoding = encoding !== undefined ? String(encoding).toLowerCase() : DEFAULT_ENCODING;
	  if (encoding !== DEFAULT_ENCODING) {
	    throw new Error('Encoding not supported. Only utf-8 is supported');
	  }
	  options = ToDictionary(options);

	  /** @private @type {boolean} */
	  this._streaming = false;
	  /** @private @type {?Encoder} */
	  this._encoder = null;
	  /** @private @type {{fatal: boolean}} */
	  this._options = {fatal: Boolean(options['fatal'])};

	  Object.defineProperty(this, 'encoding', {value: 'utf-8'});
	}

	TextEncoder$1.prototype = {
	  /**
	   * @param {string=} opt_string The string to encode.
	   * @param {Object=} options
	   * @return {Uint8Array} Encoded bytes, as a Uint8Array.
	   */
	  encode: function encode(opt_string, options) {
	    opt_string = opt_string ? String(opt_string) : '';
	    options = ToDictionary(options);

	    // NOTE: This option is nonstandard. None of the encodings
	    // permitted for encoding (i.e. UTF-8, UTF-16) are stateful,
	    // so streaming is not necessary.
	    if (!this._streaming)
	      this._encoder = new UTF8Encoder(this._options);
	    this._streaming = Boolean(options['stream']);

	    var bytes = [];
	    var input_stream = new Stream(stringToCodePoints(opt_string));
	    /** @type {?(number|!Array.<number>)} */
	    var result;
	    while (!input_stream.endOfStream()) {
	      result = this._encoder.handler(input_stream, input_stream.read());
	      if (result === finished)
	        break;
	      if (Array.isArray(result))
	        bytes.push.apply(bytes, /**@type {!Array.<number>}*/(result));
	      else
	        bytes.push(result);
	    }
	    if (!this._streaming) {
	      while (true) {
	        result = this._encoder.handler(input_stream, input_stream.read());
	        if (result === finished)
	          break;
	        if (Array.isArray(result))
	          bytes.push.apply(bytes, /**@type {!Array.<number>}*/(result));
	        else
	          bytes.push(result);
	      }
	      this._encoder = null;
	    }
	    return new Uint8Array(bytes);
	  }
	};

	//
	// 8. The encoding
	//

	// 8.1 utf-8

	/**
	 * @constructor
	 * @implements {Decoder}
	 * @param {{fatal: boolean}} options
	 */
	function UTF8Decoder(options) {
	  var fatal = options.fatal;

	  // utf-8's decoder's has an associated utf-8 code point, utf-8
	  // bytes seen, and utf-8 bytes needed (all initially 0), a utf-8
	  // lower boundary (initially 0x80), and a utf-8 upper boundary
	  // (initially 0xBF).
	  var /** @type {number} */ utf8_code_point = 0,
	      /** @type {number} */ utf8_bytes_seen = 0,
	      /** @type {number} */ utf8_bytes_needed = 0,
	      /** @type {number} */ utf8_lower_boundary = 0x80,
	      /** @type {number} */ utf8_upper_boundary = 0xBF;

	  /**
	   * @param {Stream} stream The stream of bytes being decoded.
	   * @param {number} bite The next byte read from the stream.
	   * @return {?(number|!Array.<number>)} The next code point(s)
	   *     decoded, or null if not enough data exists in the input
	   *     stream to decode a complete code point.
	   */
	  this.handler = function(stream, bite) {
	    // 1. If byte is end-of-stream and utf-8 bytes needed is not 0,
	    // set utf-8 bytes needed to 0 and return error.
	    if (bite === end_of_stream && utf8_bytes_needed !== 0) {
	      utf8_bytes_needed = 0;
	      return decoderError(fatal);
	    }

	    // 2. If byte is end-of-stream, return finished.
	    if (bite === end_of_stream)
	      return finished;

	    // 3. If utf-8 bytes needed is 0, based on byte:
	    if (utf8_bytes_needed === 0) {

	      // 0x00 to 0x7F
	      if (inRange(bite, 0x00, 0x7F)) {
	        // Return a code point whose value is byte.
	        return bite;
	      }

	      // 0xC2 to 0xDF
	      if (inRange(bite, 0xC2, 0xDF)) {
	        // Set utf-8 bytes needed to 1 and utf-8 code point to byte
	        // − 0xC0.
	        utf8_bytes_needed = 1;
	        utf8_code_point = bite - 0xC0;
	      }

	      // 0xE0 to 0xEF
	      else if (inRange(bite, 0xE0, 0xEF)) {
	        // 1. If byte is 0xE0, set utf-8 lower boundary to 0xA0.
	        if (bite === 0xE0)
	          utf8_lower_boundary = 0xA0;
	        // 2. If byte is 0xED, set utf-8 upper boundary to 0x9F.
	        if (bite === 0xED)
	          utf8_upper_boundary = 0x9F;
	        // 3. Set utf-8 bytes needed to 2 and utf-8 code point to
	        // byte − 0xE0.
	        utf8_bytes_needed = 2;
	        utf8_code_point = bite - 0xE0;
	      }

	      // 0xF0 to 0xF4
	      else if (inRange(bite, 0xF0, 0xF4)) {
	        // 1. If byte is 0xF0, set utf-8 lower boundary to 0x90.
	        if (bite === 0xF0)
	          utf8_lower_boundary = 0x90;
	        // 2. If byte is 0xF4, set utf-8 upper boundary to 0x8F.
	        if (bite === 0xF4)
	          utf8_upper_boundary = 0x8F;
	        // 3. Set utf-8 bytes needed to 3 and utf-8 code point to
	        // byte − 0xF0.
	        utf8_bytes_needed = 3;
	        utf8_code_point = bite - 0xF0;
	      }

	      // Otherwise
	      else {
	        // Return error.
	        return decoderError(fatal);
	      }

	      // Then (byte is in the range 0xC2 to 0xF4) set utf-8 code
	      // point to utf-8 code point << (6 × utf-8 bytes needed) and
	      // return continue.
	      utf8_code_point = utf8_code_point << (6 * utf8_bytes_needed);
	      return null;
	    }

	    // 4. If byte is not in the range utf-8 lower boundary to utf-8
	    // upper boundary, run these substeps:
	    if (!inRange(bite, utf8_lower_boundary, utf8_upper_boundary)) {

	      // 1. Set utf-8 code point, utf-8 bytes needed, and utf-8
	      // bytes seen to 0, set utf-8 lower boundary to 0x80, and set
	      // utf-8 upper boundary to 0xBF.
	      utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;
	      utf8_lower_boundary = 0x80;
	      utf8_upper_boundary = 0xBF;

	      // 2. Prepend byte to stream.
	      stream.prepend(bite);

	      // 3. Return error.
	      return decoderError(fatal);
	    }

	    // 5. Set utf-8 lower boundary to 0x80 and utf-8 upper boundary
	    // to 0xBF.
	    utf8_lower_boundary = 0x80;
	    utf8_upper_boundary = 0xBF;

	    // 6. Increase utf-8 bytes seen by one and set utf-8 code point
	    // to utf-8 code point + (byte − 0x80) << (6 × (utf-8 bytes
	    // needed − utf-8 bytes seen)).
	    utf8_bytes_seen += 1;
	    utf8_code_point += (bite - 0x80) << (6 * (utf8_bytes_needed - utf8_bytes_seen));

	    // 7. If utf-8 bytes seen is not equal to utf-8 bytes needed,
	    // continue.
	    if (utf8_bytes_seen !== utf8_bytes_needed)
	      return null;

	    // 8. Let code point be utf-8 code point.
	    var code_point = utf8_code_point;

	    // 9. Set utf-8 code point, utf-8 bytes needed, and utf-8 bytes
	    // seen to 0.
	    utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;

	    // 10. Return a code point whose value is code point.
	    return code_point;
	  };
	}

	/**
	 * @constructor
	 * @implements {Encoder}
	 * @param {{fatal: boolean}} options
	 */
	function UTF8Encoder(options) {
	  options.fatal;
	  /**
	   * @param {Stream} stream Input stream.
	   * @param {number} code_point Next code point read from the stream.
	   * @return {(number|!Array.<number>)} Byte(s) to emit.
	   */
	  this.handler = function(stream, code_point) {
	    // 1. If code point is end-of-stream, return finished.
	    if (code_point === end_of_stream)
	      return finished;

	    // 2. If code point is in the range U+0000 to U+007F, return a
	    // byte whose value is code point.
	    if (inRange(code_point, 0x0000, 0x007f))
	      return code_point;

	    // 3. Set count and offset based on the range code point is in:
	    var count, offset;
	    // U+0080 to U+07FF:    1 and 0xC0
	    if (inRange(code_point, 0x0080, 0x07FF)) {
	      count = 1;
	      offset = 0xC0;
	    }
	    // U+0800 to U+FFFF:    2 and 0xE0
	    else if (inRange(code_point, 0x0800, 0xFFFF)) {
	      count = 2;
	      offset = 0xE0;
	    }
	    // U+10000 to U+10FFFF: 3 and 0xF0
	    else if (inRange(code_point, 0x10000, 0x10FFFF)) {
	      count = 3;
	      offset = 0xF0;
	    }

	    // 4.Let bytes be a byte sequence whose first byte is (code
	    // point >> (6 × count)) + offset.
	    var bytes = [(code_point >> (6 * count)) + offset];

	    // 5. Run these substeps while count is greater than 0:
	    while (count > 0) {

	      // 1. Set temp to code point >> (6 × (count − 1)).
	      var temp = code_point >> (6 * (count - 1));

	      // 2. Append to bytes 0x80 | (temp & 0x3F).
	      bytes.push(0x80 | (temp & 0x3F));

	      // 3. Decrease count by one.
	      count -= 1;
	    }

	    // 6. Return bytes bytes, in order.
	    return bytes;
	  };
	}

	encoding_lib.TextEncoder = TextEncoder$1;
	encoding_lib.TextDecoder = TextDecoder$1;

	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __decorate = (commonjsGlobal && commonjsGlobal.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(lib, "__esModule", { value: true });
	var deserializeUnchecked_1 = lib.deserializeUnchecked = deserialize_1 = lib.deserialize = serialize_1 = lib.serialize = lib.BinaryReader = lib.BinaryWriter = lib.BorshError = lib.baseDecode = lib.baseEncode = void 0;
	const bn_js_1 = __importDefault(bn.exports);
	const bs58_1 = __importDefault(bs58);
	// TODO: Make sure this polyfill not included when not required
	const encoding = __importStar(encoding_lib);
	const ResolvedTextDecoder = typeof TextDecoder !== "function" ? encoding.TextDecoder : TextDecoder;
	const textDecoder = new ResolvedTextDecoder("utf-8", { fatal: true });
	function baseEncode(value) {
	    if (typeof value === "string") {
	        value = Buffer.from(value, "utf8");
	    }
	    return bs58_1.default.encode(Buffer.from(value));
	}
	lib.baseEncode = baseEncode;
	function baseDecode(value) {
	    return Buffer.from(bs58_1.default.decode(value));
	}
	lib.baseDecode = baseDecode;
	const INITIAL_LENGTH = 1024;
	class BorshError extends Error {
	    constructor(message) {
	        super(message);
	        this.fieldPath = [];
	        this.originalMessage = message;
	    }
	    addToFieldPath(fieldName) {
	        this.fieldPath.splice(0, 0, fieldName);
	        // NOTE: Modifying message directly as jest doesn't use .toString()
	        this.message = this.originalMessage + ": " + this.fieldPath.join(".");
	    }
	}
	lib.BorshError = BorshError;
	/// Binary encoder.
	class BinaryWriter {
	    constructor() {
	        this.buf = Buffer.alloc(INITIAL_LENGTH);
	        this.length = 0;
	    }
	    maybeResize() {
	        if (this.buf.length < 16 + this.length) {
	            this.buf = Buffer.concat([this.buf, Buffer.alloc(INITIAL_LENGTH)]);
	        }
	    }
	    writeU8(value) {
	        this.maybeResize();
	        this.buf.writeUInt8(value, this.length);
	        this.length += 1;
	    }
	    writeU16(value) {
	        this.maybeResize();
	        this.buf.writeUInt16LE(value, this.length);
	        this.length += 2;
	    }
	    writeU32(value) {
	        this.maybeResize();
	        this.buf.writeUInt32LE(value, this.length);
	        this.length += 4;
	    }
	    writeU64(value) {
	        this.maybeResize();
	        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 8)));
	    }
	    writeU128(value) {
	        this.maybeResize();
	        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 16)));
	    }
	    writeU256(value) {
	        this.maybeResize();
	        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 32)));
	    }
	    writeU512(value) {
	        this.maybeResize();
	        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray("le", 64)));
	    }
	    writeBuffer(buffer) {
	        // Buffer.from is needed as this.buf.subarray can return plain Uint8Array in browser
	        this.buf = Buffer.concat([
	            Buffer.from(this.buf.subarray(0, this.length)),
	            buffer,
	            Buffer.alloc(INITIAL_LENGTH),
	        ]);
	        this.length += buffer.length;
	    }
	    writeString(str) {
	        this.maybeResize();
	        const b = Buffer.from(str, "utf8");
	        this.writeU32(b.length);
	        this.writeBuffer(b);
	    }
	    writeFixedArray(array) {
	        this.writeBuffer(Buffer.from(array));
	    }
	    writeArray(array, fn) {
	        this.maybeResize();
	        this.writeU32(array.length);
	        for (const elem of array) {
	            this.maybeResize();
	            fn(elem);
	        }
	    }
	    toArray() {
	        return this.buf.subarray(0, this.length);
	    }
	}
	lib.BinaryWriter = BinaryWriter;
	function handlingRangeError(target, propertyKey, propertyDescriptor) {
	    const originalMethod = propertyDescriptor.value;
	    propertyDescriptor.value = function (...args) {
	        try {
	            return originalMethod.apply(this, args);
	        }
	        catch (e) {
	            if (e instanceof RangeError) {
	                const code = e.code;
	                if (["ERR_BUFFER_OUT_OF_BOUNDS", "ERR_OUT_OF_RANGE"].indexOf(code) >= 0) {
	                    throw new BorshError("Reached the end of buffer when deserializing");
	                }
	            }
	            throw e;
	        }
	    };
	}
	class BinaryReader {
	    constructor(buf) {
	        this.buf = buf;
	        this.offset = 0;
	    }
	    readU8() {
	        const value = this.buf.readUInt8(this.offset);
	        this.offset += 1;
	        return value;
	    }
	    readU16() {
	        const value = this.buf.readUInt16LE(this.offset);
	        this.offset += 2;
	        return value;
	    }
	    readU32() {
	        const value = this.buf.readUInt32LE(this.offset);
	        this.offset += 4;
	        return value;
	    }
	    readU64() {
	        const buf = this.readBuffer(8);
	        return new bn_js_1.default(buf, "le");
	    }
	    readU128() {
	        const buf = this.readBuffer(16);
	        return new bn_js_1.default(buf, "le");
	    }
	    readU256() {
	        const buf = this.readBuffer(32);
	        return new bn_js_1.default(buf, "le");
	    }
	    readU512() {
	        const buf = this.readBuffer(64);
	        return new bn_js_1.default(buf, "le");
	    }
	    readBuffer(len) {
	        if (this.offset + len > this.buf.length) {
	            throw new BorshError(`Expected buffer length ${len} isn't within bounds`);
	        }
	        const result = this.buf.slice(this.offset, this.offset + len);
	        this.offset += len;
	        return result;
	    }
	    readString() {
	        const len = this.readU32();
	        const buf = this.readBuffer(len);
	        try {
	            // NOTE: Using TextDecoder to fail on invalid UTF-8
	            return textDecoder.decode(buf);
	        }
	        catch (e) {
	            throw new BorshError(`Error decoding UTF-8 string: ${e}`);
	        }
	    }
	    readFixedArray(len) {
	        return new Uint8Array(this.readBuffer(len));
	    }
	    readArray(fn) {
	        const len = this.readU32();
	        const result = Array();
	        for (let i = 0; i < len; ++i) {
	            result.push(fn());
	        }
	        return result;
	    }
	}
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU8", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU16", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU32", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU64", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU128", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU256", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU512", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readString", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readFixedArray", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readArray", null);
	lib.BinaryReader = BinaryReader;
	function capitalizeFirstLetter(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}
	function serializeField(schema, fieldName, value, fieldType, writer) {
	    try {
	        // TODO: Handle missing values properly (make sure they never result in just skipped write)
	        if (typeof fieldType === "string") {
	            writer[`write${capitalizeFirstLetter(fieldType)}`](value);
	        }
	        else if (fieldType instanceof Array) {
	            if (typeof fieldType[0] === "number") {
	                if (value.length !== fieldType[0]) {
	                    throw new BorshError(`Expecting byte array of length ${fieldType[0]}, but got ${value.length} bytes`);
	                }
	                writer.writeFixedArray(value);
	            }
	            else if (fieldType.length === 2 && typeof fieldType[1] === "number") {
	                if (value.length !== fieldType[1]) {
	                    throw new BorshError(`Expecting byte array of length ${fieldType[1]}, but got ${value.length} bytes`);
	                }
	                for (let i = 0; i < fieldType[1]; i++) {
	                    serializeField(schema, null, value[i], fieldType[0], writer);
	                }
	            }
	            else {
	                writer.writeArray(value, (item) => {
	                    serializeField(schema, fieldName, item, fieldType[0], writer);
	                });
	            }
	        }
	        else if (fieldType.kind !== undefined) {
	            switch (fieldType.kind) {
	                case "option": {
	                    if (value === null || value === undefined) {
	                        writer.writeU8(0);
	                    }
	                    else {
	                        writer.writeU8(1);
	                        serializeField(schema, fieldName, value, fieldType.type, writer);
	                    }
	                    break;
	                }
	                case "map": {
	                    writer.writeU32(value.size);
	                    value.forEach((val, key) => {
	                        serializeField(schema, fieldName, key, fieldType.key, writer);
	                        serializeField(schema, fieldName, val, fieldType.value, writer);
	                    });
	                    break;
	                }
	                default:
	                    throw new BorshError(`FieldType ${fieldType} unrecognized`);
	            }
	        }
	        else {
	            serializeStruct(schema, value, writer);
	        }
	    }
	    catch (error) {
	        if (error instanceof BorshError) {
	            error.addToFieldPath(fieldName);
	        }
	        throw error;
	    }
	}
	function serializeStruct(schema, obj, writer) {
	    if (typeof obj.borshSerialize === "function") {
	        obj.borshSerialize(writer);
	        return;
	    }
	    const structSchema = schema.get(obj.constructor);
	    if (!structSchema) {
	        throw new BorshError(`Class ${obj.constructor.name} is missing in schema`);
	    }
	    if (structSchema.kind === "struct") {
	        structSchema.fields.map(([fieldName, fieldType]) => {
	            serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
	        });
	    }
	    else if (structSchema.kind === "enum") {
	        const name = obj[structSchema.field];
	        for (let idx = 0; idx < structSchema.values.length; ++idx) {
	            const [fieldName, fieldType] = structSchema.values[idx];
	            if (fieldName === name) {
	                writer.writeU8(idx);
	                serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
	                break;
	            }
	        }
	    }
	    else {
	        throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${obj.constructor.name}`);
	    }
	}
	/// Serialize given object using schema of the form:
	/// { class_name -> [ [field_name, field_type], .. ], .. }
	function serialize(schema, obj, Writer = BinaryWriter) {
	    const writer = new Writer();
	    serializeStruct(schema, obj, writer);
	    return writer.toArray();
	}
	var serialize_1 = lib.serialize = serialize;
	function deserializeField(schema, fieldName, fieldType, reader) {
	    try {
	        if (typeof fieldType === "string") {
	            return reader[`read${capitalizeFirstLetter(fieldType)}`]();
	        }
	        if (fieldType instanceof Array) {
	            if (typeof fieldType[0] === "number") {
	                return reader.readFixedArray(fieldType[0]);
	            }
	            else if (typeof fieldType[1] === "number") {
	                const arr = [];
	                for (let i = 0; i < fieldType[1]; i++) {
	                    arr.push(deserializeField(schema, null, fieldType[0], reader));
	                }
	                return arr;
	            }
	            else {
	                return reader.readArray(() => deserializeField(schema, fieldName, fieldType[0], reader));
	            }
	        }
	        if (fieldType.kind === "option") {
	            const option = reader.readU8();
	            if (option) {
	                return deserializeField(schema, fieldName, fieldType.type, reader);
	            }
	            return undefined;
	        }
	        if (fieldType.kind === "map") {
	            let map = new Map();
	            const length = reader.readU32();
	            for (let i = 0; i < length; i++) {
	                const key = deserializeField(schema, fieldName, fieldType.key, reader);
	                const val = deserializeField(schema, fieldName, fieldType.value, reader);
	                map.set(key, val);
	            }
	            return map;
	        }
	        return deserializeStruct(schema, fieldType, reader);
	    }
	    catch (error) {
	        if (error instanceof BorshError) {
	            error.addToFieldPath(fieldName);
	        }
	        throw error;
	    }
	}
	function deserializeStruct(schema, classType, reader) {
	    if (typeof classType.borshDeserialize === "function") {
	        return classType.borshDeserialize(reader);
	    }
	    const structSchema = schema.get(classType);
	    if (!structSchema) {
	        throw new BorshError(`Class ${classType.name} is missing in schema`);
	    }
	    if (structSchema.kind === "struct") {
	        const result = {};
	        for (const [fieldName, fieldType] of schema.get(classType).fields) {
	            result[fieldName] = deserializeField(schema, fieldName, fieldType, reader);
	        }
	        return new classType(result);
	    }
	    if (structSchema.kind === "enum") {
	        const idx = reader.readU8();
	        if (idx >= structSchema.values.length) {
	            throw new BorshError(`Enum index: ${idx} is out of range`);
	        }
	        const [fieldName, fieldType] = structSchema.values[idx];
	        const fieldValue = deserializeField(schema, fieldName, fieldType, reader);
	        return new classType({ [fieldName]: fieldValue });
	    }
	    throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${classType.constructor.name}`);
	}
	/// Deserializes object from bytes using schema.
	function deserialize(schema, classType, buffer, Reader = BinaryReader) {
	    const reader = new Reader(buffer);
	    const result = deserializeStruct(schema, classType, reader);
	    if (reader.offset < buffer.length) {
	        throw new BorshError(`Unexpected ${buffer.length - reader.offset} bytes after deserialized data`);
	    }
	    return result;
	}
	var deserialize_1 = lib.deserialize = deserialize;
	/// Deserializes object from bytes using schema, without checking the length read
	function deserializeUnchecked(schema, classType, buffer, Reader = BinaryReader) {
	    const reader = new Reader(buffer);
	    return deserializeStruct(schema, classType, reader);
	}
	deserializeUnchecked_1 = lib.deserializeUnchecked = deserializeUnchecked;

	class Struct$1 {
	  constructor(properties) {
	    Object.assign(this, properties);
	  }

	  encode() {
	    return buffer.Buffer.from(serialize_1(SOLANA_SCHEMA, this));
	  }

	  static decode(data) {
	    return deserialize_1(SOLANA_SCHEMA, this, data);
	  }

	  static decodeUnchecked(data) {
	    return deserializeUnchecked_1(SOLANA_SCHEMA, this, data);
	  }

	} // Class representing a Rust-compatible enum, since enums are only strings or
	// numbers in pure JS

	class Enum extends Struct$1 {
	  constructor(properties) {
	    super(properties);
	    this.enum = '';

	    if (Object.keys(properties).length !== 1) {
	      throw new Error('Enum can only take single value');
	    }

	    Object.keys(properties).map(key => {
	      this.enum = key;
	    });
	  }

	}
	const SOLANA_SCHEMA = new Map();

	/**
	 * Maximum length of derived pubkey seed
	 */

	const MAX_SEED_LENGTH = 32;
	/**
	 * Size of public key in bytes
	 */

	const PUBLIC_KEY_LENGTH = 32;
	/**
	 * Value to be converted into public key
	 */

	function isPublicKeyData(value) {
	  return value._bn !== undefined;
	} // local counter used by PublicKey.unique()


	let uniquePublicKeyCounter = 1;
	/**
	 * A public key
	 */

	class PublicKey extends Struct$1 {
	  /** @internal */

	  /**
	   * Create a new PublicKey object
	   * @param value ed25519 public key as buffer or base-58 encoded string
	   */
	  constructor(value) {
	    super({});
	    this._bn = void 0;

	    if (isPublicKeyData(value)) {
	      this._bn = value._bn;
	    } else {
	      if (typeof value === 'string') {
	        // assume base 58 encoding by default
	        const decoded = bs58$1.decode(value);

	        if (decoded.length != PUBLIC_KEY_LENGTH) {
	          throw new Error(`Invalid public key input`);
	        }

	        this._bn = new BN(decoded);
	      } else {
	        this._bn = new BN(value);
	      }

	      if (this._bn.byteLength() > 32) {
	        throw new Error(`Invalid public key input`);
	      }
	    }
	  }
	  /**
	   * Returns a unique PublicKey for tests and benchmarks using acounter
	   */


	  static unique() {
	    const key = new PublicKey(uniquePublicKeyCounter);
	    uniquePublicKeyCounter += 1;
	    return new PublicKey(key.toBuffer());
	  }
	  /**
	   * Default public key value. (All zeros)
	   */


	  /**
	   * Checks if two publicKeys are equal
	   */
	  equals(publicKey) {
	    return this._bn.eq(publicKey._bn);
	  }
	  /**
	   * Return the base-58 representation of the public key
	   */


	  toBase58() {
	    return bs58$1.encode(this.toBytes());
	  }

	  toJSON() {
	    return this.toBase58();
	  }
	  /**
	   * Return the byte array representation of the public key
	   */


	  toBytes() {
	    return this.toBuffer();
	  }
	  /**
	   * Return the Buffer representation of the public key
	   */


	  toBuffer() {
	    const b = this._bn.toArrayLike(buffer.Buffer);

	    if (b.length === PUBLIC_KEY_LENGTH) {
	      return b;
	    }

	    const zeroPad = buffer.Buffer.alloc(32);
	    b.copy(zeroPad, 32 - b.length);
	    return zeroPad;
	  }
	  /**
	   * Return the base-58 representation of the public key
	   */


	  toString() {
	    return this.toBase58();
	  }
	  /**
	   * Derive a public key from another key, a seed, and a program ID.
	   * The program ID will also serve as the owner of the public key, giving
	   * it permission to write data to the account.
	   */

	  /* eslint-disable require-await */


	  static async createWithSeed(fromPublicKey, seed, programId) {
	    const buffer$1 = buffer.Buffer.concat([fromPublicKey.toBuffer(), buffer.Buffer.from(seed), programId.toBuffer()]);
	    const publicKeyBytes = sha256(buffer$1);
	    return new PublicKey(publicKeyBytes);
	  }
	  /**
	   * Derive a program address from seeds and a program ID.
	   */

	  /* eslint-disable require-await */


	  static createProgramAddressSync(seeds, programId) {
	    let buffer$1 = buffer.Buffer.alloc(0);
	    seeds.forEach(function (seed) {
	      if (seed.length > MAX_SEED_LENGTH) {
	        throw new TypeError(`Max seed length exceeded`);
	      }

	      buffer$1 = buffer.Buffer.concat([buffer$1, toBuffer(seed)]);
	    });
	    buffer$1 = buffer.Buffer.concat([buffer$1, programId.toBuffer(), buffer.Buffer.from('ProgramDerivedAddress')]);
	    const publicKeyBytes = sha256(buffer$1);

	    if (isOnCurve(publicKeyBytes)) {
	      throw new Error(`Invalid seeds, address must fall off the curve`);
	    }

	    return new PublicKey(publicKeyBytes);
	  }
	  /**
	   * Async version of createProgramAddressSync
	   * For backwards compatibility
	   */

	  /* eslint-disable require-await */


	  static async createProgramAddress(seeds, programId) {
	    return this.createProgramAddressSync(seeds, programId);
	  }
	  /**
	   * Find a valid program address
	   *
	   * Valid program addresses must fall off the ed25519 curve.  This function
	   * iterates a nonce until it finds one that when combined with the seeds
	   * results in a valid program address.
	   */


	  static findProgramAddressSync(seeds, programId) {
	    let nonce = 255;
	    let address;

	    while (nonce != 0) {
	      try {
	        const seedsWithNonce = seeds.concat(buffer.Buffer.from([nonce]));
	        address = this.createProgramAddressSync(seedsWithNonce, programId);
	      } catch (err) {
	        if (err instanceof TypeError) {
	          throw err;
	        }

	        nonce--;
	        continue;
	      }

	      return [address, nonce];
	    }

	    throw new Error(`Unable to find a viable program address nonce`);
	  }
	  /**
	   * Async version of findProgramAddressSync
	   * For backwards compatibility
	   */


	  static async findProgramAddress(seeds, programId) {
	    return this.findProgramAddressSync(seeds, programId);
	  }
	  /**
	   * Check that a pubkey is on the ed25519 curve.
	   */


	  static isOnCurve(pubkeyData) {
	    const pubkey = new PublicKey(pubkeyData);
	    return isOnCurve(pubkey.toBytes());
	  }

	}
	PublicKey.default = new PublicKey('11111111111111111111111111111111');
	SOLANA_SCHEMA.set(PublicKey, {
	  kind: 'struct',
	  fields: [['_bn', 'u256']]
	});

	/**
	 * An account key pair (public and secret keys).
	 *
	 * @deprecated since v1.10.0, please use {@link Keypair} instead.
	 */

	class Account {
	  /** @internal */

	  /** @internal */

	  /**
	   * Create a new Account object
	   *
	   * If the secretKey parameter is not provided a new key pair is randomly
	   * created for the account
	   *
	   * @param secretKey Secret key for the account
	   */
	  constructor(secretKey) {
	    this._publicKey = void 0;
	    this._secretKey = void 0;

	    if (secretKey) {
	      const secretKeyBuffer = toBuffer(secretKey);

	      if (secretKey.length !== 64) {
	        throw new Error('bad secret key size');
	      }

	      this._publicKey = secretKeyBuffer.slice(32, 64);
	      this._secretKey = secretKeyBuffer.slice(0, 32);
	    } else {
	      this._secretKey = toBuffer(generatePrivateKey());
	      this._publicKey = toBuffer(getPublicKey$1(this._secretKey));
	    }
	  }
	  /**
	   * The public key for this account
	   */


	  get publicKey() {
	    return new PublicKey(this._publicKey);
	  }
	  /**
	   * The **unencrypted** secret key for this account. The first 32 bytes
	   * is the private scalar and the last 32 bytes is the public key.
	   * Read more: https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/
	   */


	  get secretKey() {
	    return buffer.Buffer.concat([this._secretKey, this._publicKey], 64);
	  }

	}

	const BPF_LOADER_DEPRECATED_PROGRAM_ID = new PublicKey('BPFLoader1111111111111111111111111111111111');

	var Layout$1 = {};

	/* The MIT License (MIT)
	 *
	 * Copyright 2015-2018 Peter A. Bigot
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 */
	Object.defineProperty(Layout$1, "__esModule", { value: true });
	Layout$1.s16 = Layout$1.s8 = Layout$1.nu64be = Layout$1.u48be = Layout$1.u40be = Layout$1.u32be = Layout$1.u24be = Layout$1.u16be = nu64 = Layout$1.nu64 = Layout$1.u48 = Layout$1.u40 = u32 = Layout$1.u32 = Layout$1.u24 = u16 = Layout$1.u16 = u8 = Layout$1.u8 = offset = Layout$1.offset = Layout$1.greedy = Layout$1.Constant = Layout$1.UTF8 = Layout$1.CString = Layout$1.Blob = Layout$1.Boolean = Layout$1.BitField = Layout$1.BitStructure = Layout$1.VariantLayout = Layout$1.Union = Layout$1.UnionLayoutDiscriminator = Layout$1.UnionDiscriminator = Layout$1.Structure = Layout$1.Sequence = Layout$1.DoubleBE = Layout$1.Double = Layout$1.FloatBE = Layout$1.Float = Layout$1.NearInt64BE = Layout$1.NearInt64 = Layout$1.NearUInt64BE = Layout$1.NearUInt64 = Layout$1.IntBE = Layout$1.Int = Layout$1.UIntBE = Layout$1.UInt = Layout$1.OffsetLayout = Layout$1.GreedyCount = Layout$1.ExternalLayout = Layout$1.bindConstructorLayout = Layout$1.nameWithProperty = Layout$1.Layout = Layout$1.uint8ArrayToBuffer = Layout$1.checkUint8Array = void 0;
	Layout$1.constant = Layout$1.utf8 = Layout$1.cstr = blob = Layout$1.blob = Layout$1.unionLayoutDiscriminator = Layout$1.union = seq = Layout$1.seq = Layout$1.bits = struct = Layout$1.struct = Layout$1.f64be = Layout$1.f64 = Layout$1.f32be = Layout$1.f32 = Layout$1.ns64be = Layout$1.s48be = Layout$1.s40be = Layout$1.s32be = Layout$1.s24be = Layout$1.s16be = ns64 = Layout$1.ns64 = Layout$1.s48 = Layout$1.s40 = Layout$1.s32 = Layout$1.s24 = void 0;
	const buffer_1 = buffer;
	/* Check if a value is a Uint8Array.
	 *
	 * @ignore */
	function checkUint8Array(b) {
	    if (!(b instanceof Uint8Array)) {
	        throw new TypeError('b must be a Uint8Array');
	    }
	}
	Layout$1.checkUint8Array = checkUint8Array;
	/* Create a Buffer instance from a Uint8Array.
	 *
	 * @ignore */
	function uint8ArrayToBuffer(b) {
	    checkUint8Array(b);
	    return buffer_1.Buffer.from(b.buffer, b.byteOffset, b.length);
	}
	Layout$1.uint8ArrayToBuffer = uint8ArrayToBuffer;
	/**
	 * Base class for layout objects.
	 *
	 * **NOTE** This is an abstract base class; you can create instances
	 * if it amuses you, but they won't support the {@link
	 * Layout#encode|encode} or {@link Layout#decode|decode} functions.
	 *
	 * @param {Number} span - Initializer for {@link Layout#span|span}.  The
	 * parameter must be an integer; a negative value signifies that the
	 * span is {@link Layout#getSpan|value-specific}.
	 *
	 * @param {string} [property] - Initializer for {@link
	 * Layout#property|property}.
	 *
	 * @abstract
	 */
	class Layout {
	    constructor(span, property) {
	        if (!Number.isInteger(span)) {
	            throw new TypeError('span must be an integer');
	        }
	        /** The span of the layout in bytes.
	         *
	         * Positive values are generally expected.
	         *
	         * Zero will only appear in {@link Constant}s and in {@link
	         * Sequence}s where the {@link Sequence#count|count} is zero.
	         *
	         * A negative value indicates that the span is value-specific, and
	         * must be obtained using {@link Layout#getSpan|getSpan}. */
	        this.span = span;
	        /** The property name used when this layout is represented in an
	         * Object.
	         *
	         * Used only for layouts that {@link Layout#decode|decode} to Object
	         * instances.  If left undefined the span of the unnamed layout will
	         * be treated as padding: it will not be mutated by {@link
	         * Layout#encode|encode} nor represented as a property in the
	         * decoded Object. */
	        this.property = property;
	    }
	    /** Function to create an Object into which decoded properties will
	     * be written.
	     *
	     * Used only for layouts that {@link Layout#decode|decode} to Object
	     * instances, which means:
	     * * {@link Structure}
	     * * {@link Union}
	     * * {@link VariantLayout}
	     * * {@link BitStructure}
	     *
	     * If left undefined the JavaScript representation of these layouts
	     * will be Object instances.
	     *
	     * See {@link bindConstructorLayout}.
	     */
	    makeDestinationObject() {
	        return {};
	    }
	    /**
	     * Calculate the span of a specific instance of a layout.
	     *
	     * @param {Uint8Array} b - the buffer that contains an encoded instance.
	     *
	     * @param {Number} [offset] - the offset at which the encoded instance
	     * starts.  If absent a zero offset is inferred.
	     *
	     * @return {Number} - the number of bytes covered by the layout
	     * instance.  If this method is not overridden in a subclass the
	     * definition-time constant {@link Layout#span|span} will be
	     * returned.
	     *
	     * @throws {RangeError} - if the length of the value cannot be
	     * determined.
	     */
	    getSpan(b, offset) {
	        if (0 > this.span) {
	            throw new RangeError('indeterminate span');
	        }
	        return this.span;
	    }
	    /**
	     * Replicate the layout using a new property.
	     *
	     * This function must be used to get a structurally-equivalent layout
	     * with a different name since all {@link Layout} instances are
	     * immutable.
	     *
	     * **NOTE** This is a shallow copy.  All fields except {@link
	     * Layout#property|property} are strictly equal to the origin layout.
	     *
	     * @param {String} property - the value for {@link
	     * Layout#property|property} in the replica.
	     *
	     * @returns {Layout} - the copy with {@link Layout#property|property}
	     * set to `property`.
	     */
	    replicate(property) {
	        const rv = Object.create(this.constructor.prototype);
	        Object.assign(rv, this);
	        rv.property = property;
	        return rv;
	    }
	    /**
	     * Create an object from layout properties and an array of values.
	     *
	     * **NOTE** This function returns `undefined` if invoked on a layout
	     * that does not return its value as an Object.  Objects are
	     * returned for things that are a {@link Structure}, which includes
	     * {@link VariantLayout|variant layouts} if they are structures, and
	     * excludes {@link Union}s.  If you want this feature for a union
	     * you must use {@link Union.getVariant|getVariant} to select the
	     * desired layout.
	     *
	     * @param {Array} values - an array of values that correspond to the
	     * default order for properties.  As with {@link Layout#decode|decode}
	     * layout elements that have no property name are skipped when
	     * iterating over the array values.  Only the top-level properties are
	     * assigned; arguments are not assigned to properties of contained
	     * layouts.  Any unused values are ignored.
	     *
	     * @return {(Object|undefined)}
	     */
	    fromArray(values) {
	        return undefined;
	    }
	}
	Layout$1.Layout = Layout;
	/* Provide text that carries a name (such as for a function that will
	 * be throwing an error) annotated with the property of a given layout
	 * (such as one for which the value was unacceptable).
	 *
	 * @ignore */
	function nameWithProperty(name, lo) {
	    if (lo.property) {
	        return name + '[' + lo.property + ']';
	    }
	    return name;
	}
	Layout$1.nameWithProperty = nameWithProperty;
	/**
	 * Augment a class so that instances can be encoded/decoded using a
	 * given layout.
	 *
	 * Calling this function couples `Class` with `layout` in several ways:
	 *
	 * * `Class.layout_` becomes a static member property equal to `layout`;
	 * * `layout.boundConstructor_` becomes a static member property equal
	 *    to `Class`;
	 * * The {@link Layout#makeDestinationObject|makeDestinationObject()}
	 *   property of `layout` is set to a function that returns a `new
	 *   Class()`;
	 * * `Class.decode(b, offset)` becomes a static member function that
	 *   delegates to {@link Layout#decode|layout.decode}.  The
	 *   synthesized function may be captured and extended.
	 * * `Class.prototype.encode(b, offset)` provides an instance member
	 *   function that delegates to {@link Layout#encode|layout.encode}
	 *   with `src` set to `this`.  The synthesized function may be
	 *   captured and extended, but when the extension is invoked `this`
	 *   must be explicitly bound to the instance.
	 *
	 * @param {class} Class - a JavaScript class with a nullary
	 * constructor.
	 *
	 * @param {Layout} layout - the {@link Layout} instance used to encode
	 * instances of `Class`.
	 */
	// `Class` must be a constructor Function, but the assignment of a `layout_` property to it makes it difficult to type
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	function bindConstructorLayout(Class, layout) {
	    if ('function' !== typeof Class) {
	        throw new TypeError('Class must be constructor');
	    }
	    if (Object.prototype.hasOwnProperty.call(Class, 'layout_')) {
	        throw new Error('Class is already bound to a layout');
	    }
	    if (!(layout && (layout instanceof Layout))) {
	        throw new TypeError('layout must be a Layout');
	    }
	    if (Object.prototype.hasOwnProperty.call(layout, 'boundConstructor_')) {
	        throw new Error('layout is already bound to a constructor');
	    }
	    Class.layout_ = layout;
	    layout.boundConstructor_ = Class;
	    layout.makeDestinationObject = (() => new Class());
	    Object.defineProperty(Class.prototype, 'encode', {
	        value(b, offset) {
	            return layout.encode(this, b, offset);
	        },
	        writable: true,
	    });
	    Object.defineProperty(Class, 'decode', {
	        value(b, offset) {
	            return layout.decode(b, offset);
	        },
	        writable: true,
	    });
	}
	Layout$1.bindConstructorLayout = bindConstructorLayout;
	/**
	 * An object that behaves like a layout but does not consume space
	 * within its containing layout.
	 *
	 * This is primarily used to obtain metadata about a member, such as a
	 * {@link OffsetLayout} that can provide data about a {@link
	 * Layout#getSpan|value-specific span}.
	 *
	 * **NOTE** This is an abstract base class; you can create instances
	 * if it amuses you, but they won't support {@link
	 * ExternalLayout#isCount|isCount} or other {@link Layout} functions.
	 *
	 * @param {Number} span - initializer for {@link Layout#span|span}.
	 * The parameter can range from 1 through 6.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @abstract
	 * @augments {Layout}
	 */
	class ExternalLayout extends Layout {
	    /**
	     * Return `true` iff the external layout decodes to an unsigned
	     * integer layout.
	     *
	     * In that case it can be used as the source of {@link
	     * Sequence#count|Sequence counts}, {@link Blob#length|Blob lengths},
	     * or as {@link UnionLayoutDiscriminator#layout|external union
	     * discriminators}.
	     *
	     * @abstract
	     */
	    isCount() {
	        throw new Error('ExternalLayout is abstract');
	    }
	}
	Layout$1.ExternalLayout = ExternalLayout;
	/**
	 * An {@link ExternalLayout} that determines its {@link
	 * Layout#decode|value} based on offset into and length of the buffer
	 * on which it is invoked.
	 *
	 * *Factory*: {@link module:Layout.greedy|greedy}
	 *
	 * @param {Number} [elementSpan] - initializer for {@link
	 * GreedyCount#elementSpan|elementSpan}.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {ExternalLayout}
	 */
	class GreedyCount extends ExternalLayout {
	    constructor(elementSpan = 1, property) {
	        if ((!Number.isInteger(elementSpan)) || (0 >= elementSpan)) {
	            throw new TypeError('elementSpan must be a (positive) integer');
	        }
	        super(-1, property);
	        /** The layout for individual elements of the sequence.  The value
	         * must be a positive integer.  If not provided, the value will be
	         * 1. */
	        this.elementSpan = elementSpan;
	    }
	    /** @override */
	    isCount() {
	        return true;
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        checkUint8Array(b);
	        const rem = b.length - offset;
	        return Math.floor(rem / this.elementSpan);
	    }
	    /** @override */
	    encode(src, b, offset) {
	        return 0;
	    }
	}
	Layout$1.GreedyCount = GreedyCount;
	/**
	 * An {@link ExternalLayout} that supports accessing a {@link Layout}
	 * at a fixed offset from the start of another Layout.  The offset may
	 * be before, within, or after the base layout.
	 *
	 * *Factory*: {@link module:Layout.offset|offset}
	 *
	 * @param {Layout} layout - initializer for {@link
	 * OffsetLayout#layout|layout}, modulo `property`.
	 *
	 * @param {Number} [offset] - Initializes {@link
	 * OffsetLayout#offset|offset}.  Defaults to zero.
	 *
	 * @param {string} [property] - Optional new property name for a
	 * {@link Layout#replicate| replica} of `layout` to be used as {@link
	 * OffsetLayout#layout|layout}.  If not provided the `layout` is used
	 * unchanged.
	 *
	 * @augments {Layout}
	 */
	class OffsetLayout extends ExternalLayout {
	    constructor(layout, offset = 0, property) {
	        if (!(layout instanceof Layout)) {
	            throw new TypeError('layout must be a Layout');
	        }
	        if (!Number.isInteger(offset)) {
	            throw new TypeError('offset must be integer or undefined');
	        }
	        super(layout.span, property || layout.property);
	        /** The subordinated layout. */
	        this.layout = layout;
	        /** The location of {@link OffsetLayout#layout} relative to the
	         * start of another layout.
	         *
	         * The value may be positive or negative, but an error will thrown
	         * if at the point of use it goes outside the span of the Uint8Array
	         * being accessed.  */
	        this.offset = offset;
	    }
	    /** @override */
	    isCount() {
	        return ((this.layout instanceof UInt)
	            || (this.layout instanceof UIntBE));
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return this.layout.decode(b, offset + this.offset);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        return this.layout.encode(src, b, offset + this.offset);
	    }
	}
	Layout$1.OffsetLayout = OffsetLayout;
	/**
	 * Represent an unsigned integer in little-endian format.
	 *
	 * *Factory*: {@link module:Layout.u8|u8}, {@link
	 *  module:Layout.u16|u16}, {@link module:Layout.u24|u24}, {@link
	 *  module:Layout.u32|u32}, {@link module:Layout.u40|u40}, {@link
	 *  module:Layout.u48|u48}
	 *
	 * @param {Number} span - initializer for {@link Layout#span|span}.
	 * The parameter can range from 1 through 6.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class UInt extends Layout {
	    constructor(span, property) {
	        super(span, property);
	        if (6 < this.span) {
	            throw new RangeError('span must not exceed 6 bytes');
	        }
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return uint8ArrayToBuffer(b).readUIntLE(offset, this.span);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        uint8ArrayToBuffer(b).writeUIntLE(src, offset, this.span);
	        return this.span;
	    }
	}
	Layout$1.UInt = UInt;
	/**
	 * Represent an unsigned integer in big-endian format.
	 *
	 * *Factory*: {@link module:Layout.u8be|u8be}, {@link
	 * module:Layout.u16be|u16be}, {@link module:Layout.u24be|u24be},
	 * {@link module:Layout.u32be|u32be}, {@link
	 * module:Layout.u40be|u40be}, {@link module:Layout.u48be|u48be}
	 *
	 * @param {Number} span - initializer for {@link Layout#span|span}.
	 * The parameter can range from 1 through 6.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class UIntBE extends Layout {
	    constructor(span, property) {
	        super(span, property);
	        if (6 < this.span) {
	            throw new RangeError('span must not exceed 6 bytes');
	        }
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return uint8ArrayToBuffer(b).readUIntBE(offset, this.span);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        uint8ArrayToBuffer(b).writeUIntBE(src, offset, this.span);
	        return this.span;
	    }
	}
	Layout$1.UIntBE = UIntBE;
	/**
	 * Represent a signed integer in little-endian format.
	 *
	 * *Factory*: {@link module:Layout.s8|s8}, {@link
	 *  module:Layout.s16|s16}, {@link module:Layout.s24|s24}, {@link
	 *  module:Layout.s32|s32}, {@link module:Layout.s40|s40}, {@link
	 *  module:Layout.s48|s48}
	 *
	 * @param {Number} span - initializer for {@link Layout#span|span}.
	 * The parameter can range from 1 through 6.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class Int extends Layout {
	    constructor(span, property) {
	        super(span, property);
	        if (6 < this.span) {
	            throw new RangeError('span must not exceed 6 bytes');
	        }
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return uint8ArrayToBuffer(b).readIntLE(offset, this.span);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        uint8ArrayToBuffer(b).writeIntLE(src, offset, this.span);
	        return this.span;
	    }
	}
	Layout$1.Int = Int;
	/**
	 * Represent a signed integer in big-endian format.
	 *
	 * *Factory*: {@link module:Layout.s8be|s8be}, {@link
	 * module:Layout.s16be|s16be}, {@link module:Layout.s24be|s24be},
	 * {@link module:Layout.s32be|s32be}, {@link
	 * module:Layout.s40be|s40be}, {@link module:Layout.s48be|s48be}
	 *
	 * @param {Number} span - initializer for {@link Layout#span|span}.
	 * The parameter can range from 1 through 6.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class IntBE extends Layout {
	    constructor(span, property) {
	        super(span, property);
	        if (6 < this.span) {
	            throw new RangeError('span must not exceed 6 bytes');
	        }
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return uint8ArrayToBuffer(b).readIntBE(offset, this.span);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        uint8ArrayToBuffer(b).writeIntBE(src, offset, this.span);
	        return this.span;
	    }
	}
	Layout$1.IntBE = IntBE;
	const V2E32 = Math.pow(2, 32);
	/* True modulus high and low 32-bit words, where low word is always
	 * non-negative. */
	function divmodInt64(src) {
	    const hi32 = Math.floor(src / V2E32);
	    const lo32 = src - (hi32 * V2E32);
	    return { hi32, lo32 };
	}
	/* Reconstruct Number from quotient and non-negative remainder */
	function roundedInt64(hi32, lo32) {
	    return hi32 * V2E32 + lo32;
	}
	/**
	 * Represent an unsigned 64-bit integer in little-endian format when
	 * encoded and as a near integral JavaScript Number when decoded.
	 *
	 * *Factory*: {@link module:Layout.nu64|nu64}
	 *
	 * **NOTE** Values with magnitude greater than 2^52 may not decode to
	 * the exact value of the encoded representation.
	 *
	 * @augments {Layout}
	 */
	class NearUInt64 extends Layout {
	    constructor(property) {
	        super(8, property);
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const buffer = uint8ArrayToBuffer(b);
	        const lo32 = buffer.readUInt32LE(offset);
	        const hi32 = buffer.readUInt32LE(offset + 4);
	        return roundedInt64(hi32, lo32);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        const split = divmodInt64(src);
	        const buffer = uint8ArrayToBuffer(b);
	        buffer.writeUInt32LE(split.lo32, offset);
	        buffer.writeUInt32LE(split.hi32, offset + 4);
	        return 8;
	    }
	}
	Layout$1.NearUInt64 = NearUInt64;
	/**
	 * Represent an unsigned 64-bit integer in big-endian format when
	 * encoded and as a near integral JavaScript Number when decoded.
	 *
	 * *Factory*: {@link module:Layout.nu64be|nu64be}
	 *
	 * **NOTE** Values with magnitude greater than 2^52 may not decode to
	 * the exact value of the encoded representation.
	 *
	 * @augments {Layout}
	 */
	class NearUInt64BE extends Layout {
	    constructor(property) {
	        super(8, property);
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const buffer = uint8ArrayToBuffer(b);
	        const hi32 = buffer.readUInt32BE(offset);
	        const lo32 = buffer.readUInt32BE(offset + 4);
	        return roundedInt64(hi32, lo32);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        const split = divmodInt64(src);
	        const buffer = uint8ArrayToBuffer(b);
	        buffer.writeUInt32BE(split.hi32, offset);
	        buffer.writeUInt32BE(split.lo32, offset + 4);
	        return 8;
	    }
	}
	Layout$1.NearUInt64BE = NearUInt64BE;
	/**
	 * Represent a signed 64-bit integer in little-endian format when
	 * encoded and as a near integral JavaScript Number when decoded.
	 *
	 * *Factory*: {@link module:Layout.ns64|ns64}
	 *
	 * **NOTE** Values with magnitude greater than 2^52 may not decode to
	 * the exact value of the encoded representation.
	 *
	 * @augments {Layout}
	 */
	class NearInt64 extends Layout {
	    constructor(property) {
	        super(8, property);
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const buffer = uint8ArrayToBuffer(b);
	        const lo32 = buffer.readUInt32LE(offset);
	        const hi32 = buffer.readInt32LE(offset + 4);
	        return roundedInt64(hi32, lo32);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        const split = divmodInt64(src);
	        const buffer = uint8ArrayToBuffer(b);
	        buffer.writeUInt32LE(split.lo32, offset);
	        buffer.writeInt32LE(split.hi32, offset + 4);
	        return 8;
	    }
	}
	Layout$1.NearInt64 = NearInt64;
	/**
	 * Represent a signed 64-bit integer in big-endian format when
	 * encoded and as a near integral JavaScript Number when decoded.
	 *
	 * *Factory*: {@link module:Layout.ns64be|ns64be}
	 *
	 * **NOTE** Values with magnitude greater than 2^52 may not decode to
	 * the exact value of the encoded representation.
	 *
	 * @augments {Layout}
	 */
	class NearInt64BE extends Layout {
	    constructor(property) {
	        super(8, property);
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const buffer = uint8ArrayToBuffer(b);
	        const hi32 = buffer.readInt32BE(offset);
	        const lo32 = buffer.readUInt32BE(offset + 4);
	        return roundedInt64(hi32, lo32);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        const split = divmodInt64(src);
	        const buffer = uint8ArrayToBuffer(b);
	        buffer.writeInt32BE(split.hi32, offset);
	        buffer.writeUInt32BE(split.lo32, offset + 4);
	        return 8;
	    }
	}
	Layout$1.NearInt64BE = NearInt64BE;
	/**
	 * Represent a 32-bit floating point number in little-endian format.
	 *
	 * *Factory*: {@link module:Layout.f32|f32}
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class Float extends Layout {
	    constructor(property) {
	        super(4, property);
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return uint8ArrayToBuffer(b).readFloatLE(offset);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        uint8ArrayToBuffer(b).writeFloatLE(src, offset);
	        return 4;
	    }
	}
	Layout$1.Float = Float;
	/**
	 * Represent a 32-bit floating point number in big-endian format.
	 *
	 * *Factory*: {@link module:Layout.f32be|f32be}
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class FloatBE extends Layout {
	    constructor(property) {
	        super(4, property);
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return uint8ArrayToBuffer(b).readFloatBE(offset);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        uint8ArrayToBuffer(b).writeFloatBE(src, offset);
	        return 4;
	    }
	}
	Layout$1.FloatBE = FloatBE;
	/**
	 * Represent a 64-bit floating point number in little-endian format.
	 *
	 * *Factory*: {@link module:Layout.f64|f64}
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class Double extends Layout {
	    constructor(property) {
	        super(8, property);
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return uint8ArrayToBuffer(b).readDoubleLE(offset);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        uint8ArrayToBuffer(b).writeDoubleLE(src, offset);
	        return 8;
	    }
	}
	Layout$1.Double = Double;
	/**
	 * Represent a 64-bit floating point number in big-endian format.
	 *
	 * *Factory*: {@link module:Layout.f64be|f64be}
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class DoubleBE extends Layout {
	    constructor(property) {
	        super(8, property);
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        return uint8ArrayToBuffer(b).readDoubleBE(offset);
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        uint8ArrayToBuffer(b).writeDoubleBE(src, offset);
	        return 8;
	    }
	}
	Layout$1.DoubleBE = DoubleBE;
	/**
	 * Represent a contiguous sequence of a specific layout as an Array.
	 *
	 * *Factory*: {@link module:Layout.seq|seq}
	 *
	 * @param {Layout} elementLayout - initializer for {@link
	 * Sequence#elementLayout|elementLayout}.
	 *
	 * @param {(Number|ExternalLayout)} count - initializer for {@link
	 * Sequence#count|count}.  The parameter must be either a positive
	 * integer or an instance of {@link ExternalLayout}.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class Sequence extends Layout {
	    constructor(elementLayout, count, property) {
	        if (!(elementLayout instanceof Layout)) {
	            throw new TypeError('elementLayout must be a Layout');
	        }
	        if (!(((count instanceof ExternalLayout) && count.isCount())
	            || (Number.isInteger(count) && (0 <= count)))) {
	            throw new TypeError('count must be non-negative integer '
	                + 'or an unsigned integer ExternalLayout');
	        }
	        let span = -1;
	        if ((!(count instanceof ExternalLayout))
	            && (0 < elementLayout.span)) {
	            span = count * elementLayout.span;
	        }
	        super(span, property);
	        /** The layout for individual elements of the sequence. */
	        this.elementLayout = elementLayout;
	        /** The number of elements in the sequence.
	         *
	         * This will be either a non-negative integer or an instance of
	         * {@link ExternalLayout} for which {@link
	         * ExternalLayout#isCount|isCount()} is `true`. */
	        this.count = count;
	    }
	    /** @override */
	    getSpan(b, offset = 0) {
	        if (0 <= this.span) {
	            return this.span;
	        }
	        let span = 0;
	        let count = this.count;
	        if (count instanceof ExternalLayout) {
	            count = count.decode(b, offset);
	        }
	        if (0 < this.elementLayout.span) {
	            span = count * this.elementLayout.span;
	        }
	        else {
	            let idx = 0;
	            while (idx < count) {
	                span += this.elementLayout.getSpan(b, offset + span);
	                ++idx;
	            }
	        }
	        return span;
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const rv = [];
	        let i = 0;
	        let count = this.count;
	        if (count instanceof ExternalLayout) {
	            count = count.decode(b, offset);
	        }
	        while (i < count) {
	            rv.push(this.elementLayout.decode(b, offset));
	            offset += this.elementLayout.getSpan(b, offset);
	            i += 1;
	        }
	        return rv;
	    }
	    /** Implement {@link Layout#encode|encode} for {@link Sequence}.
	     *
	     * **NOTE** If `src` is shorter than {@link Sequence#count|count} then
	     * the unused space in the buffer is left unchanged.  If `src` is
	     * longer than {@link Sequence#count|count} the unneeded elements are
	     * ignored.
	     *
	     * **NOTE** If {@link Layout#count|count} is an instance of {@link
	     * ExternalLayout} then the length of `src` will be encoded as the
	     * count after `src` is encoded. */
	    encode(src, b, offset = 0) {
	        const elo = this.elementLayout;
	        const span = src.reduce((span, v) => {
	            return span + elo.encode(v, b, offset + span);
	        }, 0);
	        if (this.count instanceof ExternalLayout) {
	            this.count.encode(src.length, b, offset);
	        }
	        return span;
	    }
	}
	Layout$1.Sequence = Sequence;
	/**
	 * Represent a contiguous sequence of arbitrary layout elements as an
	 * Object.
	 *
	 * *Factory*: {@link module:Layout.struct|struct}
	 *
	 * **NOTE** The {@link Layout#span|span} of the structure is variable
	 * if any layout in {@link Structure#fields|fields} has a variable
	 * span.  When {@link Layout#encode|encoding} we must have a value for
	 * all variable-length fields, or we wouldn't be able to figure out
	 * how much space to use for storage.  We can only identify the value
	 * for a field when it has a {@link Layout#property|property}.  As
	 * such, although a structure may contain both unnamed fields and
	 * variable-length fields, it cannot contain an unnamed
	 * variable-length field.
	 *
	 * @param {Layout[]} fields - initializer for {@link
	 * Structure#fields|fields}.  An error is raised if this contains a
	 * variable-length field for which a {@link Layout#property|property}
	 * is not defined.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @param {Boolean} [decodePrefixes] - initializer for {@link
	 * Structure#decodePrefixes|property}.
	 *
	 * @throws {Error} - if `fields` contains an unnamed variable-length
	 * layout.
	 *
	 * @augments {Layout}
	 */
	class Structure extends Layout {
	    constructor(fields, property, decodePrefixes) {
	        if (!(Array.isArray(fields)
	            && fields.reduce((acc, v) => acc && (v instanceof Layout), true))) {
	            throw new TypeError('fields must be array of Layout instances');
	        }
	        if (('boolean' === typeof property)
	            && (undefined === decodePrefixes)) {
	            decodePrefixes = property;
	            property = undefined;
	        }
	        /* Verify absence of unnamed variable-length fields. */
	        for (const fd of fields) {
	            if ((0 > fd.span)
	                && (undefined === fd.property)) {
	                throw new Error('fields cannot contain unnamed variable-length layout');
	            }
	        }
	        let span = -1;
	        try {
	            span = fields.reduce((span, fd) => span + fd.getSpan(), 0);
	        }
	        catch (e) {
	            // ignore error
	        }
	        super(span, property);
	        /** The sequence of {@link Layout} values that comprise the
	         * structure.
	         *
	         * The individual elements need not be the same type, and may be
	         * either scalar or aggregate layouts.  If a member layout leaves
	         * its {@link Layout#property|property} undefined the
	         * corresponding region of the buffer associated with the element
	         * will not be mutated.
	         *
	         * @type {Layout[]} */
	        this.fields = fields;
	        /** Control behavior of {@link Layout#decode|decode()} given short
	         * buffers.
	         *
	         * In some situations a structure many be extended with additional
	         * fields over time, with older installations providing only a
	         * prefix of the full structure.  If this property is `true`
	         * decoding will accept those buffers and leave subsequent fields
	         * undefined, as long as the buffer ends at a field boundary.
	         * Defaults to `false`. */
	        this.decodePrefixes = !!decodePrefixes;
	    }
	    /** @override */
	    getSpan(b, offset = 0) {
	        if (0 <= this.span) {
	            return this.span;
	        }
	        let span = 0;
	        try {
	            span = this.fields.reduce((span, fd) => {
	                const fsp = fd.getSpan(b, offset);
	                offset += fsp;
	                return span + fsp;
	            }, 0);
	        }
	        catch (e) {
	            throw new RangeError('indeterminate span');
	        }
	        return span;
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        checkUint8Array(b);
	        const dest = this.makeDestinationObject();
	        for (const fd of this.fields) {
	            if (undefined !== fd.property) {
	                dest[fd.property] = fd.decode(b, offset);
	            }
	            offset += fd.getSpan(b, offset);
	            if (this.decodePrefixes
	                && (b.length === offset)) {
	                break;
	            }
	        }
	        return dest;
	    }
	    /** Implement {@link Layout#encode|encode} for {@link Structure}.
	     *
	     * If `src` is missing a property for a member with a defined {@link
	     * Layout#property|property} the corresponding region of the buffer is
	     * left unmodified. */
	    encode(src, b, offset = 0) {
	        const firstOffset = offset;
	        let lastOffset = 0;
	        let lastWrote = 0;
	        for (const fd of this.fields) {
	            let span = fd.span;
	            lastWrote = (0 < span) ? span : 0;
	            if (undefined !== fd.property) {
	                const fv = src[fd.property];
	                if (undefined !== fv) {
	                    lastWrote = fd.encode(fv, b, offset);
	                    if (0 > span) {
	                        /* Read the as-encoded span, which is not necessarily the
	                         * same as what we wrote. */
	                        span = fd.getSpan(b, offset);
	                    }
	                }
	            }
	            lastOffset = offset;
	            offset += span;
	        }
	        /* Use (lastOffset + lastWrote) instead of offset because the last
	         * item may have had a dynamic length and we don't want to include
	         * the padding between it and the end of the space reserved for
	         * it. */
	        return (lastOffset + lastWrote) - firstOffset;
	    }
	    /** @override */
	    fromArray(values) {
	        const dest = this.makeDestinationObject();
	        for (const fd of this.fields) {
	            if ((undefined !== fd.property)
	                && (0 < values.length)) {
	                dest[fd.property] = values.shift();
	            }
	        }
	        return dest;
	    }
	    /**
	     * Get access to the layout of a given property.
	     *
	     * @param {String} property - the structure member of interest.
	     *
	     * @return {Layout} - the layout associated with `property`, or
	     * undefined if there is no such property.
	     */
	    layoutFor(property) {
	        if ('string' !== typeof property) {
	            throw new TypeError('property must be string');
	        }
	        for (const fd of this.fields) {
	            if (fd.property === property) {
	                return fd;
	            }
	        }
	        return undefined;
	    }
	    /**
	     * Get the offset of a structure member.
	     *
	     * @param {String} property - the structure member of interest.
	     *
	     * @return {Number} - the offset in bytes to the start of `property`
	     * within the structure, or undefined if `property` is not a field
	     * within the structure.  If the property is a member but follows a
	     * variable-length structure member a negative number will be
	     * returned.
	     */
	    offsetOf(property) {
	        if ('string' !== typeof property) {
	            throw new TypeError('property must be string');
	        }
	        let offset = 0;
	        for (const fd of this.fields) {
	            if (fd.property === property) {
	                return offset;
	            }
	            if (0 > fd.span) {
	                offset = -1;
	            }
	            else if (0 <= offset) {
	                offset += fd.span;
	            }
	        }
	        return undefined;
	    }
	}
	Layout$1.Structure = Structure;
	/**
	 * An object that can provide a {@link
	 * Union#discriminator|discriminator} API for {@link Union}.
	 *
	 * **NOTE** This is an abstract base class; you can create instances
	 * if it amuses you, but they won't support the {@link
	 * UnionDiscriminator#encode|encode} or {@link
	 * UnionDiscriminator#decode|decode} functions.
	 *
	 * @param {string} [property] - Default for {@link
	 * UnionDiscriminator#property|property}.
	 *
	 * @abstract
	 */
	class UnionDiscriminator {
	    constructor(property) {
	        /** The {@link Layout#property|property} to be used when the
	         * discriminator is referenced in isolation (generally when {@link
	         * Union#decode|Union decode} cannot delegate to a specific
	         * variant). */
	        this.property = property;
	    }
	    /** Analog to {@link Layout#decode|Layout decode} for union discriminators.
	     *
	     * The implementation of this method need not reference the buffer if
	     * variant information is available through other means. */
	    decode(b, offset) {
	        throw new Error('UnionDiscriminator is abstract');
	    }
	    /** Analog to {@link Layout#decode|Layout encode} for union discriminators.
	     *
	     * The implementation of this method need not store the value if
	     * variant information is maintained through other means. */
	    encode(src, b, offset) {
	        throw new Error('UnionDiscriminator is abstract');
	    }
	}
	Layout$1.UnionDiscriminator = UnionDiscriminator;
	/**
	 * An object that can provide a {@link
	 * UnionDiscriminator|discriminator API} for {@link Union} using an
	 * unsigned integral {@link Layout} instance located either inside or
	 * outside the union.
	 *
	 * @param {ExternalLayout} layout - initializes {@link
	 * UnionLayoutDiscriminator#layout|layout}.  Must satisfy {@link
	 * ExternalLayout#isCount|isCount()}.
	 *
	 * @param {string} [property] - Default for {@link
	 * UnionDiscriminator#property|property}, superseding the property
	 * from `layout`, but defaulting to `variant` if neither `property`
	 * nor layout provide a property name.
	 *
	 * @augments {UnionDiscriminator}
	 */
	class UnionLayoutDiscriminator extends UnionDiscriminator {
	    constructor(layout, property) {
	        if (!((layout instanceof ExternalLayout)
	            && layout.isCount())) {
	            throw new TypeError('layout must be an unsigned integer ExternalLayout');
	        }
	        super(property || layout.property || 'variant');
	        /** The {@link ExternalLayout} used to access the discriminator
	         * value. */
	        this.layout = layout;
	    }
	    /** Delegate decoding to {@link UnionLayoutDiscriminator#layout|layout}. */
	    decode(b, offset) {
	        return this.layout.decode(b, offset);
	    }
	    /** Delegate encoding to {@link UnionLayoutDiscriminator#layout|layout}. */
	    encode(src, b, offset) {
	        return this.layout.encode(src, b, offset);
	    }
	}
	Layout$1.UnionLayoutDiscriminator = UnionLayoutDiscriminator;
	/**
	 * Represent any number of span-compatible layouts.
	 *
	 * *Factory*: {@link module:Layout.union|union}
	 *
	 * If the union has a {@link Union#defaultLayout|default layout} that
	 * layout must have a non-negative {@link Layout#span|span}.  The span
	 * of a fixed-span union includes its {@link
	 * Union#discriminator|discriminator} if the variant is a {@link
	 * Union#usesPrefixDiscriminator|prefix of the union}, plus the span
	 * of its {@link Union#defaultLayout|default layout}.
	 *
	 * If the union does not have a default layout then the encoded span
	 * of the union depends on the encoded span of its variant (which may
	 * be fixed or variable).
	 *
	 * {@link VariantLayout#layout|Variant layout}s are added through
	 * {@link Union#addVariant|addVariant}.  If the union has a default
	 * layout, the span of the {@link VariantLayout#layout|layout
	 * contained by the variant} must not exceed the span of the {@link
	 * Union#defaultLayout|default layout} (minus the span of a {@link
	 * Union#usesPrefixDiscriminator|prefix disriminator}, if used).  The
	 * span of the variant will equal the span of the union itself.
	 *
	 * The variant for a buffer can only be identified from the {@link
	 * Union#discriminator|discriminator} {@link
	 * UnionDiscriminator#property|property} (in the case of the {@link
	 * Union#defaultLayout|default layout}), or by using {@link
	 * Union#getVariant|getVariant} and examining the resulting {@link
	 * VariantLayout} instance.
	 *
	 * A variant compatible with a JavaScript object can be identified
	 * using {@link Union#getSourceVariant|getSourceVariant}.
	 *
	 * @param {(UnionDiscriminator|ExternalLayout|Layout)} discr - How to
	 * identify the layout used to interpret the union contents.  The
	 * parameter must be an instance of {@link UnionDiscriminator}, an
	 * {@link ExternalLayout} that satisfies {@link
	 * ExternalLayout#isCount|isCount()}, or {@link UInt} (or {@link
	 * UIntBE}).  When a non-external layout element is passed the layout
	 * appears at the start of the union.  In all cases the (synthesized)
	 * {@link UnionDiscriminator} instance is recorded as {@link
	 * Union#discriminator|discriminator}.
	 *
	 * @param {(Layout|null)} defaultLayout - initializer for {@link
	 * Union#defaultLayout|defaultLayout}.  If absent defaults to `null`.
	 * If `null` there is no default layout: the union has data-dependent
	 * length and attempts to decode or encode unrecognized variants will
	 * throw an exception.  A {@link Layout} instance must have a
	 * non-negative {@link Layout#span|span}, and if it lacks a {@link
	 * Layout#property|property} the {@link
	 * Union#defaultLayout|defaultLayout} will be a {@link
	 * Layout#replicate|replica} with property `content`.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class Union extends Layout {
	    constructor(discr, defaultLayout, property) {
	        let discriminator;
	        if ((discr instanceof UInt)
	            || (discr instanceof UIntBE)) {
	            discriminator = new UnionLayoutDiscriminator(new OffsetLayout(discr));
	        }
	        else if ((discr instanceof ExternalLayout)
	            && discr.isCount()) {
	            discriminator = new UnionLayoutDiscriminator(discr);
	        }
	        else if (!(discr instanceof UnionDiscriminator)) {
	            throw new TypeError('discr must be a UnionDiscriminator '
	                + 'or an unsigned integer layout');
	        }
	        else {
	            discriminator = discr;
	        }
	        if (undefined === defaultLayout) {
	            defaultLayout = null;
	        }
	        if (!((null === defaultLayout)
	            || (defaultLayout instanceof Layout))) {
	            throw new TypeError('defaultLayout must be null or a Layout');
	        }
	        if (null !== defaultLayout) {
	            if (0 > defaultLayout.span) {
	                throw new Error('defaultLayout must have constant span');
	            }
	            if (undefined === defaultLayout.property) {
	                defaultLayout = defaultLayout.replicate('content');
	            }
	        }
	        /* The union span can be estimated only if there's a default
	         * layout.  The union spans its default layout, plus any prefix
	         * variant layout.  By construction both layouts, if present, have
	         * non-negative span. */
	        let span = -1;
	        if (defaultLayout) {
	            span = defaultLayout.span;
	            if ((0 <= span) && ((discr instanceof UInt)
	                || (discr instanceof UIntBE))) {
	                span += discriminator.layout.span;
	            }
	        }
	        super(span, property);
	        /** The interface for the discriminator value in isolation.
	         *
	         * This a {@link UnionDiscriminator} either passed to the
	         * constructor or synthesized from the `discr` constructor
	         * argument.  {@link
	         * Union#usesPrefixDiscriminator|usesPrefixDiscriminator} will be
	         * `true` iff the `discr` parameter was a non-offset {@link
	         * Layout} instance. */
	        this.discriminator = discriminator;
	        /** `true` if the {@link Union#discriminator|discriminator} is the
	         * first field in the union.
	         *
	         * If `false` the discriminator is obtained from somewhere
	         * else. */
	        this.usesPrefixDiscriminator = (discr instanceof UInt)
	            || (discr instanceof UIntBE);
	        /** The layout for non-discriminator content when the value of the
	         * discriminator is not recognized.
	         *
	         * This is the value passed to the constructor.  It is
	         * structurally equivalent to the second component of {@link
	         * Union#layout|layout} but may have a different property
	         * name. */
	        this.defaultLayout = defaultLayout;
	        /** A registry of allowed variants.
	         *
	         * The keys are unsigned integers which should be compatible with
	         * {@link Union.discriminator|discriminator}.  The property value
	         * is the corresponding {@link VariantLayout} instances assigned
	         * to this union by {@link Union#addVariant|addVariant}.
	         *
	         * **NOTE** The registry remains mutable so that variants can be
	         * {@link Union#addVariant|added} at any time.  Users should not
	         * manipulate the content of this property. */
	        this.registry = {};
	        /* Private variable used when invoking getSourceVariant */
	        let boundGetSourceVariant = this.defaultGetSourceVariant.bind(this);
	        /** Function to infer the variant selected by a source object.
	         *
	         * Defaults to {@link
	         * Union#defaultGetSourceVariant|defaultGetSourceVariant} but may
	         * be overridden using {@link
	         * Union#configGetSourceVariant|configGetSourceVariant}.
	         *
	         * @param {Object} src - as with {@link
	         * Union#defaultGetSourceVariant|defaultGetSourceVariant}.
	         *
	         * @returns {(undefined|VariantLayout)} The default variant
	         * (`undefined`) or first registered variant that uses a property
	         * available in `src`. */
	        this.getSourceVariant = function (src) {
	            return boundGetSourceVariant(src);
	        };
	        /** Function to override the implementation of {@link
	         * Union#getSourceVariant|getSourceVariant}.
	         *
	         * Use this if the desired variant cannot be identified using the
	         * algorithm of {@link
	         * Union#defaultGetSourceVariant|defaultGetSourceVariant}.
	         *
	         * **NOTE** The provided function will be invoked bound to this
	         * Union instance, providing local access to {@link
	         * Union#registry|registry}.
	         *
	         * @param {Function} gsv - a function that follows the API of
	         * {@link Union#defaultGetSourceVariant|defaultGetSourceVariant}. */
	        this.configGetSourceVariant = function (gsv) {
	            boundGetSourceVariant = gsv.bind(this);
	        };
	    }
	    /** @override */
	    getSpan(b, offset = 0) {
	        if (0 <= this.span) {
	            return this.span;
	        }
	        /* Default layouts always have non-negative span, so we don't have
	         * one and we have to recognize the variant which will in turn
	         * determine the span. */
	        const vlo = this.getVariant(b, offset);
	        if (!vlo) {
	            throw new Error('unable to determine span for unrecognized variant');
	        }
	        return vlo.getSpan(b, offset);
	    }
	    /**
	     * Method to infer a registered Union variant compatible with `src`.
	     *
	     * The first satisfied rule in the following sequence defines the
	     * return value:
	     * * If `src` has properties matching the Union discriminator and
	     *   the default layout, `undefined` is returned regardless of the
	     *   value of the discriminator property (this ensures the default
	     *   layout will be used);
	     * * If `src` has a property matching the Union discriminator, the
	     *   value of the discriminator identifies a registered variant, and
	     *   either (a) the variant has no layout, or (b) `src` has the
	     *   variant's property, then the variant is returned (because the
	     *   source satisfies the constraints of the variant it identifies);
	     * * If `src` does not have a property matching the Union
	     *   discriminator, but does have a property matching a registered
	     *   variant, then the variant is returned (because the source
	     *   matches a variant without an explicit conflict);
	     * * An error is thrown (because we either can't identify a variant,
	     *   or we were explicitly told the variant but can't satisfy it).
	     *
	     * @param {Object} src - an object presumed to be compatible with
	     * the content of the Union.
	     *
	     * @return {(undefined|VariantLayout)} - as described above.
	     *
	     * @throws {Error} - if `src` cannot be associated with a default or
	     * registered variant.
	     */
	    defaultGetSourceVariant(src) {
	        if (Object.prototype.hasOwnProperty.call(src, this.discriminator.property)) {
	            if (this.defaultLayout && this.defaultLayout.property
	                && Object.prototype.hasOwnProperty.call(src, this.defaultLayout.property)) {
	                return undefined;
	            }
	            const vlo = this.registry[src[this.discriminator.property]];
	            if (vlo
	                && ((!vlo.layout)
	                    || (vlo.property && Object.prototype.hasOwnProperty.call(src, vlo.property)))) {
	                return vlo;
	            }
	        }
	        else {
	            for (const tag in this.registry) {
	                const vlo = this.registry[tag];
	                if (vlo.property && Object.prototype.hasOwnProperty.call(src, vlo.property)) {
	                    return vlo;
	                }
	            }
	        }
	        throw new Error('unable to infer src variant');
	    }
	    /** Implement {@link Layout#decode|decode} for {@link Union}.
	     *
	     * If the variant is {@link Union#addVariant|registered} the return
	     * value is an instance of that variant, with no explicit
	     * discriminator.  Otherwise the {@link Union#defaultLayout|default
	     * layout} is used to decode the content. */
	    decode(b, offset = 0) {
	        let dest;
	        const dlo = this.discriminator;
	        const discr = dlo.decode(b, offset);
	        const clo = this.registry[discr];
	        if (undefined === clo) {
	            const defaultLayout = this.defaultLayout;
	            let contentOffset = 0;
	            if (this.usesPrefixDiscriminator) {
	                contentOffset = dlo.layout.span;
	            }
	            dest = this.makeDestinationObject();
	            dest[dlo.property] = discr;
	            // defaultLayout.property can be undefined, but this is allowed by buffer-layout
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            dest[defaultLayout.property] = defaultLayout.decode(b, offset + contentOffset);
	        }
	        else {
	            dest = clo.decode(b, offset);
	        }
	        return dest;
	    }
	    /** Implement {@link Layout#encode|encode} for {@link Union}.
	     *
	     * This API assumes the `src` object is consistent with the union's
	     * {@link Union#defaultLayout|default layout}.  To encode variants
	     * use the appropriate variant-specific {@link VariantLayout#encode}
	     * method. */
	    encode(src, b, offset = 0) {
	        const vlo = this.getSourceVariant(src);
	        if (undefined === vlo) {
	            const dlo = this.discriminator;
	            // this.defaultLayout is not undefined when vlo is undefined
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            const clo = this.defaultLayout;
	            let contentOffset = 0;
	            if (this.usesPrefixDiscriminator) {
	                contentOffset = dlo.layout.span;
	            }
	            dlo.encode(src[dlo.property], b, offset);
	            // clo.property is not undefined when vlo is undefined
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            return contentOffset + clo.encode(src[clo.property], b, offset + contentOffset);
	        }
	        return vlo.encode(src, b, offset);
	    }
	    /** Register a new variant structure within a union.  The newly
	     * created variant is returned.
	     *
	     * @param {Number} variant - initializer for {@link
	     * VariantLayout#variant|variant}.
	     *
	     * @param {Layout} layout - initializer for {@link
	     * VariantLayout#layout|layout}.
	     *
	     * @param {String} property - initializer for {@link
	     * Layout#property|property}.
	     *
	     * @return {VariantLayout} */
	    addVariant(variant, layout, property) {
	        const rv = new VariantLayout(this, variant, layout, property);
	        this.registry[variant] = rv;
	        return rv;
	    }
	    /**
	     * Get the layout associated with a registered variant.
	     *
	     * If `vb` does not produce a registered variant the function returns
	     * `undefined`.
	     *
	     * @param {(Number|Uint8Array)} vb - either the variant number, or a
	     * buffer from which the discriminator is to be read.
	     *
	     * @param {Number} offset - offset into `vb` for the start of the
	     * union.  Used only when `vb` is an instance of {Uint8Array}.
	     *
	     * @return {({VariantLayout}|undefined)}
	     */
	    getVariant(vb, offset = 0) {
	        let variant;
	        if (vb instanceof Uint8Array) {
	            variant = this.discriminator.decode(vb, offset);
	        }
	        else {
	            variant = vb;
	        }
	        return this.registry[variant];
	    }
	}
	Layout$1.Union = Union;
	/**
	 * Represent a specific variant within a containing union.
	 *
	 * **NOTE** The {@link Layout#span|span} of the variant may include
	 * the span of the {@link Union#discriminator|discriminator} used to
	 * identify it, but values read and written using the variant strictly
	 * conform to the content of {@link VariantLayout#layout|layout}.
	 *
	 * **NOTE** User code should not invoke this constructor directly.  Use
	 * the union {@link Union#addVariant|addVariant} helper method.
	 *
	 * @param {Union} union - initializer for {@link
	 * VariantLayout#union|union}.
	 *
	 * @param {Number} variant - initializer for {@link
	 * VariantLayout#variant|variant}.
	 *
	 * @param {Layout} [layout] - initializer for {@link
	 * VariantLayout#layout|layout}.  If absent the variant carries no
	 * data.
	 *
	 * @param {String} [property] - initializer for {@link
	 * Layout#property|property}.  Unlike many other layouts, variant
	 * layouts normally include a property name so they can be identified
	 * within their containing {@link Union}.  The property identifier may
	 * be absent only if `layout` is is absent.
	 *
	 * @augments {Layout}
	 */
	class VariantLayout extends Layout {
	    constructor(union, variant, layout, property) {
	        if (!(union instanceof Union)) {
	            throw new TypeError('union must be a Union');
	        }
	        if ((!Number.isInteger(variant)) || (0 > variant)) {
	            throw new TypeError('variant must be a (non-negative) integer');
	        }
	        if (('string' === typeof layout)
	            && (undefined === property)) {
	            property = layout;
	            layout = null;
	        }
	        if (layout) {
	            if (!(layout instanceof Layout)) {
	                throw new TypeError('layout must be a Layout');
	            }
	            if ((null !== union.defaultLayout)
	                && (0 <= layout.span)
	                && (layout.span > union.defaultLayout.span)) {
	                throw new Error('variant span exceeds span of containing union');
	            }
	            if ('string' !== typeof property) {
	                throw new TypeError('variant must have a String property');
	            }
	        }
	        let span = union.span;
	        if (0 > union.span) {
	            span = layout ? layout.span : 0;
	            if ((0 <= span) && union.usesPrefixDiscriminator) {
	                span += union.discriminator.layout.span;
	            }
	        }
	        super(span, property);
	        /** The {@link Union} to which this variant belongs. */
	        this.union = union;
	        /** The unsigned integral value identifying this variant within
	         * the {@link Union#discriminator|discriminator} of the containing
	         * union. */
	        this.variant = variant;
	        /** The {@link Layout} to be used when reading/writing the
	         * non-discriminator part of the {@link
	         * VariantLayout#union|union}.  If `null` the variant carries no
	         * data. */
	        this.layout = layout || null;
	    }
	    /** @override */
	    getSpan(b, offset = 0) {
	        if (0 <= this.span) {
	            /* Will be equal to the containing union span if that is not
	             * variable. */
	            return this.span;
	        }
	        let contentOffset = 0;
	        if (this.union.usesPrefixDiscriminator) {
	            contentOffset = this.union.discriminator.layout.span;
	        }
	        /* Span is defined solely by the variant (and prefix discriminator) */
	        let span = 0;
	        if (this.layout) {
	            span = this.layout.getSpan(b, offset + contentOffset);
	        }
	        return contentOffset + span;
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const dest = this.makeDestinationObject();
	        if (this !== this.union.getVariant(b, offset)) {
	            throw new Error('variant mismatch');
	        }
	        let contentOffset = 0;
	        if (this.union.usesPrefixDiscriminator) {
	            contentOffset = this.union.discriminator.layout.span;
	        }
	        if (this.layout) {
	            dest[this.property] = this.layout.decode(b, offset + contentOffset);
	        }
	        else if (this.property) {
	            dest[this.property] = true;
	        }
	        else if (this.union.usesPrefixDiscriminator) {
	            dest[this.union.discriminator.property] = this.variant;
	        }
	        return dest;
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        let contentOffset = 0;
	        if (this.union.usesPrefixDiscriminator) {
	            contentOffset = this.union.discriminator.layout.span;
	        }
	        if (this.layout
	            && (!Object.prototype.hasOwnProperty.call(src, this.property))) {
	            throw new TypeError('variant lacks property ' + this.property);
	        }
	        this.union.discriminator.encode(this.variant, b, offset);
	        let span = contentOffset;
	        if (this.layout) {
	            this.layout.encode(src[this.property], b, offset + contentOffset);
	            span += this.layout.getSpan(b, offset + contentOffset);
	            if ((0 <= this.union.span)
	                && (span > this.union.span)) {
	                throw new Error('encoded variant overruns containing union');
	            }
	        }
	        return span;
	    }
	    /** Delegate {@link Layout#fromArray|fromArray} to {@link
	     * VariantLayout#layout|layout}. */
	    fromArray(values) {
	        if (this.layout) {
	            return this.layout.fromArray(values);
	        }
	        return undefined;
	    }
	}
	Layout$1.VariantLayout = VariantLayout;
	/** JavaScript chose to define bitwise operations as operating on
	 * signed 32-bit values in 2's complement form, meaning any integer
	 * with bit 31 set is going to look negative.  For right shifts that's
	 * not a problem, because `>>>` is a logical shift, but for every
	 * other bitwise operator we have to compensate for possible negative
	 * results. */
	function fixBitwiseResult(v) {
	    if (0 > v) {
	        v += 0x100000000;
	    }
	    return v;
	}
	/**
	 * Contain a sequence of bit fields as an unsigned integer.
	 *
	 * *Factory*: {@link module:Layout.bits|bits}
	 *
	 * This is a container element; within it there are {@link BitField}
	 * instances that provide the extracted properties.  The container
	 * simply defines the aggregate representation and its bit ordering.
	 * The representation is an object containing properties with numeric
	 * or {@link Boolean} values.
	 *
	 * {@link BitField}s are added with the {@link
	 * BitStructure#addField|addField} and {@link
	 * BitStructure#addBoolean|addBoolean} methods.

	 * @param {Layout} word - initializer for {@link
	 * BitStructure#word|word}.  The parameter must be an instance of
	 * {@link UInt} (or {@link UIntBE}) that is no more than 4 bytes wide.
	 *
	 * @param {bool} [msb] - `true` if the bit numbering starts at the
	 * most significant bit of the containing word; `false` (default) if
	 * it starts at the least significant bit of the containing word.  If
	 * the parameter at this position is a string and `property` is
	 * `undefined` the value of this argument will instead be used as the
	 * value of `property`.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class BitStructure extends Layout {
	    constructor(word, msb, property) {
	        if (!((word instanceof UInt)
	            || (word instanceof UIntBE))) {
	            throw new TypeError('word must be a UInt or UIntBE layout');
	        }
	        if (('string' === typeof msb)
	            && (undefined === property)) {
	            property = msb;
	            msb = false;
	        }
	        if (4 < word.span) {
	            throw new RangeError('word cannot exceed 32 bits');
	        }
	        super(word.span, property);
	        /** The layout used for the packed value.  {@link BitField}
	         * instances are packed sequentially depending on {@link
	         * BitStructure#msb|msb}. */
	        this.word = word;
	        /** Whether the bit sequences are packed starting at the most
	         * significant bit growing down (`true`), or the least significant
	         * bit growing up (`false`).
	         *
	         * **NOTE** Regardless of this value, the least significant bit of
	         * any {@link BitField} value is the least significant bit of the
	         * corresponding section of the packed value. */
	        this.msb = !!msb;
	        /** The sequence of {@link BitField} layouts that comprise the
	         * packed structure.
	         *
	         * **NOTE** The array remains mutable to allow fields to be {@link
	         * BitStructure#addField|added} after construction.  Users should
	         * not manipulate the content of this property.*/
	        this.fields = [];
	        /* Storage for the value.  Capture a variable instead of using an
	         * instance property because we don't want anything to change the
	         * value without going through the mutator. */
	        let value = 0;
	        this._packedSetValue = function (v) {
	            value = fixBitwiseResult(v);
	            return this;
	        };
	        this._packedGetValue = function () {
	            return value;
	        };
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const dest = this.makeDestinationObject();
	        const value = this.word.decode(b, offset);
	        this._packedSetValue(value);
	        for (const fd of this.fields) {
	            if (undefined !== fd.property) {
	                dest[fd.property] = fd.decode(b);
	            }
	        }
	        return dest;
	    }
	    /** Implement {@link Layout#encode|encode} for {@link BitStructure}.
	     *
	     * If `src` is missing a property for a member with a defined {@link
	     * Layout#property|property} the corresponding region of the packed
	     * value is left unmodified.  Unused bits are also left unmodified. */
	    encode(src, b, offset = 0) {
	        const value = this.word.decode(b, offset);
	        this._packedSetValue(value);
	        for (const fd of this.fields) {
	            if (undefined !== fd.property) {
	                const fv = src[fd.property];
	                if (undefined !== fv) {
	                    fd.encode(fv);
	                }
	            }
	        }
	        return this.word.encode(this._packedGetValue(), b, offset);
	    }
	    /** Register a new bitfield with a containing bit structure.  The
	     * resulting bitfield is returned.
	     *
	     * @param {Number} bits - initializer for {@link BitField#bits|bits}.
	     *
	     * @param {string} property - initializer for {@link
	     * Layout#property|property}.
	     *
	     * @return {BitField} */
	    addField(bits, property) {
	        const bf = new BitField(this, bits, property);
	        this.fields.push(bf);
	        return bf;
	    }
	    /** As with {@link BitStructure#addField|addField} for single-bit
	     * fields with `boolean` value representation.
	     *
	     * @param {string} property - initializer for {@link
	     * Layout#property|property}.
	     *
	     * @return {Boolean} */
	    // `Boolean` conflicts with the native primitive type
	    // eslint-disable-next-line @typescript-eslint/ban-types
	    addBoolean(property) {
	        // This is my Boolean, not the Javascript one.
	        const bf = new Boolean$1(this, property);
	        this.fields.push(bf);
	        return bf;
	    }
	    /**
	     * Get access to the bit field for a given property.
	     *
	     * @param {String} property - the bit field of interest.
	     *
	     * @return {BitField} - the field associated with `property`, or
	     * undefined if there is no such property.
	     */
	    fieldFor(property) {
	        if ('string' !== typeof property) {
	            throw new TypeError('property must be string');
	        }
	        for (const fd of this.fields) {
	            if (fd.property === property) {
	                return fd;
	            }
	        }
	        return undefined;
	    }
	}
	Layout$1.BitStructure = BitStructure;
	/**
	 * Represent a sequence of bits within a {@link BitStructure}.
	 *
	 * All bit field values are represented as unsigned integers.
	 *
	 * **NOTE** User code should not invoke this constructor directly.
	 * Use the container {@link BitStructure#addField|addField} helper
	 * method.
	 *
	 * **NOTE** BitField instances are not instances of {@link Layout}
	 * since {@link Layout#span|span} measures 8-bit units.
	 *
	 * @param {BitStructure} container - initializer for {@link
	 * BitField#container|container}.
	 *
	 * @param {Number} bits - initializer for {@link BitField#bits|bits}.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 */
	class BitField {
	    constructor(container, bits, property) {
	        if (!(container instanceof BitStructure)) {
	            throw new TypeError('container must be a BitStructure');
	        }
	        if ((!Number.isInteger(bits)) || (0 >= bits)) {
	            throw new TypeError('bits must be positive integer');
	        }
	        const totalBits = 8 * container.span;
	        const usedBits = container.fields.reduce((sum, fd) => sum + fd.bits, 0);
	        if ((bits + usedBits) > totalBits) {
	            throw new Error('bits too long for span remainder ('
	                + (totalBits - usedBits) + ' of '
	                + totalBits + ' remain)');
	        }
	        /** The {@link BitStructure} instance to which this bit field
	         * belongs. */
	        this.container = container;
	        /** The span of this value in bits. */
	        this.bits = bits;
	        /** A mask of {@link BitField#bits|bits} bits isolating value bits
	         * that fit within the field.
	         *
	         * That is, it masks a value that has not yet been shifted into
	         * position within its containing packed integer. */
	        this.valueMask = (1 << bits) - 1;
	        if (32 === bits) { // shifted value out of range
	            this.valueMask = 0xFFFFFFFF;
	        }
	        /** The offset of the value within the containing packed unsigned
	         * integer.  The least significant bit of the packed value is at
	         * offset zero, regardless of bit ordering used. */
	        this.start = usedBits;
	        if (this.container.msb) {
	            this.start = totalBits - usedBits - bits;
	        }
	        /** A mask of {@link BitField#bits|bits} isolating the field value
	         * within the containing packed unsigned integer. */
	        this.wordMask = fixBitwiseResult(this.valueMask << this.start);
	        /** The property name used when this bitfield is represented in an
	         * Object.
	         *
	         * Intended to be functionally equivalent to {@link
	         * Layout#property}.
	         *
	         * If left undefined the corresponding span of bits will be
	         * treated as padding: it will not be mutated by {@link
	         * Layout#encode|encode} nor represented as a property in the
	         * decoded Object. */
	        this.property = property;
	    }
	    /** Store a value into the corresponding subsequence of the containing
	     * bit field. */
	    decode(b, offset) {
	        const word = this.container._packedGetValue();
	        const wordValue = fixBitwiseResult(word & this.wordMask);
	        const value = wordValue >>> this.start;
	        return value;
	    }
	    /** Store a value into the corresponding subsequence of the containing
	     * bit field.
	     *
	     * **NOTE** This is not a specialization of {@link
	     * Layout#encode|Layout.encode} and there is no return value. */
	    encode(value) {
	        if ('number' !== typeof value
	            || !Number.isInteger(value)
	            || (value !== fixBitwiseResult(value & this.valueMask))) {
	            throw new TypeError(nameWithProperty('BitField.encode', this)
	                + ' value must be integer not exceeding ' + this.valueMask);
	        }
	        const word = this.container._packedGetValue();
	        const wordValue = fixBitwiseResult(value << this.start);
	        this.container._packedSetValue(fixBitwiseResult(word & ~this.wordMask)
	            | wordValue);
	    }
	}
	Layout$1.BitField = BitField;
	/**
	 * Represent a single bit within a {@link BitStructure} as a
	 * JavaScript boolean.
	 *
	 * **NOTE** User code should not invoke this constructor directly.
	 * Use the container {@link BitStructure#addBoolean|addBoolean} helper
	 * method.
	 *
	 * @param {BitStructure} container - initializer for {@link
	 * BitField#container|container}.
	 *
	 * @param {string} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {BitField}
	 */
	/* eslint-disable no-extend-native */
	class Boolean$1 extends BitField {
	    constructor(container, property) {
	        super(container, 1, property);
	    }
	    /** Override {@link BitField#decode|decode} for {@link Boolean|Boolean}.
	     *
	     * @returns {boolean} */
	    decode(b, offset) {
	        return !!super.decode(b, offset);
	    }
	    /** @override */
	    encode(value) {
	        if ('boolean' === typeof value) {
	            // BitField requires integer values
	            value = +value;
	        }
	        super.encode(value);
	    }
	}
	Layout$1.Boolean = Boolean$1;
	/* eslint-enable no-extend-native */
	/**
	 * Contain a fixed-length block of arbitrary data, represented as a
	 * Uint8Array.
	 *
	 * *Factory*: {@link module:Layout.blob|blob}
	 *
	 * @param {(Number|ExternalLayout)} length - initializes {@link
	 * Blob#length|length}.
	 *
	 * @param {String} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class Blob extends Layout {
	    constructor(length, property) {
	        if (!(((length instanceof ExternalLayout) && length.isCount())
	            || (Number.isInteger(length) && (0 <= length)))) {
	            throw new TypeError('length must be positive integer '
	                + 'or an unsigned integer ExternalLayout');
	        }
	        let span = -1;
	        if (!(length instanceof ExternalLayout)) {
	            span = length;
	        }
	        super(span, property);
	        /** The number of bytes in the blob.
	         *
	         * This may be a non-negative integer, or an instance of {@link
	         * ExternalLayout} that satisfies {@link
	         * ExternalLayout#isCount|isCount()}. */
	        this.length = length;
	    }
	    /** @override */
	    getSpan(b, offset) {
	        let span = this.span;
	        if (0 > span) {
	            span = this.length.decode(b, offset);
	        }
	        return span;
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        let span = this.span;
	        if (0 > span) {
	            span = this.length.decode(b, offset);
	        }
	        return uint8ArrayToBuffer(b).slice(offset, offset + span);
	    }
	    /** Implement {@link Layout#encode|encode} for {@link Blob}.
	     *
	     * **NOTE** If {@link Layout#count|count} is an instance of {@link
	     * ExternalLayout} then the length of `src` will be encoded as the
	     * count after `src` is encoded. */
	    encode(src, b, offset) {
	        let span = this.length;
	        if (this.length instanceof ExternalLayout) {
	            span = src.length;
	        }
	        if (!(src instanceof Uint8Array && span === src.length)) {
	            throw new TypeError(nameWithProperty('Blob.encode', this)
	                + ' requires (length ' + span + ') Uint8Array as src');
	        }
	        if ((offset + span) > b.length) {
	            throw new RangeError('encoding overruns Uint8Array');
	        }
	        const srcBuffer = uint8ArrayToBuffer(src);
	        uint8ArrayToBuffer(b).write(srcBuffer.toString('hex'), offset, span, 'hex');
	        if (this.length instanceof ExternalLayout) {
	            this.length.encode(span, b, offset);
	        }
	        return span;
	    }
	}
	Layout$1.Blob = Blob;
	/**
	 * Contain a `NUL`-terminated UTF8 string.
	 *
	 * *Factory*: {@link module:Layout.cstr|cstr}
	 *
	 * **NOTE** Any UTF8 string that incorporates a zero-valued byte will
	 * not be correctly decoded by this layout.
	 *
	 * @param {String} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class CString extends Layout {
	    constructor(property) {
	        super(-1, property);
	    }
	    /** @override */
	    getSpan(b, offset = 0) {
	        checkUint8Array(b);
	        let idx = offset;
	        while ((idx < b.length) && (0 !== b[idx])) {
	            idx += 1;
	        }
	        return 1 + idx - offset;
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const span = this.getSpan(b, offset);
	        return uint8ArrayToBuffer(b).slice(offset, offset + span - 1).toString('utf-8');
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        /* Must force this to a string, lest it be a number and the
	         * "utf8-encoding" below actually allocate a buffer of length
	         * src */
	        if ('string' !== typeof src) {
	            src = String(src);
	        }
	        const srcb = buffer_1.Buffer.from(src, 'utf8');
	        const span = srcb.length;
	        if ((offset + span) > b.length) {
	            throw new RangeError('encoding overruns Buffer');
	        }
	        const buffer = uint8ArrayToBuffer(b);
	        srcb.copy(buffer, offset);
	        buffer[offset + span] = 0;
	        return span + 1;
	    }
	}
	Layout$1.CString = CString;
	/**
	 * Contain a UTF8 string with implicit length.
	 *
	 * *Factory*: {@link module:Layout.utf8|utf8}
	 *
	 * **NOTE** Because the length is implicit in the size of the buffer
	 * this layout should be used only in isolation, or in a situation
	 * where the length can be expressed by operating on a slice of the
	 * containing buffer.
	 *
	 * @param {Number} [maxSpan] - the maximum length allowed for encoded
	 * string content.  If not provided there is no bound on the allowed
	 * content.
	 *
	 * @param {String} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class UTF8 extends Layout {
	    constructor(maxSpan, property) {
	        if (('string' === typeof maxSpan) && (undefined === property)) {
	            property = maxSpan;
	            maxSpan = undefined;
	        }
	        if (undefined === maxSpan) {
	            maxSpan = -1;
	        }
	        else if (!Number.isInteger(maxSpan)) {
	            throw new TypeError('maxSpan must be an integer');
	        }
	        super(-1, property);
	        /** The maximum span of the layout in bytes.
	         *
	         * Positive values are generally expected.  Zero is abnormal.
	         * Attempts to encode or decode a value that exceeds this length
	         * will throw a `RangeError`.
	         *
	         * A negative value indicates that there is no bound on the length
	         * of the content. */
	        this.maxSpan = maxSpan;
	    }
	    /** @override */
	    getSpan(b, offset = 0) {
	        checkUint8Array(b);
	        return b.length - offset;
	    }
	    /** @override */
	    decode(b, offset = 0) {
	        const span = this.getSpan(b, offset);
	        if ((0 <= this.maxSpan)
	            && (this.maxSpan < span)) {
	            throw new RangeError('text length exceeds maxSpan');
	        }
	        return uint8ArrayToBuffer(b).slice(offset, offset + span).toString('utf-8');
	    }
	    /** @override */
	    encode(src, b, offset = 0) {
	        /* Must force this to a string, lest it be a number and the
	         * "utf8-encoding" below actually allocate a buffer of length
	         * src */
	        if ('string' !== typeof src) {
	            src = String(src);
	        }
	        const srcb = buffer_1.Buffer.from(src, 'utf8');
	        const span = srcb.length;
	        if ((0 <= this.maxSpan)
	            && (this.maxSpan < span)) {
	            throw new RangeError('text length exceeds maxSpan');
	        }
	        if ((offset + span) > b.length) {
	            throw new RangeError('encoding overruns Buffer');
	        }
	        srcb.copy(uint8ArrayToBuffer(b), offset);
	        return span;
	    }
	}
	Layout$1.UTF8 = UTF8;
	/**
	 * Contain a constant value.
	 *
	 * This layout may be used in cases where a JavaScript value can be
	 * inferred without an expression in the binary encoding.  An example
	 * would be a {@link VariantLayout|variant layout} where the content
	 * is implied by the union {@link Union#discriminator|discriminator}.
	 *
	 * @param {Object|Number|String} value - initializer for {@link
	 * Constant#value|value}.  If the value is an object (or array) and
	 * the application intends the object to remain unchanged regardless
	 * of what is done to values decoded by this layout, the value should
	 * be frozen prior passing it to this constructor.
	 *
	 * @param {String} [property] - initializer for {@link
	 * Layout#property|property}.
	 *
	 * @augments {Layout}
	 */
	class Constant extends Layout {
	    constructor(value, property) {
	        super(0, property);
	        /** The value produced by this constant when the layout is {@link
	         * Constant#decode|decoded}.
	         *
	         * Any JavaScript value including `null` and `undefined` is
	         * permitted.
	         *
	         * **WARNING** If `value` passed in the constructor was not
	         * frozen, it is possible for users of decoded values to change
	         * the content of the value. */
	        this.value = value;
	    }
	    /** @override */
	    decode(b, offset) {
	        return this.value;
	    }
	    /** @override */
	    encode(src, b, offset) {
	        /* Constants take no space */
	        return 0;
	    }
	}
	Layout$1.Constant = Constant;
	/** Factory for {@link GreedyCount}. */
	Layout$1.greedy = ((elementSpan, property) => new GreedyCount(elementSpan, property));
	/** Factory for {@link OffsetLayout}. */
	var offset = Layout$1.offset = ((layout, offset, property) => new OffsetLayout(layout, offset, property));
	/** Factory for {@link UInt|unsigned int layouts} spanning one
	 * byte. */
	var u8 = Layout$1.u8 = ((property) => new UInt(1, property));
	/** Factory for {@link UInt|little-endian unsigned int layouts}
	 * spanning two bytes. */
	var u16 = Layout$1.u16 = ((property) => new UInt(2, property));
	/** Factory for {@link UInt|little-endian unsigned int layouts}
	 * spanning three bytes. */
	Layout$1.u24 = ((property) => new UInt(3, property));
	/** Factory for {@link UInt|little-endian unsigned int layouts}
	 * spanning four bytes. */
	var u32 = Layout$1.u32 = ((property) => new UInt(4, property));
	/** Factory for {@link UInt|little-endian unsigned int layouts}
	 * spanning five bytes. */
	Layout$1.u40 = ((property) => new UInt(5, property));
	/** Factory for {@link UInt|little-endian unsigned int layouts}
	 * spanning six bytes. */
	Layout$1.u48 = ((property) => new UInt(6, property));
	/** Factory for {@link NearUInt64|little-endian unsigned int
	 * layouts} interpreted as Numbers. */
	var nu64 = Layout$1.nu64 = ((property) => new NearUInt64(property));
	/** Factory for {@link UInt|big-endian unsigned int layouts}
	 * spanning two bytes. */
	Layout$1.u16be = ((property) => new UIntBE(2, property));
	/** Factory for {@link UInt|big-endian unsigned int layouts}
	 * spanning three bytes. */
	Layout$1.u24be = ((property) => new UIntBE(3, property));
	/** Factory for {@link UInt|big-endian unsigned int layouts}
	 * spanning four bytes. */
	Layout$1.u32be = ((property) => new UIntBE(4, property));
	/** Factory for {@link UInt|big-endian unsigned int layouts}
	 * spanning five bytes. */
	Layout$1.u40be = ((property) => new UIntBE(5, property));
	/** Factory for {@link UInt|big-endian unsigned int layouts}
	 * spanning six bytes. */
	Layout$1.u48be = ((property) => new UIntBE(6, property));
	/** Factory for {@link NearUInt64BE|big-endian unsigned int
	 * layouts} interpreted as Numbers. */
	Layout$1.nu64be = ((property) => new NearUInt64BE(property));
	/** Factory for {@link Int|signed int layouts} spanning one
	 * byte. */
	Layout$1.s8 = ((property) => new Int(1, property));
	/** Factory for {@link Int|little-endian signed int layouts}
	 * spanning two bytes. */
	Layout$1.s16 = ((property) => new Int(2, property));
	/** Factory for {@link Int|little-endian signed int layouts}
	 * spanning three bytes. */
	Layout$1.s24 = ((property) => new Int(3, property));
	/** Factory for {@link Int|little-endian signed int layouts}
	 * spanning four bytes. */
	Layout$1.s32 = ((property) => new Int(4, property));
	/** Factory for {@link Int|little-endian signed int layouts}
	 * spanning five bytes. */
	Layout$1.s40 = ((property) => new Int(5, property));
	/** Factory for {@link Int|little-endian signed int layouts}
	 * spanning six bytes. */
	Layout$1.s48 = ((property) => new Int(6, property));
	/** Factory for {@link NearInt64|little-endian signed int layouts}
	 * interpreted as Numbers. */
	var ns64 = Layout$1.ns64 = ((property) => new NearInt64(property));
	/** Factory for {@link Int|big-endian signed int layouts}
	 * spanning two bytes. */
	Layout$1.s16be = ((property) => new IntBE(2, property));
	/** Factory for {@link Int|big-endian signed int layouts}
	 * spanning three bytes. */
	Layout$1.s24be = ((property) => new IntBE(3, property));
	/** Factory for {@link Int|big-endian signed int layouts}
	 * spanning four bytes. */
	Layout$1.s32be = ((property) => new IntBE(4, property));
	/** Factory for {@link Int|big-endian signed int layouts}
	 * spanning five bytes. */
	Layout$1.s40be = ((property) => new IntBE(5, property));
	/** Factory for {@link Int|big-endian signed int layouts}
	 * spanning six bytes. */
	Layout$1.s48be = ((property) => new IntBE(6, property));
	/** Factory for {@link NearInt64BE|big-endian signed int layouts}
	 * interpreted as Numbers. */
	Layout$1.ns64be = ((property) => new NearInt64BE(property));
	/** Factory for {@link Float|little-endian 32-bit floating point} values. */
	Layout$1.f32 = ((property) => new Float(property));
	/** Factory for {@link FloatBE|big-endian 32-bit floating point} values. */
	Layout$1.f32be = ((property) => new FloatBE(property));
	/** Factory for {@link Double|little-endian 64-bit floating point} values. */
	Layout$1.f64 = ((property) => new Double(property));
	/** Factory for {@link DoubleBE|big-endian 64-bit floating point} values. */
	Layout$1.f64be = ((property) => new DoubleBE(property));
	/** Factory for {@link Structure} values. */
	var struct = Layout$1.struct = ((fields, property, decodePrefixes) => new Structure(fields, property, decodePrefixes));
	/** Factory for {@link BitStructure} values. */
	Layout$1.bits = ((word, msb, property) => new BitStructure(word, msb, property));
	/** Factory for {@link Sequence} values. */
	var seq = Layout$1.seq = ((elementLayout, count, property) => new Sequence(elementLayout, count, property));
	/** Factory for {@link Union} values. */
	Layout$1.union = ((discr, defaultLayout, property) => new Union(discr, defaultLayout, property));
	/** Factory for {@link UnionLayoutDiscriminator} values. */
	Layout$1.unionLayoutDiscriminator = ((layout, property) => new UnionLayoutDiscriminator(layout, property));
	/** Factory for {@link Blob} values. */
	var blob = Layout$1.blob = ((length, property) => new Blob(length, property));
	/** Factory for {@link CString} values. */
	Layout$1.cstr = ((property) => new CString(property));
	/** Factory for {@link UTF8} values. */
	Layout$1.utf8 = ((maxSpan, property) => new UTF8(maxSpan, property));
	/** Factory for {@link Constant} values. */
	Layout$1.constant = ((value, property) => new Constant(value, property));

	/**
	 * Maximum over-the-wire size of a Transaction
	 *
	 * 1280 is IPv6 minimum MTU
	 * 40 bytes is the size of the IPv6 header
	 * 8 bytes is the size of the fragment header
	 */
	const PACKET_DATA_SIZE = 1280 - 40 - 8;
	const VERSION_PREFIX_MASK = 0x7f;
	const SIGNATURE_LENGTH_IN_BYTES = 64;

	class TransactionExpiredBlockheightExceededError extends Error {
	  constructor(signature) {
	    super(`Signature ${signature} has expired: block height exceeded.`);
	    this.signature = void 0;
	    this.signature = signature;
	  }

	}
	Object.defineProperty(TransactionExpiredBlockheightExceededError.prototype, 'name', {
	  value: 'TransactionExpiredBlockheightExceededError'
	});
	class TransactionExpiredTimeoutError extends Error {
	  constructor(signature, timeoutSeconds) {
	    super(`Transaction was not confirmed in ${timeoutSeconds.toFixed(2)} seconds. It is ` + 'unknown if it succeeded or failed. Check signature ' + `${signature} using the Solana Explorer or CLI tools.`);
	    this.signature = void 0;
	    this.signature = signature;
	  }

	}
	Object.defineProperty(TransactionExpiredTimeoutError.prototype, 'name', {
	  value: 'TransactionExpiredTimeoutError'
	});

	class MessageAccountKeys {
	  constructor(staticAccountKeys, accountKeysFromLookups) {
	    this.staticAccountKeys = void 0;
	    this.accountKeysFromLookups = void 0;
	    this.staticAccountKeys = staticAccountKeys;
	    this.accountKeysFromLookups = accountKeysFromLookups;
	  }

	  keySegments() {
	    const keySegments = [this.staticAccountKeys];

	    if (this.accountKeysFromLookups) {
	      keySegments.push(this.accountKeysFromLookups.writable);
	      keySegments.push(this.accountKeysFromLookups.readonly);
	    }

	    return keySegments;
	  }

	  get(index) {
	    for (const keySegment of this.keySegments()) {
	      if (index < keySegment.length) {
	        return keySegment[index];
	      } else {
	        index -= keySegment.length;
	      }
	    }

	    return;
	  }

	  get length() {
	    return this.keySegments().flat().length;
	  }

	  compileInstructions(instructions) {
	    // Bail early if any account indexes would overflow a u8
	    const U8_MAX = 255;

	    if (this.length > U8_MAX + 1) {
	      throw new Error('Account index overflow encountered during compilation');
	    }

	    const keyIndexMap = new Map();
	    this.keySegments().flat().forEach((key, index) => {
	      keyIndexMap.set(key.toBase58(), index);
	    });

	    const findKeyIndex = key => {
	      const keyIndex = keyIndexMap.get(key.toBase58());
	      if (keyIndex === undefined) throw new Error('Encountered an unknown instruction account key during compilation');
	      return keyIndex;
	    };

	    return instructions.map(instruction => {
	      return {
	        programIdIndex: findKeyIndex(instruction.programId),
	        accountKeyIndexes: instruction.keys.map(meta => findKeyIndex(meta.pubkey)),
	        data: instruction.data
	      };
	    });
	  }

	}

	/**
	 * Layout for a public key
	 */
	const publicKey = (property = 'publicKey') => {
	  return blob(32, property);
	};
	/**
	 * Layout for a signature
	 */

	const signature = (property = 'signature') => {
	  return blob(64, property);
	};

	/**
	 * Layout for a Rust String type
	 */
	const rustString = (property = 'string') => {
	  const rsl = struct([u32('length'), u32('lengthPadding'), blob(offset(u32(), -8), 'chars')], property);

	  const _decode = rsl.decode.bind(rsl);

	  const _encode = rsl.encode.bind(rsl);

	  const rslShim = rsl;

	  rslShim.decode = (b, offset) => {
	    const data = _decode(b, offset);

	    return data['chars'].toString();
	  };

	  rslShim.encode = (str, b, offset) => {
	    const data = {
	      chars: buffer.Buffer.from(str, 'utf8')
	    };
	    return _encode(data, b, offset);
	  };

	  rslShim.alloc = str => {
	    return u32().span + u32().span + buffer.Buffer.from(str, 'utf8').length;
	  };

	  return rslShim;
	};
	/**
	 * Layout for an Authorized object
	 */

	const authorized = (property = 'authorized') => {
	  return struct([publicKey('staker'), publicKey('withdrawer')], property);
	};
	/**
	 * Layout for a Lockup object
	 */

	const lockup = (property = 'lockup') => {
	  return struct([ns64('unixTimestamp'), ns64('epoch'), publicKey('custodian')], property);
	};
	/**
	 *  Layout for a VoteInit object
	 */

	const voteInit = (property = 'voteInit') => {
	  return struct([publicKey('nodePubkey'), publicKey('authorizedVoter'), publicKey('authorizedWithdrawer'), u8('commission')], property);
	};
	/**
	 *  Layout for a VoteAuthorizeWithSeedArgs object
	 */

	const voteAuthorizeWithSeedArgs = (property = 'voteAuthorizeWithSeedArgs') => {
	  return struct([u32('voteAuthorizationType'), publicKey('currentAuthorityDerivedKeyOwnerPubkey'), rustString('currentAuthorityDerivedKeySeed'), publicKey('newAuthorized')], property);
	};
	function getAlloc(type, fields) {
	  const getItemAlloc = item => {
	    if (item.span >= 0) {
	      return item.span;
	    } else if (typeof item.alloc === 'function') {
	      return item.alloc(fields[item.property]);
	    } else if ('count' in item && 'elementLayout' in item) {
	      const field = fields[item.property];

	      if (Array.isArray(field)) {
	        return field.length * getItemAlloc(item.elementLayout);
	      }
	    } else if ('fields' in item) {
	      // This is a `Structure` whose size needs to be recursively measured.
	      return getAlloc({
	        layout: item
	      }, fields[item.property]);
	    } // Couldn't determine allocated size of layout


	    return 0;
	  };

	  let alloc = 0;
	  type.layout.fields.forEach(item => {
	    alloc += getItemAlloc(item);
	  });
	  return alloc;
	}

	function decodeLength(bytes) {
	  let len = 0;
	  let size = 0;

	  for (;;) {
	    let elem = bytes.shift();
	    len |= (elem & 0x7f) << size * 7;
	    size += 1;

	    if ((elem & 0x80) === 0) {
	      break;
	    }
	  }

	  return len;
	}
	function encodeLength(bytes, len) {
	  let rem_len = len;

	  for (;;) {
	    let elem = rem_len & 0x7f;
	    rem_len >>= 7;

	    if (rem_len == 0) {
	      bytes.push(elem);
	      break;
	    } else {
	      elem |= 0x80;
	      bytes.push(elem);
	    }
	  }
	}

	function assert$1 (condition, message) {
	  if (!condition) {
	    throw new Error(message || 'Assertion failed');
	  }
	}

	class CompiledKeys {
	  constructor(payer, keyMetaMap) {
	    this.payer = void 0;
	    this.keyMetaMap = void 0;
	    this.payer = payer;
	    this.keyMetaMap = keyMetaMap;
	  }

	  static compile(instructions, payer) {
	    const keyMetaMap = new Map();

	    const getOrInsertDefault = pubkey => {
	      const address = pubkey.toBase58();
	      let keyMeta = keyMetaMap.get(address);

	      if (keyMeta === undefined) {
	        keyMeta = {
	          isSigner: false,
	          isWritable: false,
	          isInvoked: false
	        };
	        keyMetaMap.set(address, keyMeta);
	      }

	      return keyMeta;
	    };

	    const payerKeyMeta = getOrInsertDefault(payer);
	    payerKeyMeta.isSigner = true;
	    payerKeyMeta.isWritable = true;

	    for (const ix of instructions) {
	      getOrInsertDefault(ix.programId).isInvoked = true;

	      for (const accountMeta of ix.keys) {
	        const keyMeta = getOrInsertDefault(accountMeta.pubkey);
	        keyMeta.isSigner || (keyMeta.isSigner = accountMeta.isSigner);
	        keyMeta.isWritable || (keyMeta.isWritable = accountMeta.isWritable);
	      }
	    }

	    return new CompiledKeys(payer, keyMetaMap);
	  }

	  getMessageComponents() {
	    const mapEntries = [...this.keyMetaMap.entries()];
	    assert$1(mapEntries.length <= 256, 'Max static account keys length exceeded');
	    const writableSigners = mapEntries.filter(([, meta]) => meta.isSigner && meta.isWritable);
	    const readonlySigners = mapEntries.filter(([, meta]) => meta.isSigner && !meta.isWritable);
	    const writableNonSigners = mapEntries.filter(([, meta]) => !meta.isSigner && meta.isWritable);
	    const readonlyNonSigners = mapEntries.filter(([, meta]) => !meta.isSigner && !meta.isWritable);
	    const header = {
	      numRequiredSignatures: writableSigners.length + readonlySigners.length,
	      numReadonlySignedAccounts: readonlySigners.length,
	      numReadonlyUnsignedAccounts: readonlyNonSigners.length
	    }; // sanity checks

	    {
	      assert$1(writableSigners.length > 0, 'Expected at least one writable signer key');
	      const [payerAddress] = writableSigners[0];
	      assert$1(payerAddress === this.payer.toBase58(), 'Expected first writable signer key to be the fee payer');
	    }
	    const staticAccountKeys = [...writableSigners.map(([address]) => new PublicKey(address)), ...readonlySigners.map(([address]) => new PublicKey(address)), ...writableNonSigners.map(([address]) => new PublicKey(address)), ...readonlyNonSigners.map(([address]) => new PublicKey(address))];
	    return [header, staticAccountKeys];
	  }

	  extractTableLookup(lookupTable) {
	    const [writableIndexes, drainedWritableKeys] = this.drainKeysFoundInLookupTable(lookupTable.state.addresses, keyMeta => !keyMeta.isSigner && !keyMeta.isInvoked && keyMeta.isWritable);
	    const [readonlyIndexes, drainedReadonlyKeys] = this.drainKeysFoundInLookupTable(lookupTable.state.addresses, keyMeta => !keyMeta.isSigner && !keyMeta.isInvoked && !keyMeta.isWritable); // Don't extract lookup if no keys were found

	    if (writableIndexes.length === 0 && readonlyIndexes.length === 0) {
	      return;
	    }

	    return [{
	      accountKey: lookupTable.key,
	      writableIndexes,
	      readonlyIndexes
	    }, {
	      writable: drainedWritableKeys,
	      readonly: drainedReadonlyKeys
	    }];
	  }
	  /** @internal */


	  drainKeysFoundInLookupTable(lookupTableEntries, keyMetaFilter) {
	    const lookupTableIndexes = new Array();
	    const drainedKeys = new Array();

	    for (const [address, keyMeta] of this.keyMetaMap.entries()) {
	      if (keyMetaFilter(keyMeta)) {
	        const key = new PublicKey(address);
	        const lookupTableIndex = lookupTableEntries.findIndex(entry => entry.equals(key));

	        if (lookupTableIndex >= 0) {
	          assert$1(lookupTableIndex < 256, 'Max lookup table index exceeded');
	          lookupTableIndexes.push(lookupTableIndex);
	          drainedKeys.push(key);
	          this.keyMetaMap.delete(address);
	        }
	      }
	    }

	    return [lookupTableIndexes, drainedKeys];
	  }

	}

	/**
	 * An instruction to execute by a program
	 *
	 * @property {number} programIdIndex
	 * @property {number[]} accounts
	 * @property {string} data
	 */

	/**
	 * List of instructions to be processed atomically
	 */
	class Message {
	  constructor(args) {
	    this.header = void 0;
	    this.accountKeys = void 0;
	    this.recentBlockhash = void 0;
	    this.instructions = void 0;
	    this.indexToProgramIds = new Map();
	    this.header = args.header;
	    this.accountKeys = args.accountKeys.map(account => new PublicKey(account));
	    this.recentBlockhash = args.recentBlockhash;
	    this.instructions = args.instructions;
	    this.instructions.forEach(ix => this.indexToProgramIds.set(ix.programIdIndex, this.accountKeys[ix.programIdIndex]));
	  }

	  get version() {
	    return 'legacy';
	  }

	  get staticAccountKeys() {
	    return this.accountKeys;
	  }

	  get compiledInstructions() {
	    return this.instructions.map(ix => ({
	      programIdIndex: ix.programIdIndex,
	      accountKeyIndexes: ix.accounts,
	      data: bs58$1.decode(ix.data)
	    }));
	  }

	  get addressTableLookups() {
	    return [];
	  }

	  getAccountKeys() {
	    return new MessageAccountKeys(this.staticAccountKeys);
	  }

	  static compile(args) {
	    const compiledKeys = CompiledKeys.compile(args.instructions, args.payerKey);
	    const [header, staticAccountKeys] = compiledKeys.getMessageComponents();
	    const accountKeys = new MessageAccountKeys(staticAccountKeys);
	    const instructions = accountKeys.compileInstructions(args.instructions).map(ix => ({
	      programIdIndex: ix.programIdIndex,
	      accounts: ix.accountKeyIndexes,
	      data: bs58$1.encode(ix.data)
	    }));
	    return new Message({
	      header,
	      accountKeys: staticAccountKeys,
	      recentBlockhash: args.recentBlockhash,
	      instructions
	    });
	  }

	  isAccountSigner(index) {
	    return index < this.header.numRequiredSignatures;
	  }

	  isAccountWritable(index) {
	    const numSignedAccounts = this.header.numRequiredSignatures;

	    if (index >= this.header.numRequiredSignatures) {
	      const unsignedAccountIndex = index - numSignedAccounts;
	      const numUnsignedAccounts = this.accountKeys.length - numSignedAccounts;
	      const numWritableUnsignedAccounts = numUnsignedAccounts - this.header.numReadonlyUnsignedAccounts;
	      return unsignedAccountIndex < numWritableUnsignedAccounts;
	    } else {
	      const numWritableSignedAccounts = numSignedAccounts - this.header.numReadonlySignedAccounts;
	      return index < numWritableSignedAccounts;
	    }
	  }

	  isProgramId(index) {
	    return this.indexToProgramIds.has(index);
	  }

	  programIds() {
	    return [...this.indexToProgramIds.values()];
	  }

	  nonProgramIds() {
	    return this.accountKeys.filter((_, index) => !this.isProgramId(index));
	  }

	  serialize() {
	    const numKeys = this.accountKeys.length;
	    let keyCount = [];
	    encodeLength(keyCount, numKeys);
	    const instructions = this.instructions.map(instruction => {
	      const {
	        accounts,
	        programIdIndex
	      } = instruction;
	      const data = Array.from(bs58$1.decode(instruction.data));
	      let keyIndicesCount = [];
	      encodeLength(keyIndicesCount, accounts.length);
	      let dataCount = [];
	      encodeLength(dataCount, data.length);
	      return {
	        programIdIndex,
	        keyIndicesCount: buffer.Buffer.from(keyIndicesCount),
	        keyIndices: accounts,
	        dataLength: buffer.Buffer.from(dataCount),
	        data
	      };
	    });
	    let instructionCount = [];
	    encodeLength(instructionCount, instructions.length);
	    let instructionBuffer = buffer.Buffer.alloc(PACKET_DATA_SIZE);
	    buffer.Buffer.from(instructionCount).copy(instructionBuffer);
	    let instructionBufferLength = instructionCount.length;
	    instructions.forEach(instruction => {
	      const instructionLayout = struct([u8('programIdIndex'), blob(instruction.keyIndicesCount.length, 'keyIndicesCount'), seq(u8('keyIndex'), instruction.keyIndices.length, 'keyIndices'), blob(instruction.dataLength.length, 'dataLength'), seq(u8('userdatum'), instruction.data.length, 'data')]);
	      const length = instructionLayout.encode(instruction, instructionBuffer, instructionBufferLength);
	      instructionBufferLength += length;
	    });
	    instructionBuffer = instructionBuffer.slice(0, instructionBufferLength);
	    const signDataLayout = struct([blob(1, 'numRequiredSignatures'), blob(1, 'numReadonlySignedAccounts'), blob(1, 'numReadonlyUnsignedAccounts'), blob(keyCount.length, 'keyCount'), seq(publicKey('key'), numKeys, 'keys'), publicKey('recentBlockhash')]);
	    const transaction = {
	      numRequiredSignatures: buffer.Buffer.from([this.header.numRequiredSignatures]),
	      numReadonlySignedAccounts: buffer.Buffer.from([this.header.numReadonlySignedAccounts]),
	      numReadonlyUnsignedAccounts: buffer.Buffer.from([this.header.numReadonlyUnsignedAccounts]),
	      keyCount: buffer.Buffer.from(keyCount),
	      keys: this.accountKeys.map(key => toBuffer(key.toBytes())),
	      recentBlockhash: bs58$1.decode(this.recentBlockhash)
	    };
	    let signData = buffer.Buffer.alloc(2048);
	    const length = signDataLayout.encode(transaction, signData);
	    instructionBuffer.copy(signData, length);
	    return signData.slice(0, length + instructionBuffer.length);
	  }
	  /**
	   * Decode a compiled message into a Message object.
	   */


	  static from(buffer$1) {
	    // Slice up wire data
	    let byteArray = [...buffer$1];
	    const numRequiredSignatures = byteArray.shift();

	    if (numRequiredSignatures !== (numRequiredSignatures & VERSION_PREFIX_MASK)) {
	      throw new Error('Versioned messages must be deserialized with VersionedMessage.deserialize()');
	    }

	    const numReadonlySignedAccounts = byteArray.shift();
	    const numReadonlyUnsignedAccounts = byteArray.shift();
	    const accountCount = decodeLength(byteArray);
	    let accountKeys = [];

	    for (let i = 0; i < accountCount; i++) {
	      const account = byteArray.slice(0, PUBLIC_KEY_LENGTH);
	      byteArray = byteArray.slice(PUBLIC_KEY_LENGTH);
	      accountKeys.push(new PublicKey(buffer.Buffer.from(account)));
	    }

	    const recentBlockhash = byteArray.slice(0, PUBLIC_KEY_LENGTH);
	    byteArray = byteArray.slice(PUBLIC_KEY_LENGTH);
	    const instructionCount = decodeLength(byteArray);
	    let instructions = [];

	    for (let i = 0; i < instructionCount; i++) {
	      const programIdIndex = byteArray.shift();
	      const accountCount = decodeLength(byteArray);
	      const accounts = byteArray.slice(0, accountCount);
	      byteArray = byteArray.slice(accountCount);
	      const dataLength = decodeLength(byteArray);
	      const dataSlice = byteArray.slice(0, dataLength);
	      const data = bs58$1.encode(buffer.Buffer.from(dataSlice));
	      byteArray = byteArray.slice(dataLength);
	      instructions.push({
	        programIdIndex,
	        accounts,
	        data
	      });
	    }

	    const messageArgs = {
	      header: {
	        numRequiredSignatures,
	        numReadonlySignedAccounts,
	        numReadonlyUnsignedAccounts
	      },
	      recentBlockhash: bs58$1.encode(buffer.Buffer.from(recentBlockhash)),
	      accountKeys,
	      instructions
	    };
	    return new Message(messageArgs);
	  }

	}

	/**
	 * Message constructor arguments
	 */

	class MessageV0 {
	  constructor(args) {
	    this.header = void 0;
	    this.staticAccountKeys = void 0;
	    this.recentBlockhash = void 0;
	    this.compiledInstructions = void 0;
	    this.addressTableLookups = void 0;
	    this.header = args.header;
	    this.staticAccountKeys = args.staticAccountKeys;
	    this.recentBlockhash = args.recentBlockhash;
	    this.compiledInstructions = args.compiledInstructions;
	    this.addressTableLookups = args.addressTableLookups;
	  }

	  get version() {
	    return 0;
	  }

	  get numAccountKeysFromLookups() {
	    let count = 0;

	    for (const lookup of this.addressTableLookups) {
	      count += lookup.readonlyIndexes.length + lookup.writableIndexes.length;
	    }

	    return count;
	  }

	  getAccountKeys(args) {
	    let accountKeysFromLookups;

	    if (args && 'accountKeysFromLookups' in args && args.accountKeysFromLookups) {
	      if (this.numAccountKeysFromLookups != args.accountKeysFromLookups.writable.length + args.accountKeysFromLookups.readonly.length) {
	        throw new Error('Failed to get account keys because of a mismatch in the number of account keys from lookups');
	      }

	      accountKeysFromLookups = args.accountKeysFromLookups;
	    } else if (args && 'addressLookupTableAccounts' in args && args.addressLookupTableAccounts) {
	      accountKeysFromLookups = this.resolveAddressTableLookups(args.addressLookupTableAccounts);
	    } else if (this.addressTableLookups.length > 0) {
	      throw new Error('Failed to get account keys because address table lookups were not resolved');
	    }

	    return new MessageAccountKeys(this.staticAccountKeys, accountKeysFromLookups);
	  }

	  isAccountSigner(index) {
	    return index < this.header.numRequiredSignatures;
	  }

	  isAccountWritable(index) {
	    const numSignedAccounts = this.header.numRequiredSignatures;
	    const numStaticAccountKeys = this.staticAccountKeys.length;

	    if (index >= numStaticAccountKeys) {
	      const lookupAccountKeysIndex = index - numStaticAccountKeys;
	      const numWritableLookupAccountKeys = this.addressTableLookups.reduce((count, lookup) => count + lookup.writableIndexes.length, 0);
	      return lookupAccountKeysIndex < numWritableLookupAccountKeys;
	    } else if (index >= this.header.numRequiredSignatures) {
	      const unsignedAccountIndex = index - numSignedAccounts;
	      const numUnsignedAccounts = numStaticAccountKeys - numSignedAccounts;
	      const numWritableUnsignedAccounts = numUnsignedAccounts - this.header.numReadonlyUnsignedAccounts;
	      return unsignedAccountIndex < numWritableUnsignedAccounts;
	    } else {
	      const numWritableSignedAccounts = numSignedAccounts - this.header.numReadonlySignedAccounts;
	      return index < numWritableSignedAccounts;
	    }
	  }

	  resolveAddressTableLookups(addressLookupTableAccounts) {
	    const accountKeysFromLookups = {
	      writable: [],
	      readonly: []
	    };

	    for (const tableLookup of this.addressTableLookups) {
	      const tableAccount = addressLookupTableAccounts.find(account => account.key.equals(tableLookup.accountKey));

	      if (!tableAccount) {
	        throw new Error(`Failed to find address lookup table account for table key ${tableLookup.accountKey.toBase58()}`);
	      }

	      for (const index of tableLookup.writableIndexes) {
	        if (index < tableAccount.state.addresses.length) {
	          accountKeysFromLookups.writable.push(tableAccount.state.addresses[index]);
	        } else {
	          throw new Error(`Failed to find address for index ${index} in address lookup table ${tableLookup.accountKey.toBase58()}`);
	        }
	      }

	      for (const index of tableLookup.readonlyIndexes) {
	        if (index < tableAccount.state.addresses.length) {
	          accountKeysFromLookups.readonly.push(tableAccount.state.addresses[index]);
	        } else {
	          throw new Error(`Failed to find address for index ${index} in address lookup table ${tableLookup.accountKey.toBase58()}`);
	        }
	      }
	    }

	    return accountKeysFromLookups;
	  }

	  static compile(args) {
	    const compiledKeys = CompiledKeys.compile(args.instructions, args.payerKey);
	    const addressTableLookups = new Array();
	    const accountKeysFromLookups = {
	      writable: new Array(),
	      readonly: new Array()
	    };
	    const lookupTableAccounts = args.addressLookupTableAccounts || [];

	    for (const lookupTable of lookupTableAccounts) {
	      const extractResult = compiledKeys.extractTableLookup(lookupTable);

	      if (extractResult !== undefined) {
	        const [addressTableLookup, {
	          writable,
	          readonly
	        }] = extractResult;
	        addressTableLookups.push(addressTableLookup);
	        accountKeysFromLookups.writable.push(...writable);
	        accountKeysFromLookups.readonly.push(...readonly);
	      }
	    }

	    const [header, staticAccountKeys] = compiledKeys.getMessageComponents();
	    const accountKeys = new MessageAccountKeys(staticAccountKeys, accountKeysFromLookups);
	    const compiledInstructions = accountKeys.compileInstructions(args.instructions);
	    return new MessageV0({
	      header,
	      staticAccountKeys,
	      recentBlockhash: args.recentBlockhash,
	      compiledInstructions,
	      addressTableLookups
	    });
	  }

	  serialize() {
	    const encodedStaticAccountKeysLength = Array();
	    encodeLength(encodedStaticAccountKeysLength, this.staticAccountKeys.length);
	    const serializedInstructions = this.serializeInstructions();
	    const encodedInstructionsLength = Array();
	    encodeLength(encodedInstructionsLength, this.compiledInstructions.length);
	    const serializedAddressTableLookups = this.serializeAddressTableLookups();
	    const encodedAddressTableLookupsLength = Array();
	    encodeLength(encodedAddressTableLookupsLength, this.addressTableLookups.length);
	    const messageLayout = struct([u8('prefix'), struct([u8('numRequiredSignatures'), u8('numReadonlySignedAccounts'), u8('numReadonlyUnsignedAccounts')], 'header'), blob(encodedStaticAccountKeysLength.length, 'staticAccountKeysLength'), seq(publicKey(), this.staticAccountKeys.length, 'staticAccountKeys'), publicKey('recentBlockhash'), blob(encodedInstructionsLength.length, 'instructionsLength'), blob(serializedInstructions.length, 'serializedInstructions'), blob(encodedAddressTableLookupsLength.length, 'addressTableLookupsLength'), blob(serializedAddressTableLookups.length, 'serializedAddressTableLookups')]);
	    const serializedMessage = new Uint8Array(PACKET_DATA_SIZE);
	    const MESSAGE_VERSION_0_PREFIX = 1 << 7;
	    const serializedMessageLength = messageLayout.encode({
	      prefix: MESSAGE_VERSION_0_PREFIX,
	      header: this.header,
	      staticAccountKeysLength: new Uint8Array(encodedStaticAccountKeysLength),
	      staticAccountKeys: this.staticAccountKeys.map(key => key.toBytes()),
	      recentBlockhash: bs58$1.decode(this.recentBlockhash),
	      instructionsLength: new Uint8Array(encodedInstructionsLength),
	      serializedInstructions,
	      addressTableLookupsLength: new Uint8Array(encodedAddressTableLookupsLength),
	      serializedAddressTableLookups
	    }, serializedMessage);
	    return serializedMessage.slice(0, serializedMessageLength);
	  }

	  serializeInstructions() {
	    let serializedLength = 0;
	    const serializedInstructions = new Uint8Array(PACKET_DATA_SIZE);

	    for (const instruction of this.compiledInstructions) {
	      const encodedAccountKeyIndexesLength = Array();
	      encodeLength(encodedAccountKeyIndexesLength, instruction.accountKeyIndexes.length);
	      const encodedDataLength = Array();
	      encodeLength(encodedDataLength, instruction.data.length);
	      const instructionLayout = struct([u8('programIdIndex'), blob(encodedAccountKeyIndexesLength.length, 'encodedAccountKeyIndexesLength'), seq(u8(), instruction.accountKeyIndexes.length, 'accountKeyIndexes'), blob(encodedDataLength.length, 'encodedDataLength'), blob(instruction.data.length, 'data')]);
	      serializedLength += instructionLayout.encode({
	        programIdIndex: instruction.programIdIndex,
	        encodedAccountKeyIndexesLength: new Uint8Array(encodedAccountKeyIndexesLength),
	        accountKeyIndexes: instruction.accountKeyIndexes,
	        encodedDataLength: new Uint8Array(encodedDataLength),
	        data: instruction.data
	      }, serializedInstructions, serializedLength);
	    }

	    return serializedInstructions.slice(0, serializedLength);
	  }

	  serializeAddressTableLookups() {
	    let serializedLength = 0;
	    const serializedAddressTableLookups = new Uint8Array(PACKET_DATA_SIZE);

	    for (const lookup of this.addressTableLookups) {
	      const encodedWritableIndexesLength = Array();
	      encodeLength(encodedWritableIndexesLength, lookup.writableIndexes.length);
	      const encodedReadonlyIndexesLength = Array();
	      encodeLength(encodedReadonlyIndexesLength, lookup.readonlyIndexes.length);
	      const addressTableLookupLayout = struct([publicKey('accountKey'), blob(encodedWritableIndexesLength.length, 'encodedWritableIndexesLength'), seq(u8(), lookup.writableIndexes.length, 'writableIndexes'), blob(encodedReadonlyIndexesLength.length, 'encodedReadonlyIndexesLength'), seq(u8(), lookup.readonlyIndexes.length, 'readonlyIndexes')]);
	      serializedLength += addressTableLookupLayout.encode({
	        accountKey: lookup.accountKey.toBytes(),
	        encodedWritableIndexesLength: new Uint8Array(encodedWritableIndexesLength),
	        writableIndexes: lookup.writableIndexes,
	        encodedReadonlyIndexesLength: new Uint8Array(encodedReadonlyIndexesLength),
	        readonlyIndexes: lookup.readonlyIndexes
	      }, serializedAddressTableLookups, serializedLength);
	    }

	    return serializedAddressTableLookups.slice(0, serializedLength);
	  }

	  static deserialize(serializedMessage) {
	    let byteArray = [...serializedMessage];
	    const prefix = byteArray.shift();
	    const maskedPrefix = prefix & VERSION_PREFIX_MASK;
	    assert$1(prefix !== maskedPrefix, `Expected versioned message but received legacy message`);
	    const version = maskedPrefix;
	    assert$1(version === 0, `Expected versioned message with version 0 but found version ${version}`);
	    const header = {
	      numRequiredSignatures: byteArray.shift(),
	      numReadonlySignedAccounts: byteArray.shift(),
	      numReadonlyUnsignedAccounts: byteArray.shift()
	    };
	    const staticAccountKeys = [];
	    const staticAccountKeysLength = decodeLength(byteArray);

	    for (let i = 0; i < staticAccountKeysLength; i++) {
	      staticAccountKeys.push(new PublicKey(byteArray.splice(0, PUBLIC_KEY_LENGTH)));
	    }

	    const recentBlockhash = bs58$1.encode(byteArray.splice(0, PUBLIC_KEY_LENGTH));
	    const instructionCount = decodeLength(byteArray);
	    const compiledInstructions = [];

	    for (let i = 0; i < instructionCount; i++) {
	      const programIdIndex = byteArray.shift();
	      const accountKeyIndexesLength = decodeLength(byteArray);
	      const accountKeyIndexes = byteArray.splice(0, accountKeyIndexesLength);
	      const dataLength = decodeLength(byteArray);
	      const data = new Uint8Array(byteArray.splice(0, dataLength));
	      compiledInstructions.push({
	        programIdIndex,
	        accountKeyIndexes,
	        data
	      });
	    }

	    const addressTableLookupsCount = decodeLength(byteArray);
	    const addressTableLookups = [];

	    for (let i = 0; i < addressTableLookupsCount; i++) {
	      const accountKey = new PublicKey(byteArray.splice(0, PUBLIC_KEY_LENGTH));
	      const writableIndexesLength = decodeLength(byteArray);
	      const writableIndexes = byteArray.splice(0, writableIndexesLength);
	      const readonlyIndexesLength = decodeLength(byteArray);
	      const readonlyIndexes = byteArray.splice(0, readonlyIndexesLength);
	      addressTableLookups.push({
	        accountKey,
	        writableIndexes,
	        readonlyIndexes
	      });
	    }

	    return new MessageV0({
	      header,
	      staticAccountKeys,
	      recentBlockhash,
	      compiledInstructions,
	      addressTableLookups
	    });
	  }

	}

	// eslint-disable-next-line no-redeclare
	const VersionedMessage = {
	  deserializeMessageVersion(serializedMessage) {
	    const prefix = serializedMessage[0];
	    const maskedPrefix = prefix & VERSION_PREFIX_MASK; // if the highest bit of the prefix is not set, the message is not versioned

	    if (maskedPrefix === prefix) {
	      return 'legacy';
	    } // the lower 7 bits of the prefix indicate the message version


	    return maskedPrefix;
	  },

	  deserialize: serializedMessage => {
	    const version = VersionedMessage.deserializeMessageVersion(serializedMessage);

	    if (version === 'legacy') {
	      return Message.from(serializedMessage);
	    }

	    if (version === 0) {
	      return MessageV0.deserialize(serializedMessage);
	    } else {
	      throw new Error(`Transaction message version ${version} deserialization is not supported`);
	    }
	  }
	};

	/**
	 * Transaction signature as base-58 encoded string
	 */

	exports.TransactionStatus = void 0;
	/**
	 * Default (empty) signature
	 */

	(function (TransactionStatus) {
	  TransactionStatus[TransactionStatus["BLOCKHEIGHT_EXCEEDED"] = 0] = "BLOCKHEIGHT_EXCEEDED";
	  TransactionStatus[TransactionStatus["PROCESSED"] = 1] = "PROCESSED";
	  TransactionStatus[TransactionStatus["TIMED_OUT"] = 2] = "TIMED_OUT";
	})(exports.TransactionStatus || (exports.TransactionStatus = {}));

	const DEFAULT_SIGNATURE = buffer.Buffer.alloc(SIGNATURE_LENGTH_IN_BYTES).fill(0);
	/**
	 * Account metadata used to define instructions
	 */

	/**
	 * Transaction Instruction class
	 */
	class TransactionInstruction {
	  /**
	   * Public keys to include in this transaction
	   * Boolean represents whether this pubkey needs to sign the transaction
	   */

	  /**
	   * Program Id to execute
	   */

	  /**
	   * Program input
	   */
	  constructor(opts) {
	    this.keys = void 0;
	    this.programId = void 0;
	    this.data = buffer.Buffer.alloc(0);
	    this.programId = opts.programId;
	    this.keys = opts.keys;

	    if (opts.data) {
	      this.data = opts.data;
	    }
	  }
	  /**
	   * @internal
	   */


	  toJSON() {
	    return {
	      keys: this.keys.map(({
	        pubkey,
	        isSigner,
	        isWritable
	      }) => ({
	        pubkey: pubkey.toJSON(),
	        isSigner,
	        isWritable
	      })),
	      programId: this.programId.toJSON(),
	      data: [...this.data]
	    };
	  }

	}
	/**
	 * Pair of signature and corresponding public key
	 */

	/**
	 * Transaction class
	 */
	class Transaction {
	  /**
	   * Signatures for the transaction.  Typically created by invoking the
	   * `sign()` method
	   */

	  /**
	   * The first (payer) Transaction signature
	   */
	  get signature() {
	    if (this.signatures.length > 0) {
	      return this.signatures[0].signature;
	    }

	    return null;
	  }
	  /**
	   * The transaction fee payer
	   */


	  /**
	   * Construct an empty Transaction
	   */
	  constructor(opts) {
	    this.signatures = [];
	    this.feePayer = void 0;
	    this.instructions = [];
	    this.recentBlockhash = void 0;
	    this.lastValidBlockHeight = void 0;
	    this.nonceInfo = void 0;
	    this._message = void 0;
	    this._json = void 0;

	    if (!opts) {
	      return;
	    }

	    if (opts.feePayer) {
	      this.feePayer = opts.feePayer;
	    }

	    if (opts.signatures) {
	      this.signatures = opts.signatures;
	    }

	    if (Object.prototype.hasOwnProperty.call(opts, 'lastValidBlockHeight')) {
	      const {
	        blockhash,
	        lastValidBlockHeight
	      } = opts;
	      this.recentBlockhash = blockhash;
	      this.lastValidBlockHeight = lastValidBlockHeight;
	    } else {
	      const {
	        recentBlockhash,
	        nonceInfo
	      } = opts;

	      if (nonceInfo) {
	        this.nonceInfo = nonceInfo;
	      }

	      this.recentBlockhash = recentBlockhash;
	    }
	  }
	  /**
	   * @internal
	   */


	  toJSON() {
	    return {
	      recentBlockhash: this.recentBlockhash || null,
	      feePayer: this.feePayer ? this.feePayer.toJSON() : null,
	      nonceInfo: this.nonceInfo ? {
	        nonce: this.nonceInfo.nonce,
	        nonceInstruction: this.nonceInfo.nonceInstruction.toJSON()
	      } : null,
	      instructions: this.instructions.map(instruction => instruction.toJSON()),
	      signers: this.signatures.map(({
	        publicKey
	      }) => {
	        return publicKey.toJSON();
	      })
	    };
	  }
	  /**
	   * Add one or more instructions to this Transaction
	   */


	  add(...items) {
	    if (items.length === 0) {
	      throw new Error('No instructions');
	    }

	    items.forEach(item => {
	      if ('instructions' in item) {
	        this.instructions = this.instructions.concat(item.instructions);
	      } else if ('data' in item && 'programId' in item && 'keys' in item) {
	        this.instructions.push(item);
	      } else {
	        this.instructions.push(new TransactionInstruction(item));
	      }
	    });
	    return this;
	  }
	  /**
	   * Compile transaction data
	   */


	  compileMessage() {
	    if (this._message && JSON.stringify(this.toJSON()) === JSON.stringify(this._json)) {
	      return this._message;
	    }

	    let recentBlockhash;
	    let instructions;

	    if (this.nonceInfo) {
	      recentBlockhash = this.nonceInfo.nonce;

	      if (this.instructions[0] != this.nonceInfo.nonceInstruction) {
	        instructions = [this.nonceInfo.nonceInstruction, ...this.instructions];
	      } else {
	        instructions = this.instructions;
	      }
	    } else {
	      recentBlockhash = this.recentBlockhash;
	      instructions = this.instructions;
	    }

	    if (!recentBlockhash) {
	      throw new Error('Transaction recentBlockhash required');
	    }

	    if (instructions.length < 1) {
	      console.warn('No instructions provided');
	    }

	    let feePayer;

	    if (this.feePayer) {
	      feePayer = this.feePayer;
	    } else if (this.signatures.length > 0 && this.signatures[0].publicKey) {
	      // Use implicit fee payer
	      feePayer = this.signatures[0].publicKey;
	    } else {
	      throw new Error('Transaction fee payer required');
	    }

	    for (let i = 0; i < instructions.length; i++) {
	      if (instructions[i].programId === undefined) {
	        throw new Error(`Transaction instruction index ${i} has undefined program id`);
	      }
	    }

	    const programIds = [];
	    const accountMetas = [];
	    instructions.forEach(instruction => {
	      instruction.keys.forEach(accountMeta => {
	        accountMetas.push({ ...accountMeta
	        });
	      });
	      const programId = instruction.programId.toString();

	      if (!programIds.includes(programId)) {
	        programIds.push(programId);
	      }
	    }); // Append programID account metas

	    programIds.forEach(programId => {
	      accountMetas.push({
	        pubkey: new PublicKey(programId),
	        isSigner: false,
	        isWritable: false
	      });
	    }); // Cull duplicate account metas

	    const uniqueMetas = [];
	    accountMetas.forEach(accountMeta => {
	      const pubkeyString = accountMeta.pubkey.toString();
	      const uniqueIndex = uniqueMetas.findIndex(x => {
	        return x.pubkey.toString() === pubkeyString;
	      });

	      if (uniqueIndex > -1) {
	        uniqueMetas[uniqueIndex].isWritable = uniqueMetas[uniqueIndex].isWritable || accountMeta.isWritable;
	        uniqueMetas[uniqueIndex].isSigner = uniqueMetas[uniqueIndex].isSigner || accountMeta.isSigner;
	      } else {
	        uniqueMetas.push(accountMeta);
	      }
	    }); // Sort. Prioritizing first by signer, then by writable

	    uniqueMetas.sort(function (x, y) {
	      if (x.isSigner !== y.isSigner) {
	        // Signers always come before non-signers
	        return x.isSigner ? -1 : 1;
	      }

	      if (x.isWritable !== y.isWritable) {
	        // Writable accounts always come before read-only accounts
	        return x.isWritable ? -1 : 1;
	      } // Otherwise, sort by pubkey, stringwise.


	      return x.pubkey.toBase58().localeCompare(y.pubkey.toBase58());
	    }); // Move fee payer to the front

	    const feePayerIndex = uniqueMetas.findIndex(x => {
	      return x.pubkey.equals(feePayer);
	    });

	    if (feePayerIndex > -1) {
	      const [payerMeta] = uniqueMetas.splice(feePayerIndex, 1);
	      payerMeta.isSigner = true;
	      payerMeta.isWritable = true;
	      uniqueMetas.unshift(payerMeta);
	    } else {
	      uniqueMetas.unshift({
	        pubkey: feePayer,
	        isSigner: true,
	        isWritable: true
	      });
	    } // Disallow unknown signers


	    for (const signature of this.signatures) {
	      const uniqueIndex = uniqueMetas.findIndex(x => {
	        return x.pubkey.equals(signature.publicKey);
	      });

	      if (uniqueIndex > -1) {
	        if (!uniqueMetas[uniqueIndex].isSigner) {
	          uniqueMetas[uniqueIndex].isSigner = true;
	          console.warn('Transaction references a signature that is unnecessary, ' + 'only the fee payer and instruction signer accounts should sign a transaction. ' + 'This behavior is deprecated and will throw an error in the next major version release.');
	        }
	      } else {
	        throw new Error(`unknown signer: ${signature.publicKey.toString()}`);
	      }
	    }

	    let numRequiredSignatures = 0;
	    let numReadonlySignedAccounts = 0;
	    let numReadonlyUnsignedAccounts = 0; // Split out signing from non-signing keys and count header values

	    const signedKeys = [];
	    const unsignedKeys = [];
	    uniqueMetas.forEach(({
	      pubkey,
	      isSigner,
	      isWritable
	    }) => {
	      if (isSigner) {
	        signedKeys.push(pubkey.toString());
	        numRequiredSignatures += 1;

	        if (!isWritable) {
	          numReadonlySignedAccounts += 1;
	        }
	      } else {
	        unsignedKeys.push(pubkey.toString());

	        if (!isWritable) {
	          numReadonlyUnsignedAccounts += 1;
	        }
	      }
	    });
	    const accountKeys = signedKeys.concat(unsignedKeys);
	    const compiledInstructions = instructions.map(instruction => {
	      const {
	        data,
	        programId
	      } = instruction;
	      return {
	        programIdIndex: accountKeys.indexOf(programId.toString()),
	        accounts: instruction.keys.map(meta => accountKeys.indexOf(meta.pubkey.toString())),
	        data: bs58$1.encode(data)
	      };
	    });
	    compiledInstructions.forEach(instruction => {
	      assert$1(instruction.programIdIndex >= 0);
	      instruction.accounts.forEach(keyIndex => assert$1(keyIndex >= 0));
	    });
	    return new Message({
	      header: {
	        numRequiredSignatures,
	        numReadonlySignedAccounts,
	        numReadonlyUnsignedAccounts
	      },
	      accountKeys,
	      recentBlockhash,
	      instructions: compiledInstructions
	    });
	  }
	  /**
	   * @internal
	   */


	  _compile() {
	    const message = this.compileMessage();
	    const signedKeys = message.accountKeys.slice(0, message.header.numRequiredSignatures);

	    if (this.signatures.length === signedKeys.length) {
	      const valid = this.signatures.every((pair, index) => {
	        return signedKeys[index].equals(pair.publicKey);
	      });
	      if (valid) return message;
	    }

	    this.signatures = signedKeys.map(publicKey => ({
	      signature: null,
	      publicKey
	    }));
	    return message;
	  }
	  /**
	   * Get a buffer of the Transaction data that need to be covered by signatures
	   */


	  serializeMessage() {
	    return this._compile().serialize();
	  }
	  /**
	   * Get the estimated fee associated with a transaction
	   */


	  async getEstimatedFee(connection) {
	    return (await connection.getFeeForMessage(this.compileMessage())).value;
	  }
	  /**
	   * Specify the public keys which will be used to sign the Transaction.
	   * The first signer will be used as the transaction fee payer account.
	   *
	   * Signatures can be added with either `partialSign` or `addSignature`
	   *
	   * @deprecated Deprecated since v0.84.0. Only the fee payer needs to be
	   * specified and it can be set in the Transaction constructor or with the
	   * `feePayer` property.
	   */


	  setSigners(...signers) {
	    if (signers.length === 0) {
	      throw new Error('No signers');
	    }

	    const seen = new Set();
	    this.signatures = signers.filter(publicKey => {
	      const key = publicKey.toString();

	      if (seen.has(key)) {
	        return false;
	      } else {
	        seen.add(key);
	        return true;
	      }
	    }).map(publicKey => ({
	      signature: null,
	      publicKey
	    }));
	  }
	  /**
	   * Sign the Transaction with the specified signers. Multiple signatures may
	   * be applied to a Transaction. The first signature is considered "primary"
	   * and is used identify and confirm transactions.
	   *
	   * If the Transaction `feePayer` is not set, the first signer will be used
	   * as the transaction fee payer account.
	   *
	   * Transaction fields should not be modified after the first call to `sign`,
	   * as doing so may invalidate the signature and cause the Transaction to be
	   * rejected.
	   *
	   * The Transaction must be assigned a valid `recentBlockhash` before invoking this method
	   */


	  sign(...signers) {
	    if (signers.length === 0) {
	      throw new Error('No signers');
	    } // Dedupe signers


	    const seen = new Set();
	    const uniqueSigners = [];

	    for (const signer of signers) {
	      const key = signer.publicKey.toString();

	      if (seen.has(key)) {
	        continue;
	      } else {
	        seen.add(key);
	        uniqueSigners.push(signer);
	      }
	    }

	    this.signatures = uniqueSigners.map(signer => ({
	      signature: null,
	      publicKey: signer.publicKey
	    }));

	    const message = this._compile();

	    this._partialSign(message, ...uniqueSigners);
	  }
	  /**
	   * Partially sign a transaction with the specified accounts. All accounts must
	   * correspond to either the fee payer or a signer account in the transaction
	   * instructions.
	   *
	   * All the caveats from the `sign` method apply to `partialSign`
	   */


	  partialSign(...signers) {
	    if (signers.length === 0) {
	      throw new Error('No signers');
	    } // Dedupe signers


	    const seen = new Set();
	    const uniqueSigners = [];

	    for (const signer of signers) {
	      const key = signer.publicKey.toString();

	      if (seen.has(key)) {
	        continue;
	      } else {
	        seen.add(key);
	        uniqueSigners.push(signer);
	      }
	    }

	    const message = this._compile();

	    this._partialSign(message, ...uniqueSigners);
	  }
	  /**
	   * @internal
	   */


	  _partialSign(message, ...signers) {
	    const signData = message.serialize();
	    signers.forEach(signer => {
	      const signature = sign(signData, signer.secretKey);

	      this._addSignature(signer.publicKey, toBuffer(signature));
	    });
	  }
	  /**
	   * Add an externally created signature to a transaction. The public key
	   * must correspond to either the fee payer or a signer account in the transaction
	   * instructions.
	   */


	  addSignature(pubkey, signature) {
	    this._compile(); // Ensure signatures array is populated


	    this._addSignature(pubkey, signature);
	  }
	  /**
	   * @internal
	   */


	  _addSignature(pubkey, signature) {
	    assert$1(signature.length === 64);
	    const index = this.signatures.findIndex(sigpair => pubkey.equals(sigpair.publicKey));

	    if (index < 0) {
	      throw new Error(`unknown signer: ${pubkey.toString()}`);
	    }

	    this.signatures[index].signature = buffer.Buffer.from(signature);
	  }
	  /**
	   * Verify signatures of a complete, signed Transaction
	   */


	  verifySignatures() {
	    return this._verifySignatures(this.serializeMessage(), true);
	  }
	  /**
	   * @internal
	   */


	  _verifySignatures(signData, requireAllSignatures) {
	    for (const {
	      signature,
	      publicKey
	    } of this.signatures) {
	      if (signature === null) {
	        if (requireAllSignatures) {
	          return false;
	        }
	      } else {
	        if (!verify(signature, signData, publicKey.toBuffer())) {
	          return false;
	        }
	      }
	    }

	    return true;
	  }
	  /**
	   * Serialize the Transaction in the wire format.
	   */


	  serialize(config) {
	    const {
	      requireAllSignatures,
	      verifySignatures
	    } = Object.assign({
	      requireAllSignatures: true,
	      verifySignatures: true
	    }, config);
	    const signData = this.serializeMessage();

	    if (verifySignatures && !this._verifySignatures(signData, requireAllSignatures)) {
	      throw new Error('Signature verification failed');
	    }

	    return this._serialize(signData);
	  }
	  /**
	   * @internal
	   */


	  _serialize(signData) {
	    const {
	      signatures
	    } = this;
	    const signatureCount = [];
	    encodeLength(signatureCount, signatures.length);
	    const transactionLength = signatureCount.length + signatures.length * 64 + signData.length;
	    const wireTransaction = buffer.Buffer.alloc(transactionLength);
	    assert$1(signatures.length < 256);
	    buffer.Buffer.from(signatureCount).copy(wireTransaction, 0);
	    signatures.forEach(({
	      signature
	    }, index) => {
	      if (signature !== null) {
	        assert$1(signature.length === 64, `signature has invalid length`);
	        buffer.Buffer.from(signature).copy(wireTransaction, signatureCount.length + index * 64);
	      }
	    });
	    signData.copy(wireTransaction, signatureCount.length + signatures.length * 64);
	    assert$1(wireTransaction.length <= PACKET_DATA_SIZE, `Transaction too large: ${wireTransaction.length} > ${PACKET_DATA_SIZE}`);
	    return wireTransaction;
	  }
	  /**
	   * Deprecated method
	   * @internal
	   */


	  get keys() {
	    assert$1(this.instructions.length === 1);
	    return this.instructions[0].keys.map(keyObj => keyObj.pubkey);
	  }
	  /**
	   * Deprecated method
	   * @internal
	   */


	  get programId() {
	    assert$1(this.instructions.length === 1);
	    return this.instructions[0].programId;
	  }
	  /**
	   * Deprecated method
	   * @internal
	   */


	  get data() {
	    assert$1(this.instructions.length === 1);
	    return this.instructions[0].data;
	  }
	  /**
	   * Parse a wire transaction into a Transaction object.
	   */


	  static from(buffer$1) {
	    // Slice up wire data
	    let byteArray = [...buffer$1];
	    const signatureCount = decodeLength(byteArray);
	    let signatures = [];

	    for (let i = 0; i < signatureCount; i++) {
	      const signature = byteArray.slice(0, SIGNATURE_LENGTH_IN_BYTES);
	      byteArray = byteArray.slice(SIGNATURE_LENGTH_IN_BYTES);
	      signatures.push(bs58$1.encode(buffer.Buffer.from(signature)));
	    }

	    return Transaction.populate(Message.from(byteArray), signatures);
	  }
	  /**
	   * Populate Transaction object from message and signatures
	   */


	  static populate(message, signatures = []) {
	    const transaction = new Transaction();
	    transaction.recentBlockhash = message.recentBlockhash;

	    if (message.header.numRequiredSignatures > 0) {
	      transaction.feePayer = message.accountKeys[0];
	    }

	    signatures.forEach((signature, index) => {
	      const sigPubkeyPair = {
	        signature: signature == bs58$1.encode(DEFAULT_SIGNATURE) ? null : bs58$1.decode(signature),
	        publicKey: message.accountKeys[index]
	      };
	      transaction.signatures.push(sigPubkeyPair);
	    });
	    message.instructions.forEach(instruction => {
	      const keys = instruction.accounts.map(account => {
	        const pubkey = message.accountKeys[account];
	        return {
	          pubkey,
	          isSigner: transaction.signatures.some(keyObj => keyObj.publicKey.toString() === pubkey.toString()) || message.isAccountSigner(account),
	          isWritable: message.isAccountWritable(account)
	        };
	      });
	      transaction.instructions.push(new TransactionInstruction({
	        keys,
	        programId: message.accountKeys[instruction.programIdIndex],
	        data: bs58$1.decode(instruction.data)
	      }));
	    });
	    transaction._message = message;
	    transaction._json = transaction.toJSON();
	    return transaction;
	  }

	}

	class TransactionMessage {
	  constructor(args) {
	    this.payerKey = void 0;
	    this.instructions = void 0;
	    this.recentBlockhash = void 0;
	    this.payerKey = args.payerKey;
	    this.instructions = args.instructions;
	    this.recentBlockhash = args.recentBlockhash;
	  }

	  static decompile(message, args) {
	    const {
	      header,
	      compiledInstructions,
	      recentBlockhash
	    } = message;
	    const {
	      numRequiredSignatures,
	      numReadonlySignedAccounts,
	      numReadonlyUnsignedAccounts
	    } = header;
	    const numWritableSignedAccounts = numRequiredSignatures - numReadonlySignedAccounts;
	    assert$1(numWritableSignedAccounts > 0, 'Message header is invalid');
	    const numWritableUnsignedAccounts = message.staticAccountKeys.length - numReadonlyUnsignedAccounts;
	    assert$1(numWritableUnsignedAccounts >= 0, 'Message header is invalid');
	    const accountKeys = message.getAccountKeys(args);
	    const payerKey = accountKeys.get(0);

	    if (payerKey === undefined) {
	      throw new Error('Failed to decompile message because no account keys were found');
	    }

	    const instructions = [];

	    for (const compiledIx of compiledInstructions) {
	      const keys = [];

	      for (const keyIndex of compiledIx.accountKeyIndexes) {
	        const pubkey = accountKeys.get(keyIndex);

	        if (pubkey === undefined) {
	          throw new Error(`Failed to find key for account key index ${keyIndex}`);
	        }

	        const isSigner = keyIndex < numRequiredSignatures;
	        let isWritable;

	        if (isSigner) {
	          isWritable = keyIndex < numWritableSignedAccounts;
	        } else if (keyIndex < accountKeys.staticAccountKeys.length) {
	          isWritable = keyIndex - numRequiredSignatures < numWritableUnsignedAccounts;
	        } else {
	          isWritable = keyIndex - accountKeys.staticAccountKeys.length < // accountKeysFromLookups cannot be undefined because we already found a pubkey for this index above
	          accountKeys.accountKeysFromLookups.writable.length;
	        }

	        keys.push({
	          pubkey,
	          isSigner: keyIndex < header.numRequiredSignatures,
	          isWritable
	        });
	      }

	      const programId = accountKeys.get(compiledIx.programIdIndex);

	      if (programId === undefined) {
	        throw new Error(`Failed to find program id for program id index ${compiledIx.programIdIndex}`);
	      }

	      instructions.push(new TransactionInstruction({
	        programId,
	        data: toBuffer(compiledIx.data),
	        keys
	      }));
	    }

	    return new TransactionMessage({
	      payerKey,
	      instructions,
	      recentBlockhash
	    });
	  }

	  compileToLegacyMessage() {
	    return Message.compile({
	      payerKey: this.payerKey,
	      recentBlockhash: this.recentBlockhash,
	      instructions: this.instructions
	    });
	  }

	  compileToV0Message(addressLookupTableAccounts) {
	    return MessageV0.compile({
	      payerKey: this.payerKey,
	      recentBlockhash: this.recentBlockhash,
	      instructions: this.instructions,
	      addressLookupTableAccounts
	    });
	  }

	}

	/**
	 * Versioned transaction class
	 */
	class VersionedTransaction {
	  get version() {
	    return this.message.version;
	  }

	  constructor(message, signatures) {
	    this.signatures = void 0;
	    this.message = void 0;

	    if (signatures !== undefined) {
	      assert$1(signatures.length === message.header.numRequiredSignatures, 'Expected signatures length to be equal to the number of required signatures');
	      this.signatures = signatures;
	    } else {
	      const defaultSignatures = [];

	      for (let i = 0; i < message.header.numRequiredSignatures; i++) {
	        defaultSignatures.push(new Uint8Array(SIGNATURE_LENGTH_IN_BYTES));
	      }

	      this.signatures = defaultSignatures;
	    }

	    this.message = message;
	  }

	  serialize() {
	    const serializedMessage = this.message.serialize();
	    const encodedSignaturesLength = Array();
	    encodeLength(encodedSignaturesLength, this.signatures.length);
	    const transactionLayout = struct([blob(encodedSignaturesLength.length, 'encodedSignaturesLength'), seq(signature(), this.signatures.length, 'signatures'), blob(serializedMessage.length, 'serializedMessage')]);
	    const serializedTransaction = new Uint8Array(2048);
	    const serializedTransactionLength = transactionLayout.encode({
	      encodedSignaturesLength: new Uint8Array(encodedSignaturesLength),
	      signatures: this.signatures,
	      serializedMessage
	    }, serializedTransaction);
	    return serializedTransaction.slice(0, serializedTransactionLength);
	  }

	  static deserialize(serializedTransaction) {
	    let byteArray = [...serializedTransaction];
	    const signatures = [];
	    const signaturesLength = decodeLength(byteArray);

	    for (let i = 0; i < signaturesLength; i++) {
	      signatures.push(new Uint8Array(byteArray.splice(0, SIGNATURE_LENGTH_IN_BYTES)));
	    }

	    const message = VersionedMessage.deserialize(new Uint8Array(byteArray));
	    return new VersionedTransaction(message, signatures);
	  }

	  sign(signers) {
	    const messageData = this.message.serialize();
	    const signerPubkeys = this.message.staticAccountKeys.slice(0, this.message.header.numRequiredSignatures);

	    for (const signer of signers) {
	      const signerIndex = signerPubkeys.findIndex(pubkey => pubkey.equals(signer.publicKey));
	      assert$1(signerIndex >= 0, `Cannot sign with non signer key ${signer.publicKey.toBase58()}`);
	      this.signatures[signerIndex] = sign(messageData, signer.secretKey);
	    }
	  }

	  addSignature(publicKey, signature) {
	    assert$1(signature.byteLength === 64, 'Signature must be 64 bytes long');
	    const signerPubkeys = this.message.staticAccountKeys.slice(0, this.message.header.numRequiredSignatures);
	    const signerIndex = signerPubkeys.findIndex(pubkey => pubkey.equals(publicKey));
	    assert$1(signerIndex >= 0, `Can not add signature; \`${publicKey.toBase58()}\` is not required to sign this transaction`);
	    this.signatures[signerIndex] = signature;
	  }

	}

	const SYSVAR_CLOCK_PUBKEY = new PublicKey('SysvarC1ock11111111111111111111111111111111');
	const SYSVAR_EPOCH_SCHEDULE_PUBKEY = new PublicKey('SysvarEpochSchedu1e111111111111111111111111');
	const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey('Sysvar1nstructions1111111111111111111111111');
	const SYSVAR_RECENT_BLOCKHASHES_PUBKEY = new PublicKey('SysvarRecentB1ockHashes11111111111111111111');
	const SYSVAR_RENT_PUBKEY = new PublicKey('SysvarRent111111111111111111111111111111111');
	const SYSVAR_REWARDS_PUBKEY = new PublicKey('SysvarRewards111111111111111111111111111111');
	const SYSVAR_SLOT_HASHES_PUBKEY = new PublicKey('SysvarS1otHashes111111111111111111111111111');
	const SYSVAR_SLOT_HISTORY_PUBKEY = new PublicKey('SysvarS1otHistory11111111111111111111111111');
	const SYSVAR_STAKE_HISTORY_PUBKEY = new PublicKey('SysvarStakeHistory1111111111111111111111111');

	/**
	 * Sign, send and confirm a transaction.
	 *
	 * If `commitment` option is not specified, defaults to 'max' commitment.
	 *
	 * @param {Connection} connection
	 * @param {Transaction} transaction
	 * @param {Array<Signer>} signers
	 * @param {ConfirmOptions} [options]
	 * @returns {Promise<TransactionSignature>}
	 */
	async function sendAndConfirmTransaction(connection, transaction, signers, options) {
	  const sendOptions = options && {
	    skipPreflight: options.skipPreflight,
	    preflightCommitment: options.preflightCommitment || options.commitment,
	    maxRetries: options.maxRetries,
	    minContextSlot: options.minContextSlot
	  };
	  const signature = await connection.sendTransaction(transaction, signers, sendOptions);
	  const status = transaction.recentBlockhash != null && transaction.lastValidBlockHeight != null ? (await connection.confirmTransaction({
	    signature: signature,
	    blockhash: transaction.recentBlockhash,
	    lastValidBlockHeight: transaction.lastValidBlockHeight
	  }, options && options.commitment)).value : (await connection.confirmTransaction(signature, options && options.commitment)).value;

	  if (status.err) {
	    throw new Error(`Transaction ${signature} failed (${JSON.stringify(status)})`);
	  }

	  return signature;
	}

	// zzz
	function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Populate a buffer of instruction data using an InstructionType
	 * @internal
	 */
	function encodeData(type, fields) {
	  const allocLength = type.layout.span >= 0 ? type.layout.span : getAlloc(type, fields);
	  const data = buffer.Buffer.alloc(allocLength);
	  const layoutFields = Object.assign({
	    instruction: type.index
	  }, fields);
	  type.layout.encode(layoutFields, data);
	  return data;
	}
	/**
	 * Decode instruction data buffer using an InstructionType
	 * @internal
	 */

	function decodeData$1(type, buffer) {
	  let data;

	  try {
	    data = type.layout.decode(buffer);
	  } catch (err) {
	    throw new Error('invalid instruction; ' + err);
	  }

	  if (data.instruction !== type.index) {
	    throw new Error(`invalid instruction; instruction index mismatch ${data.instruction} != ${type.index}`);
	  }

	  return data;
	}

	/**
	 * https://github.com/solana-labs/solana/blob/90bedd7e067b5b8f3ddbb45da00a4e9cabb22c62/sdk/src/fee_calculator.rs#L7-L11
	 *
	 * @internal
	 */

	const FeeCalculatorLayout = nu64('lamportsPerSignature');
	/**
	 * Calculator for transaction fees.
	 *
	 * @deprecated Deprecated since Solana v1.8.0.
	 */

	/**
	 * See https://github.com/solana-labs/solana/blob/0ea2843ec9cdc517572b8e62c959f41b55cf4453/sdk/src/nonce_state.rs#L29-L32
	 *
	 * @internal
	 */

	const NonceAccountLayout = struct([u32('version'), u32('state'), publicKey('authorizedPubkey'), publicKey('nonce'), struct([FeeCalculatorLayout], 'feeCalculator')]);
	const NONCE_ACCOUNT_LENGTH = NonceAccountLayout.span;

	/**
	 * NonceAccount class
	 */
	class NonceAccount {
	  /**
	   * @internal
	   */
	  constructor(args) {
	    this.authorizedPubkey = void 0;
	    this.nonce = void 0;
	    this.feeCalculator = void 0;
	    this.authorizedPubkey = args.authorizedPubkey;
	    this.nonce = args.nonce;
	    this.feeCalculator = args.feeCalculator;
	  }
	  /**
	   * Deserialize NonceAccount from the account data.
	   *
	   * @param buffer account data
	   * @return NonceAccount
	   */


	  static fromAccountData(buffer) {
	    const nonceAccount = NonceAccountLayout.decode(toBuffer(buffer), 0);
	    return new NonceAccount({
	      authorizedPubkey: new PublicKey(nonceAccount.authorizedPubkey),
	      nonce: new PublicKey(nonceAccount.nonce).toString(),
	      feeCalculator: nonceAccount.feeCalculator
	    });
	  }

	}

	var browser$1 = {};

	Object.defineProperty(browser$1, "__esModule", { value: true });
	/**
	 * Convert a little-endian buffer into a BigInt.
	 * @param buf The little-endian buffer to convert
	 * @returns A BigInt with the little-endian representation of buf.
	 */
	function toBigIntLE(buf) {
	    {
	        const reversed = Buffer.from(buf);
	        reversed.reverse();
	        const hex = reversed.toString('hex');
	        if (hex.length === 0) {
	            return BigInt(0);
	        }
	        return BigInt(`0x${hex}`);
	    }
	}
	var toBigIntLE_1 = browser$1.toBigIntLE = toBigIntLE;
	/**
	 * Convert a big-endian buffer into a BigInt
	 * @param buf The big-endian buffer to convert.
	 * @returns A BigInt with the big-endian representation of buf.
	 */
	function toBigIntBE(buf) {
	    {
	        const hex = buf.toString('hex');
	        if (hex.length === 0) {
	            return BigInt(0);
	        }
	        return BigInt(`0x${hex}`);
	    }
	}
	browser$1.toBigIntBE = toBigIntBE;
	/**
	 * Convert a BigInt to a little-endian buffer.
	 * @param num   The BigInt to convert.
	 * @param width The number of bytes that the resulting buffer should be.
	 * @returns A little-endian buffer representation of num.
	 */
	function toBufferLE(num, width) {
	    {
	        const hex = num.toString(16);
	        const buffer = Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
	        buffer.reverse();
	        return buffer;
	    }
	}
	var toBufferLE_1 = browser$1.toBufferLE = toBufferLE;
	/**
	 * Convert a BigInt to a big-endian buffer.
	 * @param num   The BigInt to convert.
	 * @param width The number of bytes that the resulting buffer should be.
	 * @returns A big-endian buffer representation of num.
	 */
	function toBufferBE(num, width) {
	    {
	        const hex = num.toString(16);
	        return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
	    }
	}
	browser$1.toBufferBE = toBufferBE;

	const encodeDecode = layout => {
	  const decode = layout.decode.bind(layout);
	  const encode = layout.encode.bind(layout);
	  return {
	    decode,
	    encode
	  };
	};

	const bigInt = length => property => {
	  const layout = blob(length, property);
	  const {
	    encode,
	    decode
	  } = encodeDecode(layout);
	  const bigIntLayout = layout;

	  bigIntLayout.decode = (buffer$1, offset) => {
	    const src = decode(buffer$1, offset);
	    return toBigIntLE_1(buffer.Buffer.from(src));
	  };

	  bigIntLayout.encode = (bigInt, buffer, offset) => {
	    const src = toBufferLE_1(bigInt, length);
	    return encode(src, buffer, offset);
	  };

	  return bigIntLayout;
	};

	const u64 = bigInt(8);

	/**
	 * Create account system transaction params
	 */

	/**
	 * System Instruction class
	 */
	class SystemInstruction {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Decode a system instruction and retrieve the instruction type.
	   */


	  static decodeInstructionType(instruction) {
	    this.checkProgramId(instruction.programId);
	    const instructionTypeLayout = u32('instruction');
	    const typeIndex = instructionTypeLayout.decode(instruction.data);
	    let type;

	    for (const [ixType, layout] of Object.entries(SYSTEM_INSTRUCTION_LAYOUTS)) {
	      if (layout.index == typeIndex) {
	        type = ixType;
	        break;
	      }
	    }

	    if (!type) {
	      throw new Error('Instruction type incorrect; not a SystemInstruction');
	    }

	    return type;
	  }
	  /**
	   * Decode a create account system instruction and retrieve the instruction params.
	   */


	  static decodeCreateAccount(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 2);
	    const {
	      lamports,
	      space,
	      programId
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.Create, instruction.data);
	    return {
	      fromPubkey: instruction.keys[0].pubkey,
	      newAccountPubkey: instruction.keys[1].pubkey,
	      lamports,
	      space,
	      programId: new PublicKey(programId)
	    };
	  }
	  /**
	   * Decode a transfer system instruction and retrieve the instruction params.
	   */


	  static decodeTransfer(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 2);
	    const {
	      lamports
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.Transfer, instruction.data);
	    return {
	      fromPubkey: instruction.keys[0].pubkey,
	      toPubkey: instruction.keys[1].pubkey,
	      lamports
	    };
	  }
	  /**
	   * Decode a transfer with seed system instruction and retrieve the instruction params.
	   */


	  static decodeTransferWithSeed(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    const {
	      lamports,
	      seed,
	      programId
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.TransferWithSeed, instruction.data);
	    return {
	      fromPubkey: instruction.keys[0].pubkey,
	      basePubkey: instruction.keys[1].pubkey,
	      toPubkey: instruction.keys[2].pubkey,
	      lamports,
	      seed,
	      programId: new PublicKey(programId)
	    };
	  }
	  /**
	   * Decode an allocate system instruction and retrieve the instruction params.
	   */


	  static decodeAllocate(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 1);
	    const {
	      space
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.Allocate, instruction.data);
	    return {
	      accountPubkey: instruction.keys[0].pubkey,
	      space
	    };
	  }
	  /**
	   * Decode an allocate with seed system instruction and retrieve the instruction params.
	   */


	  static decodeAllocateWithSeed(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 1);
	    const {
	      base,
	      seed,
	      space,
	      programId
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.AllocateWithSeed, instruction.data);
	    return {
	      accountPubkey: instruction.keys[0].pubkey,
	      basePubkey: new PublicKey(base),
	      seed,
	      space,
	      programId: new PublicKey(programId)
	    };
	  }
	  /**
	   * Decode an assign system instruction and retrieve the instruction params.
	   */


	  static decodeAssign(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 1);
	    const {
	      programId
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.Assign, instruction.data);
	    return {
	      accountPubkey: instruction.keys[0].pubkey,
	      programId: new PublicKey(programId)
	    };
	  }
	  /**
	   * Decode an assign with seed system instruction and retrieve the instruction params.
	   */


	  static decodeAssignWithSeed(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 1);
	    const {
	      base,
	      seed,
	      programId
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.AssignWithSeed, instruction.data);
	    return {
	      accountPubkey: instruction.keys[0].pubkey,
	      basePubkey: new PublicKey(base),
	      seed,
	      programId: new PublicKey(programId)
	    };
	  }
	  /**
	   * Decode a create account with seed system instruction and retrieve the instruction params.
	   */


	  static decodeCreateWithSeed(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 2);
	    const {
	      base,
	      seed,
	      lamports,
	      space,
	      programId
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.CreateWithSeed, instruction.data);
	    return {
	      fromPubkey: instruction.keys[0].pubkey,
	      newAccountPubkey: instruction.keys[1].pubkey,
	      basePubkey: new PublicKey(base),
	      seed,
	      lamports,
	      space,
	      programId: new PublicKey(programId)
	    };
	  }
	  /**
	   * Decode a nonce initialize system instruction and retrieve the instruction params.
	   */


	  static decodeNonceInitialize(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    const {
	      authorized
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.InitializeNonceAccount, instruction.data);
	    return {
	      noncePubkey: instruction.keys[0].pubkey,
	      authorizedPubkey: new PublicKey(authorized)
	    };
	  }
	  /**
	   * Decode a nonce advance system instruction and retrieve the instruction params.
	   */


	  static decodeNonceAdvance(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.AdvanceNonceAccount, instruction.data);
	    return {
	      noncePubkey: instruction.keys[0].pubkey,
	      authorizedPubkey: instruction.keys[2].pubkey
	    };
	  }
	  /**
	   * Decode a nonce withdraw system instruction and retrieve the instruction params.
	   */


	  static decodeNonceWithdraw(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 5);
	    const {
	      lamports
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.WithdrawNonceAccount, instruction.data);
	    return {
	      noncePubkey: instruction.keys[0].pubkey,
	      toPubkey: instruction.keys[1].pubkey,
	      authorizedPubkey: instruction.keys[4].pubkey,
	      lamports
	    };
	  }
	  /**
	   * Decode a nonce authorize system instruction and retrieve the instruction params.
	   */


	  static decodeNonceAuthorize(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 2);
	    const {
	      authorized
	    } = decodeData$1(SYSTEM_INSTRUCTION_LAYOUTS.AuthorizeNonceAccount, instruction.data);
	    return {
	      noncePubkey: instruction.keys[0].pubkey,
	      authorizedPubkey: instruction.keys[1].pubkey,
	      newAuthorizedPubkey: new PublicKey(authorized)
	    };
	  }
	  /**
	   * @internal
	   */


	  static checkProgramId(programId) {
	    if (!programId.equals(SystemProgram.programId)) {
	      throw new Error('invalid instruction; programId is not SystemProgram');
	    }
	  }
	  /**
	   * @internal
	   */


	  static checkKeyLength(keys, expectedLength) {
	    if (keys.length < expectedLength) {
	      throw new Error(`invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`);
	    }
	  }

	}
	/**
	 * An enumeration of valid SystemInstructionType's
	 */

	/**
	 * An enumeration of valid system InstructionType's
	 * @internal
	 */
	const SYSTEM_INSTRUCTION_LAYOUTS = Object.freeze({
	  Create: {
	    index: 0,
	    layout: struct([u32('instruction'), ns64('lamports'), ns64('space'), publicKey('programId')])
	  },
	  Assign: {
	    index: 1,
	    layout: struct([u32('instruction'), publicKey('programId')])
	  },
	  Transfer: {
	    index: 2,
	    layout: struct([u32('instruction'), u64('lamports')])
	  },
	  CreateWithSeed: {
	    index: 3,
	    layout: struct([u32('instruction'), publicKey('base'), rustString('seed'), ns64('lamports'), ns64('space'), publicKey('programId')])
	  },
	  AdvanceNonceAccount: {
	    index: 4,
	    layout: struct([u32('instruction')])
	  },
	  WithdrawNonceAccount: {
	    index: 5,
	    layout: struct([u32('instruction'), ns64('lamports')])
	  },
	  InitializeNonceAccount: {
	    index: 6,
	    layout: struct([u32('instruction'), publicKey('authorized')])
	  },
	  AuthorizeNonceAccount: {
	    index: 7,
	    layout: struct([u32('instruction'), publicKey('authorized')])
	  },
	  Allocate: {
	    index: 8,
	    layout: struct([u32('instruction'), ns64('space')])
	  },
	  AllocateWithSeed: {
	    index: 9,
	    layout: struct([u32('instruction'), publicKey('base'), rustString('seed'), ns64('space'), publicKey('programId')])
	  },
	  AssignWithSeed: {
	    index: 10,
	    layout: struct([u32('instruction'), publicKey('base'), rustString('seed'), publicKey('programId')])
	  },
	  TransferWithSeed: {
	    index: 11,
	    layout: struct([u32('instruction'), u64('lamports'), rustString('seed'), publicKey('programId')])
	  },
	  UpgradeNonceAccount: {
	    index: 12,
	    layout: struct([u32('instruction')])
	  }
	});
	/**
	 * Factory class for transactions to interact with the System program
	 */

	class SystemProgram {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Public key that identifies the System program
	   */


	  /**
	   * Generate a transaction instruction that creates a new account
	   */
	  static createAccount(params) {
	    const type = SYSTEM_INSTRUCTION_LAYOUTS.Create;
	    const data = encodeData(type, {
	      lamports: params.lamports,
	      space: params.space,
	      programId: toBuffer(params.programId.toBuffer())
	    });
	    return new TransactionInstruction({
	      keys: [{
	        pubkey: params.fromPubkey,
	        isSigner: true,
	        isWritable: true
	      }, {
	        pubkey: params.newAccountPubkey,
	        isSigner: true,
	        isWritable: true
	      }],
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction instruction that transfers lamports from one account to another
	   */


	  static transfer(params) {
	    let data;
	    let keys;

	    if ('basePubkey' in params) {
	      const type = SYSTEM_INSTRUCTION_LAYOUTS.TransferWithSeed;
	      data = encodeData(type, {
	        lamports: BigInt(params.lamports),
	        seed: params.seed,
	        programId: toBuffer(params.programId.toBuffer())
	      });
	      keys = [{
	        pubkey: params.fromPubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: params.basePubkey,
	        isSigner: true,
	        isWritable: false
	      }, {
	        pubkey: params.toPubkey,
	        isSigner: false,
	        isWritable: true
	      }];
	    } else {
	      const type = SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
	      data = encodeData(type, {
	        lamports: BigInt(params.lamports)
	      });
	      keys = [{
	        pubkey: params.fromPubkey,
	        isSigner: true,
	        isWritable: true
	      }, {
	        pubkey: params.toPubkey,
	        isSigner: false,
	        isWritable: true
	      }];
	    }

	    return new TransactionInstruction({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction instruction that assigns an account to a program
	   */


	  static assign(params) {
	    let data;
	    let keys;

	    if ('basePubkey' in params) {
	      const type = SYSTEM_INSTRUCTION_LAYOUTS.AssignWithSeed;
	      data = encodeData(type, {
	        base: toBuffer(params.basePubkey.toBuffer()),
	        seed: params.seed,
	        programId: toBuffer(params.programId.toBuffer())
	      });
	      keys = [{
	        pubkey: params.accountPubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: params.basePubkey,
	        isSigner: true,
	        isWritable: false
	      }];
	    } else {
	      const type = SYSTEM_INSTRUCTION_LAYOUTS.Assign;
	      data = encodeData(type, {
	        programId: toBuffer(params.programId.toBuffer())
	      });
	      keys = [{
	        pubkey: params.accountPubkey,
	        isSigner: true,
	        isWritable: true
	      }];
	    }

	    return new TransactionInstruction({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction instruction that creates a new account at
	   *   an address generated with `from`, a seed, and programId
	   */


	  static createAccountWithSeed(params) {
	    const type = SYSTEM_INSTRUCTION_LAYOUTS.CreateWithSeed;
	    const data = encodeData(type, {
	      base: toBuffer(params.basePubkey.toBuffer()),
	      seed: params.seed,
	      lamports: params.lamports,
	      space: params.space,
	      programId: toBuffer(params.programId.toBuffer())
	    });
	    let keys = [{
	      pubkey: params.fromPubkey,
	      isSigner: true,
	      isWritable: true
	    }, {
	      pubkey: params.newAccountPubkey,
	      isSigner: false,
	      isWritable: true
	    }];

	    if (params.basePubkey != params.fromPubkey) {
	      keys.push({
	        pubkey: params.basePubkey,
	        isSigner: true,
	        isWritable: false
	      });
	    }

	    return new TransactionInstruction({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction that creates a new Nonce account
	   */


	  static createNonceAccount(params) {
	    const transaction = new Transaction();

	    if ('basePubkey' in params && 'seed' in params) {
	      transaction.add(SystemProgram.createAccountWithSeed({
	        fromPubkey: params.fromPubkey,
	        newAccountPubkey: params.noncePubkey,
	        basePubkey: params.basePubkey,
	        seed: params.seed,
	        lamports: params.lamports,
	        space: NONCE_ACCOUNT_LENGTH,
	        programId: this.programId
	      }));
	    } else {
	      transaction.add(SystemProgram.createAccount({
	        fromPubkey: params.fromPubkey,
	        newAccountPubkey: params.noncePubkey,
	        lamports: params.lamports,
	        space: NONCE_ACCOUNT_LENGTH,
	        programId: this.programId
	      }));
	    }

	    const initParams = {
	      noncePubkey: params.noncePubkey,
	      authorizedPubkey: params.authorizedPubkey
	    };
	    transaction.add(this.nonceInitialize(initParams));
	    return transaction;
	  }
	  /**
	   * Generate an instruction to initialize a Nonce account
	   */


	  static nonceInitialize(params) {
	    const type = SYSTEM_INSTRUCTION_LAYOUTS.InitializeNonceAccount;
	    const data = encodeData(type, {
	      authorized: toBuffer(params.authorizedPubkey.toBuffer())
	    });
	    const instructionData = {
	      keys: [{
	        pubkey: params.noncePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: SYSVAR_RENT_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    };
	    return new TransactionInstruction(instructionData);
	  }
	  /**
	   * Generate an instruction to advance the nonce in a Nonce account
	   */


	  static nonceAdvance(params) {
	    const type = SYSTEM_INSTRUCTION_LAYOUTS.AdvanceNonceAccount;
	    const data = encodeData(type);
	    const instructionData = {
	      keys: [{
	        pubkey: params.noncePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: params.authorizedPubkey,
	        isSigner: true,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    };
	    return new TransactionInstruction(instructionData);
	  }
	  /**
	   * Generate a transaction instruction that withdraws lamports from a Nonce account
	   */


	  static nonceWithdraw(params) {
	    const type = SYSTEM_INSTRUCTION_LAYOUTS.WithdrawNonceAccount;
	    const data = encodeData(type, {
	      lamports: params.lamports
	    });
	    return new TransactionInstruction({
	      keys: [{
	        pubkey: params.noncePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: params.toPubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: SYSVAR_RENT_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: params.authorizedPubkey,
	        isSigner: true,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction instruction that authorizes a new PublicKey as the authority
	   * on a Nonce account.
	   */


	  static nonceAuthorize(params) {
	    const type = SYSTEM_INSTRUCTION_LAYOUTS.AuthorizeNonceAccount;
	    const data = encodeData(type, {
	      authorized: toBuffer(params.newAuthorizedPubkey.toBuffer())
	    });
	    return new TransactionInstruction({
	      keys: [{
	        pubkey: params.noncePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: params.authorizedPubkey,
	        isSigner: true,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction instruction that allocates space in an account without funding
	   */


	  static allocate(params) {
	    let data;
	    let keys;

	    if ('basePubkey' in params) {
	      const type = SYSTEM_INSTRUCTION_LAYOUTS.AllocateWithSeed;
	      data = encodeData(type, {
	        base: toBuffer(params.basePubkey.toBuffer()),
	        seed: params.seed,
	        space: params.space,
	        programId: toBuffer(params.programId.toBuffer())
	      });
	      keys = [{
	        pubkey: params.accountPubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: params.basePubkey,
	        isSigner: true,
	        isWritable: false
	      }];
	    } else {
	      const type = SYSTEM_INSTRUCTION_LAYOUTS.Allocate;
	      data = encodeData(type, {
	        space: params.space
	      });
	      keys = [{
	        pubkey: params.accountPubkey,
	        isSigner: true,
	        isWritable: true
	      }];
	    }

	    return new TransactionInstruction({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }

	}
	SystemProgram.programId = new PublicKey('11111111111111111111111111111111');

	// Keep program chunks under PACKET_DATA_SIZE, leaving enough room for the
	// rest of the Transaction fields
	//
	// TODO: replace 300 with a proper constant for the size of the other
	// Transaction fields
	const CHUNK_SIZE = PACKET_DATA_SIZE - 300;
	/**
	 * Program loader interface
	 */

	class Loader {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Amount of program data placed in each load Transaction
	   */


	  /**
	   * Minimum number of signatures required to load a program not including
	   * retries
	   *
	   * Can be used to calculate transaction fees
	   */
	  static getMinNumSignatures(dataLength) {
	    return 2 * ( // Every transaction requires two signatures (payer + program)
	    Math.ceil(dataLength / Loader.chunkSize) + 1 + // Add one for Create transaction
	    1) // Add one for Finalize transaction
	    ;
	  }
	  /**
	   * Loads a generic program
	   *
	   * @param connection The connection to use
	   * @param payer System account that pays to load the program
	   * @param program Account to load the program into
	   * @param programId Public key that identifies the loader
	   * @param data Program octets
	   * @return true if program was loaded successfully, false if program was already loaded
	   */


	  static async load(connection, payer, program, programId, data) {
	    {
	      const balanceNeeded = await connection.getMinimumBalanceForRentExemption(data.length); // Fetch program account info to check if it has already been created

	      const programInfo = await connection.getAccountInfo(program.publicKey, 'confirmed');
	      let transaction = null;

	      if (programInfo !== null) {
	        if (programInfo.executable) {
	          console.error('Program load failed, account is already executable');
	          return false;
	        }

	        if (programInfo.data.length !== data.length) {
	          transaction = transaction || new Transaction();
	          transaction.add(SystemProgram.allocate({
	            accountPubkey: program.publicKey,
	            space: data.length
	          }));
	        }

	        if (!programInfo.owner.equals(programId)) {
	          transaction = transaction || new Transaction();
	          transaction.add(SystemProgram.assign({
	            accountPubkey: program.publicKey,
	            programId
	          }));
	        }

	        if (programInfo.lamports < balanceNeeded) {
	          transaction = transaction || new Transaction();
	          transaction.add(SystemProgram.transfer({
	            fromPubkey: payer.publicKey,
	            toPubkey: program.publicKey,
	            lamports: balanceNeeded - programInfo.lamports
	          }));
	        }
	      } else {
	        transaction = new Transaction().add(SystemProgram.createAccount({
	          fromPubkey: payer.publicKey,
	          newAccountPubkey: program.publicKey,
	          lamports: balanceNeeded > 0 ? balanceNeeded : 1,
	          space: data.length,
	          programId
	        }));
	      } // If the account is already created correctly, skip this step
	      // and proceed directly to loading instructions


	      if (transaction !== null) {
	        await sendAndConfirmTransaction(connection, transaction, [payer, program], {
	          commitment: 'confirmed'
	        });
	      }
	    }
	    const dataLayout = struct([u32('instruction'), u32('offset'), u32('bytesLength'), u32('bytesLengthPadding'), seq(u8('byte'), offset(u32(), -8), 'bytes')]);
	    const chunkSize = Loader.chunkSize;
	    let offset$1 = 0;
	    let array = data;
	    let transactions = [];

	    while (array.length > 0) {
	      const bytes = array.slice(0, chunkSize);
	      const data = buffer.Buffer.alloc(chunkSize + 16);
	      dataLayout.encode({
	        instruction: 0,
	        // Load instruction
	        offset: offset$1,
	        bytes: bytes,
	        bytesLength: 0,
	        bytesLengthPadding: 0
	      }, data);
	      const transaction = new Transaction().add({
	        keys: [{
	          pubkey: program.publicKey,
	          isSigner: true,
	          isWritable: true
	        }],
	        programId,
	        data
	      });
	      transactions.push(sendAndConfirmTransaction(connection, transaction, [payer, program], {
	        commitment: 'confirmed'
	      })); // Delay between sends in an attempt to reduce rate limit errors

	      if (connection._rpcEndpoint.includes('solana.com')) {
	        const REQUESTS_PER_SECOND = 4;
	        await sleep(1000 / REQUESTS_PER_SECOND);
	      }

	      offset$1 += chunkSize;
	      array = array.slice(chunkSize);
	    }

	    await Promise.all(transactions); // Finalize the account loaded with program data for execution

	    {
	      const dataLayout = struct([u32('instruction')]);
	      const data = buffer.Buffer.alloc(dataLayout.span);
	      dataLayout.encode({
	        instruction: 1 // Finalize instruction

	      }, data);
	      const transaction = new Transaction().add({
	        keys: [{
	          pubkey: program.publicKey,
	          isSigner: true,
	          isWritable: true
	        }, {
	          pubkey: SYSVAR_RENT_PUBKEY,
	          isSigner: false,
	          isWritable: false
	        }],
	        programId,
	        data
	      });
	      await sendAndConfirmTransaction(connection, transaction, [payer, program], {
	        commitment: 'confirmed'
	      });
	    } // success

	    return true;
	  }

	}
	Loader.chunkSize = CHUNK_SIZE;

	const BPF_LOADER_PROGRAM_ID = new PublicKey('BPFLoader2111111111111111111111111111111111');
	/**
	 * Factory class for transactions to interact with a program loader
	 */

	class BpfLoader {
	  /**
	   * Minimum number of signatures required to load a program not including
	   * retries
	   *
	   * Can be used to calculate transaction fees
	   */
	  static getMinNumSignatures(dataLength) {
	    return Loader.getMinNumSignatures(dataLength);
	  }
	  /**
	   * Load a BPF program
	   *
	   * @param connection The connection to use
	   * @param payer Account that will pay program loading fees
	   * @param program Account to load the program into
	   * @param elf The entire ELF containing the BPF program
	   * @param loaderProgramId The program id of the BPF loader to use
	   * @return true if program was loaded successfully, false if program was already loaded
	   */


	  static load(connection, payer, program, elf, loaderProgramId) {
	    return Loader.load(connection, payer, program, loaderProgramId, elf);
	  }

	}

	var objToString = Object.prototype.toString;
	var objKeys = Object.keys || function(obj) {
			var keys = [];
			for (var name in obj) {
				keys.push(name);
			}
			return keys;
		};

	function stringify$1(val, isArrayProp) {
		var i, max, str, keys, key, propVal, toStr;
		if (val === true) {
			return "true";
		}
		if (val === false) {
			return "false";
		}
		switch (typeof val) {
			case "object":
				if (val === null) {
					return null;
				} else if (val.toJSON && typeof val.toJSON === "function") {
					return stringify$1(val.toJSON(), isArrayProp);
				} else {
					toStr = objToString.call(val);
					if (toStr === "[object Array]") {
						str = '[';
						max = val.length - 1;
						for(i = 0; i < max; i++) {
							str += stringify$1(val[i], true) + ',';
						}
						if (max > -1) {
							str += stringify$1(val[i], true);
						}
						return str + ']';
					} else if (toStr === "[object Object]") {
						// only object is left
						keys = objKeys(val).sort();
						max = keys.length;
						str = "";
						i = 0;
						while (i < max) {
							key = keys[i];
							propVal = stringify$1(val[key], false);
							if (propVal !== undefined) {
								if (str) {
									str += ',';
								}
								str += JSON.stringify(key) + ':' + propVal;
							}
							i++;
						}
						return '{' + str + '}';
					} else {
						return JSON.stringify(val);
					}
				}
			case "function":
			case "undefined":
				return isArrayProp ? null : undefined;
			case "string":
				return JSON.stringify(val);
			default:
				return isFinite(val) ? val : null;
		}
	}

	var fastStableStringify = function(val) {
		var returnVal = stringify$1(val, false);
		if (returnVal !== undefined) {
			return ''+ returnVal;
		}
	};

	var fastStableStringify$1 = fastStableStringify;

	/**
	 * A `StructFailure` represents a single specific failure in validation.
	 */

	/**
	 * `StructError` objects are thrown (or returned) when validation fails.
	 *
	 * Validation logic is design to exit early for maximum performance. The error
	 * represents the first error encountered during validation. For more detail,
	 * the `error.failures` property is a generator function that can be run to
	 * continue validation and receive all the failures in the data.
	 */
	class StructError extends TypeError {
	  constructor(failure, failures) {
	    let cached;
	    const {
	      message,
	      ...rest
	    } = failure;
	    const {
	      path
	    } = failure;
	    const msg = path.length === 0 ? message : "At path: " + path.join('.') + " -- " + message;
	    super(msg);
	    Object.assign(this, rest);
	    this.name = this.constructor.name;

	    this.failures = () => {
	      var _cached;

	      return (_cached = cached) != null ? _cached : cached = [failure, ...failures()];
	    };
	  }

	}

	/**
	 * Check if a value is an iterator.
	 */
	function isIterable(x) {
	  return isObject(x) && typeof x[Symbol.iterator] === 'function';
	}
	/**
	 * Check if a value is a plain object.
	 */


	function isObject(x) {
	  return typeof x === 'object' && x != null;
	}
	/**
	 * Return a value as a printable string.
	 */

	function print(value) {
	  return typeof value === 'string' ? JSON.stringify(value) : "" + value;
	}
	/**
	 * Shifts (removes and returns) the first value from the `input` iterator.
	 * Like `Array.prototype.shift()` but for an `Iterator`.
	 */

	function shiftIterator(input) {
	  const {
	    done,
	    value
	  } = input.next();
	  return done ? undefined : value;
	}
	/**
	 * Convert a single validation result to a failure.
	 */

	function toFailure(result, context, struct, value) {
	  if (result === true) {
	    return;
	  } else if (result === false) {
	    result = {};
	  } else if (typeof result === 'string') {
	    result = {
	      message: result
	    };
	  }

	  const {
	    path,
	    branch
	  } = context;
	  const {
	    type
	  } = struct;
	  const {
	    refinement,
	    message = "Expected a value of type `" + type + "`" + (refinement ? " with refinement `" + refinement + "`" : '') + ", but received: `" + print(value) + "`"
	  } = result;
	  return {
	    value,
	    type,
	    refinement,
	    key: path[path.length - 1],
	    path,
	    branch,
	    ...result,
	    message
	  };
	}
	/**
	 * Convert a validation result to an iterable of failures.
	 */

	function* toFailures(result, context, struct, value) {
	  if (!isIterable(result)) {
	    result = [result];
	  }

	  for (const r of result) {
	    const failure = toFailure(r, context, struct, value);

	    if (failure) {
	      yield failure;
	    }
	  }
	}
	/**
	 * Check a value against a struct, traversing deeply into nested values, and
	 * returning an iterator of failures or success.
	 */

	function* run(value, struct, options = {}) {
	  const {
	    path = [],
	    branch = [value],
	    coerce = false,
	    mask = false
	  } = options;
	  const ctx = {
	    path,
	    branch
	  };

	  if (coerce) {
	    value = struct.coercer(value, ctx);

	    if (mask && struct.type !== 'type' && isObject(struct.schema) && isObject(value) && !Array.isArray(value)) {
	      for (const key in value) {
	        if (struct.schema[key] === undefined) {
	          delete value[key];
	        }
	      }
	    }
	  }

	  let valid = true;

	  for (const failure of struct.validator(value, ctx)) {
	    valid = false;
	    yield [failure, undefined];
	  }

	  for (let [k, v, s] of struct.entries(value, ctx)) {
	    const ts = run(v, s, {
	      path: k === undefined ? path : [...path, k],
	      branch: k === undefined ? branch : [...branch, v],
	      coerce,
	      mask
	    });

	    for (const t of ts) {
	      if (t[0]) {
	        valid = false;
	        yield [t[0], undefined];
	      } else if (coerce) {
	        v = t[1];

	        if (k === undefined) {
	          value = v;
	        } else if (value instanceof Map) {
	          value.set(k, v);
	        } else if (value instanceof Set) {
	          value.add(v);
	        } else if (isObject(value)) {
	          value[k] = v;
	        }
	      }
	    }
	  }

	  if (valid) {
	    for (const failure of struct.refiner(value, ctx)) {
	      valid = false;
	      yield [failure, undefined];
	    }
	  }

	  if (valid) {
	    yield [undefined, value];
	  }
	}

	/**
	 * `Struct` objects encapsulate the validation logic for a specific type of
	 * values. Once constructed, you use the `assert`, `is` or `validate` helpers to
	 * validate unknown input data against the struct.
	 */

	class Struct {
	  constructor(props) {
	    const {
	      type,
	      schema,
	      validator,
	      refiner,
	      coercer = value => value,
	      entries = function* () {}
	    } = props;
	    this.type = type;
	    this.schema = schema;
	    this.entries = entries;
	    this.coercer = coercer;

	    if (validator) {
	      this.validator = (value, context) => {
	        const result = validator(value, context);
	        return toFailures(result, context, this, value);
	      };
	    } else {
	      this.validator = () => [];
	    }

	    if (refiner) {
	      this.refiner = (value, context) => {
	        const result = refiner(value, context);
	        return toFailures(result, context, this, value);
	      };
	    } else {
	      this.refiner = () => [];
	    }
	  }
	  /**
	   * Assert that a value passes the struct's validation, throwing if it doesn't.
	   */


	  assert(value) {
	    return assert(value, this);
	  }
	  /**
	   * Create a value with the struct's coercion logic, then validate it.
	   */


	  create(value) {
	    return create(value, this);
	  }
	  /**
	   * Check if a value passes the struct's validation.
	   */


	  is(value) {
	    return is(value, this);
	  }
	  /**
	   * Mask a value, coercing and validating it, but returning only the subset of
	   * properties defined by the struct's schema.
	   */


	  mask(value) {
	    return mask(value, this);
	  }
	  /**
	   * Validate a value with the struct's validation logic, returning a tuple
	   * representing the result.
	   *
	   * You may optionally pass `true` for the `withCoercion` argument to coerce
	   * the value before attempting to validate it. If you do, the result will
	   * contain the coerced result when successful.
	   */


	  validate(value, options = {}) {
	    return validate$1(value, this, options);
	  }

	}
	/**
	 * Assert that a value passes a struct, throwing if it doesn't.
	 */

	function assert(value, struct) {
	  const result = validate$1(value, struct);

	  if (result[0]) {
	    throw result[0];
	  }
	}
	/**
	 * Create a value with the coercion logic of struct and validate it.
	 */

	function create(value, struct) {
	  const result = validate$1(value, struct, {
	    coerce: true
	  });

	  if (result[0]) {
	    throw result[0];
	  } else {
	    return result[1];
	  }
	}
	/**
	 * Mask a value, returning only the subset of properties defined by a struct.
	 */

	function mask(value, struct) {
	  const result = validate$1(value, struct, {
	    coerce: true,
	    mask: true
	  });

	  if (result[0]) {
	    throw result[0];
	  } else {
	    return result[1];
	  }
	}
	/**
	 * Check if a value passes a struct.
	 */

	function is(value, struct) {
	  const result = validate$1(value, struct);
	  return !result[0];
	}
	/**
	 * Validate a value against a struct, returning an error if invalid, or the
	 * value (with potential coercion) if valid.
	 */

	function validate$1(value, struct, options = {}) {
	  const tuples = run(value, struct, options);
	  const tuple = shiftIterator(tuples);

	  if (tuple[0]) {
	    const error = new StructError(tuple[0], function* () {
	      for (const t of tuples) {
	        if (t[0]) {
	          yield t[0];
	        }
	      }
	    });
	    return [error, undefined];
	  } else {
	    const v = tuple[1];
	    return [undefined, v];
	  }
	}
	/**
	 * Define a new struct type with a custom validation function.
	 */

	function define(name, validator) {
	  return new Struct({
	    type: name,
	    schema: null,
	    validator
	  });
	}

	/**
	 * Ensure that any value passes validation.
	 */

	function any() {
	  return define('any', () => true);
	}
	function array(Element) {
	  return new Struct({
	    type: 'array',
	    schema: Element,

	    *entries(value) {
	      if (Element && Array.isArray(value)) {
	        for (const [i, v] of value.entries()) {
	          yield [i, v, Element];
	        }
	      }
	    },

	    coercer(value) {
	      return Array.isArray(value) ? value.slice() : value;
	    },

	    validator(value) {
	      return Array.isArray(value) || "Expected an array value, but received: " + print(value);
	    }

	  });
	}
	/**
	 * Ensure that a value is a boolean.
	 */

	function boolean() {
	  return define('boolean', value => {
	    return typeof value === 'boolean';
	  });
	}
	/**
	 * Ensure that a value is an instance of a specific class.
	 */

	function instance(Class) {
	  return define('instance', value => {
	    return value instanceof Class || "Expected a `" + Class.name + "` instance, but received: " + print(value);
	  });
	}
	function literal(constant) {
	  const description = print(constant);
	  const t = typeof constant;
	  return new Struct({
	    type: 'literal',
	    schema: t === 'string' || t === 'number' || t === 'boolean' ? constant : null,

	    validator(value) {
	      return value === constant || "Expected the literal `" + description + "`, but received: " + print(value);
	    }

	  });
	}
	/**
	 * Ensure that no value ever passes validation.
	 */

	function never() {
	  return define('never', () => false);
	}
	/**
	 * Augment an existing struct to allow `null` values.
	 */

	function nullable(struct) {
	  return new Struct({ ...struct,
	    validator: (value, ctx) => value === null || struct.validator(value, ctx),
	    refiner: (value, ctx) => value === null || struct.refiner(value, ctx)
	  });
	}
	/**
	 * Ensure that a value is a number.
	 */

	function number() {
	  return define('number', value => {
	    return typeof value === 'number' && !isNaN(value) || "Expected a number, but received: " + print(value);
	  });
	}
	/**
	 * Augment a struct to allow `undefined` values.
	 */

	function optional(struct) {
	  return new Struct({ ...struct,
	    validator: (value, ctx) => value === undefined || struct.validator(value, ctx),
	    refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx)
	  });
	}
	/**
	 * Ensure that a value is an object with keys and values of specific types, but
	 * without ensuring any specific shape of properties.
	 *
	 * Like TypeScript's `Record` utility.
	 */

	function record(Key, Value) {
	  return new Struct({
	    type: 'record',
	    schema: null,

	    *entries(value) {
	      if (isObject(value)) {
	        for (const k in value) {
	          const v = value[k];
	          yield [k, k, Key];
	          yield [k, v, Value];
	        }
	      }
	    },

	    validator(value) {
	      return isObject(value) || "Expected an object, but received: " + print(value);
	    }

	  });
	}
	/**
	 * Ensure that a value is a string.
	 */

	function string() {
	  return define('string', value => {
	    return typeof value === 'string' || "Expected a string, but received: " + print(value);
	  });
	}
	function tuple(Elements) {
	  const Never = never();
	  return new Struct({
	    type: 'tuple',
	    schema: null,

	    *entries(value) {
	      if (Array.isArray(value)) {
	        const length = Math.max(Elements.length, value.length);

	        for (let i = 0; i < length; i++) {
	          yield [i, value[i], Elements[i] || Never];
	        }
	      }
	    },

	    validator(value) {
	      return Array.isArray(value) || "Expected an array, but received: " + print(value);
	    }

	  });
	}
	/**
	 * Ensure that a value has a set of known properties of specific types.
	 *
	 * Note: Unrecognized properties are allowed and untouched. This is similar to
	 * how TypeScript's structural typing works.
	 */

	function type(schema) {
	  const keys = Object.keys(schema);
	  return new Struct({
	    type: 'type',
	    schema,

	    *entries(value) {
	      if (isObject(value)) {
	        for (const k of keys) {
	          yield [k, value[k], schema[k]];
	        }
	      }
	    },

	    validator(value) {
	      return isObject(value) || "Expected an object, but received: " + print(value);
	    }

	  });
	}
	function union(Structs) {
	  const description = Structs.map(s => s.type).join(' | ');
	  return new Struct({
	    type: 'union',
	    schema: null,

	    validator(value, ctx) {
	      const failures = [];

	      for (const S of Structs) {
	        const [...tuples] = run(value, S, ctx);
	        const [first] = tuples;

	        if (!first[0]) {
	          return [];
	        } else {
	          for (const [failure] of tuples) {
	            if (failure) {
	              failures.push(failure);
	            }
	          }
	        }
	      }

	      return ["Expected the value to satisfy a union of `" + description + "`, but received: " + print(value), ...failures];
	    }

	  });
	}
	/**
	 * Ensure that any value passes validation, without widening its type to `any`.
	 */

	function unknown() {
	  return define('unknown', () => true);
	}

	/**
	 * Augment a `Struct` to add an additional coercion step to its input.
	 *
	 * This allows you to transform input data before validating it, to increase the
	 * likelihood that it passes validation—for example for default values, parsing
	 * different formats, etc.
	 *
	 * Note: You must use `create(value, Struct)` on the value to have the coercion
	 * take effect! Using simply `assert()` or `is()` will not use coercion.
	 */

	function coerce(struct, condition, coercer) {
	  return new Struct({ ...struct,
	    coercer: (value, ctx) => {
	      return is(value, condition) ? struct.coercer(coercer(value, ctx), ctx) : struct.coercer(value, ctx);
	    }
	  });
	}

	var index_browser = {};

	var interopRequireDefault = {exports: {}};

	(function (module) {
		function _interopRequireDefault(obj) {
		  return obj && obj.__esModule ? obj : {
		    "default": obj
		  };
		}

		module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (interopRequireDefault));

	var createClass = {exports: {}};

	var hasRequiredCreateClass;

	function requireCreateClass () {
		if (hasRequiredCreateClass) return createClass.exports;
		hasRequiredCreateClass = 1;
		(function (module) {
			function _defineProperties(target, props) {
			  for (var i = 0; i < props.length; i++) {
			    var descriptor = props[i];
			    descriptor.enumerable = descriptor.enumerable || false;
			    descriptor.configurable = true;
			    if ("value" in descriptor) descriptor.writable = true;
			    Object.defineProperty(target, descriptor.key, descriptor);
			  }
			}

			function _createClass(Constructor, protoProps, staticProps) {
			  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
			  if (staticProps) _defineProperties(Constructor, staticProps);
			  Object.defineProperty(Constructor, "prototype", {
			    writable: false
			  });
			  return Constructor;
			}

			module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (createClass));
		return createClass.exports;
	}

	var classCallCheck = {exports: {}};

	var hasRequiredClassCallCheck;

	function requireClassCallCheck () {
		if (hasRequiredClassCallCheck) return classCallCheck.exports;
		hasRequiredClassCallCheck = 1;
		(function (module) {
			function _classCallCheck(instance, Constructor) {
			  if (!(instance instanceof Constructor)) {
			    throw new TypeError("Cannot call a class as a function");
			  }
			}

			module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (classCallCheck));
		return classCallCheck.exports;
	}

	var inherits = {exports: {}};

	var setPrototypeOf = {exports: {}};

	var hasRequiredSetPrototypeOf;

	function requireSetPrototypeOf () {
		if (hasRequiredSetPrototypeOf) return setPrototypeOf.exports;
		hasRequiredSetPrototypeOf = 1;
		(function (module) {
			function _setPrototypeOf(o, p) {
			  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
			    o.__proto__ = p;
			    return o;
			  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
			  return _setPrototypeOf(o, p);
			}

			module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (setPrototypeOf));
		return setPrototypeOf.exports;
	}

	var hasRequiredInherits;

	function requireInherits () {
		if (hasRequiredInherits) return inherits.exports;
		hasRequiredInherits = 1;
		(function (module) {
			var setPrototypeOf = requireSetPrototypeOf();

			function _inherits(subClass, superClass) {
			  if (typeof superClass !== "function" && superClass !== null) {
			    throw new TypeError("Super expression must either be null or a function");
			  }

			  subClass.prototype = Object.create(superClass && superClass.prototype, {
			    constructor: {
			      value: subClass,
			      writable: true,
			      configurable: true
			    }
			  });
			  Object.defineProperty(subClass, "prototype", {
			    writable: false
			  });
			  if (superClass) setPrototypeOf(subClass, superClass);
			}

			module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (inherits));
		return inherits.exports;
	}

	var possibleConstructorReturn = {exports: {}};

	var _typeof = {exports: {}};

	var hasRequired_typeof;

	function require_typeof () {
		if (hasRequired_typeof) return _typeof.exports;
		hasRequired_typeof = 1;
		(function (module) {
			function _typeof(obj) {
			  "@babel/helpers - typeof";

			  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
			    return typeof obj;
			  } : function (obj) {
			    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
			  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
			}

			module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (_typeof));
		return _typeof.exports;
	}

	var assertThisInitialized = {exports: {}};

	var hasRequiredAssertThisInitialized;

	function requireAssertThisInitialized () {
		if (hasRequiredAssertThisInitialized) return assertThisInitialized.exports;
		hasRequiredAssertThisInitialized = 1;
		(function (module) {
			function _assertThisInitialized(self) {
			  if (self === void 0) {
			    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
			  }

			  return self;
			}

			module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (assertThisInitialized));
		return assertThisInitialized.exports;
	}

	var hasRequiredPossibleConstructorReturn;

	function requirePossibleConstructorReturn () {
		if (hasRequiredPossibleConstructorReturn) return possibleConstructorReturn.exports;
		hasRequiredPossibleConstructorReturn = 1;
		(function (module) {
			var _typeof = require_typeof()["default"];

			var assertThisInitialized = requireAssertThisInitialized();

			function _possibleConstructorReturn(self, call) {
			  if (call && (_typeof(call) === "object" || typeof call === "function")) {
			    return call;
			  } else if (call !== void 0) {
			    throw new TypeError("Derived constructors may only return object or undefined");
			  }

			  return assertThisInitialized(self);
			}

			module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (possibleConstructorReturn));
		return possibleConstructorReturn.exports;
	}

	var getPrototypeOf = {exports: {}};

	var hasRequiredGetPrototypeOf;

	function requireGetPrototypeOf () {
		if (hasRequiredGetPrototypeOf) return getPrototypeOf.exports;
		hasRequiredGetPrototypeOf = 1;
		(function (module) {
			function _getPrototypeOf(o) {
			  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
			    return o.__proto__ || Object.getPrototypeOf(o);
			  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
			  return _getPrototypeOf(o);
			}

			module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (getPrototypeOf));
		return getPrototypeOf.exports;
	}

	var websocket_browser = {};

	var eventemitter3 = {exports: {}};

	var hasRequiredEventemitter3;

	function requireEventemitter3 () {
		if (hasRequiredEventemitter3) return eventemitter3.exports;
		hasRequiredEventemitter3 = 1;
		(function (module) {

			var has = Object.prototype.hasOwnProperty
			  , prefix = '~';

			/**
			 * Constructor to create a storage for our `EE` objects.
			 * An `Events` instance is a plain object whose properties are event names.
			 *
			 * @constructor
			 * @private
			 */
			function Events() {}

			//
			// We try to not inherit from `Object.prototype`. In some engines creating an
			// instance in this way is faster than calling `Object.create(null)` directly.
			// If `Object.create(null)` is not supported we prefix the event names with a
			// character to make sure that the built-in object properties are not
			// overridden or used as an attack vector.
			//
			if (Object.create) {
			  Events.prototype = Object.create(null);

			  //
			  // This hack is needed because the `__proto__` property is still inherited in
			  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
			  //
			  if (!new Events().__proto__) prefix = false;
			}

			/**
			 * Representation of a single event listener.
			 *
			 * @param {Function} fn The listener function.
			 * @param {*} context The context to invoke the listener with.
			 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
			 * @constructor
			 * @private
			 */
			function EE(fn, context, once) {
			  this.fn = fn;
			  this.context = context;
			  this.once = once || false;
			}

			/**
			 * Add a listener for a given event.
			 *
			 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
			 * @param {(String|Symbol)} event The event name.
			 * @param {Function} fn The listener function.
			 * @param {*} context The context to invoke the listener with.
			 * @param {Boolean} once Specify if the listener is a one-time listener.
			 * @returns {EventEmitter}
			 * @private
			 */
			function addListener(emitter, event, fn, context, once) {
			  if (typeof fn !== 'function') {
			    throw new TypeError('The listener must be a function');
			  }

			  var listener = new EE(fn, context || emitter, once)
			    , evt = prefix ? prefix + event : event;

			  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
			  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
			  else emitter._events[evt] = [emitter._events[evt], listener];

			  return emitter;
			}

			/**
			 * Clear event by name.
			 *
			 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
			 * @param {(String|Symbol)} evt The Event name.
			 * @private
			 */
			function clearEvent(emitter, evt) {
			  if (--emitter._eventsCount === 0) emitter._events = new Events();
			  else delete emitter._events[evt];
			}

			/**
			 * Minimal `EventEmitter` interface that is molded against the Node.js
			 * `EventEmitter` interface.
			 *
			 * @constructor
			 * @public
			 */
			function EventEmitter() {
			  this._events = new Events();
			  this._eventsCount = 0;
			}

			/**
			 * Return an array listing the events for which the emitter has registered
			 * listeners.
			 *
			 * @returns {Array}
			 * @public
			 */
			EventEmitter.prototype.eventNames = function eventNames() {
			  var names = []
			    , events
			    , name;

			  if (this._eventsCount === 0) return names;

			  for (name in (events = this._events)) {
			    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
			  }

			  if (Object.getOwnPropertySymbols) {
			    return names.concat(Object.getOwnPropertySymbols(events));
			  }

			  return names;
			};

			/**
			 * Return the listeners registered for a given event.
			 *
			 * @param {(String|Symbol)} event The event name.
			 * @returns {Array} The registered listeners.
			 * @public
			 */
			EventEmitter.prototype.listeners = function listeners(event) {
			  var evt = prefix ? prefix + event : event
			    , handlers = this._events[evt];

			  if (!handlers) return [];
			  if (handlers.fn) return [handlers.fn];

			  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
			    ee[i] = handlers[i].fn;
			  }

			  return ee;
			};

			/**
			 * Return the number of listeners listening to a given event.
			 *
			 * @param {(String|Symbol)} event The event name.
			 * @returns {Number} The number of listeners.
			 * @public
			 */
			EventEmitter.prototype.listenerCount = function listenerCount(event) {
			  var evt = prefix ? prefix + event : event
			    , listeners = this._events[evt];

			  if (!listeners) return 0;
			  if (listeners.fn) return 1;
			  return listeners.length;
			};

			/**
			 * Calls each of the listeners registered for a given event.
			 *
			 * @param {(String|Symbol)} event The event name.
			 * @returns {Boolean} `true` if the event had listeners, else `false`.
			 * @public
			 */
			EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
			  var evt = prefix ? prefix + event : event;

			  if (!this._events[evt]) return false;

			  var listeners = this._events[evt]
			    , len = arguments.length
			    , args
			    , i;

			  if (listeners.fn) {
			    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

			    switch (len) {
			      case 1: return listeners.fn.call(listeners.context), true;
			      case 2: return listeners.fn.call(listeners.context, a1), true;
			      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
			      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
			      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
			      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
			    }

			    for (i = 1, args = new Array(len -1); i < len; i++) {
			      args[i - 1] = arguments[i];
			    }

			    listeners.fn.apply(listeners.context, args);
			  } else {
			    var length = listeners.length
			      , j;

			    for (i = 0; i < length; i++) {
			      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

			      switch (len) {
			        case 1: listeners[i].fn.call(listeners[i].context); break;
			        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
			        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
			        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
			        default:
			          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
			            args[j - 1] = arguments[j];
			          }

			          listeners[i].fn.apply(listeners[i].context, args);
			      }
			    }
			  }

			  return true;
			};

			/**
			 * Add a listener for a given event.
			 *
			 * @param {(String|Symbol)} event The event name.
			 * @param {Function} fn The listener function.
			 * @param {*} [context=this] The context to invoke the listener with.
			 * @returns {EventEmitter} `this`.
			 * @public
			 */
			EventEmitter.prototype.on = function on(event, fn, context) {
			  return addListener(this, event, fn, context, false);
			};

			/**
			 * Add a one-time listener for a given event.
			 *
			 * @param {(String|Symbol)} event The event name.
			 * @param {Function} fn The listener function.
			 * @param {*} [context=this] The context to invoke the listener with.
			 * @returns {EventEmitter} `this`.
			 * @public
			 */
			EventEmitter.prototype.once = function once(event, fn, context) {
			  return addListener(this, event, fn, context, true);
			};

			/**
			 * Remove the listeners of a given event.
			 *
			 * @param {(String|Symbol)} event The event name.
			 * @param {Function} fn Only remove the listeners that match this function.
			 * @param {*} context Only remove the listeners that have this context.
			 * @param {Boolean} once Only remove one-time listeners.
			 * @returns {EventEmitter} `this`.
			 * @public
			 */
			EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
			  var evt = prefix ? prefix + event : event;

			  if (!this._events[evt]) return this;
			  if (!fn) {
			    clearEvent(this, evt);
			    return this;
			  }

			  var listeners = this._events[evt];

			  if (listeners.fn) {
			    if (
			      listeners.fn === fn &&
			      (!once || listeners.once) &&
			      (!context || listeners.context === context)
			    ) {
			      clearEvent(this, evt);
			    }
			  } else {
			    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
			      if (
			        listeners[i].fn !== fn ||
			        (once && !listeners[i].once) ||
			        (context && listeners[i].context !== context)
			      ) {
			        events.push(listeners[i]);
			      }
			    }

			    //
			    // Reset the array, or remove it completely if we have no more listeners.
			    //
			    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
			    else clearEvent(this, evt);
			  }

			  return this;
			};

			/**
			 * Remove all listeners, or those of the specified event.
			 *
			 * @param {(String|Symbol)} [event] The event name.
			 * @returns {EventEmitter} `this`.
			 * @public
			 */
			EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
			  var evt;

			  if (event) {
			    evt = prefix ? prefix + event : event;
			    if (this._events[evt]) clearEvent(this, evt);
			  } else {
			    this._events = new Events();
			    this._eventsCount = 0;
			  }

			  return this;
			};

			//
			// Alias methods names because people roll like that.
			//
			EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
			EventEmitter.prototype.addListener = EventEmitter.prototype.on;

			//
			// Expose the prefix.
			//
			EventEmitter.prefixed = prefix;

			//
			// Allow `EventEmitter` to be imported as module namespace.
			//
			EventEmitter.EventEmitter = EventEmitter;

			//
			// Expose the module.
			//
			{
			  module.exports = EventEmitter;
			}
	} (eventemitter3));
		return eventemitter3.exports;
	}

	/**
	 * WebSocket implements a browser-side WebSocket specification.
	 * @module Client
	 */

	var hasRequiredWebsocket_browser;

	function requireWebsocket_browser () {
		if (hasRequiredWebsocket_browser) return websocket_browser;
		hasRequiredWebsocket_browser = 1;
		(function (exports) {

			var _interopRequireDefault = interopRequireDefault.exports;

			Object.defineProperty(exports, "__esModule", {
			  value: true
			});
			exports["default"] = _default;

			var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());

			var _createClass2 = _interopRequireDefault(requireCreateClass());

			var _inherits2 = _interopRequireDefault(requireInherits());

			var _possibleConstructorReturn2 = _interopRequireDefault(requirePossibleConstructorReturn());

			var _getPrototypeOf2 = _interopRequireDefault(requireGetPrototypeOf());

			var _eventemitter = requireEventemitter3();

			function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

			function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

			var WebSocketBrowserImpl = /*#__PURE__*/function (_EventEmitter) {
			  (0, _inherits2["default"])(WebSocketBrowserImpl, _EventEmitter);

			  var _super = _createSuper(WebSocketBrowserImpl);

			  /** Instantiate a WebSocket class
			   * @constructor
			   * @param {String} address - url to a websocket server
			   * @param {(Object)} options - websocket options
			   * @param {(String|Array)} protocols - a list of protocols
			   * @return {WebSocketBrowserImpl} - returns a WebSocket instance
			   */
			  function WebSocketBrowserImpl(address, options, protocols) {
			    var _this;

			    (0, _classCallCheck2["default"])(this, WebSocketBrowserImpl);
			    _this = _super.call(this);
			    _this.socket = new window.WebSocket(address, protocols);

			    _this.socket.onopen = function () {
			      return _this.emit("open");
			    };

			    _this.socket.onmessage = function (event) {
			      return _this.emit("message", event.data);
			    };

			    _this.socket.onerror = function (error) {
			      return _this.emit("error", error);
			    };

			    _this.socket.onclose = function (event) {
			      _this.emit("close", event.code, event.reason);
			    };

			    return _this;
			  }
			  /**
			   * Sends data through a websocket connection
			   * @method
			   * @param {(String|Object)} data - data to be sent via websocket
			   * @param {Object} optionsOrCallback - ws options
			   * @param {Function} callback - a callback called once the data is sent
			   * @return {Undefined}
			   */


			  (0, _createClass2["default"])(WebSocketBrowserImpl, [{
			    key: "send",
			    value: function send(data, optionsOrCallback, callback) {
			      var cb = callback || optionsOrCallback;

			      try {
			        this.socket.send(data);
			        cb();
			      } catch (error) {
			        cb(error);
			      }
			    }
			    /**
			     * Closes an underlying socket
			     * @method
			     * @param {Number} code - status code explaining why the connection is being closed
			     * @param {String} reason - a description why the connection is closing
			     * @return {Undefined}
			     * @throws {Error}
			     */

			  }, {
			    key: "close",
			    value: function close(code, reason) {
			      this.socket.close(code, reason);
			    }
			  }, {
			    key: "addEventListener",
			    value: function addEventListener(type, listener, options) {
			      this.socket.addEventListener(type, listener, options);
			    }
			  }]);
			  return WebSocketBrowserImpl;
			}(_eventemitter.EventEmitter);
			/**
			 * factory method for common WebSocket instance
			 * @method
			 * @param {String} address - url to a websocket server
			 * @param {(Object)} options - websocket options
			 * @return {Undefined}
			 */


			function _default(address, options) {
			  return new WebSocketBrowserImpl(address, options);
			}
	} (websocket_browser));
		return websocket_browser;
	}

	var client = {};

	var regeneratorRuntime = {exports: {}};

	var hasRequiredRegeneratorRuntime;

	function requireRegeneratorRuntime () {
		if (hasRequiredRegeneratorRuntime) return regeneratorRuntime.exports;
		hasRequiredRegeneratorRuntime = 1;
		(function (module) {
			var _typeof = require_typeof()["default"];

			function _regeneratorRuntime() {
			  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */

			  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
			    return exports;
			  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
			  var exports = {},
			      Op = Object.prototype,
			      hasOwn = Op.hasOwnProperty,
			      $Symbol = "function" == typeof Symbol ? Symbol : {},
			      iteratorSymbol = $Symbol.iterator || "@@iterator",
			      asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
			      toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

			  function define(obj, key, value) {
			    return Object.defineProperty(obj, key, {
			      value: value,
			      enumerable: !0,
			      configurable: !0,
			      writable: !0
			    }), obj[key];
			  }

			  try {
			    define({}, "");
			  } catch (err) {
			    define = function define(obj, key, value) {
			      return obj[key] = value;
			    };
			  }

			  function wrap(innerFn, outerFn, self, tryLocsList) {
			    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
			        generator = Object.create(protoGenerator.prototype),
			        context = new Context(tryLocsList || []);
			    return generator._invoke = function (innerFn, self, context) {
			      var state = "suspendedStart";
			      return function (method, arg) {
			        if ("executing" === state) throw new Error("Generator is already running");

			        if ("completed" === state) {
			          if ("throw" === method) throw arg;
			          return doneResult();
			        }

			        for (context.method = method, context.arg = arg;;) {
			          var delegate = context.delegate;

			          if (delegate) {
			            var delegateResult = maybeInvokeDelegate(delegate, context);

			            if (delegateResult) {
			              if (delegateResult === ContinueSentinel) continue;
			              return delegateResult;
			            }
			          }

			          if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
			            if ("suspendedStart" === state) throw state = "completed", context.arg;
			            context.dispatchException(context.arg);
			          } else "return" === context.method && context.abrupt("return", context.arg);
			          state = "executing";
			          var record = tryCatch(innerFn, self, context);

			          if ("normal" === record.type) {
			            if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
			            return {
			              value: record.arg,
			              done: context.done
			            };
			          }

			          "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
			        }
			      };
			    }(innerFn, self, context), generator;
			  }

			  function tryCatch(fn, obj, arg) {
			    try {
			      return {
			        type: "normal",
			        arg: fn.call(obj, arg)
			      };
			    } catch (err) {
			      return {
			        type: "throw",
			        arg: err
			      };
			    }
			  }

			  exports.wrap = wrap;
			  var ContinueSentinel = {};

			  function Generator() {}

			  function GeneratorFunction() {}

			  function GeneratorFunctionPrototype() {}

			  var IteratorPrototype = {};
			  define(IteratorPrototype, iteratorSymbol, function () {
			    return this;
			  });
			  var getProto = Object.getPrototypeOf,
			      NativeIteratorPrototype = getProto && getProto(getProto(values([])));
			  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
			  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);

			  function defineIteratorMethods(prototype) {
			    ["next", "throw", "return"].forEach(function (method) {
			      define(prototype, method, function (arg) {
			        return this._invoke(method, arg);
			      });
			    });
			  }

			  function AsyncIterator(generator, PromiseImpl) {
			    function invoke(method, arg, resolve, reject) {
			      var record = tryCatch(generator[method], generator, arg);

			      if ("throw" !== record.type) {
			        var result = record.arg,
			            value = result.value;
			        return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
			          invoke("next", value, resolve, reject);
			        }, function (err) {
			          invoke("throw", err, resolve, reject);
			        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
			          result.value = unwrapped, resolve(result);
			        }, function (error) {
			          return invoke("throw", error, resolve, reject);
			        });
			      }

			      reject(record.arg);
			    }

			    var previousPromise;

			    this._invoke = function (method, arg) {
			      function callInvokeWithMethodAndArg() {
			        return new PromiseImpl(function (resolve, reject) {
			          invoke(method, arg, resolve, reject);
			        });
			      }

			      return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
			    };
			  }

			  function maybeInvokeDelegate(delegate, context) {
			    var method = delegate.iterator[context.method];

			    if (undefined === method) {
			      if (context.delegate = null, "throw" === context.method) {
			        if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel;
			        context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method");
			      }

			      return ContinueSentinel;
			    }

			    var record = tryCatch(method, delegate.iterator, context.arg);
			    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
			    var info = record.arg;
			    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
			  }

			  function pushTryEntry(locs) {
			    var entry = {
			      tryLoc: locs[0]
			    };
			    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
			  }

			  function resetTryEntry(entry) {
			    var record = entry.completion || {};
			    record.type = "normal", delete record.arg, entry.completion = record;
			  }

			  function Context(tryLocsList) {
			    this.tryEntries = [{
			      tryLoc: "root"
			    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
			  }

			  function values(iterable) {
			    if (iterable) {
			      var iteratorMethod = iterable[iteratorSymbol];
			      if (iteratorMethod) return iteratorMethod.call(iterable);
			      if ("function" == typeof iterable.next) return iterable;

			      if (!isNaN(iterable.length)) {
			        var i = -1,
			            next = function next() {
			          for (; ++i < iterable.length;) {
			            if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
			          }

			          return next.value = undefined, next.done = !0, next;
			        };

			        return next.next = next;
			      }
			    }

			    return {
			      next: doneResult
			    };
			  }

			  function doneResult() {
			    return {
			      value: undefined,
			      done: !0
			    };
			  }

			  return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
			    var ctor = "function" == typeof genFun && genFun.constructor;
			    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
			  }, exports.mark = function (genFun) {
			    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
			  }, exports.awrap = function (arg) {
			    return {
			      __await: arg
			    };
			  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
			    return this;
			  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
			    void 0 === PromiseImpl && (PromiseImpl = Promise);
			    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
			    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
			      return result.done ? result.value : iter.next();
			    });
			  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
			    return this;
			  }), define(Gp, "toString", function () {
			    return "[object Generator]";
			  }), exports.keys = function (object) {
			    var keys = [];

			    for (var key in object) {
			      keys.push(key);
			    }

			    return keys.reverse(), function next() {
			      for (; keys.length;) {
			        var key = keys.pop();
			        if (key in object) return next.value = key, next.done = !1, next;
			      }

			      return next.done = !0, next;
			    };
			  }, exports.values = values, Context.prototype = {
			    constructor: Context,
			    reset: function reset(skipTempReset) {
			      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) {
			        "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
			      }
			    },
			    stop: function stop() {
			      this.done = !0;
			      var rootRecord = this.tryEntries[0].completion;
			      if ("throw" === rootRecord.type) throw rootRecord.arg;
			      return this.rval;
			    },
			    dispatchException: function dispatchException(exception) {
			      if (this.done) throw exception;
			      var context = this;

			      function handle(loc, caught) {
			        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
			      }

			      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
			        var entry = this.tryEntries[i],
			            record = entry.completion;
			        if ("root" === entry.tryLoc) return handle("end");

			        if (entry.tryLoc <= this.prev) {
			          var hasCatch = hasOwn.call(entry, "catchLoc"),
			              hasFinally = hasOwn.call(entry, "finallyLoc");

			          if (hasCatch && hasFinally) {
			            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
			            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
			          } else if (hasCatch) {
			            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
			          } else {
			            if (!hasFinally) throw new Error("try statement without catch or finally");
			            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
			          }
			        }
			      }
			    },
			    abrupt: function abrupt(type, arg) {
			      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
			        var entry = this.tryEntries[i];

			        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
			          var finallyEntry = entry;
			          break;
			        }
			      }

			      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
			      var record = finallyEntry ? finallyEntry.completion : {};
			      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
			    },
			    complete: function complete(record, afterLoc) {
			      if ("throw" === record.type) throw record.arg;
			      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
			    },
			    finish: function finish(finallyLoc) {
			      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
			        var entry = this.tryEntries[i];
			        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
			      }
			    },
			    "catch": function _catch(tryLoc) {
			      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
			        var entry = this.tryEntries[i];

			        if (entry.tryLoc === tryLoc) {
			          var record = entry.completion;

			          if ("throw" === record.type) {
			            var thrown = record.arg;
			            resetTryEntry(entry);
			          }

			          return thrown;
			        }
			      }

			      throw new Error("illegal catch attempt");
			    },
			    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
			      return this.delegate = {
			        iterator: values(iterable),
			        resultName: resultName,
			        nextLoc: nextLoc
			      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
			    }
			  }, exports;
			}

			module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (regeneratorRuntime));
		return regeneratorRuntime.exports;
	}

	var regenerator;
	var hasRequiredRegenerator;

	function requireRegenerator () {
		if (hasRequiredRegenerator) return regenerator;
		hasRequiredRegenerator = 1;
		regenerator = requireRegeneratorRuntime()();
		return regenerator;
	}

	var asyncToGenerator = {exports: {}};

	var hasRequiredAsyncToGenerator;

	function requireAsyncToGenerator () {
		if (hasRequiredAsyncToGenerator) return asyncToGenerator.exports;
		hasRequiredAsyncToGenerator = 1;
		(function (module) {
			function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
			  try {
			    var info = gen[key](arg);
			    var value = info.value;
			  } catch (error) {
			    reject(error);
			    return;
			  }

			  if (info.done) {
			    resolve(value);
			  } else {
			    Promise.resolve(value).then(_next, _throw);
			  }
			}

			function _asyncToGenerator(fn) {
			  return function () {
			    var self = this,
			        args = arguments;
			    return new Promise(function (resolve, reject) {
			      var gen = fn.apply(self, args);

			      function _next(value) {
			        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
			      }

			      function _throw(err) {
			        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
			      }

			      _next(undefined);
			    });
			  };
			}

			module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
	} (asyncToGenerator));
		return asyncToGenerator.exports;
	}

	/**
	 * "Client" wraps "ws" or a browser-implemented "WebSocket" library
	 * according to the environment providing JSON RPC 2.0 support on top.
	 * @module Client
	 */

	var hasRequiredClient;

	function requireClient () {
		if (hasRequiredClient) return client;
		hasRequiredClient = 1;
		(function (exports) {

			var _interopRequireDefault = interopRequireDefault.exports;

			Object.defineProperty(exports, "__esModule", {
			  value: true
			});
			exports["default"] = void 0;

			var _regenerator = _interopRequireDefault(requireRegenerator());

			var _asyncToGenerator2 = _interopRequireDefault(requireAsyncToGenerator());

			var _typeof2 = _interopRequireDefault(require_typeof());

			var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());

			var _createClass2 = _interopRequireDefault(requireCreateClass());

			var _inherits2 = _interopRequireDefault(requireInherits());

			var _possibleConstructorReturn2 = _interopRequireDefault(requirePossibleConstructorReturn());

			var _getPrototypeOf2 = _interopRequireDefault(requireGetPrototypeOf());

			var _eventemitter = requireEventemitter3();

			function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

			function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

			var __rest = function (s, e) {
			  var t = {};

			  for (var p in s) {
			    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
			  }

			  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
			    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
			  }
			  return t;
			}; // @ts-ignore


			var CommonClient = /*#__PURE__*/function (_EventEmitter) {
			  (0, _inherits2["default"])(CommonClient, _EventEmitter);

			  var _super = _createSuper(CommonClient);

			  /**
			   * Instantiate a Client class.
			   * @constructor
			   * @param {webSocketFactory} webSocketFactory - factory method for WebSocket
			   * @param {String} address - url to a websocket server
			   * @param {Object} options - ws options object with reconnect parameters
			   * @param {Function} generate_request_id - custom generation request Id
			   * @return {CommonClient}
			   */
			  function CommonClient(webSocketFactory) {
			    var _this;

			    var address = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ws://localhost:8080";

			    var _a = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			    var generate_request_id = arguments.length > 3 ? arguments[3] : undefined;
			    (0, _classCallCheck2["default"])(this, CommonClient);

			    var _a$autoconnect = _a.autoconnect,
			        autoconnect = _a$autoconnect === void 0 ? true : _a$autoconnect,
			        _a$reconnect = _a.reconnect,
			        reconnect = _a$reconnect === void 0 ? true : _a$reconnect,
			        _a$reconnect_interval = _a.reconnect_interval,
			        reconnect_interval = _a$reconnect_interval === void 0 ? 1000 : _a$reconnect_interval,
			        _a$max_reconnects = _a.max_reconnects,
			        max_reconnects = _a$max_reconnects === void 0 ? 5 : _a$max_reconnects,
			        rest_options = __rest(_a, ["autoconnect", "reconnect", "reconnect_interval", "max_reconnects"]);

			    _this = _super.call(this);
			    _this.webSocketFactory = webSocketFactory;
			    _this.queue = {};
			    _this.rpc_id = 0;
			    _this.address = address;
			    _this.autoconnect = autoconnect;
			    _this.ready = false;
			    _this.reconnect = reconnect;
			    _this.reconnect_interval = reconnect_interval;
			    _this.max_reconnects = max_reconnects;
			    _this.rest_options = rest_options;
			    _this.current_reconnects = 0;

			    _this.generate_request_id = generate_request_id || function () {
			      return ++_this.rpc_id;
			    };

			    if (_this.autoconnect) _this._connect(_this.address, Object.assign({
			      autoconnect: _this.autoconnect,
			      reconnect: _this.reconnect,
			      reconnect_interval: _this.reconnect_interval,
			      max_reconnects: _this.max_reconnects
			    }, _this.rest_options));
			    return _this;
			  }
			  /**
			   * Connects to a defined server if not connected already.
			   * @method
			   * @return {Undefined}
			   */


			  (0, _createClass2["default"])(CommonClient, [{
			    key: "connect",
			    value: function connect() {
			      if (this.socket) return;

			      this._connect(this.address, Object.assign({
			        autoconnect: this.autoconnect,
			        reconnect: this.reconnect,
			        reconnect_interval: this.reconnect_interval,
			        max_reconnects: this.max_reconnects
			      }, this.rest_options));
			    }
			    /**
			     * Calls a registered RPC method on server.
			     * @method
			     * @param {String} method - RPC method name
			     * @param {Object|Array} params - optional method parameters
			     * @param {Number} timeout - RPC reply timeout value
			     * @param {Object} ws_opts - options passed to ws
			     * @return {Promise}
			     */

			  }, {
			    key: "call",
			    value: function call(method, params, timeout, ws_opts) {
			      var _this2 = this;

			      if (!ws_opts && "object" === (0, _typeof2["default"])(timeout)) {
			        ws_opts = timeout;
			        timeout = null;
			      }

			      return new Promise(function (resolve, reject) {
			        if (!_this2.ready) return reject(new Error("socket not ready"));

			        var rpc_id = _this2.generate_request_id(method, params);

			        var message = {
			          jsonrpc: "2.0",
			          method: method,
			          params: params || null,
			          id: rpc_id
			        };

			        _this2.socket.send(JSON.stringify(message), ws_opts, function (error) {
			          if (error) return reject(error);
			          _this2.queue[rpc_id] = {
			            promise: [resolve, reject]
			          };

			          if (timeout) {
			            _this2.queue[rpc_id].timeout = setTimeout(function () {
			              delete _this2.queue[rpc_id];
			              reject(new Error("reply timeout"));
			            }, timeout);
			          }
			        });
			      });
			    }
			    /**
			     * Logins with the other side of the connection.
			     * @method
			     * @param {Object} params - Login credentials object
			     * @return {Promise}
			     */

			  }, {
			    key: "login",
			    value: function () {
			      var _login = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(params) {
			        var resp;
			        return _regenerator["default"].wrap(function _callee$(_context) {
			          while (1) {
			            switch (_context.prev = _context.next) {
			              case 0:
			                _context.next = 2;
			                return this.call("rpc.login", params);

			              case 2:
			                resp = _context.sent;

			                if (resp) {
			                  _context.next = 5;
			                  break;
			                }

			                throw new Error("authentication failed");

			              case 5:
			                return _context.abrupt("return", resp);

			              case 6:
			              case "end":
			                return _context.stop();
			            }
			          }
			        }, _callee, this);
			      }));

			      function login(_x) {
			        return _login.apply(this, arguments);
			      }

			      return login;
			    }()
			    /**
			     * Fetches a list of client's methods registered on server.
			     * @method
			     * @return {Array}
			     */

			  }, {
			    key: "listMethods",
			    value: function () {
			      var _listMethods = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
			        return _regenerator["default"].wrap(function _callee2$(_context2) {
			          while (1) {
			            switch (_context2.prev = _context2.next) {
			              case 0:
			                _context2.next = 2;
			                return this.call("__listMethods");

			              case 2:
			                return _context2.abrupt("return", _context2.sent);

			              case 3:
			              case "end":
			                return _context2.stop();
			            }
			          }
			        }, _callee2, this);
			      }));

			      function listMethods() {
			        return _listMethods.apply(this, arguments);
			      }

			      return listMethods;
			    }()
			    /**
			     * Sends a JSON-RPC 2.0 notification to server.
			     * @method
			     * @param {String} method - RPC method name
			     * @param {Object} params - optional method parameters
			     * @return {Promise}
			     */

			  }, {
			    key: "notify",
			    value: function notify(method, params) {
			      var _this3 = this;

			      return new Promise(function (resolve, reject) {
			        if (!_this3.ready) return reject(new Error("socket not ready"));
			        var message = {
			          jsonrpc: "2.0",
			          method: method,
			          params: params || null
			        };

			        _this3.socket.send(JSON.stringify(message), function (error) {
			          if (error) return reject(error);
			          resolve();
			        });
			      });
			    }
			    /**
			     * Subscribes for a defined event.
			     * @method
			     * @param {String|Array} event - event name
			     * @return {Undefined}
			     * @throws {Error}
			     */

			  }, {
			    key: "subscribe",
			    value: function () {
			      var _subscribe = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(event) {
			        var result;
			        return _regenerator["default"].wrap(function _callee3$(_context3) {
			          while (1) {
			            switch (_context3.prev = _context3.next) {
			              case 0:
			                if (typeof event === "string") event = [event];
			                _context3.next = 3;
			                return this.call("rpc.on", event);

			              case 3:
			                result = _context3.sent;

			                if (!(typeof event === "string" && result[event] !== "ok")) {
			                  _context3.next = 6;
			                  break;
			                }

			                throw new Error("Failed subscribing to an event '" + event + "' with: " + result[event]);

			              case 6:
			                return _context3.abrupt("return", result);

			              case 7:
			              case "end":
			                return _context3.stop();
			            }
			          }
			        }, _callee3, this);
			      }));

			      function subscribe(_x2) {
			        return _subscribe.apply(this, arguments);
			      }

			      return subscribe;
			    }()
			    /**
			     * Unsubscribes from a defined event.
			     * @method
			     * @param {String|Array} event - event name
			     * @return {Undefined}
			     * @throws {Error}
			     */

			  }, {
			    key: "unsubscribe",
			    value: function () {
			      var _unsubscribe = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(event) {
			        var result;
			        return _regenerator["default"].wrap(function _callee4$(_context4) {
			          while (1) {
			            switch (_context4.prev = _context4.next) {
			              case 0:
			                if (typeof event === "string") event = [event];
			                _context4.next = 3;
			                return this.call("rpc.off", event);

			              case 3:
			                result = _context4.sent;

			                if (!(typeof event === "string" && result[event] !== "ok")) {
			                  _context4.next = 6;
			                  break;
			                }

			                throw new Error("Failed unsubscribing from an event with: " + result);

			              case 6:
			                return _context4.abrupt("return", result);

			              case 7:
			              case "end":
			                return _context4.stop();
			            }
			          }
			        }, _callee4, this);
			      }));

			      function unsubscribe(_x3) {
			        return _unsubscribe.apply(this, arguments);
			      }

			      return unsubscribe;
			    }()
			    /**
			     * Closes a WebSocket connection gracefully.
			     * @method
			     * @param {Number} code - socket close code
			     * @param {String} data - optional data to be sent before closing
			     * @return {Undefined}
			     */

			  }, {
			    key: "close",
			    value: function close(code, data) {
			      this.socket.close(code || 1000, data);
			    }
			    /**
			     * Connection/Message handler.
			     * @method
			     * @private
			     * @param {String} address - WebSocket API address
			     * @param {Object} options - ws options object
			     * @return {Undefined}
			     */

			  }, {
			    key: "_connect",
			    value: function _connect(address, options) {
			      var _this4 = this;

			      this.socket = this.webSocketFactory(address, options);
			      this.socket.addEventListener("open", function () {
			        _this4.ready = true;

			        _this4.emit("open");

			        _this4.current_reconnects = 0;
			      });
			      this.socket.addEventListener("message", function (_ref) {
			        var message = _ref.data;
			        if (message instanceof ArrayBuffer) message = Buffer.from(message).toString();

			        try {
			          message = JSON.parse(message);
			        } catch (error) {
			          return;
			        } // check if any listeners are attached and forward event


			        if (message.notification && _this4.listeners(message.notification).length) {
			          if (!Object.keys(message.params).length) return _this4.emit(message.notification);
			          var args = [message.notification];
			          if (message.params.constructor === Object) args.push(message.params);else // using for-loop instead of unshift/spread because performance is better
			            for (var i = 0; i < message.params.length; i++) {
			              args.push(message.params[i]);
			            } // run as microtask so that pending queue messages are resolved first
			          // eslint-disable-next-line prefer-spread

			          return Promise.resolve().then(function () {
			            _this4.emit.apply(_this4, args);
			          });
			        }

			        if (!_this4.queue[message.id]) {
			          // general JSON RPC 2.0 events
			          if (message.method && message.params) {
			            // run as microtask so that pending queue messages are resolved first
			            return Promise.resolve().then(function () {
			              _this4.emit(message.method, message.params);
			            });
			          }

			          return;
			        } // reject early since server's response is invalid


			        if ("error" in message === "result" in message) _this4.queue[message.id].promise[1](new Error("Server response malformed. Response must include either \"result\"" + " or \"error\", but not both."));
			        if (_this4.queue[message.id].timeout) clearTimeout(_this4.queue[message.id].timeout);
			        if (message.error) _this4.queue[message.id].promise[1](message.error);else _this4.queue[message.id].promise[0](message.result);
			        delete _this4.queue[message.id];
			      });
			      this.socket.addEventListener("error", function (error) {
			        return _this4.emit("error", error);
			      });
			      this.socket.addEventListener("close", function (_ref2) {
			        var code = _ref2.code,
			            reason = _ref2.reason;
			        if (_this4.ready) // Delay close event until internal state is updated
			          setTimeout(function () {
			            return _this4.emit("close", code, reason);
			          }, 0);
			        _this4.ready = false;
			        _this4.socket = undefined;
			        if (code === 1000) return;
			        _this4.current_reconnects++;
			        if (_this4.reconnect && (_this4.max_reconnects > _this4.current_reconnects || _this4.max_reconnects === 0)) setTimeout(function () {
			          return _this4._connect(address, options);
			        }, _this4.reconnect_interval);
			      });
			    }
			  }]);
			  return CommonClient;
			}(_eventemitter.EventEmitter);

			exports["default"] = CommonClient;
	} (client));
		return client;
	}

	var _interopRequireDefault = interopRequireDefault.exports;

	Object.defineProperty(index_browser, "__esModule", {
	  value: true
	});
	var Client_1 = index_browser.Client = void 0;

	var _createClass2 = _interopRequireDefault(requireCreateClass());

	var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());

	var _inherits2 = _interopRequireDefault(requireInherits());

	var _possibleConstructorReturn2 = _interopRequireDefault(requirePossibleConstructorReturn());

	var _getPrototypeOf2 = _interopRequireDefault(requireGetPrototypeOf());

	var _websocket = _interopRequireDefault(requireWebsocket_browser());

	var _client = _interopRequireDefault(requireClient());

	function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

	function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

	var Client = /*#__PURE__*/function (_CommonClient) {
	  (0, _inherits2["default"])(Client, _CommonClient);

	  var _super = _createSuper(Client);

	  function Client() {
	    var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ws://localhost:8080";

	    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	        _ref$autoconnect = _ref.autoconnect,
	        autoconnect = _ref$autoconnect === void 0 ? true : _ref$autoconnect,
	        _ref$reconnect = _ref.reconnect,
	        reconnect = _ref$reconnect === void 0 ? true : _ref$reconnect,
	        _ref$reconnect_interv = _ref.reconnect_interval,
	        reconnect_interval = _ref$reconnect_interv === void 0 ? 1000 : _ref$reconnect_interv,
	        _ref$max_reconnects = _ref.max_reconnects,
	        max_reconnects = _ref$max_reconnects === void 0 ? 5 : _ref$max_reconnects;

	    var generate_request_id = arguments.length > 2 ? arguments[2] : undefined;
	    (0, _classCallCheck2["default"])(this, Client);
	    return _super.call(this, _websocket["default"], address, {
	      autoconnect: autoconnect,
	      reconnect: reconnect,
	      reconnect_interval: reconnect_interval,
	      max_reconnects: max_reconnects
	    }, generate_request_id);
	  }

	  return (0, _createClass2["default"])(Client);
	}(_client["default"]);

	Client_1 = index_browser.Client = Client;

	// Unique ID creation requires a high quality random # generator. In the browser we therefore
	// require the crypto API and do not support built-in fallback to lower quality random number
	// generators (like Math.random()).
	var getRandomValues;
	var rnds8 = new Uint8Array(16);
	function rng() {
	  // lazy load so that environments that need to polyfill have a chance to do so
	  if (!getRandomValues) {
	    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
	    // find the complete implementation of crypto (msCrypto) on IE11.
	    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

	    if (!getRandomValues) {
	      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
	    }
	  }

	  return getRandomValues(rnds8);
	}

	var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

	function validate(uuid) {
	  return typeof uuid === 'string' && REGEX.test(uuid);
	}

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */

	var byteToHex = [];

	for (var i = 0; i < 256; ++i) {
	  byteToHex.push((i + 0x100).toString(16).substr(1));
	}

	function stringify(arr) {
	  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	  // Note: Be careful editing this code!  It's been tuned for performance
	  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
	  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
	  // of the following:
	  // - One or more input array values don't map to a hex octet (leading to
	  // "undefined" in the uuid)
	  // - Invalid input values for the RFC `version` or `variant` fields

	  if (!validate(uuid)) {
	    throw TypeError('Stringified UUID is invalid');
	  }

	  return uuid;
	}

	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	var _nodeId;

	var _clockseq; // Previous uuid creation time


	var _lastMSecs = 0;
	var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || new Array(16);
	  options = options || {};
	  var node = options.node || _nodeId;
	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
	  // specified.  We do this lazily to minimize issues related to insufficient
	  // system entropy.  See #189

	  if (node == null || clockseq == null) {
	    var seedBytes = options.random || (options.rng || rng)();

	    if (node == null) {
	      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
	    }

	    if (clockseq == null) {
	      // Per 4.2.2, randomize (14 bit) clockseq
	      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
	    }
	  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


	  var msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock

	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

	  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval


	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  } // Per 4.2.1.2 Throw error if too many uuids are requested


	  if (nsecs >= 10000) {
	    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

	  msecs += 12219292800000; // `time_low`

	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff; // `time_mid`

	  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff; // `time_high_and_version`

	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

	  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

	  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

	  b[i++] = clockseq & 0xff; // `node`

	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf || stringify(b);
	}

	function parse(uuid) {
	  if (!validate(uuid)) {
	    throw TypeError('Invalid UUID');
	  }

	  var v;
	  var arr = new Uint8Array(16); // Parse ########-....-....-....-............

	  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
	  arr[1] = v >>> 16 & 0xff;
	  arr[2] = v >>> 8 & 0xff;
	  arr[3] = v & 0xff; // Parse ........-####-....-....-............

	  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
	  arr[5] = v & 0xff; // Parse ........-....-####-....-............

	  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
	  arr[7] = v & 0xff; // Parse ........-....-....-####-............

	  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
	  arr[9] = v & 0xff; // Parse ........-....-....-....-############
	  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

	  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
	  arr[11] = v / 0x100000000 & 0xff;
	  arr[12] = v >>> 24 & 0xff;
	  arr[13] = v >>> 16 & 0xff;
	  arr[14] = v >>> 8 & 0xff;
	  arr[15] = v & 0xff;
	  return arr;
	}

	function stringToBytes(str) {
	  str = unescape(encodeURIComponent(str)); // UTF8 escape

	  var bytes = [];

	  for (var i = 0; i < str.length; ++i) {
	    bytes.push(str.charCodeAt(i));
	  }

	  return bytes;
	}

	var DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
	var URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
	function v35 (name, version, hashfunc) {
	  function generateUUID(value, namespace, buf, offset) {
	    if (typeof value === 'string') {
	      value = stringToBytes(value);
	    }

	    if (typeof namespace === 'string') {
	      namespace = parse(namespace);
	    }

	    if (namespace.length !== 16) {
	      throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
	    } // Compute hash of namespace and value, Per 4.3
	    // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
	    // hashfunc([...namespace, ... value])`


	    var bytes = new Uint8Array(16 + value.length);
	    bytes.set(namespace);
	    bytes.set(value, namespace.length);
	    bytes = hashfunc(bytes);
	    bytes[6] = bytes[6] & 0x0f | version;
	    bytes[8] = bytes[8] & 0x3f | 0x80;

	    if (buf) {
	      offset = offset || 0;

	      for (var i = 0; i < 16; ++i) {
	        buf[offset + i] = bytes[i];
	      }

	      return buf;
	    }

	    return stringify(bytes);
	  } // Function#name is not settable on some platforms (#270)


	  try {
	    generateUUID.name = name; // eslint-disable-next-line no-empty
	  } catch (err) {} // For CommonJS default export support


	  generateUUID.DNS = DNS;
	  generateUUID.URL = URL;
	  return generateUUID;
	}

	/*
	 * Browser-compatible JavaScript MD5
	 *
	 * Modification of JavaScript MD5
	 * https://github.com/blueimp/JavaScript-MD5
	 *
	 * Copyright 2011, Sebastian Tschan
	 * https://blueimp.net
	 *
	 * Licensed under the MIT license:
	 * https://opensource.org/licenses/MIT
	 *
	 * Based on
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */
	function md5(bytes) {
	  if (typeof bytes === 'string') {
	    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

	    bytes = new Uint8Array(msg.length);

	    for (var i = 0; i < msg.length; ++i) {
	      bytes[i] = msg.charCodeAt(i);
	    }
	  }

	  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
	}
	/*
	 * Convert an array of little-endian words to an array of bytes
	 */


	function md5ToHexEncodedArray(input) {
	  var output = [];
	  var length32 = input.length * 32;
	  var hexTab = '0123456789abcdef';

	  for (var i = 0; i < length32; i += 8) {
	    var x = input[i >> 5] >>> i % 32 & 0xff;
	    var hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
	    output.push(hex);
	  }

	  return output;
	}
	/**
	 * Calculate output length with padding and bit length
	 */


	function getOutputLength(inputLength8) {
	  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
	}
	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length.
	 */


	function wordsToMd5(x, len) {
	  /* append padding */
	  x[len >> 5] |= 0x80 << len % 32;
	  x[getOutputLength(len) - 1] = len;
	  var a = 1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d = 271733878;

	  for (var i = 0; i < x.length; i += 16) {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;
	    a = md5ff(a, b, c, d, x[i], 7, -680876936);
	    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
	    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
	    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
	    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
	    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
	    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
	    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
	    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
	    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
	    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
	    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
	    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
	    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
	    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
	    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
	    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
	    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
	    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
	    b = md5gg(b, c, d, a, x[i], 20, -373897302);
	    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
	    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
	    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
	    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
	    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
	    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
	    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
	    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
	    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
	    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
	    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
	    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
	    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
	    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
	    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
	    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
	    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
	    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
	    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
	    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
	    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
	    d = md5hh(d, a, b, c, x[i], 11, -358537222);
	    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
	    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
	    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
	    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
	    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
	    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
	    a = md5ii(a, b, c, d, x[i], 6, -198630844);
	    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
	    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
	    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
	    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
	    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
	    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
	    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
	    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
	    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
	    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
	    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
	    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
	    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
	    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
	    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
	    a = safeAdd(a, olda);
	    b = safeAdd(b, oldb);
	    c = safeAdd(c, oldc);
	    d = safeAdd(d, oldd);
	  }

	  return [a, b, c, d];
	}
	/*
	 * Convert an array bytes to an array of little-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */


	function bytesToWords(input) {
	  if (input.length === 0) {
	    return [];
	  }

	  var length8 = input.length * 8;
	  var output = new Uint32Array(getOutputLength(length8));

	  for (var i = 0; i < length8; i += 8) {
	    output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
	  }

	  return output;
	}
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */


	function safeAdd(x, y) {
	  var lsw = (x & 0xffff) + (y & 0xffff);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return msw << 16 | lsw & 0xffff;
	}
	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */


	function bitRotateLeft(num, cnt) {
	  return num << cnt | num >>> 32 - cnt;
	}
	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */


	function md5cmn(q, a, b, x, s, t) {
	  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
	}

	function md5ff(a, b, c, d, x, s, t) {
	  return md5cmn(b & c | ~b & d, a, b, x, s, t);
	}

	function md5gg(a, b, c, d, x, s, t) {
	  return md5cmn(b & d | c & ~d, a, b, x, s, t);
	}

	function md5hh(a, b, c, d, x, s, t) {
	  return md5cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function md5ii(a, b, c, d, x, s, t) {
	  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
	}

	var v3 = v35('v3', 0x30, md5);
	var v3$1 = v3;

	function v4(options, buf, offset) {
	  options = options || {};
	  var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

	  rnds[6] = rnds[6] & 0x0f | 0x40;
	  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

	  if (buf) {
	    offset = offset || 0;

	    for (var i = 0; i < 16; ++i) {
	      buf[offset + i] = rnds[i];
	    }

	    return buf;
	  }

	  return stringify(rnds);
	}

	// Adapted from Chris Veness' SHA1 code at
	// http://www.movable-type.co.uk/scripts/sha1.html
	function f(s, x, y, z) {
	  switch (s) {
	    case 0:
	      return x & y ^ ~x & z;

	    case 1:
	      return x ^ y ^ z;

	    case 2:
	      return x & y ^ x & z ^ y & z;

	    case 3:
	      return x ^ y ^ z;
	  }
	}

	function ROTL(x, n) {
	  return x << n | x >>> 32 - n;
	}

	function sha1(bytes) {
	  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
	  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

	  if (typeof bytes === 'string') {
	    var msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

	    bytes = [];

	    for (var i = 0; i < msg.length; ++i) {
	      bytes.push(msg.charCodeAt(i));
	    }
	  } else if (!Array.isArray(bytes)) {
	    // Convert Array-like to Array
	    bytes = Array.prototype.slice.call(bytes);
	  }

	  bytes.push(0x80);
	  var l = bytes.length / 4 + 2;
	  var N = Math.ceil(l / 16);
	  var M = new Array(N);

	  for (var _i = 0; _i < N; ++_i) {
	    var arr = new Uint32Array(16);

	    for (var j = 0; j < 16; ++j) {
	      arr[j] = bytes[_i * 64 + j * 4] << 24 | bytes[_i * 64 + j * 4 + 1] << 16 | bytes[_i * 64 + j * 4 + 2] << 8 | bytes[_i * 64 + j * 4 + 3];
	    }

	    M[_i] = arr;
	  }

	  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
	  M[N - 1][14] = Math.floor(M[N - 1][14]);
	  M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

	  for (var _i2 = 0; _i2 < N; ++_i2) {
	    var W = new Uint32Array(80);

	    for (var t = 0; t < 16; ++t) {
	      W[t] = M[_i2][t];
	    }

	    for (var _t = 16; _t < 80; ++_t) {
	      W[_t] = ROTL(W[_t - 3] ^ W[_t - 8] ^ W[_t - 14] ^ W[_t - 16], 1);
	    }

	    var a = H[0];
	    var b = H[1];
	    var c = H[2];
	    var d = H[3];
	    var e = H[4];

	    for (var _t2 = 0; _t2 < 80; ++_t2) {
	      var s = Math.floor(_t2 / 20);
	      var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[_t2] >>> 0;
	      e = d;
	      d = c;
	      c = ROTL(b, 30) >>> 0;
	      b = a;
	      a = T;
	    }

	    H[0] = H[0] + a >>> 0;
	    H[1] = H[1] + b >>> 0;
	    H[2] = H[2] + c >>> 0;
	    H[3] = H[3] + d >>> 0;
	    H[4] = H[4] + e >>> 0;
	  }

	  return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
	}

	var v5 = v35('v5', 0x50, sha1);
	var v5$1 = v5;

	var nil = '00000000-0000-0000-0000-000000000000';

	function version(uuid) {
	  if (!validate(uuid)) {
	    throw TypeError('Invalid UUID');
	  }

	  return parseInt(uuid.substr(14, 1), 16);
	}

	var esmBrowser = /*#__PURE__*/Object.freeze({
		__proto__: null,
		v1: v1,
		v3: v3$1,
		v4: v4,
		v5: v5$1,
		NIL: nil,
		version: version,
		validate: validate,
		stringify: stringify,
		parse: parse
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(esmBrowser);

	const uuid$1 = require$$0.v4;

	/**
	 *  Generates a JSON-RPC 1.0 or 2.0 request
	 *  @param {String} method Name of method to call
	 *  @param {Array|Object} params Array of parameters passed to the method as specified, or an object of parameter names and corresponding value
	 *  @param {String|Number|null} [id] Request ID can be a string, number, null for explicit notification or left out for automatic generation
	 *  @param {Object} [options]
	 *  @param {Number} [options.version=2] JSON-RPC version to use (1 or 2)
	 *  @param {Boolean} [options.notificationIdNull=false] When true, version 2 requests will set id to null instead of omitting it
	 *  @param {Function} [options.generator] Passed the request, and the options object and is expected to return a request ID
	 *  @throws {TypeError} If any of the parameters are invalid
	 *  @return {Object} A JSON-RPC 1.0 or 2.0 request
	 *  @memberOf Utils
	 */
	const generateRequest$1 = function(method, params, id, options) {
	  if(typeof method !== 'string') {
	    throw new TypeError(method + ' must be a string');
	  }

	  options = options || {};

	  // check valid version provided
	  const version = typeof options.version === 'number' ? options.version : 2;
	  if (version !== 1 && version !== 2) {
	    throw new TypeError(version + ' must be 1 or 2');
	  }

	  const request = {
	    method: method
	  };

	  if(version === 2) {
	    request.jsonrpc = '2.0';
	  }

	  if(params) {
	    // params given, but invalid?
	    if(typeof params !== 'object' && !Array.isArray(params)) {
	      throw new TypeError(params + ' must be an object, array or omitted');
	    }
	    request.params = params;
	  }

	  // if id was left out, generate one (null means explicit notification)
	  if(typeof(id) === 'undefined') {
	    const generator = typeof options.generator === 'function' ? options.generator : function() { return uuid$1(); };
	    request.id = generator(request, options);
	  } else if (version === 2 && id === null) {
	    // we have a version 2 notification
	    if (options.notificationIdNull) {
	      request.id = null; // id will not be set at all unless option provided
	    }
	  } else {
	    request.id = id;
	  }

	  return request;
	};

	var generateRequest_1 = generateRequest$1;

	const uuid = require$$0.v4;
	const generateRequest = generateRequest_1;

	/**
	 * Constructor for a Jayson Browser Client that does not depend any node.js core libraries
	 * @class ClientBrowser
	 * @param {Function} callServer Method that calls the server, receives the stringified request and a regular node-style callback
	 * @param {Object} [options]
	 * @param {Function} [options.reviver] Reviver function for JSON
	 * @param {Function} [options.replacer] Replacer function for JSON
	 * @param {Number} [options.version=2] JSON-RPC version to use (1|2)
	 * @param {Function} [options.generator] Function to use for generating request IDs
	 *  @param {Boolean} [options.notificationIdNull=false] When true, version 2 requests will set id to null instead of omitting it
	 * @return {ClientBrowser}
	 */
	const ClientBrowser = function(callServer, options) {
	  if(!(this instanceof ClientBrowser)) {
	    return new ClientBrowser(callServer, options);
	  }

	  if (!options) {
	    options = {};
	  }

	  this.options = {
	    reviver: typeof options.reviver !== 'undefined' ? options.reviver : null,
	    replacer: typeof options.replacer !== 'undefined' ? options.replacer : null,
	    generator: typeof options.generator !== 'undefined' ? options.generator : function() { return uuid(); },
	    version: typeof options.version !== 'undefined' ? options.version : 2,
	    notificationIdNull: typeof options.notificationIdNull === 'boolean' ? options.notificationIdNull : false,
	  };

	  this.callServer = callServer;
	};

	var browser = ClientBrowser;

	/**
	 *  Creates a request and dispatches it if given a callback.
	 *  @param {String|Array} method A batch request if passed an Array, or a method name if passed a String
	 *  @param {Array|Object} [params] Parameters for the method
	 *  @param {String|Number} [id] Optional id. If undefined an id will be generated. If null it creates a notification request
	 *  @param {Function} [callback] Request callback. If specified, executes the request rather than only returning it.
	 *  @throws {TypeError} Invalid parameters
	 *  @return {Object} JSON-RPC 1.0 or 2.0 compatible request
	 */
	ClientBrowser.prototype.request = function(method, params, id, callback) {
	  const self = this;
	  let request = null;

	  // is this a batch request?
	  const isBatch = Array.isArray(method) && typeof params === 'function';

	  if (this.options.version === 1 && isBatch) {
	    throw new TypeError('JSON-RPC 1.0 does not support batching');
	  }

	  // is this a raw request?
	  const isRaw = !isBatch && method && typeof method === 'object' && typeof params === 'function';

	  if(isBatch || isRaw) {
	    callback = params;
	    request = method;
	  } else {
	    if(typeof id === 'function') {
	      callback = id;
	      // specifically undefined because "null" is a notification request
	      id = undefined;
	    }

	    const hasCallback = typeof callback === 'function';

	    try {
	      request = generateRequest(method, params, id, {
	        generator: this.options.generator,
	        version: this.options.version,
	        notificationIdNull: this.options.notificationIdNull,
	      });
	    } catch(err) {
	      if(hasCallback) {
	        return callback(err);
	      }
	      throw err;
	    }

	    // no callback means we should just return a raw request
	    if(!hasCallback) {
	      return request;
	    }

	  }

	  let message;
	  try {
	    message = JSON.stringify(request, this.options.replacer);
	  } catch(err) {
	    return callback(err);
	  }

	  this.callServer(message, function(err, response) {
	    self._parseResponse(err, response, callback);
	  });

	  // always return the raw request
	  return request;
	};

	/**
	 * Parses a response from a server
	 * @param {Object} err Error to pass on that is unrelated to the actual response
	 * @param {String} responseText JSON-RPC 1.0 or 2.0 response
	 * @param {Function} callback Callback that will receive different arguments depending on the amount of parameters
	 * @private
	 */
	ClientBrowser.prototype._parseResponse = function(err, responseText, callback) {
	  if(err) {
	    callback(err);
	    return;
	  }

	  if(!responseText) {
	    // empty response text, assume that is correct because it could be a
	    // notification which jayson does not give any body for
	    return callback();
	  }

	  let response;
	  try {
	    response = JSON.parse(responseText, this.options.reviver);
	  } catch(err) {
	    return callback(err);
	  }

	  if(callback.length === 3) {
	    // if callback length is 3, we split callback arguments on error and response

	    // is batch response?
	    if(Array.isArray(response)) {

	      // neccesary to split strictly on validity according to spec here
	      const isError = function(res) {
	        return typeof res.error !== 'undefined';
	      };

	      const isNotError = function (res) {
	        return !isError(res);
	      };

	      return callback(null, response.filter(isError), response.filter(isNotError));
	    
	    } else {

	      // split regardless of validity
	      return callback(null, response.error, response.result);
	    
	    }
	  
	  }

	  callback(null, response);
	};

	var RpcClient = browser;

	const MINIMUM_SLOT_PER_EPOCH = 32; // Returns the number of trailing zeros in the binary representation of self.

	function trailingZeros(n) {
	  let trailingZeros = 0;

	  while (n > 1) {
	    n /= 2;
	    trailingZeros++;
	  }

	  return trailingZeros;
	} // Returns the smallest power of two greater than or equal to n


	function nextPowerOfTwo(n) {
	  if (n === 0) return 1;
	  n--;
	  n |= n >> 1;
	  n |= n >> 2;
	  n |= n >> 4;
	  n |= n >> 8;
	  n |= n >> 16;
	  n |= n >> 32;
	  return n + 1;
	}
	/**
	 * Epoch schedule
	 * (see https://docs.solana.com/terminology#epoch)
	 * Can be retrieved with the {@link connection.getEpochSchedule} method
	 */


	class EpochSchedule {
	  /** The maximum number of slots in each epoch */

	  /** The number of slots before beginning of an epoch to calculate a leader schedule for that epoch */

	  /** Indicates whether epochs start short and grow */

	  /** The first epoch with `slotsPerEpoch` slots */

	  /** The first slot of `firstNormalEpoch` */
	  constructor(slotsPerEpoch, leaderScheduleSlotOffset, warmup, firstNormalEpoch, firstNormalSlot) {
	    this.slotsPerEpoch = void 0;
	    this.leaderScheduleSlotOffset = void 0;
	    this.warmup = void 0;
	    this.firstNormalEpoch = void 0;
	    this.firstNormalSlot = void 0;
	    this.slotsPerEpoch = slotsPerEpoch;
	    this.leaderScheduleSlotOffset = leaderScheduleSlotOffset;
	    this.warmup = warmup;
	    this.firstNormalEpoch = firstNormalEpoch;
	    this.firstNormalSlot = firstNormalSlot;
	  }

	  getEpoch(slot) {
	    return this.getEpochAndSlotIndex(slot)[0];
	  }

	  getEpochAndSlotIndex(slot) {
	    if (slot < this.firstNormalSlot) {
	      const epoch = trailingZeros(nextPowerOfTwo(slot + MINIMUM_SLOT_PER_EPOCH + 1)) - trailingZeros(MINIMUM_SLOT_PER_EPOCH) - 1;
	      const epochLen = this.getSlotsInEpoch(epoch);
	      const slotIndex = slot - (epochLen - MINIMUM_SLOT_PER_EPOCH);
	      return [epoch, slotIndex];
	    } else {
	      const normalSlotIndex = slot - this.firstNormalSlot;
	      const normalEpochIndex = Math.floor(normalSlotIndex / this.slotsPerEpoch);
	      const epoch = this.firstNormalEpoch + normalEpochIndex;
	      const slotIndex = normalSlotIndex % this.slotsPerEpoch;
	      return [epoch, slotIndex];
	    }
	  }

	  getFirstSlotInEpoch(epoch) {
	    if (epoch <= this.firstNormalEpoch) {
	      return (Math.pow(2, epoch) - 1) * MINIMUM_SLOT_PER_EPOCH;
	    } else {
	      return (epoch - this.firstNormalEpoch) * this.slotsPerEpoch + this.firstNormalSlot;
	    }
	  }

	  getLastSlotInEpoch(epoch) {
	    return this.getFirstSlotInEpoch(epoch) + this.getSlotsInEpoch(epoch) - 1;
	  }

	  getSlotsInEpoch(epoch) {
	    if (epoch < this.firstNormalEpoch) {
	      return Math.pow(2, epoch + trailingZeros(MINIMUM_SLOT_PER_EPOCH));
	    } else {
	      return this.slotsPerEpoch;
	    }
	  }

	}

	class SendTransactionError extends Error {
	  constructor(message, logs) {
	    super(message);
	    this.logs = void 0;
	    this.logs = logs;
	  }

	} // Keep in sync with client/src/rpc_custom_errors.rs
	// Typescript `enums` thwart tree-shaking. See https://bargsten.org/jsts/enums/

	const SolanaJSONRPCErrorCode = {
	  JSON_RPC_SERVER_ERROR_BLOCK_CLEANED_UP: -32001,
	  JSON_RPC_SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE: -32002,
	  JSON_RPC_SERVER_ERROR_TRANSACTION_SIGNATURE_VERIFICATION_FAILURE: -32003,
	  JSON_RPC_SERVER_ERROR_BLOCK_NOT_AVAILABLE: -32004,
	  JSON_RPC_SERVER_ERROR_NODE_UNHEALTHY: -32005,
	  JSON_RPC_SERVER_ERROR_TRANSACTION_PRECOMPILE_VERIFICATION_FAILURE: -32006,
	  JSON_RPC_SERVER_ERROR_SLOT_SKIPPED: -32007,
	  JSON_RPC_SERVER_ERROR_NO_SNAPSHOT: -32008,
	  JSON_RPC_SERVER_ERROR_LONG_TERM_STORAGE_SLOT_SKIPPED: -32009,
	  JSON_RPC_SERVER_ERROR_KEY_EXCLUDED_FROM_SECONDARY_INDEX: -32010,
	  JSON_RPC_SERVER_ERROR_TRANSACTION_HISTORY_NOT_AVAILABLE: -32011,
	  JSON_RPC_SCAN_ERROR: -32012,
	  JSON_RPC_SERVER_ERROR_TRANSACTION_SIGNATURE_LEN_MISMATCH: -32013,
	  JSON_RPC_SERVER_ERROR_BLOCK_STATUS_NOT_AVAILABLE_YET: -32014,
	  JSON_RPC_SERVER_ERROR_UNSUPPORTED_TRANSACTION_VERSION: -32015,
	  JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED: -32016
	};
	class SolanaJSONRPCError extends Error {
	  constructor({
	    code,
	    message,
	    data
	  }, customMessage) {
	    super(customMessage != null ? `${customMessage}: ${message}` : message);
	    this.code = void 0;
	    this.data = void 0;
	    this.code = code;
	    this.data = data;
	    this.name = 'SolanaJSONRPCError';
	  }

	}

	var fetchImpl = globalThis.fetch;

	// TODO: These constants should be removed in favor of reading them out of a
	// Syscall account

	/**
	 * @internal
	 */
	const NUM_TICKS_PER_SECOND = 160;
	/**
	 * @internal
	 */

	const DEFAULT_TICKS_PER_SLOT = 64;
	/**
	 * @internal
	 */

	const NUM_SLOTS_PER_SECOND = NUM_TICKS_PER_SECOND / DEFAULT_TICKS_PER_SLOT;
	/**
	 * @internal
	 */

	const MS_PER_SLOT = 1000 / NUM_SLOTS_PER_SECOND;

	/**
	 * @internal
	 */

	/**
	 * Decode account data buffer using an AccountType
	 * @internal
	 */
	function decodeData(type, data) {
	  let decoded;

	  try {
	    decoded = type.layout.decode(data);
	  } catch (err) {
	    throw new Error('invalid instruction; ' + err);
	  }

	  if (decoded.typeIndex !== type.index) {
	    throw new Error(`invalid account data; account type mismatch ${decoded.typeIndex} != ${type.index}`);
	  }

	  return decoded;
	}

	/// The serialized size of lookup table metadata
	const LOOKUP_TABLE_META_SIZE = 56;
	class AddressLookupTableAccount {
	  constructor(args) {
	    this.key = void 0;
	    this.state = void 0;
	    this.key = args.key;
	    this.state = args.state;
	  }

	  isActive() {
	    const U64_MAX = BigInt('0xffffffffffffffff');
	    return this.state.deactivationSlot === U64_MAX;
	  }

	  static deserialize(accountData) {
	    const meta = decodeData(LookupTableMetaLayout, accountData);
	    const serializedAddressesLen = accountData.length - LOOKUP_TABLE_META_SIZE;
	    assert$1(serializedAddressesLen >= 0, 'lookup table is invalid');
	    assert$1(serializedAddressesLen % 32 === 0, 'lookup table is invalid');
	    const numSerializedAddresses = serializedAddressesLen / 32;
	    const {
	      addresses
	    } = struct([seq(publicKey(), numSerializedAddresses, 'addresses')]).decode(accountData.slice(LOOKUP_TABLE_META_SIZE));
	    return {
	      deactivationSlot: meta.deactivationSlot,
	      lastExtendedSlot: meta.lastExtendedSlot,
	      lastExtendedSlotStartIndex: meta.lastExtendedStartIndex,
	      authority: meta.authority.length !== 0 ? new PublicKey(meta.authority[0]) : undefined,
	      addresses: addresses.map(address => new PublicKey(address))
	    };
	  }

	}
	const LookupTableMetaLayout = {
	  index: 1,
	  layout: struct([u32('typeIndex'), u64('deactivationSlot'), nu64('lastExtendedSlot'), u8('lastExtendedStartIndex'), u8(), // option
	  seq(publicKey(), offset(u8(), -1), 'authority')])
	};

	const URL_RE = /^[^:]+:\/\/([^:[]+|\[[^\]]+\])(:\d+)?(.*)/i;
	function makeWebsocketUrl(endpoint) {
	  const matches = endpoint.match(URL_RE);

	  if (matches == null) {
	    throw TypeError(`Failed to validate endpoint URL \`${endpoint}\``);
	  }

	  const [_, // eslint-disable-line @typescript-eslint/no-unused-vars
	  hostish, portWithColon, rest] = matches;
	  const protocol = endpoint.startsWith('https:') ? 'wss:' : 'ws:';
	  const startPort = portWithColon == null ? null : parseInt(portWithColon.slice(1), 10);
	  const websocketPort = // Only shift the port by +1 as a convention for ws(s) only if given endpoint
	  // is explictly specifying the endpoint port (HTTP-based RPC), assuming
	  // we're directly trying to connect to solana-validator's ws listening port.
	  // When the endpoint omits the port, we're connecting to the protocol
	  // default ports: http(80) or https(443) and it's assumed we're behind a reverse
	  // proxy which manages WebSocket upgrade and backend port redirection.
	  startPort == null ? '' : `:${startPort + 1}`;
	  return `${protocol}//${hostish}${websocketPort}${rest}`;
	}

	var _process$env$npm_pack;
	const PublicKeyFromString = coerce(instance(PublicKey), string(), value => new PublicKey(value));
	const RawAccountDataResult = tuple([string(), literal('base64')]);
	const BufferFromRawAccountData = coerce(instance(buffer.Buffer), RawAccountDataResult, value => buffer.Buffer.from(value[0], 'base64'));
	/**
	 * Attempt to use a recent blockhash for up to 30 seconds
	 * @internal
	 */

	const BLOCKHASH_CACHE_TIMEOUT_MS = 30 * 1000;
	/**
	 * HACK.
	 * Copied from rpc-websockets/dist/lib/client.
	 * Otherwise, `yarn build` fails with:
	 * https://gist.github.com/steveluscher/c057eca81d479ef705cdb53162f9971d
	 */

	/* @internal */
	function assertEndpointUrl(putativeUrl) {
	  if (/^https?:/.test(putativeUrl) === false) {
	    throw new TypeError('Endpoint URL must start with `http:` or `https:`.');
	  }

	  return putativeUrl;
	}
	/** @internal */


	function extractCommitmentFromConfig(commitmentOrConfig) {
	  let commitment;
	  let config;

	  if (typeof commitmentOrConfig === 'string') {
	    commitment = commitmentOrConfig;
	  } else if (commitmentOrConfig) {
	    const {
	      commitment: specifiedCommitment,
	      ...specifiedConfig
	    } = commitmentOrConfig;
	    commitment = specifiedCommitment;
	    config = specifiedConfig;
	  }

	  return {
	    commitment,
	    config
	  };
	}
	/**
	 * @internal
	 */


	function createRpcResult(result) {
	  return union([type({
	    jsonrpc: literal('2.0'),
	    id: string(),
	    result
	  }), type({
	    jsonrpc: literal('2.0'),
	    id: string(),
	    error: type({
	      code: unknown(),
	      message: string(),
	      data: optional(any())
	    })
	  })]);
	}

	const UnknownRpcResult = createRpcResult(unknown());
	/**
	 * @internal
	 */

	function jsonRpcResult(schema) {
	  return coerce(createRpcResult(schema), UnknownRpcResult, value => {
	    if ('error' in value) {
	      return value;
	    } else {
	      return { ...value,
	        result: create(value.result, schema)
	      };
	    }
	  });
	}
	/**
	 * @internal
	 */


	function jsonRpcResultAndContext(value) {
	  return jsonRpcResult(type({
	    context: type({
	      slot: number()
	    }),
	    value
	  }));
	}
	/**
	 * @internal
	 */


	function notificationResultAndContext(value) {
	  return type({
	    context: type({
	      slot: number()
	    }),
	    value
	  });
	}
	/**
	 * @internal
	 */


	function versionedMessageFromResponse(version, response) {
	  if (version === 0) {
	    return new MessageV0({
	      header: response.header,
	      staticAccountKeys: response.accountKeys.map(accountKey => new PublicKey(accountKey)),
	      recentBlockhash: response.recentBlockhash,
	      compiledInstructions: response.instructions.map(ix => ({
	        programIdIndex: ix.programIdIndex,
	        accountKeyIndexes: ix.accounts,
	        data: bs58$1.decode(ix.data)
	      })),
	      addressTableLookups: response.addressTableLookups
	    });
	  } else {
	    return new Message(response);
	  }
	}
	/**
	 * The level of commitment desired when querying state
	 * <pre>
	 *   'processed': Query the most recent block which has reached 1 confirmation by the connected node
	 *   'confirmed': Query the most recent block which has reached 1 confirmation by the cluster
	 *   'finalized': Query the most recent block which has been finalized by the cluster
	 * </pre>
	 */


	const GetInflationGovernorResult = type({
	  foundation: number(),
	  foundationTerm: number(),
	  initial: number(),
	  taper: number(),
	  terminal: number()
	});
	/**
	 * The inflation reward for an epoch
	 */

	/**
	 * Expected JSON RPC response for the "getInflationReward" message
	 */
	const GetInflationRewardResult = jsonRpcResult(array(nullable(type({
	  epoch: number(),
	  effectiveSlot: number(),
	  amount: number(),
	  postBalance: number()
	}))));
	/**
	 * Information about the current epoch
	 */

	const GetEpochInfoResult = type({
	  epoch: number(),
	  slotIndex: number(),
	  slotsInEpoch: number(),
	  absoluteSlot: number(),
	  blockHeight: optional(number()),
	  transactionCount: optional(number())
	});
	const GetEpochScheduleResult = type({
	  slotsPerEpoch: number(),
	  leaderScheduleSlotOffset: number(),
	  warmup: boolean(),
	  firstNormalEpoch: number(),
	  firstNormalSlot: number()
	});
	/**
	 * Leader schedule
	 * (see https://docs.solana.com/terminology#leader-schedule)
	 */

	const GetLeaderScheduleResult = record(string(), array(number()));
	/**
	 * Transaction error or null
	 */

	const TransactionErrorResult = nullable(union([type({}), string()]));
	/**
	 * Signature status for a transaction
	 */

	const SignatureStatusResult = type({
	  err: TransactionErrorResult
	});
	/**
	 * Transaction signature received notification
	 */

	const SignatureReceivedResult = literal('receivedSignature');
	/**
	 * Version info for a node
	 */

	const VersionResult = type({
	  'solana-core': string(),
	  'feature-set': optional(number())
	});
	const SimulatedTransactionResponseStruct = jsonRpcResultAndContext(type({
	  err: nullable(union([type({}), string()])),
	  logs: nullable(array(string())),
	  accounts: optional(nullable(array(nullable(type({
	    executable: boolean(),
	    owner: string(),
	    lamports: number(),
	    data: array(string()),
	    rentEpoch: optional(number())
	  }))))),
	  unitsConsumed: optional(number()),
	  returnData: optional(nullable(type({
	    programId: string(),
	    data: tuple([string(), literal('base64')])
	  })))
	}));

	/**
	 * Expected JSON RPC response for the "getBlockProduction" message
	 */
	const BlockProductionResponseStruct = jsonRpcResultAndContext(type({
	  byIdentity: record(string(), array(number())),
	  range: type({
	    firstSlot: number(),
	    lastSlot: number()
	  })
	}));
	/**
	 * A performance sample
	 */

	function createRpcClient(url, httpHeaders, customFetch, fetchMiddleware, disableRetryOnRateLimit) {
	  const fetch = customFetch ? customFetch : fetchImpl;

	  let fetchWithMiddleware;

	  if (fetchMiddleware) {
	    fetchWithMiddleware = async (info, init) => {
	      const modifiedFetchArgs = await new Promise((resolve, reject) => {
	        try {
	          fetchMiddleware(info, init, (modifiedInfo, modifiedInit) => resolve([modifiedInfo, modifiedInit]));
	        } catch (error) {
	          reject(error);
	        }
	      });
	      return await fetch(...modifiedFetchArgs);
	    };
	  }

	  const clientBrowser = new RpcClient(async (request, callback) => {
	    const agent = undefined;
	    const options = {
	      method: 'POST',
	      body: request,
	      agent,
	      headers: Object.assign({
	        'Content-Type': 'application/json'
	      }, httpHeaders || {}, COMMON_HTTP_HEADERS)
	    };

	    try {
	      let too_many_requests_retries = 5;
	      let res;
	      let waitTime = 500;

	      for (;;) {
	        if (fetchWithMiddleware) {
	          res = await fetchWithMiddleware(url, options);
	        } else {
	          res = await fetch(url, options);
	        }

	        if (res.status !== 429
	        /* Too many requests */
	        ) {
	          break;
	        }

	        if (disableRetryOnRateLimit === true) {
	          break;
	        }

	        too_many_requests_retries -= 1;

	        if (too_many_requests_retries === 0) {
	          break;
	        }

	        console.log(`Server responded with ${res.status} ${res.statusText}.  Retrying after ${waitTime}ms delay...`);
	        await sleep(waitTime);
	        waitTime *= 2;
	      }

	      const text = await res.text();

	      if (res.ok) {
	        callback(null, text);
	      } else {
	        callback(new Error(`${res.status} ${res.statusText}: ${text}`));
	      }
	    } catch (err) {
	      if (err instanceof Error) callback(err);
	    } finally {
	    }
	  }, {});
	  return clientBrowser;
	}

	function createRpcRequest(client) {
	  return (method, args) => {
	    return new Promise((resolve, reject) => {
	      client.request(method, args, (err, response) => {
	        if (err) {
	          reject(err);
	          return;
	        }

	        resolve(response);
	      });
	    });
	  };
	}

	function createRpcBatchRequest(client) {
	  return requests => {
	    return new Promise((resolve, reject) => {
	      // Do nothing if requests is empty
	      if (requests.length === 0) resolve([]);
	      const batch = requests.map(params => {
	        return client.request(params.methodName, params.args);
	      });
	      client.request(batch, (err, response) => {
	        if (err) {
	          reject(err);
	          return;
	        }

	        resolve(response);
	      });
	    });
	  };
	}
	/**
	 * Expected JSON RPC response for the "getInflationGovernor" message
	 */


	const GetInflationGovernorRpcResult = jsonRpcResult(GetInflationGovernorResult);
	/**
	 * Expected JSON RPC response for the "getEpochInfo" message
	 */

	const GetEpochInfoRpcResult = jsonRpcResult(GetEpochInfoResult);
	/**
	 * Expected JSON RPC response for the "getEpochSchedule" message
	 */

	const GetEpochScheduleRpcResult = jsonRpcResult(GetEpochScheduleResult);
	/**
	 * Expected JSON RPC response for the "getLeaderSchedule" message
	 */

	const GetLeaderScheduleRpcResult = jsonRpcResult(GetLeaderScheduleResult);
	/**
	 * Expected JSON RPC response for the "minimumLedgerSlot" and "getFirstAvailableBlock" messages
	 */

	const SlotRpcResult = jsonRpcResult(number());
	/**
	 * Supply
	 */

	/**
	 * Expected JSON RPC response for the "getSupply" message
	 */
	const GetSupplyRpcResult = jsonRpcResultAndContext(type({
	  total: number(),
	  circulating: number(),
	  nonCirculating: number(),
	  nonCirculatingAccounts: array(PublicKeyFromString)
	}));
	/**
	 * Token amount object which returns a token amount in different formats
	 * for various client use cases.
	 */

	/**
	 * Expected JSON RPC structure for token amounts
	 */
	const TokenAmountResult = type({
	  amount: string(),
	  uiAmount: nullable(number()),
	  decimals: number(),
	  uiAmountString: optional(string())
	});
	/**
	 * Token address and balance.
	 */

	/**
	 * Expected JSON RPC response for the "getTokenLargestAccounts" message
	 */
	const GetTokenLargestAccountsResult = jsonRpcResultAndContext(array(type({
	  address: PublicKeyFromString,
	  amount: string(),
	  uiAmount: nullable(number()),
	  decimals: number(),
	  uiAmountString: optional(string())
	})));
	/**
	 * Expected JSON RPC response for the "getTokenAccountsByOwner" message
	 */

	const GetTokenAccountsByOwner = jsonRpcResultAndContext(array(type({
	  pubkey: PublicKeyFromString,
	  account: type({
	    executable: boolean(),
	    owner: PublicKeyFromString,
	    lamports: number(),
	    data: BufferFromRawAccountData,
	    rentEpoch: number()
	  })
	})));
	const ParsedAccountDataResult = type({
	  program: string(),
	  parsed: unknown(),
	  space: number()
	});
	/**
	 * Expected JSON RPC response for the "getTokenAccountsByOwner" message with parsed data
	 */

	const GetParsedTokenAccountsByOwner = jsonRpcResultAndContext(array(type({
	  pubkey: PublicKeyFromString,
	  account: type({
	    executable: boolean(),
	    owner: PublicKeyFromString,
	    lamports: number(),
	    data: ParsedAccountDataResult,
	    rentEpoch: number()
	  })
	})));
	/**
	 * Pair of an account address and its balance
	 */

	/**
	 * Expected JSON RPC response for the "getLargestAccounts" message
	 */
	const GetLargestAccountsRpcResult = jsonRpcResultAndContext(array(type({
	  lamports: number(),
	  address: PublicKeyFromString
	})));
	/**
	 * @internal
	 */

	const AccountInfoResult = type({
	  executable: boolean(),
	  owner: PublicKeyFromString,
	  lamports: number(),
	  data: BufferFromRawAccountData,
	  rentEpoch: number()
	});
	/**
	 * @internal
	 */

	const KeyedAccountInfoResult = type({
	  pubkey: PublicKeyFromString,
	  account: AccountInfoResult
	});
	const ParsedOrRawAccountData = coerce(union([instance(buffer.Buffer), ParsedAccountDataResult]), union([RawAccountDataResult, ParsedAccountDataResult]), value => {
	  if (Array.isArray(value)) {
	    return create(value, BufferFromRawAccountData);
	  } else {
	    return value;
	  }
	});
	/**
	 * @internal
	 */

	const ParsedAccountInfoResult = type({
	  executable: boolean(),
	  owner: PublicKeyFromString,
	  lamports: number(),
	  data: ParsedOrRawAccountData,
	  rentEpoch: number()
	});
	const KeyedParsedAccountInfoResult = type({
	  pubkey: PublicKeyFromString,
	  account: ParsedAccountInfoResult
	});
	/**
	 * @internal
	 */

	const StakeActivationResult = type({
	  state: union([literal('active'), literal('inactive'), literal('activating'), literal('deactivating')]),
	  active: number(),
	  inactive: number()
	});
	/**
	 * Expected JSON RPC response for the "getConfirmedSignaturesForAddress2" message
	 */

	const GetConfirmedSignaturesForAddress2RpcResult = jsonRpcResult(array(type({
	  signature: string(),
	  slot: number(),
	  err: TransactionErrorResult,
	  memo: nullable(string()),
	  blockTime: optional(nullable(number()))
	})));
	/**
	 * Expected JSON RPC response for the "getSignaturesForAddress" message
	 */

	const GetSignaturesForAddressRpcResult = jsonRpcResult(array(type({
	  signature: string(),
	  slot: number(),
	  err: TransactionErrorResult,
	  memo: nullable(string()),
	  blockTime: optional(nullable(number()))
	})));
	/***
	 * Expected JSON RPC response for the "accountNotification" message
	 */

	const AccountNotificationResult = type({
	  subscription: number(),
	  result: notificationResultAndContext(AccountInfoResult)
	});
	/**
	 * @internal
	 */

	const ProgramAccountInfoResult = type({
	  pubkey: PublicKeyFromString,
	  account: AccountInfoResult
	});
	/***
	 * Expected JSON RPC response for the "programNotification" message
	 */

	const ProgramAccountNotificationResult = type({
	  subscription: number(),
	  result: notificationResultAndContext(ProgramAccountInfoResult)
	});
	/**
	 * @internal
	 */

	const SlotInfoResult = type({
	  parent: number(),
	  slot: number(),
	  root: number()
	});
	/**
	 * Expected JSON RPC response for the "slotNotification" message
	 */

	const SlotNotificationResult = type({
	  subscription: number(),
	  result: SlotInfoResult
	});
	/**
	 * Slot updates which can be used for tracking the live progress of a cluster.
	 * - `"firstShredReceived"`: connected node received the first shred of a block.
	 * Indicates that a new block that is being produced.
	 * - `"completed"`: connected node has received all shreds of a block. Indicates
	 * a block was recently produced.
	 * - `"optimisticConfirmation"`: block was optimistically confirmed by the
	 * cluster. It is not guaranteed that an optimistic confirmation notification
	 * will be sent for every finalized blocks.
	 * - `"root"`: the connected node rooted this block.
	 * - `"createdBank"`: the connected node has started validating this block.
	 * - `"frozen"`: the connected node has validated this block.
	 * - `"dead"`: the connected node failed to validate this block.
	 */

	/**
	 * @internal
	 */
	const SlotUpdateResult = union([type({
	  type: union([literal('firstShredReceived'), literal('completed'), literal('optimisticConfirmation'), literal('root')]),
	  slot: number(),
	  timestamp: number()
	}), type({
	  type: literal('createdBank'),
	  parent: number(),
	  slot: number(),
	  timestamp: number()
	}), type({
	  type: literal('frozen'),
	  slot: number(),
	  timestamp: number(),
	  stats: type({
	    numTransactionEntries: number(),
	    numSuccessfulTransactions: number(),
	    numFailedTransactions: number(),
	    maxTransactionsPerEntry: number()
	  })
	}), type({
	  type: literal('dead'),
	  slot: number(),
	  timestamp: number(),
	  err: string()
	})]);
	/**
	 * Expected JSON RPC response for the "slotsUpdatesNotification" message
	 */

	const SlotUpdateNotificationResult = type({
	  subscription: number(),
	  result: SlotUpdateResult
	});
	/**
	 * Expected JSON RPC response for the "signatureNotification" message
	 */

	const SignatureNotificationResult = type({
	  subscription: number(),
	  result: notificationResultAndContext(union([SignatureStatusResult, SignatureReceivedResult]))
	});
	/**
	 * Expected JSON RPC response for the "rootNotification" message
	 */

	const RootNotificationResult = type({
	  subscription: number(),
	  result: number()
	});
	const ContactInfoResult = type({
	  pubkey: string(),
	  gossip: nullable(string()),
	  tpu: nullable(string()),
	  rpc: nullable(string()),
	  version: nullable(string())
	});
	const VoteAccountInfoResult = type({
	  votePubkey: string(),
	  nodePubkey: string(),
	  activatedStake: number(),
	  epochVoteAccount: boolean(),
	  epochCredits: array(tuple([number(), number(), number()])),
	  commission: number(),
	  lastVote: number(),
	  rootSlot: nullable(number())
	});
	/**
	 * Expected JSON RPC response for the "getVoteAccounts" message
	 */

	const GetVoteAccounts = jsonRpcResult(type({
	  current: array(VoteAccountInfoResult),
	  delinquent: array(VoteAccountInfoResult)
	}));
	const ConfirmationStatus = union([literal('processed'), literal('confirmed'), literal('finalized')]);
	const SignatureStatusResponse = type({
	  slot: number(),
	  confirmations: nullable(number()),
	  err: TransactionErrorResult,
	  confirmationStatus: optional(ConfirmationStatus)
	});
	/**
	 * Expected JSON RPC response for the "getSignatureStatuses" message
	 */

	const GetSignatureStatusesRpcResult = jsonRpcResultAndContext(array(nullable(SignatureStatusResponse)));
	/**
	 * Expected JSON RPC response for the "getMinimumBalanceForRentExemption" message
	 */

	const GetMinimumBalanceForRentExemptionRpcResult = jsonRpcResult(number());
	const AddressTableLookupStruct = type({
	  accountKey: PublicKeyFromString,
	  writableIndexes: array(number()),
	  readonlyIndexes: array(number())
	});
	const ConfirmedTransactionResult = type({
	  signatures: array(string()),
	  message: type({
	    accountKeys: array(string()),
	    header: type({
	      numRequiredSignatures: number(),
	      numReadonlySignedAccounts: number(),
	      numReadonlyUnsignedAccounts: number()
	    }),
	    instructions: array(type({
	      accounts: array(number()),
	      data: string(),
	      programIdIndex: number()
	    })),
	    recentBlockhash: string(),
	    addressTableLookups: optional(array(AddressTableLookupStruct))
	  })
	});
	const ParsedInstructionResult = type({
	  parsed: unknown(),
	  program: string(),
	  programId: PublicKeyFromString
	});
	const RawInstructionResult = type({
	  accounts: array(PublicKeyFromString),
	  data: string(),
	  programId: PublicKeyFromString
	});
	const InstructionResult = union([RawInstructionResult, ParsedInstructionResult]);
	const UnknownInstructionResult = union([type({
	  parsed: unknown(),
	  program: string(),
	  programId: string()
	}), type({
	  accounts: array(string()),
	  data: string(),
	  programId: string()
	})]);
	const ParsedOrRawInstruction = coerce(InstructionResult, UnknownInstructionResult, value => {
	  if ('accounts' in value) {
	    return create(value, RawInstructionResult);
	  } else {
	    return create(value, ParsedInstructionResult);
	  }
	});
	/**
	 * @internal
	 */

	const ParsedConfirmedTransactionResult = type({
	  signatures: array(string()),
	  message: type({
	    accountKeys: array(type({
	      pubkey: PublicKeyFromString,
	      signer: boolean(),
	      writable: boolean(),
	      source: optional(union([literal('transaction'), literal('lookupTable')]))
	    })),
	    instructions: array(ParsedOrRawInstruction),
	    recentBlockhash: string(),
	    addressTableLookups: optional(nullable(array(AddressTableLookupStruct)))
	  })
	});
	const TokenBalanceResult = type({
	  accountIndex: number(),
	  mint: string(),
	  owner: optional(string()),
	  uiTokenAmount: TokenAmountResult
	});
	const LoadedAddressesResult = type({
	  writable: array(PublicKeyFromString),
	  readonly: array(PublicKeyFromString)
	});
	/**
	 * @internal
	 */

	const ConfirmedTransactionMetaResult = type({
	  err: TransactionErrorResult,
	  fee: number(),
	  innerInstructions: optional(nullable(array(type({
	    index: number(),
	    instructions: array(type({
	      accounts: array(number()),
	      data: string(),
	      programIdIndex: number()
	    }))
	  })))),
	  preBalances: array(number()),
	  postBalances: array(number()),
	  logMessages: optional(nullable(array(string()))),
	  preTokenBalances: optional(nullable(array(TokenBalanceResult))),
	  postTokenBalances: optional(nullable(array(TokenBalanceResult))),
	  loadedAddresses: optional(LoadedAddressesResult),
	  computeUnitsConsumed: optional(number())
	});
	/**
	 * @internal
	 */

	const ParsedConfirmedTransactionMetaResult = type({
	  err: TransactionErrorResult,
	  fee: number(),
	  innerInstructions: optional(nullable(array(type({
	    index: number(),
	    instructions: array(ParsedOrRawInstruction)
	  })))),
	  preBalances: array(number()),
	  postBalances: array(number()),
	  logMessages: optional(nullable(array(string()))),
	  preTokenBalances: optional(nullable(array(TokenBalanceResult))),
	  postTokenBalances: optional(nullable(array(TokenBalanceResult))),
	  loadedAddresses: optional(LoadedAddressesResult),
	  computeUnitsConsumed: optional(number())
	});
	const TransactionVersionStruct = union([literal(0), literal('legacy')]);
	/**
	 * Expected JSON RPC response for the "getBlock" message
	 */

	const GetBlockRpcResult = jsonRpcResult(nullable(type({
	  blockhash: string(),
	  previousBlockhash: string(),
	  parentSlot: number(),
	  transactions: array(type({
	    transaction: ConfirmedTransactionResult,
	    meta: nullable(ConfirmedTransactionMetaResult),
	    version: optional(TransactionVersionStruct)
	  })),
	  rewards: optional(array(type({
	    pubkey: string(),
	    lamports: number(),
	    postBalance: nullable(number()),
	    rewardType: nullable(string())
	  }))),
	  blockTime: nullable(number()),
	  blockHeight: nullable(number())
	})));
	/**
	 * Expected JSON RPC response for the "getConfirmedBlock" message
	 *
	 * @deprecated Deprecated since Solana v1.8.0. Please use {@link GetBlockRpcResult} instead.
	 */

	const GetConfirmedBlockRpcResult = jsonRpcResult(nullable(type({
	  blockhash: string(),
	  previousBlockhash: string(),
	  parentSlot: number(),
	  transactions: array(type({
	    transaction: ConfirmedTransactionResult,
	    meta: nullable(ConfirmedTransactionMetaResult)
	  })),
	  rewards: optional(array(type({
	    pubkey: string(),
	    lamports: number(),
	    postBalance: nullable(number()),
	    rewardType: nullable(string())
	  }))),
	  blockTime: nullable(number())
	})));
	/**
	 * Expected JSON RPC response for the "getBlock" message
	 */

	const GetBlockSignaturesRpcResult = jsonRpcResult(nullable(type({
	  blockhash: string(),
	  previousBlockhash: string(),
	  parentSlot: number(),
	  signatures: array(string()),
	  blockTime: nullable(number())
	})));
	/**
	 * Expected JSON RPC response for the "getTransaction" message
	 */

	const GetTransactionRpcResult = jsonRpcResult(nullable(type({
	  slot: number(),
	  meta: ConfirmedTransactionMetaResult,
	  blockTime: optional(nullable(number())),
	  transaction: ConfirmedTransactionResult,
	  version: optional(TransactionVersionStruct)
	})));
	/**
	 * Expected parsed JSON RPC response for the "getTransaction" message
	 */

	const GetParsedTransactionRpcResult = jsonRpcResult(nullable(type({
	  slot: number(),
	  transaction: ParsedConfirmedTransactionResult,
	  meta: nullable(ParsedConfirmedTransactionMetaResult),
	  blockTime: optional(nullable(number())),
	  version: optional(TransactionVersionStruct)
	})));
	/**
	 * Expected JSON RPC response for the "getRecentBlockhash" message
	 *
	 * @deprecated Deprecated since Solana v1.8.0. Please use {@link GetLatestBlockhashRpcResult} instead.
	 */

	const GetRecentBlockhashAndContextRpcResult = jsonRpcResultAndContext(type({
	  blockhash: string(),
	  feeCalculator: type({
	    lamportsPerSignature: number()
	  })
	}));
	/**
	 * Expected JSON RPC response for the "getLatestBlockhash" message
	 */

	const GetLatestBlockhashRpcResult = jsonRpcResultAndContext(type({
	  blockhash: string(),
	  lastValidBlockHeight: number()
	}));
	const PerfSampleResult = type({
	  slot: number(),
	  numTransactions: number(),
	  numSlots: number(),
	  samplePeriodSecs: number()
	});
	/*
	 * Expected JSON RPC response for "getRecentPerformanceSamples" message
	 */

	const GetRecentPerformanceSamplesRpcResult = jsonRpcResult(array(PerfSampleResult));
	/**
	 * Expected JSON RPC response for the "getFeeCalculatorForBlockhash" message
	 */

	const GetFeeCalculatorRpcResult = jsonRpcResultAndContext(nullable(type({
	  feeCalculator: type({
	    lamportsPerSignature: number()
	  })
	})));
	/**
	 * Expected JSON RPC response for the "requestAirdrop" message
	 */

	const RequestAirdropRpcResult = jsonRpcResult(string());
	/**
	 * Expected JSON RPC response for the "sendTransaction" message
	 */

	const SendTransactionRpcResult = jsonRpcResult(string());
	/**
	 * Information about the latest slot being processed by a node
	 */

	/**
	 * @internal
	 */
	const LogsResult = type({
	  err: TransactionErrorResult,
	  logs: array(string()),
	  signature: string()
	});
	/**
	 * Logs result.
	 */

	/**
	 * Expected JSON RPC response for the "logsNotification" message.
	 */
	const LogsNotificationResult = type({
	  result: notificationResultAndContext(LogsResult),
	  subscription: number()
	});
	/**
	 * Filter for log subscriptions.
	 */

	/** @internal */
	const COMMON_HTTP_HEADERS = {
	  'solana-client': `js/${(_process$env$npm_pack = "0.0.0-development") !== null && _process$env$npm_pack !== void 0 ? _process$env$npm_pack : 'UNKNOWN'}`
	};
	/**
	 * A connection to a fullnode JSON RPC endpoint
	 */

	class Connection {
	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal
	   * A number that we increment every time an active connection closes.
	   * Used to determine whether the same socket connection that was open
	   * when an async operation started is the same one that's active when
	   * its continuation fires.
	   *
	   */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /** @internal */

	  /**
	   * Special case.
	   * After a signature is processed, RPCs automatically dispose of the
	   * subscription on the server side. We need to track which of these
	   * subscriptions have been disposed in such a way, so that we know
	   * whether the client is dealing with a not-yet-processed signature
	   * (in which case we must tear down the server subscription) or an
	   * already-processed signature (in which case the client can simply
	   * clear out the subscription locally without telling the server).
	   *
	   * NOTE: There is a proposal to eliminate this special case, here:
	   * https://github.com/solana-labs/solana/issues/18892
	   */

	  /** @internal */

	  /**
	   * Establish a JSON RPC connection
	   *
	   * @param endpoint URL to the fullnode JSON RPC endpoint
	   * @param commitmentOrConfig optional default commitment level or optional ConnectionConfig configuration object
	   */
	  constructor(endpoint, commitmentOrConfig) {
	    this._commitment = void 0;
	    this._confirmTransactionInitialTimeout = void 0;
	    this._rpcEndpoint = void 0;
	    this._rpcWsEndpoint = void 0;
	    this._rpcClient = void 0;
	    this._rpcRequest = void 0;
	    this._rpcBatchRequest = void 0;
	    this._rpcWebSocket = void 0;
	    this._rpcWebSocketConnected = false;
	    this._rpcWebSocketHeartbeat = null;
	    this._rpcWebSocketIdleTimeout = null;
	    this._rpcWebSocketGeneration = 0;
	    this._disableBlockhashCaching = false;
	    this._pollingBlockhash = false;
	    this._blockhashInfo = {
	      latestBlockhash: null,
	      lastFetch: 0,
	      transactionSignatures: [],
	      simulatedSignatures: []
	    };
	    this._nextClientSubscriptionId = 0;
	    this._subscriptionDisposeFunctionsByClientSubscriptionId = {};
	    this._subscriptionCallbacksByServerSubscriptionId = {};
	    this._subscriptionsByHash = {};
	    this._subscriptionsAutoDisposedByRpc = new Set();
	    let wsEndpoint;
	    let httpHeaders;
	    let fetch;
	    let fetchMiddleware;
	    let disableRetryOnRateLimit;

	    if (commitmentOrConfig && typeof commitmentOrConfig === 'string') {
	      this._commitment = commitmentOrConfig;
	    } else if (commitmentOrConfig) {
	      this._commitment = commitmentOrConfig.commitment;
	      this._confirmTransactionInitialTimeout = commitmentOrConfig.confirmTransactionInitialTimeout;
	      wsEndpoint = commitmentOrConfig.wsEndpoint;
	      httpHeaders = commitmentOrConfig.httpHeaders;
	      fetch = commitmentOrConfig.fetch;
	      fetchMiddleware = commitmentOrConfig.fetchMiddleware;
	      disableRetryOnRateLimit = commitmentOrConfig.disableRetryOnRateLimit;
	    }

	    this._rpcEndpoint = assertEndpointUrl(endpoint);
	    this._rpcWsEndpoint = wsEndpoint || makeWebsocketUrl(endpoint);
	    this._rpcClient = createRpcClient(endpoint, httpHeaders, fetch, fetchMiddleware, disableRetryOnRateLimit);
	    this._rpcRequest = createRpcRequest(this._rpcClient);
	    this._rpcBatchRequest = createRpcBatchRequest(this._rpcClient);
	    this._rpcWebSocket = new Client_1(this._rpcWsEndpoint, {
	      autoconnect: false,
	      max_reconnects: Infinity
	    });

	    this._rpcWebSocket.on('open', this._wsOnOpen.bind(this));

	    this._rpcWebSocket.on('error', this._wsOnError.bind(this));

	    this._rpcWebSocket.on('close', this._wsOnClose.bind(this));

	    this._rpcWebSocket.on('accountNotification', this._wsOnAccountNotification.bind(this));

	    this._rpcWebSocket.on('programNotification', this._wsOnProgramAccountNotification.bind(this));

	    this._rpcWebSocket.on('slotNotification', this._wsOnSlotNotification.bind(this));

	    this._rpcWebSocket.on('slotsUpdatesNotification', this._wsOnSlotUpdatesNotification.bind(this));

	    this._rpcWebSocket.on('signatureNotification', this._wsOnSignatureNotification.bind(this));

	    this._rpcWebSocket.on('rootNotification', this._wsOnRootNotification.bind(this));

	    this._rpcWebSocket.on('logsNotification', this._wsOnLogsNotification.bind(this));
	  }
	  /**
	   * The default commitment used for requests
	   */


	  get commitment() {
	    return this._commitment;
	  }
	  /**
	   * The RPC endpoint
	   */


	  get rpcEndpoint() {
	    return this._rpcEndpoint;
	  }
	  /**
	   * Fetch the balance for the specified public key, return with context
	   */


	  async getBalanceAndContext(publicKey, commitmentOrConfig) {
	    /** @internal */
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([publicKey.toBase58()], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getBalance', args);
	    const res = create(unsafeRes, jsonRpcResultAndContext(number()));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get balance for ${publicKey.toBase58()}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the balance for the specified public key
	   */


	  async getBalance(publicKey, commitmentOrConfig) {
	    return await this.getBalanceAndContext(publicKey, commitmentOrConfig).then(x => x.value).catch(e => {
	      throw new Error('failed to get balance of account ' + publicKey.toBase58() + ': ' + e);
	    });
	  }
	  /**
	   * Fetch the estimated production time of a block
	   */


	  async getBlockTime(slot) {
	    const unsafeRes = await this._rpcRequest('getBlockTime', [slot]);
	    const res = create(unsafeRes, jsonRpcResult(nullable(number())));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get block time for slot ${slot}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the lowest slot that the node has information about in its ledger.
	   * This value may increase over time if the node is configured to purge older ledger data
	   */


	  async getMinimumLedgerSlot() {
	    const unsafeRes = await this._rpcRequest('minimumLedgerSlot', []);
	    const res = create(unsafeRes, jsonRpcResult(number()));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get minimum ledger slot');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the slot of the lowest confirmed block that has not been purged from the ledger
	   */


	  async getFirstAvailableBlock() {
	    const unsafeRes = await this._rpcRequest('getFirstAvailableBlock', []);
	    const res = create(unsafeRes, SlotRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get first available block');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch information about the current supply
	   */


	  async getSupply(config) {
	    let configArg = {};

	    if (typeof config === 'string') {
	      configArg = {
	        commitment: config
	      };
	    } else if (config) {
	      configArg = { ...config,
	        commitment: config && config.commitment || this.commitment
	      };
	    } else {
	      configArg = {
	        commitment: this.commitment
	      };
	    }

	    const unsafeRes = await this._rpcRequest('getSupply', [configArg]);
	    const res = create(unsafeRes, GetSupplyRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get supply');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the current supply of a token mint
	   */


	  async getTokenSupply(tokenMintAddress, commitment) {
	    const args = this._buildArgs([tokenMintAddress.toBase58()], commitment);

	    const unsafeRes = await this._rpcRequest('getTokenSupply', args);
	    const res = create(unsafeRes, jsonRpcResultAndContext(TokenAmountResult));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get token supply');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the current balance of a token account
	   */


	  async getTokenAccountBalance(tokenAddress, commitment) {
	    const args = this._buildArgs([tokenAddress.toBase58()], commitment);

	    const unsafeRes = await this._rpcRequest('getTokenAccountBalance', args);
	    const res = create(unsafeRes, jsonRpcResultAndContext(TokenAmountResult));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get token account balance');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch all the token accounts owned by the specified account
	   *
	   * @return {Promise<RpcResponseAndContext<Array<{pubkey: PublicKey, account: AccountInfo<Buffer>}>>>}
	   */


	  async getTokenAccountsByOwner(ownerAddress, filter, commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);
	    let _args = [ownerAddress.toBase58()];

	    if ('mint' in filter) {
	      _args.push({
	        mint: filter.mint.toBase58()
	      });
	    } else {
	      _args.push({
	        programId: filter.programId.toBase58()
	      });
	    }

	    const args = this._buildArgs(_args, commitment, 'base64', config);

	    const unsafeRes = await this._rpcRequest('getTokenAccountsByOwner', args);
	    const res = create(unsafeRes, GetTokenAccountsByOwner);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get token accounts owned by account ${ownerAddress.toBase58()}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch parsed token accounts owned by the specified account
	   *
	   * @return {Promise<RpcResponseAndContext<Array<{pubkey: PublicKey, account: AccountInfo<ParsedAccountData>}>>>}
	   */


	  async getParsedTokenAccountsByOwner(ownerAddress, filter, commitment) {
	    let _args = [ownerAddress.toBase58()];

	    if ('mint' in filter) {
	      _args.push({
	        mint: filter.mint.toBase58()
	      });
	    } else {
	      _args.push({
	        programId: filter.programId.toBase58()
	      });
	    }

	    const args = this._buildArgs(_args, commitment, 'jsonParsed');

	    const unsafeRes = await this._rpcRequest('getTokenAccountsByOwner', args);
	    const res = create(unsafeRes, GetParsedTokenAccountsByOwner);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get token accounts owned by account ${ownerAddress.toBase58()}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the 20 largest accounts with their current balances
	   */


	  async getLargestAccounts(config) {
	    const arg = { ...config,
	      commitment: config && config.commitment || this.commitment
	    };
	    const args = arg.filter || arg.commitment ? [arg] : [];
	    const unsafeRes = await this._rpcRequest('getLargestAccounts', args);
	    const res = create(unsafeRes, GetLargestAccountsRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get largest accounts');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the 20 largest token accounts with their current balances
	   * for a given mint.
	   */


	  async getTokenLargestAccounts(mintAddress, commitment) {
	    const args = this._buildArgs([mintAddress.toBase58()], commitment);

	    const unsafeRes = await this._rpcRequest('getTokenLargestAccounts', args);
	    const res = create(unsafeRes, GetTokenLargestAccountsResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get token largest accounts');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch all the account info for the specified public key, return with context
	   */


	  async getAccountInfoAndContext(publicKey, commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([publicKey.toBase58()], commitment, 'base64', config);

	    const unsafeRes = await this._rpcRequest('getAccountInfo', args);
	    const res = create(unsafeRes, jsonRpcResultAndContext(nullable(AccountInfoResult)));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get info about account ${publicKey.toBase58()}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch parsed account info for the specified public key
	   */


	  async getParsedAccountInfo(publicKey, commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([publicKey.toBase58()], commitment, 'jsonParsed', config);

	    const unsafeRes = await this._rpcRequest('getAccountInfo', args);
	    const res = create(unsafeRes, jsonRpcResultAndContext(nullable(ParsedAccountInfoResult)));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get info about account ${publicKey.toBase58()}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch all the account info for the specified public key
	   */


	  async getAccountInfo(publicKey, commitmentOrConfig) {
	    try {
	      const res = await this.getAccountInfoAndContext(publicKey, commitmentOrConfig);
	      return res.value;
	    } catch (e) {
	      throw new Error('failed to get info about account ' + publicKey.toBase58() + ': ' + e);
	    }
	  }
	  /**
	   * Fetch all the account info for multiple accounts specified by an array of public keys, return with context
	   */


	  async getMultipleAccountsInfoAndContext(publicKeys, commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);
	    const keys = publicKeys.map(key => key.toBase58());

	    const args = this._buildArgs([keys], commitment, 'base64', config);

	    const unsafeRes = await this._rpcRequest('getMultipleAccounts', args);
	    const res = create(unsafeRes, jsonRpcResultAndContext(array(nullable(AccountInfoResult))));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get info for accounts ${keys}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch all the account info for multiple accounts specified by an array of public keys
	   */


	  async getMultipleAccountsInfo(publicKeys, commitmentOrConfig) {
	    const res = await this.getMultipleAccountsInfoAndContext(publicKeys, commitmentOrConfig);
	    return res.value;
	  }
	  /**
	   * Returns epoch activation information for a stake account that has been delegated
	   */


	  async getStakeActivation(publicKey, commitmentOrConfig, epoch) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([publicKey.toBase58()], commitment, undefined
	    /* encoding */
	    , { ...config,
	      epoch: epoch != null ? epoch : config === null || config === void 0 ? void 0 : config.epoch
	    });

	    const unsafeRes = await this._rpcRequest('getStakeActivation', args);
	    const res = create(unsafeRes, jsonRpcResult(StakeActivationResult));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get Stake Activation ${publicKey.toBase58()}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch all the accounts owned by the specified program id
	   *
	   * @return {Promise<Array<{pubkey: PublicKey, account: AccountInfo<Buffer>}>>}
	   */


	  async getProgramAccounts(programId, configOrCommitment) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(configOrCommitment);
	    const {
	      encoding,
	      ...configWithoutEncoding
	    } = config || {};

	    const args = this._buildArgs([programId.toBase58()], commitment, encoding || 'base64', configWithoutEncoding);

	    const unsafeRes = await this._rpcRequest('getProgramAccounts', args);
	    const res = create(unsafeRes, jsonRpcResult(array(KeyedAccountInfoResult)));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get accounts owned by program ${programId.toBase58()}`);
	    }

	    return res.result;
	  }
	  /**
	   * Fetch and parse all the accounts owned by the specified program id
	   *
	   * @return {Promise<Array<{pubkey: PublicKey, account: AccountInfo<Buffer | ParsedAccountData>}>>}
	   */


	  async getParsedProgramAccounts(programId, configOrCommitment) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(configOrCommitment);

	    const args = this._buildArgs([programId.toBase58()], commitment, 'jsonParsed', config);

	    const unsafeRes = await this._rpcRequest('getProgramAccounts', args);
	    const res = create(unsafeRes, jsonRpcResult(array(KeyedParsedAccountInfoResult)));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get accounts owned by program ${programId.toBase58()}`);
	    }

	    return res.result;
	  }

	  // eslint-disable-next-line no-dupe-class-members
	  async confirmTransaction(strategy, commitment) {
	    let rawSignature;

	    if (typeof strategy == 'string') {
	      rawSignature = strategy;
	    } else {
	      const config = strategy;
	      rawSignature = config.signature;
	    }

	    let decodedSignature;

	    try {
	      decodedSignature = bs58$1.decode(rawSignature);
	    } catch (err) {
	      throw new Error('signature must be base58 encoded: ' + rawSignature);
	    }

	    assert$1(decodedSignature.length === 64, 'signature has invalid length');
	    const subscriptionCommitment = commitment || this.commitment;
	    let timeoutId;
	    let subscriptionId;
	    let done = false;
	    const confirmationPromise = new Promise((resolve, reject) => {
	      try {
	        subscriptionId = this.onSignature(rawSignature, (result, context) => {
	          subscriptionId = undefined;
	          const response = {
	            context,
	            value: result
	          };
	          done = true;
	          resolve({
	            __type: exports.TransactionStatus.PROCESSED,
	            response
	          });
	        }, subscriptionCommitment);
	      } catch (err) {
	        reject(err);
	      }
	    });
	    const expiryPromise = new Promise(resolve => {
	      if (typeof strategy === 'string') {
	        let timeoutMs = this._confirmTransactionInitialTimeout || 60 * 1000;

	        switch (subscriptionCommitment) {
	          case 'processed':
	          case 'recent':
	          case 'single':
	          case 'confirmed':
	          case 'singleGossip':
	            {
	              timeoutMs = this._confirmTransactionInitialTimeout || 30 * 1000;
	              break;
	            }
	        }

	        timeoutId = setTimeout(() => resolve({
	          __type: exports.TransactionStatus.TIMED_OUT,
	          timeoutMs
	        }), timeoutMs);
	      } else {
	        let config = strategy;

	        const checkBlockHeight = async () => {
	          try {
	            const blockHeight = await this.getBlockHeight(commitment);
	            return blockHeight;
	          } catch (_e) {
	            return -1;
	          }
	        };

	        (async () => {
	          let currentBlockHeight = await checkBlockHeight();
	          if (done) return;

	          while (currentBlockHeight <= config.lastValidBlockHeight) {
	            await sleep(1000);
	            if (done) return;
	            currentBlockHeight = await checkBlockHeight();
	            if (done) return;
	          }

	          resolve({
	            __type: exports.TransactionStatus.BLOCKHEIGHT_EXCEEDED
	          });
	        })();
	      }
	    });
	    let result;

	    try {
	      const outcome = await Promise.race([confirmationPromise, expiryPromise]);

	      switch (outcome.__type) {
	        case exports.TransactionStatus.BLOCKHEIGHT_EXCEEDED:
	          throw new TransactionExpiredBlockheightExceededError(rawSignature);

	        case exports.TransactionStatus.PROCESSED:
	          result = outcome.response;
	          break;

	        case exports.TransactionStatus.TIMED_OUT:
	          throw new TransactionExpiredTimeoutError(rawSignature, outcome.timeoutMs / 1000);
	      }
	    } finally {
	      clearTimeout(timeoutId);

	      if (subscriptionId) {
	        this.removeSignatureListener(subscriptionId);
	      }
	    }

	    return result;
	  }
	  /**
	   * Return the list of nodes that are currently participating in the cluster
	   */


	  async getClusterNodes() {
	    const unsafeRes = await this._rpcRequest('getClusterNodes', []);
	    const res = create(unsafeRes, jsonRpcResult(array(ContactInfoResult)));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get cluster nodes');
	    }

	    return res.result;
	  }
	  /**
	   * Return the list of nodes that are currently participating in the cluster
	   */


	  async getVoteAccounts(commitment) {
	    const args = this._buildArgs([], commitment);

	    const unsafeRes = await this._rpcRequest('getVoteAccounts', args);
	    const res = create(unsafeRes, GetVoteAccounts);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get vote accounts');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the current slot that the node is processing
	   */


	  async getSlot(commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getSlot', args);
	    const res = create(unsafeRes, jsonRpcResult(number()));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get slot');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the current slot leader of the cluster
	   */


	  async getSlotLeader(commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getSlotLeader', args);
	    const res = create(unsafeRes, jsonRpcResult(string()));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get slot leader');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch `limit` number of slot leaders starting from `startSlot`
	   *
	   * @param startSlot fetch slot leaders starting from this slot
	   * @param limit number of slot leaders to return
	   */


	  async getSlotLeaders(startSlot, limit) {
	    const args = [startSlot, limit];
	    const unsafeRes = await this._rpcRequest('getSlotLeaders', args);
	    const res = create(unsafeRes, jsonRpcResult(array(PublicKeyFromString)));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get slot leaders');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the current status of a signature
	   */


	  async getSignatureStatus(signature, config) {
	    const {
	      context,
	      value: values
	    } = await this.getSignatureStatuses([signature], config);
	    assert$1(values.length === 1);
	    const value = values[0];
	    return {
	      context,
	      value
	    };
	  }
	  /**
	   * Fetch the current statuses of a batch of signatures
	   */


	  async getSignatureStatuses(signatures, config) {
	    const params = [signatures];

	    if (config) {
	      params.push(config);
	    }

	    const unsafeRes = await this._rpcRequest('getSignatureStatuses', params);
	    const res = create(unsafeRes, GetSignatureStatusesRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get signature status');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the current transaction count of the cluster
	   */


	  async getTransactionCount(commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getTransactionCount', args);
	    const res = create(unsafeRes, jsonRpcResult(number()));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get transaction count');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the current total currency supply of the cluster in lamports
	   *
	   * @deprecated Deprecated since v1.2.8. Please use {@link getSupply} instead.
	   */


	  async getTotalSupply(commitment) {
	    const result = await this.getSupply({
	      commitment,
	      excludeNonCirculatingAccountsList: true
	    });
	    return result.value.total;
	  }
	  /**
	   * Fetch the cluster InflationGovernor parameters
	   */


	  async getInflationGovernor(commitment) {
	    const args = this._buildArgs([], commitment);

	    const unsafeRes = await this._rpcRequest('getInflationGovernor', args);
	    const res = create(unsafeRes, GetInflationGovernorRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get inflation');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the inflation reward for a list of addresses for an epoch
	   */


	  async getInflationReward(addresses, epoch, commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([addresses.map(pubkey => pubkey.toBase58())], commitment, undefined
	    /* encoding */
	    , { ...config,
	      epoch: epoch != null ? epoch : config === null || config === void 0 ? void 0 : config.epoch
	    });

	    const unsafeRes = await this._rpcRequest('getInflationReward', args);
	    const res = create(unsafeRes, GetInflationRewardResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get inflation reward');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the Epoch Info parameters
	   */


	  async getEpochInfo(commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getEpochInfo', args);
	    const res = create(unsafeRes, GetEpochInfoRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get epoch info');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the Epoch Schedule parameters
	   */


	  async getEpochSchedule() {
	    const unsafeRes = await this._rpcRequest('getEpochSchedule', []);
	    const res = create(unsafeRes, GetEpochScheduleRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get epoch schedule');
	    }

	    const epochSchedule = res.result;
	    return new EpochSchedule(epochSchedule.slotsPerEpoch, epochSchedule.leaderScheduleSlotOffset, epochSchedule.warmup, epochSchedule.firstNormalEpoch, epochSchedule.firstNormalSlot);
	  }
	  /**
	   * Fetch the leader schedule for the current epoch
	   * @return {Promise<RpcResponseAndContext<LeaderSchedule>>}
	   */


	  async getLeaderSchedule() {
	    const unsafeRes = await this._rpcRequest('getLeaderSchedule', []);
	    const res = create(unsafeRes, GetLeaderScheduleRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get leader schedule');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the minimum balance needed to exempt an account of `dataLength`
	   * size from rent
	   */


	  async getMinimumBalanceForRentExemption(dataLength, commitment) {
	    const args = this._buildArgs([dataLength], commitment);

	    const unsafeRes = await this._rpcRequest('getMinimumBalanceForRentExemption', args);
	    const res = create(unsafeRes, GetMinimumBalanceForRentExemptionRpcResult);

	    if ('error' in res) {
	      console.warn('Unable to fetch minimum balance for rent exemption');
	      return 0;
	    }

	    return res.result;
	  }
	  /**
	   * Fetch a recent blockhash from the cluster, return with context
	   * @return {Promise<RpcResponseAndContext<{blockhash: Blockhash, feeCalculator: FeeCalculator}>>}
	   *
	   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getLatestBlockhash} instead.
	   */


	  async getRecentBlockhashAndContext(commitment) {
	    const args = this._buildArgs([], commitment);

	    const unsafeRes = await this._rpcRequest('getRecentBlockhash', args);
	    const res = create(unsafeRes, GetRecentBlockhashAndContextRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get recent blockhash');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch recent performance samples
	   * @return {Promise<Array<PerfSample>>}
	   */


	  async getRecentPerformanceSamples(limit) {
	    const unsafeRes = await this._rpcRequest('getRecentPerformanceSamples', limit ? [limit] : []);
	    const res = create(unsafeRes, GetRecentPerformanceSamplesRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get recent performance samples');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the fee calculator for a recent blockhash from the cluster, return with context
	   *
	   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getFeeForMessage} instead.
	   */


	  async getFeeCalculatorForBlockhash(blockhash, commitment) {
	    const args = this._buildArgs([blockhash], commitment);

	    const unsafeRes = await this._rpcRequest('getFeeCalculatorForBlockhash', args);
	    const res = create(unsafeRes, GetFeeCalculatorRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get fee calculator');
	    }

	    const {
	      context,
	      value
	    } = res.result;
	    return {
	      context,
	      value: value !== null ? value.feeCalculator : null
	    };
	  }
	  /**
	   * Fetch the fee for a message from the cluster, return with context
	   */


	  async getFeeForMessage(message, commitment) {
	    const wireMessage = message.serialize().toString('base64');

	    const args = this._buildArgs([wireMessage], commitment);

	    const unsafeRes = await this._rpcRequest('getFeeForMessage', args);
	    const res = create(unsafeRes, jsonRpcResultAndContext(nullable(number())));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get slot');
	    }

	    if (res.result === null) {
	      throw new Error('invalid blockhash');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch a recent blockhash from the cluster
	   * @return {Promise<{blockhash: Blockhash, feeCalculator: FeeCalculator}>}
	   *
	   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getLatestBlockhash} instead.
	   */


	  async getRecentBlockhash(commitment) {
	    try {
	      const res = await this.getRecentBlockhashAndContext(commitment);
	      return res.value;
	    } catch (e) {
	      throw new Error('failed to get recent blockhash: ' + e);
	    }
	  }
	  /**
	   * Fetch the latest blockhash from the cluster
	   * @return {Promise<BlockhashWithExpiryBlockHeight>}
	   */


	  async getLatestBlockhash(commitmentOrConfig) {
	    try {
	      const res = await this.getLatestBlockhashAndContext(commitmentOrConfig);
	      return res.value;
	    } catch (e) {
	      throw new Error('failed to get recent blockhash: ' + e);
	    }
	  }
	  /**
	   * Fetch the latest blockhash from the cluster
	   * @return {Promise<BlockhashWithExpiryBlockHeight>}
	   */


	  async getLatestBlockhashAndContext(commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getLatestBlockhash', args);
	    const res = create(unsafeRes, GetLatestBlockhashRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get latest blockhash');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the node version
	   */


	  async getVersion() {
	    const unsafeRes = await this._rpcRequest('getVersion', []);
	    const res = create(unsafeRes, jsonRpcResult(VersionResult));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get version');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch the genesis hash
	   */


	  async getGenesisHash() {
	    const unsafeRes = await this._rpcRequest('getGenesisHash', []);
	    const res = create(unsafeRes, jsonRpcResult(string()));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get genesis hash');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch a processed block from the cluster.
	   *
	   * @deprecated Instead, call `getBlock` using a `GetVersionedBlockConfig` by
	   * setting the `maxSupportedTransactionVersion` property.
	   */


	  /**
	   * Fetch a processed block from the cluster.
	   */
	  // eslint-disable-next-line no-dupe-class-members
	  async getBlock(slot, rawConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(rawConfig);

	    const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getBlock', args);
	    const res = create(unsafeRes, GetBlockRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get confirmed block');
	    }

	    const result = res.result;
	    if (!result) return result;
	    return { ...result,
	      transactions: result.transactions.map(({
	        transaction,
	        meta,
	        version
	      }) => ({
	        meta,
	        transaction: { ...transaction,
	          message: versionedMessageFromResponse(version, transaction.message)
	        },
	        version
	      }))
	    };
	  }
	  /*
	   * Returns the current block height of the node
	   */


	  async getBlockHeight(commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgs([], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getBlockHeight', args);
	    const res = create(unsafeRes, jsonRpcResult(number()));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get block height information');
	    }

	    return res.result;
	  }
	  /*
	   * Returns recent block production information from the current or previous epoch
	   */


	  async getBlockProduction(configOrCommitment) {
	    let extra;
	    let commitment;

	    if (typeof configOrCommitment === 'string') {
	      commitment = configOrCommitment;
	    } else if (configOrCommitment) {
	      const {
	        commitment: c,
	        ...rest
	      } = configOrCommitment;
	      commitment = c;
	      extra = rest;
	    }

	    const args = this._buildArgs([], commitment, 'base64', extra);

	    const unsafeRes = await this._rpcRequest('getBlockProduction', args);
	    const res = create(unsafeRes, BlockProductionResponseStruct);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get block production information');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch a confirmed or finalized transaction from the cluster.
	   *
	   * @deprecated Instead, call `getTransaction` using a
	   * `GetVersionedTransactionConfig` by setting the
	   * `maxSupportedTransactionVersion` property.
	   */


	  /**
	   * Fetch a confirmed or finalized transaction from the cluster.
	   */
	  // eslint-disable-next-line no-dupe-class-members
	  async getTransaction(signature, rawConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(rawConfig);

	    const args = this._buildArgsAtLeastConfirmed([signature], commitment, undefined
	    /* encoding */
	    , config);

	    const unsafeRes = await this._rpcRequest('getTransaction', args);
	    const res = create(unsafeRes, GetTransactionRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get transaction');
	    }

	    const result = res.result;
	    if (!result) return result;
	    return { ...result,
	      transaction: { ...result.transaction,
	        message: versionedMessageFromResponse(result.version, result.transaction.message)
	      }
	    };
	  }
	  /**
	   * Fetch parsed transaction details for a confirmed or finalized transaction
	   */


	  async getParsedTransaction(signature, commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);

	    const args = this._buildArgsAtLeastConfirmed([signature], commitment, 'jsonParsed', config);

	    const unsafeRes = await this._rpcRequest('getTransaction', args);
	    const res = create(unsafeRes, GetParsedTransactionRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get transaction');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch parsed transaction details for a batch of confirmed transactions
	   */


	  async getParsedTransactions(signatures, commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);
	    const batch = signatures.map(signature => {
	      const args = this._buildArgsAtLeastConfirmed([signature], commitment, 'jsonParsed', config);

	      return {
	        methodName: 'getTransaction',
	        args
	      };
	    });
	    const unsafeRes = await this._rpcBatchRequest(batch);
	    const res = unsafeRes.map(unsafeRes => {
	      const res = create(unsafeRes, GetParsedTransactionRpcResult);

	      if ('error' in res) {
	        throw new SolanaJSONRPCError(res.error, 'failed to get transactions');
	      }

	      return res.result;
	    });
	    return res;
	  }
	  /**
	   * Fetch transaction details for a batch of confirmed transactions.
	   * Similar to {@link getParsedTransactions} but returns a {@link TransactionResponse}.
	   *
	   * @deprecated Instead, call `getTransactions` using a
	   * `GetVersionedTransactionConfig` by setting the
	   * `maxSupportedTransactionVersion` property.
	   */


	  /**
	   * Fetch transaction details for a batch of confirmed transactions.
	   * Similar to {@link getParsedTransactions} but returns a {@link
	   * VersionedTransactionResponse}.
	   */
	  // eslint-disable-next-line no-dupe-class-members
	  async getTransactions(signatures, commitmentOrConfig) {
	    const {
	      commitment,
	      config
	    } = extractCommitmentFromConfig(commitmentOrConfig);
	    const batch = signatures.map(signature => {
	      const args = this._buildArgsAtLeastConfirmed([signature], commitment, undefined
	      /* encoding */
	      , config);

	      return {
	        methodName: 'getTransaction',
	        args
	      };
	    });
	    const unsafeRes = await this._rpcBatchRequest(batch);
	    const res = unsafeRes.map(unsafeRes => {
	      const res = create(unsafeRes, GetTransactionRpcResult);

	      if ('error' in res) {
	        throw new SolanaJSONRPCError(res.error, 'failed to get transactions');
	      }

	      const result = res.result;
	      if (!result) return result;
	      return { ...result,
	        transaction: { ...result.transaction,
	          message: versionedMessageFromResponse(result.version, result.transaction.message)
	        }
	      };
	    });
	    return res;
	  }
	  /**
	   * Fetch a list of Transactions and transaction statuses from the cluster
	   * for a confirmed block.
	   *
	   * @deprecated Deprecated since v1.13.0. Please use {@link getBlock} instead.
	   */


	  async getConfirmedBlock(slot, commitment) {
	    const args = this._buildArgsAtLeastConfirmed([slot], commitment);

	    const unsafeRes = await this._rpcRequest('getConfirmedBlock', args);
	    const res = create(unsafeRes, GetConfirmedBlockRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get confirmed block');
	    }

	    const result = res.result;

	    if (!result) {
	      throw new Error('Confirmed block ' + slot + ' not found');
	    }

	    const block = { ...result,
	      transactions: result.transactions.map(({
	        transaction,
	        meta
	      }) => {
	        const message = new Message(transaction.message);
	        return {
	          meta,
	          transaction: { ...transaction,
	            message
	          }
	        };
	      })
	    };
	    return { ...block,
	      transactions: block.transactions.map(({
	        transaction,
	        meta
	      }) => {
	        return {
	          meta,
	          transaction: Transaction.populate(transaction.message, transaction.signatures)
	        };
	      })
	    };
	  }
	  /**
	   * Fetch confirmed blocks between two slots
	   */


	  async getBlocks(startSlot, endSlot, commitment) {
	    const args = this._buildArgsAtLeastConfirmed(endSlot !== undefined ? [startSlot, endSlot] : [startSlot], commitment);

	    const unsafeRes = await this._rpcRequest('getBlocks', args);
	    const res = create(unsafeRes, jsonRpcResult(array(number())));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get blocks');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch a list of Signatures from the cluster for a block, excluding rewards
	   */


	  async getBlockSignatures(slot, commitment) {
	    const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined, {
	      transactionDetails: 'signatures',
	      rewards: false
	    });

	    const unsafeRes = await this._rpcRequest('getBlock', args);
	    const res = create(unsafeRes, GetBlockSignaturesRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get block');
	    }

	    const result = res.result;

	    if (!result) {
	      throw new Error('Block ' + slot + ' not found');
	    }

	    return result;
	  }
	  /**
	   * Fetch a list of Signatures from the cluster for a confirmed block, excluding rewards
	   *
	   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getBlockSignatures} instead.
	   */


	  async getConfirmedBlockSignatures(slot, commitment) {
	    const args = this._buildArgsAtLeastConfirmed([slot], commitment, undefined, {
	      transactionDetails: 'signatures',
	      rewards: false
	    });

	    const unsafeRes = await this._rpcRequest('getConfirmedBlock', args);
	    const res = create(unsafeRes, GetBlockSignaturesRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get confirmed block');
	    }

	    const result = res.result;

	    if (!result) {
	      throw new Error('Confirmed block ' + slot + ' not found');
	    }

	    return result;
	  }
	  /**
	   * Fetch a transaction details for a confirmed transaction
	   *
	   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getTransaction} instead.
	   */


	  async getConfirmedTransaction(signature, commitment) {
	    const args = this._buildArgsAtLeastConfirmed([signature], commitment);

	    const unsafeRes = await this._rpcRequest('getConfirmedTransaction', args);
	    const res = create(unsafeRes, GetTransactionRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get transaction');
	    }

	    const result = res.result;
	    if (!result) return result;
	    const message = new Message(result.transaction.message);
	    const signatures = result.transaction.signatures;
	    return { ...result,
	      transaction: Transaction.populate(message, signatures)
	    };
	  }
	  /**
	   * Fetch parsed transaction details for a confirmed transaction
	   *
	   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getParsedTransaction} instead.
	   */


	  async getParsedConfirmedTransaction(signature, commitment) {
	    const args = this._buildArgsAtLeastConfirmed([signature], commitment, 'jsonParsed');

	    const unsafeRes = await this._rpcRequest('getConfirmedTransaction', args);
	    const res = create(unsafeRes, GetParsedTransactionRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get confirmed transaction');
	    }

	    return res.result;
	  }
	  /**
	   * Fetch parsed transaction details for a batch of confirmed transactions
	   *
	   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getParsedTransactions} instead.
	   */


	  async getParsedConfirmedTransactions(signatures, commitment) {
	    const batch = signatures.map(signature => {
	      const args = this._buildArgsAtLeastConfirmed([signature], commitment, 'jsonParsed');

	      return {
	        methodName: 'getConfirmedTransaction',
	        args
	      };
	    });
	    const unsafeRes = await this._rpcBatchRequest(batch);
	    const res = unsafeRes.map(unsafeRes => {
	      const res = create(unsafeRes, GetParsedTransactionRpcResult);

	      if ('error' in res) {
	        throw new SolanaJSONRPCError(res.error, 'failed to get confirmed transactions');
	      }

	      return res.result;
	    });
	    return res;
	  }
	  /**
	   * Fetch a list of all the confirmed signatures for transactions involving an address
	   * within a specified slot range. Max range allowed is 10,000 slots.
	   *
	   * @deprecated Deprecated since v1.3. Please use {@link getConfirmedSignaturesForAddress2} instead.
	   *
	   * @param address queried address
	   * @param startSlot start slot, inclusive
	   * @param endSlot end slot, inclusive
	   */


	  async getConfirmedSignaturesForAddress(address, startSlot, endSlot) {
	    let options = {};
	    let firstAvailableBlock = await this.getFirstAvailableBlock();

	    while (!('until' in options)) {
	      startSlot--;

	      if (startSlot <= 0 || startSlot < firstAvailableBlock) {
	        break;
	      }

	      try {
	        const block = await this.getConfirmedBlockSignatures(startSlot, 'finalized');

	        if (block.signatures.length > 0) {
	          options.until = block.signatures[block.signatures.length - 1].toString();
	        }
	      } catch (err) {
	        if (err instanceof Error && err.message.includes('skipped')) {
	          continue;
	        } else {
	          throw err;
	        }
	      }
	    }

	    let highestConfirmedRoot = await this.getSlot('finalized');

	    while (!('before' in options)) {
	      endSlot++;

	      if (endSlot > highestConfirmedRoot) {
	        break;
	      }

	      try {
	        const block = await this.getConfirmedBlockSignatures(endSlot);

	        if (block.signatures.length > 0) {
	          options.before = block.signatures[block.signatures.length - 1].toString();
	        }
	      } catch (err) {
	        if (err instanceof Error && err.message.includes('skipped')) {
	          continue;
	        } else {
	          throw err;
	        }
	      }
	    }

	    const confirmedSignatureInfo = await this.getConfirmedSignaturesForAddress2(address, options);
	    return confirmedSignatureInfo.map(info => info.signature);
	  }
	  /**
	   * Returns confirmed signatures for transactions involving an
	   * address backwards in time from the provided signature or most recent confirmed block
	   *
	   *
	   * @param address queried address
	   * @param options
	   */


	  async getConfirmedSignaturesForAddress2(address, options, commitment) {
	    const args = this._buildArgsAtLeastConfirmed([address.toBase58()], commitment, undefined, options);

	    const unsafeRes = await this._rpcRequest('getConfirmedSignaturesForAddress2', args);
	    const res = create(unsafeRes, GetConfirmedSignaturesForAddress2RpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get confirmed signatures for address');
	    }

	    return res.result;
	  }
	  /**
	   * Returns confirmed signatures for transactions involving an
	   * address backwards in time from the provided signature or most recent confirmed block
	   *
	   *
	   * @param address queried address
	   * @param options
	   */


	  async getSignaturesForAddress(address, options, commitment) {
	    const args = this._buildArgsAtLeastConfirmed([address.toBase58()], commitment, undefined, options);

	    const unsafeRes = await this._rpcRequest('getSignaturesForAddress', args);
	    const res = create(unsafeRes, GetSignaturesForAddressRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, 'failed to get signatures for address');
	    }

	    return res.result;
	  }

	  async getAddressLookupTable(accountKey, config) {
	    const {
	      context,
	      value: accountInfo
	    } = await this.getAccountInfoAndContext(accountKey, config);
	    let value = null;

	    if (accountInfo !== null) {
	      value = new AddressLookupTableAccount({
	        key: accountKey,
	        state: AddressLookupTableAccount.deserialize(accountInfo.data)
	      });
	    }

	    return {
	      context,
	      value
	    };
	  }
	  /**
	   * Fetch the contents of a Nonce account from the cluster, return with context
	   */


	  async getNonceAndContext(nonceAccount, commitment) {
	    const {
	      context,
	      value: accountInfo
	    } = await this.getAccountInfoAndContext(nonceAccount, commitment);
	    let value = null;

	    if (accountInfo !== null) {
	      value = NonceAccount.fromAccountData(accountInfo.data);
	    }

	    return {
	      context,
	      value
	    };
	  }
	  /**
	   * Fetch the contents of a Nonce account from the cluster
	   */


	  async getNonce(nonceAccount, commitment) {
	    return await this.getNonceAndContext(nonceAccount, commitment).then(x => x.value).catch(e => {
	      throw new Error('failed to get nonce for account ' + nonceAccount.toBase58() + ': ' + e);
	    });
	  }
	  /**
	   * Request an allocation of lamports to the specified address
	   *
	   * ```typescript
	   * import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
	   *
	   * (async () => {
	   *   const connection = new Connection("https://api.testnet.solana.com", "confirmed");
	   *   const myAddress = new PublicKey("2nr1bHFT86W9tGnyvmYW4vcHKsQB3sVQfnddasz4kExM");
	   *   const signature = await connection.requestAirdrop(myAddress, LAMPORTS_PER_SOL);
	   *   await connection.confirmTransaction(signature);
	   * })();
	   * ```
	   */


	  async requestAirdrop(to, lamports) {
	    const unsafeRes = await this._rpcRequest('requestAirdrop', [to.toBase58(), lamports]);
	    const res = create(unsafeRes, RequestAirdropRpcResult);

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `airdrop to ${to.toBase58()} failed`);
	    }

	    return res.result;
	  }
	  /**
	   * @internal
	   */


	  async _blockhashWithExpiryBlockHeight(disableCache) {
	    if (!disableCache) {
	      // Wait for polling to finish
	      while (this._pollingBlockhash) {
	        await sleep(100);
	      }

	      const timeSinceFetch = Date.now() - this._blockhashInfo.lastFetch;

	      const expired = timeSinceFetch >= BLOCKHASH_CACHE_TIMEOUT_MS;

	      if (this._blockhashInfo.latestBlockhash !== null && !expired) {
	        return this._blockhashInfo.latestBlockhash;
	      }
	    }

	    return await this._pollNewBlockhash();
	  }
	  /**
	   * @internal
	   */


	  async _pollNewBlockhash() {
	    this._pollingBlockhash = true;

	    try {
	      const startTime = Date.now();
	      const cachedLatestBlockhash = this._blockhashInfo.latestBlockhash;
	      const cachedBlockhash = cachedLatestBlockhash ? cachedLatestBlockhash.blockhash : null;

	      for (let i = 0; i < 50; i++) {
	        const latestBlockhash = await this.getLatestBlockhash('finalized');

	        if (cachedBlockhash !== latestBlockhash.blockhash) {
	          this._blockhashInfo = {
	            latestBlockhash,
	            lastFetch: Date.now(),
	            transactionSignatures: [],
	            simulatedSignatures: []
	          };
	          return latestBlockhash;
	        } // Sleep for approximately half a slot


	        await sleep(MS_PER_SLOT / 2);
	      }

	      throw new Error(`Unable to obtain a new blockhash after ${Date.now() - startTime}ms`);
	    } finally {
	      this._pollingBlockhash = false;
	    }
	  }
	  /**
	   * get the stake minimum delegation
	   */


	  async getStakeMinimumDelegation(config) {
	    const {
	      commitment,
	      config: configArg
	    } = extractCommitmentFromConfig(config);

	    const args = this._buildArgs([], commitment, 'base64', configArg);

	    const unsafeRes = await this._rpcRequest('getStakeMinimumDelegation', args);
	    const res = create(unsafeRes, jsonRpcResultAndContext(number()));

	    if ('error' in res) {
	      throw new SolanaJSONRPCError(res.error, `failed to get stake minimum delegation`);
	    }

	    return res.result;
	  }
	  /**
	   * Simulate a transaction
	   *
	   * @deprecated Instead, call {@link simulateTransaction} with {@link
	   * VersionedTransaction} and {@link SimulateTransactionConfig} parameters
	   */


	  /**
	   * Simulate a transaction
	   */
	  // eslint-disable-next-line no-dupe-class-members
	  async simulateTransaction(transactionOrMessage, configOrSigners, includeAccounts) {
	    if ('message' in transactionOrMessage) {
	      const versionedTx = transactionOrMessage;
	      const wireTransaction = versionedTx.serialize();
	      const encodedTransaction = buffer.Buffer.from(wireTransaction).toString('base64');

	      if (Array.isArray(configOrSigners) || includeAccounts !== undefined) {
	        throw new Error('Invalid arguments');
	      }

	      const config = configOrSigners || {};
	      config.encoding = 'base64';

	      if (!('commitment' in config)) {
	        config.commitment = this.commitment;
	      }

	      const args = [encodedTransaction, config];
	      const unsafeRes = await this._rpcRequest('simulateTransaction', args);
	      const res = create(unsafeRes, SimulatedTransactionResponseStruct);

	      if ('error' in res) {
	        throw new Error('failed to simulate transaction: ' + res.error.message);
	      }

	      return res.result;
	    }

	    let transaction;

	    if (transactionOrMessage instanceof Transaction) {
	      let originalTx = transactionOrMessage;
	      transaction = new Transaction();
	      transaction.feePayer = originalTx.feePayer;
	      transaction.instructions = transactionOrMessage.instructions;
	      transaction.nonceInfo = originalTx.nonceInfo;
	      transaction.signatures = originalTx.signatures;
	    } else {
	      transaction = Transaction.populate(transactionOrMessage); // HACK: this function relies on mutating the populated transaction

	      transaction._message = transaction._json = undefined;
	    }

	    if (configOrSigners !== undefined && !Array.isArray(configOrSigners)) {
	      throw new Error('Invalid arguments');
	    }

	    const signers = configOrSigners;

	    if (transaction.nonceInfo && signers) {
	      transaction.sign(...signers);
	    } else {
	      let disableCache = this._disableBlockhashCaching;

	      for (;;) {
	        const latestBlockhash = await this._blockhashWithExpiryBlockHeight(disableCache);
	        transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
	        transaction.recentBlockhash = latestBlockhash.blockhash;
	        if (!signers) break;
	        transaction.sign(...signers);

	        if (!transaction.signature) {
	          throw new Error('!signature'); // should never happen
	        }

	        const signature = transaction.signature.toString('base64');

	        if (!this._blockhashInfo.simulatedSignatures.includes(signature) && !this._blockhashInfo.transactionSignatures.includes(signature)) {
	          // The signature of this transaction has not been seen before with the
	          // current recentBlockhash, all done. Let's break
	          this._blockhashInfo.simulatedSignatures.push(signature);

	          break;
	        } else {
	          // This transaction would be treated as duplicate (its derived signature
	          // matched to one of already recorded signatures).
	          // So, we must fetch a new blockhash for a different signature by disabling
	          // our cache not to wait for the cache expiration (BLOCKHASH_CACHE_TIMEOUT_MS).
	          disableCache = true;
	        }
	      }
	    }

	    const message = transaction._compile();

	    const signData = message.serialize();

	    const wireTransaction = transaction._serialize(signData);

	    const encodedTransaction = wireTransaction.toString('base64');
	    const config = {
	      encoding: 'base64',
	      commitment: this.commitment
	    };

	    if (includeAccounts) {
	      const addresses = (Array.isArray(includeAccounts) ? includeAccounts : message.nonProgramIds()).map(key => key.toBase58());
	      config['accounts'] = {
	        encoding: 'base64',
	        addresses
	      };
	    }

	    if (signers) {
	      config.sigVerify = true;
	    }

	    const args = [encodedTransaction, config];
	    const unsafeRes = await this._rpcRequest('simulateTransaction', args);
	    const res = create(unsafeRes, SimulatedTransactionResponseStruct);

	    if ('error' in res) {
	      let logs;

	      if ('data' in res.error) {
	        logs = res.error.data.logs;

	        if (logs && Array.isArray(logs)) {
	          const traceIndent = '\n    ';
	          const logTrace = traceIndent + logs.join(traceIndent);
	          console.error(res.error.message, logTrace);
	        }
	      }

	      throw new SendTransactionError('failed to simulate transaction: ' + res.error.message, logs);
	    }

	    return res.result;
	  }
	  /**
	   * Sign and send a transaction
	   *
	   * @deprecated Instead, call {@link sendTransaction} with a {@link
	   * VersionedTransaction}
	   */


	  /**
	   * Sign and send a transaction
	   */
	  // eslint-disable-next-line no-dupe-class-members
	  async sendTransaction(transaction, signersOrOptions, options) {
	    if ('version' in transaction) {
	      if (signersOrOptions && Array.isArray(signersOrOptions)) {
	        throw new Error('Invalid arguments');
	      }

	      const wireTransaction = transaction.serialize();
	      return await this.sendRawTransaction(wireTransaction, options);
	    }

	    if (signersOrOptions === undefined || !Array.isArray(signersOrOptions)) {
	      throw new Error('Invalid arguments');
	    }

	    const signers = signersOrOptions;

	    if (transaction.nonceInfo) {
	      transaction.sign(...signers);
	    } else {
	      let disableCache = this._disableBlockhashCaching;

	      for (;;) {
	        const latestBlockhash = await this._blockhashWithExpiryBlockHeight(disableCache);
	        transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
	        transaction.recentBlockhash = latestBlockhash.blockhash;
	        transaction.sign(...signers);

	        if (!transaction.signature) {
	          throw new Error('!signature'); // should never happen
	        }

	        const signature = transaction.signature.toString('base64');

	        if (!this._blockhashInfo.transactionSignatures.includes(signature)) {
	          // The signature of this transaction has not been seen before with the
	          // current recentBlockhash, all done. Let's break
	          this._blockhashInfo.transactionSignatures.push(signature);

	          break;
	        } else {
	          // This transaction would be treated as duplicate (its derived signature
	          // matched to one of already recorded signatures).
	          // So, we must fetch a new blockhash for a different signature by disabling
	          // our cache not to wait for the cache expiration (BLOCKHASH_CACHE_TIMEOUT_MS).
	          disableCache = true;
	        }
	      }
	    }

	    const wireTransaction = transaction.serialize();
	    return await this.sendRawTransaction(wireTransaction, options);
	  }
	  /**
	   * Send a transaction that has already been signed and serialized into the
	   * wire format
	   */


	  async sendRawTransaction(rawTransaction, options) {
	    const encodedTransaction = toBuffer(rawTransaction).toString('base64');
	    const result = await this.sendEncodedTransaction(encodedTransaction, options);
	    return result;
	  }
	  /**
	   * Send a transaction that has already been signed, serialized into the
	   * wire format, and encoded as a base64 string
	   */


	  async sendEncodedTransaction(encodedTransaction, options) {
	    const config = {
	      encoding: 'base64'
	    };
	    const skipPreflight = options && options.skipPreflight;
	    const preflightCommitment = options && options.preflightCommitment || this.commitment;

	    if (options && options.maxRetries != null) {
	      config.maxRetries = options.maxRetries;
	    }

	    if (options && options.minContextSlot != null) {
	      config.minContextSlot = options.minContextSlot;
	    }

	    if (skipPreflight) {
	      config.skipPreflight = skipPreflight;
	    }

	    if (preflightCommitment) {
	      config.preflightCommitment = preflightCommitment;
	    }

	    const args = [encodedTransaction, config];
	    const unsafeRes = await this._rpcRequest('sendTransaction', args);
	    const res = create(unsafeRes, SendTransactionRpcResult);

	    if ('error' in res) {
	      let logs;

	      if ('data' in res.error) {
	        logs = res.error.data.logs;
	      }

	      throw new SendTransactionError('failed to send transaction: ' + res.error.message, logs);
	    }

	    return res.result;
	  }
	  /**
	   * @internal
	   */


	  _wsOnOpen() {
	    this._rpcWebSocketConnected = true;
	    this._rpcWebSocketHeartbeat = setInterval(() => {
	      // Ping server every 5s to prevent idle timeouts
	      this._rpcWebSocket.notify('ping').catch(() => {});
	    }, 5000);

	    this._updateSubscriptions();
	  }
	  /**
	   * @internal
	   */


	  _wsOnError(err) {
	    this._rpcWebSocketConnected = false;
	    console.error('ws error:', err.message);
	  }
	  /**
	   * @internal
	   */


	  _wsOnClose(code) {
	    this._rpcWebSocketConnected = false;
	    this._rpcWebSocketGeneration++;

	    if (this._rpcWebSocketIdleTimeout) {
	      clearTimeout(this._rpcWebSocketIdleTimeout);
	      this._rpcWebSocketIdleTimeout = null;
	    }

	    if (this._rpcWebSocketHeartbeat) {
	      clearInterval(this._rpcWebSocketHeartbeat);
	      this._rpcWebSocketHeartbeat = null;
	    }

	    if (code === 1000) {
	      // explicit close, check if any subscriptions have been made since close
	      this._updateSubscriptions();

	      return;
	    } // implicit close, prepare subscriptions for auto-reconnect


	    this._subscriptionCallbacksByServerSubscriptionId = {};
	    Object.entries(this._subscriptionsByHash).forEach(([hash, subscription]) => {
	      this._subscriptionsByHash[hash] = { ...subscription,
	        state: 'pending'
	      };
	    });
	  }
	  /**
	   * @internal
	   */


	  async _updateSubscriptions() {
	    if (Object.keys(this._subscriptionsByHash).length === 0) {
	      if (this._rpcWebSocketConnected) {
	        this._rpcWebSocketConnected = false;
	        this._rpcWebSocketIdleTimeout = setTimeout(() => {
	          this._rpcWebSocketIdleTimeout = null;

	          try {
	            this._rpcWebSocket.close();
	          } catch (err) {
	            // swallow error if socket has already been closed.
	            if (err instanceof Error) {
	              console.log(`Error when closing socket connection: ${err.message}`);
	            }
	          }
	        }, 500);
	      }

	      return;
	    }

	    if (this._rpcWebSocketIdleTimeout !== null) {
	      clearTimeout(this._rpcWebSocketIdleTimeout);
	      this._rpcWebSocketIdleTimeout = null;
	      this._rpcWebSocketConnected = true;
	    }

	    if (!this._rpcWebSocketConnected) {
	      this._rpcWebSocket.connect();

	      return;
	    }

	    const activeWebSocketGeneration = this._rpcWebSocketGeneration;

	    const isCurrentConnectionStillActive = () => {
	      return activeWebSocketGeneration === this._rpcWebSocketGeneration;
	    };

	    await Promise.all( // Don't be tempted to change this to `Object.entries`. We call
	    // `_updateSubscriptions` recursively when processing the state,
	    // so it's important that we look up the *current* version of
	    // each subscription, every time we process a hash.
	    Object.keys(this._subscriptionsByHash).map(async hash => {
	      const subscription = this._subscriptionsByHash[hash];

	      if (subscription === undefined) {
	        // This entry has since been deleted. Skip.
	        return;
	      }

	      switch (subscription.state) {
	        case 'pending':
	        case 'unsubscribed':
	          if (subscription.callbacks.size === 0) {
	            /**
	             * You can end up here when:
	             *
	             * - a subscription has recently unsubscribed
	             *   without having new callbacks added to it
	             *   while the unsubscribe was in flight, or
	             * - when a pending subscription has its
	             *   listeners removed before a request was
	             *   sent to the server.
	             *
	             * Being that nobody is interested in this
	             * subscription any longer, delete it.
	             */
	            delete this._subscriptionsByHash[hash];

	            if (subscription.state === 'unsubscribed') {
	              delete this._subscriptionCallbacksByServerSubscriptionId[subscription.serverSubscriptionId];
	            }

	            await this._updateSubscriptions();
	            return;
	          }

	          await (async () => {
	            const {
	              args,
	              method
	            } = subscription;

	            try {
	              this._subscriptionsByHash[hash] = { ...subscription,
	                state: 'subscribing'
	              };
	              const serverSubscriptionId = await this._rpcWebSocket.call(method, args);
	              this._subscriptionsByHash[hash] = { ...subscription,
	                serverSubscriptionId,
	                state: 'subscribed'
	              };
	              this._subscriptionCallbacksByServerSubscriptionId[serverSubscriptionId] = subscription.callbacks;
	              await this._updateSubscriptions();
	            } catch (e) {
	              if (e instanceof Error) {
	                console.error(`${method} error for argument`, args, e.message);
	              }

	              if (!isCurrentConnectionStillActive()) {
	                return;
	              } // TODO: Maybe add an 'errored' state or a retry limit?


	              this._subscriptionsByHash[hash] = { ...subscription,
	                state: 'pending'
	              };
	              await this._updateSubscriptions();
	            }
	          })();
	          break;

	        case 'subscribed':
	          if (subscription.callbacks.size === 0) {
	            // By the time we successfully set up a subscription
	            // with the server, the client stopped caring about it.
	            // Tear it down now.
	            await (async () => {
	              const {
	                serverSubscriptionId,
	                unsubscribeMethod
	              } = subscription;

	              if (this._subscriptionsAutoDisposedByRpc.has(serverSubscriptionId)) {
	                /**
	                 * Special case.
	                 * If we're dealing with a subscription that has been auto-
	                 * disposed by the RPC, then we can skip the RPC call to
	                 * tear down the subscription here.
	                 *
	                 * NOTE: There is a proposal to eliminate this special case, here:
	                 * https://github.com/solana-labs/solana/issues/18892
	                 */
	                this._subscriptionsAutoDisposedByRpc.delete(serverSubscriptionId);
	              } else {
	                this._subscriptionsByHash[hash] = { ...subscription,
	                  state: 'unsubscribing'
	                };

	                try {
	                  await this._rpcWebSocket.call(unsubscribeMethod, [serverSubscriptionId]);
	                } catch (e) {
	                  if (e instanceof Error) {
	                    console.error(`${unsubscribeMethod} error:`, e.message);
	                  }

	                  if (!isCurrentConnectionStillActive()) {
	                    return;
	                  } // TODO: Maybe add an 'errored' state or a retry limit?


	                  this._subscriptionsByHash[hash] = { ...subscription,
	                    state: 'subscribed'
	                  };
	                  await this._updateSubscriptions();
	                  return;
	                }
	              }

	              this._subscriptionsByHash[hash] = { ...subscription,
	                state: 'unsubscribed'
	              };
	              await this._updateSubscriptions();
	            })();
	          }

	          break;
	      }
	    }));
	  }
	  /**
	   * @internal
	   */


	  _handleServerNotification(serverSubscriptionId, callbackArgs) {
	    const callbacks = this._subscriptionCallbacksByServerSubscriptionId[serverSubscriptionId];

	    if (callbacks === undefined) {
	      return;
	    }

	    callbacks.forEach(cb => {
	      try {
	        cb( // I failed to find a way to convince TypeScript that `cb` is of type
	        // `TCallback` which is certainly compatible with `Parameters<TCallback>`.
	        // See https://github.com/microsoft/TypeScript/issues/47615
	        // @ts-ignore
	        ...callbackArgs);
	      } catch (e) {
	        console.error(e);
	      }
	    });
	  }
	  /**
	   * @internal
	   */


	  _wsOnAccountNotification(notification) {
	    const {
	      result,
	      subscription
	    } = create(notification, AccountNotificationResult);

	    this._handleServerNotification(subscription, [result.value, result.context]);
	  }
	  /**
	   * @internal
	   */


	  _makeSubscription(subscriptionConfig,
	  /**
	   * When preparing `args` for a call to `_makeSubscription`, be sure
	   * to carefully apply a default `commitment` property, if necessary.
	   *
	   * - If the user supplied a `commitment` use that.
	   * - Otherwise, if the `Connection::commitment` is set, use that.
	   * - Otherwise, set it to the RPC server default: `finalized`.
	   *
	   * This is extremely important to ensure that these two fundamentally
	   * identical subscriptions produce the same identifying hash:
	   *
	   * - A subscription made without specifying a commitment.
	   * - A subscription made where the commitment specified is the same
	   *   as the default applied to the subscription above.
	   *
	   * Example; these two subscriptions must produce the same hash:
	   *
	   * - An `accountSubscribe` subscription for `'PUBKEY'`
	   * - An `accountSubscribe` subscription for `'PUBKEY'` with commitment
	   *   `'finalized'`.
	   *
	   * See the 'making a subscription with defaulted params omitted' test
	   * in `connection-subscriptions.ts` for more.
	   */
	  args) {
	    const clientSubscriptionId = this._nextClientSubscriptionId++;
	    const hash = fastStableStringify$1([subscriptionConfig.method, args], true
	    /* isArrayProp */
	    );
	    const existingSubscription = this._subscriptionsByHash[hash];

	    if (existingSubscription === undefined) {
	      this._subscriptionsByHash[hash] = { ...subscriptionConfig,
	        args,
	        callbacks: new Set([subscriptionConfig.callback]),
	        state: 'pending'
	      };
	    } else {
	      existingSubscription.callbacks.add(subscriptionConfig.callback);
	    }

	    this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId] = async () => {
	      delete this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId];
	      const subscription = this._subscriptionsByHash[hash];
	      assert$1(subscription !== undefined, `Could not find a \`Subscription\` when tearing down client subscription #${clientSubscriptionId}`);
	      subscription.callbacks.delete(subscriptionConfig.callback);
	      await this._updateSubscriptions();
	    };

	    this._updateSubscriptions();

	    return clientSubscriptionId;
	  }
	  /**
	   * Register a callback to be invoked whenever the specified account changes
	   *
	   * @param publicKey Public key of the account to monitor
	   * @param callback Function to invoke whenever the account is changed
	   * @param commitment Specify the commitment level account changes must reach before notification
	   * @return subscription id
	   */


	  onAccountChange(publicKey, callback, commitment) {
	    const args = this._buildArgs([publicKey.toBase58()], commitment || this._commitment || 'finalized', // Apply connection/server default.
	    'base64');

	    return this._makeSubscription({
	      callback,
	      method: 'accountSubscribe',
	      unsubscribeMethod: 'accountUnsubscribe'
	    }, args);
	  }
	  /**
	   * Deregister an account notification callback
	   *
	   * @param id client subscription id to deregister
	   */


	  async removeAccountChangeListener(clientSubscriptionId) {
	    await this._unsubscribeClientSubscription(clientSubscriptionId, 'account change');
	  }
	  /**
	   * @internal
	   */


	  _wsOnProgramAccountNotification(notification) {
	    const {
	      result,
	      subscription
	    } = create(notification, ProgramAccountNotificationResult);

	    this._handleServerNotification(subscription, [{
	      accountId: result.value.pubkey,
	      accountInfo: result.value.account
	    }, result.context]);
	  }
	  /**
	   * Register a callback to be invoked whenever accounts owned by the
	   * specified program change
	   *
	   * @param programId Public key of the program to monitor
	   * @param callback Function to invoke whenever the account is changed
	   * @param commitment Specify the commitment level account changes must reach before notification
	   * @param filters The program account filters to pass into the RPC method
	   * @return subscription id
	   */


	  onProgramAccountChange(programId, callback, commitment, filters) {
	    const args = this._buildArgs([programId.toBase58()], commitment || this._commitment || 'finalized', // Apply connection/server default.
	    'base64'
	    /* encoding */
	    , filters ? {
	      filters: filters
	    } : undefined
	    /* extra */
	    );

	    return this._makeSubscription({
	      callback,
	      method: 'programSubscribe',
	      unsubscribeMethod: 'programUnsubscribe'
	    }, args);
	  }
	  /**
	   * Deregister an account notification callback
	   *
	   * @param id client subscription id to deregister
	   */


	  async removeProgramAccountChangeListener(clientSubscriptionId) {
	    await this._unsubscribeClientSubscription(clientSubscriptionId, 'program account change');
	  }
	  /**
	   * Registers a callback to be invoked whenever logs are emitted.
	   */


	  onLogs(filter, callback, commitment) {
	    const args = this._buildArgs([typeof filter === 'object' ? {
	      mentions: [filter.toString()]
	    } : filter], commitment || this._commitment || 'finalized' // Apply connection/server default.
	    );

	    return this._makeSubscription({
	      callback,
	      method: 'logsSubscribe',
	      unsubscribeMethod: 'logsUnsubscribe'
	    }, args);
	  }
	  /**
	   * Deregister a logs callback.
	   *
	   * @param id client subscription id to deregister.
	   */


	  async removeOnLogsListener(clientSubscriptionId) {
	    await this._unsubscribeClientSubscription(clientSubscriptionId, 'logs');
	  }
	  /**
	   * @internal
	   */


	  _wsOnLogsNotification(notification) {
	    const {
	      result,
	      subscription
	    } = create(notification, LogsNotificationResult);

	    this._handleServerNotification(subscription, [result.value, result.context]);
	  }
	  /**
	   * @internal
	   */


	  _wsOnSlotNotification(notification) {
	    const {
	      result,
	      subscription
	    } = create(notification, SlotNotificationResult);

	    this._handleServerNotification(subscription, [result]);
	  }
	  /**
	   * Register a callback to be invoked upon slot changes
	   *
	   * @param callback Function to invoke whenever the slot changes
	   * @return subscription id
	   */


	  onSlotChange(callback) {
	    return this._makeSubscription({
	      callback,
	      method: 'slotSubscribe',
	      unsubscribeMethod: 'slotUnsubscribe'
	    }, []
	    /* args */
	    );
	  }
	  /**
	   * Deregister a slot notification callback
	   *
	   * @param id client subscription id to deregister
	   */


	  async removeSlotChangeListener(clientSubscriptionId) {
	    await this._unsubscribeClientSubscription(clientSubscriptionId, 'slot change');
	  }
	  /**
	   * @internal
	   */


	  _wsOnSlotUpdatesNotification(notification) {
	    const {
	      result,
	      subscription
	    } = create(notification, SlotUpdateNotificationResult);

	    this._handleServerNotification(subscription, [result]);
	  }
	  /**
	   * Register a callback to be invoked upon slot updates. {@link SlotUpdate}'s
	   * may be useful to track live progress of a cluster.
	   *
	   * @param callback Function to invoke whenever the slot updates
	   * @return subscription id
	   */


	  onSlotUpdate(callback) {
	    return this._makeSubscription({
	      callback,
	      method: 'slotsUpdatesSubscribe',
	      unsubscribeMethod: 'slotsUpdatesUnsubscribe'
	    }, []
	    /* args */
	    );
	  }
	  /**
	   * Deregister a slot update notification callback
	   *
	   * @param id client subscription id to deregister
	   */


	  async removeSlotUpdateListener(clientSubscriptionId) {
	    await this._unsubscribeClientSubscription(clientSubscriptionId, 'slot update');
	  }
	  /**
	   * @internal
	   */


	  async _unsubscribeClientSubscription(clientSubscriptionId, subscriptionName) {
	    const dispose = this._subscriptionDisposeFunctionsByClientSubscriptionId[clientSubscriptionId];

	    if (dispose) {
	      await dispose();
	    } else {
	      console.warn('Ignored unsubscribe request because an active subscription with id ' + `\`${clientSubscriptionId}\` for '${subscriptionName}' events ` + 'could not be found.');
	    }
	  }

	  _buildArgs(args, override, encoding, extra) {
	    const commitment = override || this._commitment;

	    if (commitment || encoding || extra) {
	      let options = {};

	      if (encoding) {
	        options.encoding = encoding;
	      }

	      if (commitment) {
	        options.commitment = commitment;
	      }

	      if (extra) {
	        options = Object.assign(options, extra);
	      }

	      args.push(options);
	    }

	    return args;
	  }
	  /**
	   * @internal
	   */


	  _buildArgsAtLeastConfirmed(args, override, encoding, extra) {
	    const commitment = override || this._commitment;

	    if (commitment && !['confirmed', 'finalized'].includes(commitment)) {
	      throw new Error('Using Connection with default commitment: `' + this._commitment + '`, but method requires at least `confirmed`');
	    }

	    return this._buildArgs(args, override, encoding, extra);
	  }
	  /**
	   * @internal
	   */


	  _wsOnSignatureNotification(notification) {
	    const {
	      result,
	      subscription
	    } = create(notification, SignatureNotificationResult);

	    if (result.value !== 'receivedSignature') {
	      /**
	       * Special case.
	       * After a signature is processed, RPCs automatically dispose of the
	       * subscription on the server side. We need to track which of these
	       * subscriptions have been disposed in such a way, so that we know
	       * whether the client is dealing with a not-yet-processed signature
	       * (in which case we must tear down the server subscription) or an
	       * already-processed signature (in which case the client can simply
	       * clear out the subscription locally without telling the server).
	       *
	       * NOTE: There is a proposal to eliminate this special case, here:
	       * https://github.com/solana-labs/solana/issues/18892
	       */
	      this._subscriptionsAutoDisposedByRpc.add(subscription);
	    }

	    this._handleServerNotification(subscription, result.value === 'receivedSignature' ? [{
	      type: 'received'
	    }, result.context] : [{
	      type: 'status',
	      result: result.value
	    }, result.context]);
	  }
	  /**
	   * Register a callback to be invoked upon signature updates
	   *
	   * @param signature Transaction signature string in base 58
	   * @param callback Function to invoke on signature notifications
	   * @param commitment Specify the commitment level signature must reach before notification
	   * @return subscription id
	   */


	  onSignature(signature, callback, commitment) {
	    const args = this._buildArgs([signature], commitment || this._commitment || 'finalized' // Apply connection/server default.
	    );

	    const clientSubscriptionId = this._makeSubscription({
	      callback: (notification, context) => {
	        if (notification.type === 'status') {
	          callback(notification.result, context); // Signatures subscriptions are auto-removed by the RPC service
	          // so no need to explicitly send an unsubscribe message.

	          try {
	            this.removeSignatureListener(clientSubscriptionId); // eslint-disable-next-line no-empty
	          } catch (_err) {// Already removed.
	          }
	        }
	      },
	      method: 'signatureSubscribe',
	      unsubscribeMethod: 'signatureUnsubscribe'
	    }, args);

	    return clientSubscriptionId;
	  }
	  /**
	   * Register a callback to be invoked when a transaction is
	   * received and/or processed.
	   *
	   * @param signature Transaction signature string in base 58
	   * @param callback Function to invoke on signature notifications
	   * @param options Enable received notifications and set the commitment
	   *   level that signature must reach before notification
	   * @return subscription id
	   */


	  onSignatureWithOptions(signature, callback, options) {
	    const {
	      commitment,
	      ...extra
	    } = { ...options,
	      commitment: options && options.commitment || this._commitment || 'finalized' // Apply connection/server default.

	    };

	    const args = this._buildArgs([signature], commitment, undefined
	    /* encoding */
	    , extra);

	    const clientSubscriptionId = this._makeSubscription({
	      callback: (notification, context) => {
	        callback(notification, context); // Signatures subscriptions are auto-removed by the RPC service
	        // so no need to explicitly send an unsubscribe message.

	        try {
	          this.removeSignatureListener(clientSubscriptionId); // eslint-disable-next-line no-empty
	        } catch (_err) {// Already removed.
	        }
	      },
	      method: 'signatureSubscribe',
	      unsubscribeMethod: 'signatureUnsubscribe'
	    }, args);

	    return clientSubscriptionId;
	  }
	  /**
	   * Deregister a signature notification callback
	   *
	   * @param id client subscription id to deregister
	   */


	  async removeSignatureListener(clientSubscriptionId) {
	    await this._unsubscribeClientSubscription(clientSubscriptionId, 'signature result');
	  }
	  /**
	   * @internal
	   */


	  _wsOnRootNotification(notification) {
	    const {
	      result,
	      subscription
	    } = create(notification, RootNotificationResult);

	    this._handleServerNotification(subscription, [result]);
	  }
	  /**
	   * Register a callback to be invoked upon root changes
	   *
	   * @param callback Function to invoke whenever the root changes
	   * @return subscription id
	   */


	  onRootChange(callback) {
	    return this._makeSubscription({
	      callback,
	      method: 'rootSubscribe',
	      unsubscribeMethod: 'rootUnsubscribe'
	    }, []
	    /* args */
	    );
	  }
	  /**
	   * Deregister a root notification callback
	   *
	   * @param id client subscription id to deregister
	   */


	  async removeRootChangeListener(clientSubscriptionId) {
	    await this._unsubscribeClientSubscription(clientSubscriptionId, 'root change');
	  }

	}

	/**
	 * Keypair signer interface
	 */

	/**
	 * An account keypair used for signing transactions.
	 */
	class Keypair {
	  /**
	   * Create a new keypair instance.
	   * Generate random keypair if no {@link Ed25519Keypair} is provided.
	   *
	   * @param keypair ed25519 keypair
	   */
	  constructor(keypair) {
	    this._keypair = void 0;
	    this._keypair = keypair !== null && keypair !== void 0 ? keypair : generateKeypair();
	  }
	  /**
	   * Generate a new random keypair
	   */


	  static generate() {
	    return new Keypair(generateKeypair());
	  }
	  /**
	   * Create a keypair from a raw secret key byte array.
	   *
	   * This method should only be used to recreate a keypair from a previously
	   * generated secret key. Generating keypairs from a random seed should be done
	   * with the {@link Keypair.fromSeed} method.
	   *
	   * @throws error if the provided secret key is invalid and validation is not skipped.
	   *
	   * @param secretKey secret key byte array
	   * @param options: skip secret key validation
	   */


	  static fromSecretKey(secretKey, options) {
	    if (secretKey.byteLength !== 64) {
	      throw new Error('bad secret key size');
	    }

	    const publicKey = secretKey.slice(32, 64);

	    if (!options || !options.skipValidation) {
	      const privateScalar = secretKey.slice(0, 32);
	      const computedPublicKey = getPublicKey$1(privateScalar);

	      for (let ii = 0; ii < 32; ii++) {
	        if (publicKey[ii] !== computedPublicKey[ii]) {
	          throw new Error('provided secretKey is invalid');
	        }
	      }
	    }

	    return new Keypair({
	      publicKey,
	      secretKey
	    });
	  }
	  /**
	   * Generate a keypair from a 32 byte seed.
	   *
	   * @param seed seed byte array
	   */


	  static fromSeed(seed) {
	    const publicKey = getPublicKey$1(seed);
	    const secretKey = new Uint8Array(64);
	    secretKey.set(seed);
	    secretKey.set(publicKey, 32);
	    return new Keypair({
	      publicKey,
	      secretKey
	    });
	  }
	  /**
	   * The public key for this keypair
	   */


	  get publicKey() {
	    return new PublicKey(this._keypair.publicKey);
	  }
	  /**
	   * The raw secret key for this keypair
	   */


	  get secretKey() {
	    return new Uint8Array(this._keypair.secretKey);
	  }

	}

	/**
	 * An enumeration of valid address lookup table InstructionType's
	 * @internal
	 */
	const LOOKUP_TABLE_INSTRUCTION_LAYOUTS = Object.freeze({
	  CreateLookupTable: {
	    index: 0,
	    layout: struct([u32('instruction'), u64('recentSlot'), u8('bumpSeed')])
	  },
	  FreezeLookupTable: {
	    index: 1,
	    layout: struct([u32('instruction')])
	  },
	  ExtendLookupTable: {
	    index: 2,
	    layout: struct([u32('instruction'), u64(), seq(publicKey(), offset(u32(), -8), 'addresses')])
	  },
	  DeactivateLookupTable: {
	    index: 3,
	    layout: struct([u32('instruction')])
	  },
	  CloseLookupTable: {
	    index: 4,
	    layout: struct([u32('instruction')])
	  }
	});
	class AddressLookupTableInstruction {
	  /**
	   * @internal
	   */
	  constructor() {}

	  static decodeInstructionType(instruction) {
	    this.checkProgramId(instruction.programId);
	    const instructionTypeLayout = u32('instruction');
	    const index = instructionTypeLayout.decode(instruction.data);
	    let type;

	    for (const [layoutType, layout] of Object.entries(LOOKUP_TABLE_INSTRUCTION_LAYOUTS)) {
	      if (layout.index == index) {
	        type = layoutType;
	        break;
	      }
	    }

	    if (!type) {
	      throw new Error('Invalid Instruction. Should be a LookupTable Instruction');
	    }

	    return type;
	  }

	  static decodeCreateLookupTable(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeysLength(instruction.keys, 4);
	    const {
	      recentSlot
	    } = decodeData$1(LOOKUP_TABLE_INSTRUCTION_LAYOUTS.CreateLookupTable, instruction.data);
	    return {
	      authority: instruction.keys[1].pubkey,
	      payer: instruction.keys[2].pubkey,
	      recentSlot: Number(recentSlot)
	    };
	  }

	  static decodeExtendLookupTable(instruction) {
	    this.checkProgramId(instruction.programId);

	    if (instruction.keys.length < 2) {
	      throw new Error(`invalid instruction; found ${instruction.keys.length} keys, expected at least 2`);
	    }

	    const {
	      addresses
	    } = decodeData$1(LOOKUP_TABLE_INSTRUCTION_LAYOUTS.ExtendLookupTable, instruction.data);
	    return {
	      lookupTable: instruction.keys[0].pubkey,
	      authority: instruction.keys[1].pubkey,
	      payer: instruction.keys.length > 2 ? instruction.keys[2].pubkey : undefined,
	      addresses: addresses.map(buffer => new PublicKey(buffer))
	    };
	  }

	  static decodeCloseLookupTable(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeysLength(instruction.keys, 3);
	    return {
	      lookupTable: instruction.keys[0].pubkey,
	      authority: instruction.keys[1].pubkey,
	      recipient: instruction.keys[2].pubkey
	    };
	  }

	  static decodeFreezeLookupTable(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeysLength(instruction.keys, 2);
	    return {
	      lookupTable: instruction.keys[0].pubkey,
	      authority: instruction.keys[1].pubkey
	    };
	  }

	  static decodeDeactivateLookupTable(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeysLength(instruction.keys, 2);
	    return {
	      lookupTable: instruction.keys[0].pubkey,
	      authority: instruction.keys[1].pubkey
	    };
	  }
	  /**
	   * @internal
	   */


	  static checkProgramId(programId) {
	    if (!programId.equals(AddressLookupTableProgram.programId)) {
	      throw new Error('invalid instruction; programId is not AddressLookupTable Program');
	    }
	  }
	  /**
	   * @internal
	   */


	  static checkKeysLength(keys, expectedLength) {
	    if (keys.length < expectedLength) {
	      throw new Error(`invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`);
	    }
	  }

	}
	class AddressLookupTableProgram {
	  /**
	   * @internal
	   */
	  constructor() {}

	  static createLookupTable(params) {
	    const [lookupTableAddress, bumpSeed] = PublicKey.findProgramAddressSync([params.authority.toBuffer(), toBufferLE_1(BigInt(params.recentSlot), 8)], this.programId);
	    const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.CreateLookupTable;
	    const data = encodeData(type, {
	      recentSlot: BigInt(params.recentSlot),
	      bumpSeed: bumpSeed
	    });
	    const keys = [{
	      pubkey: lookupTableAddress,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: params.authority,
	      isSigner: true,
	      isWritable: false
	    }, {
	      pubkey: params.payer,
	      isSigner: true,
	      isWritable: true
	    }, {
	      pubkey: SystemProgram.programId,
	      isSigner: false,
	      isWritable: false
	    }];
	    return [new TransactionInstruction({
	      programId: this.programId,
	      keys: keys,
	      data: data
	    }), lookupTableAddress];
	  }

	  static freezeLookupTable(params) {
	    const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.FreezeLookupTable;
	    const data = encodeData(type);
	    const keys = [{
	      pubkey: params.lookupTable,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: params.authority,
	      isSigner: true,
	      isWritable: false
	    }];
	    return new TransactionInstruction({
	      programId: this.programId,
	      keys: keys,
	      data: data
	    });
	  }

	  static extendLookupTable(params) {
	    const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.ExtendLookupTable;
	    const data = encodeData(type, {
	      addresses: params.addresses.map(addr => addr.toBytes())
	    });
	    const keys = [{
	      pubkey: params.lookupTable,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: params.authority,
	      isSigner: true,
	      isWritable: false
	    }];

	    if (params.payer) {
	      keys.push({
	        pubkey: params.payer,
	        isSigner: true,
	        isWritable: true
	      }, {
	        pubkey: SystemProgram.programId,
	        isSigner: false,
	        isWritable: false
	      });
	    }

	    return new TransactionInstruction({
	      programId: this.programId,
	      keys: keys,
	      data: data
	    });
	  }

	  static deactivateLookupTable(params) {
	    const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.DeactivateLookupTable;
	    const data = encodeData(type);
	    const keys = [{
	      pubkey: params.lookupTable,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: params.authority,
	      isSigner: true,
	      isWritable: false
	    }];
	    return new TransactionInstruction({
	      programId: this.programId,
	      keys: keys,
	      data: data
	    });
	  }

	  static closeLookupTable(params) {
	    const type = LOOKUP_TABLE_INSTRUCTION_LAYOUTS.CloseLookupTable;
	    const data = encodeData(type);
	    const keys = [{
	      pubkey: params.lookupTable,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: params.authority,
	      isSigner: true,
	      isWritable: false
	    }, {
	      pubkey: params.recipient,
	      isSigner: false,
	      isWritable: true
	    }];
	    return new TransactionInstruction({
	      programId: this.programId,
	      keys: keys,
	      data: data
	    });
	  }

	}
	AddressLookupTableProgram.programId = new PublicKey('AddressLookupTab1e1111111111111111111111111');

	/**
	 * Compute Budget Instruction class
	 */

	class ComputeBudgetInstruction {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Decode a compute budget instruction and retrieve the instruction type.
	   */


	  static decodeInstructionType(instruction) {
	    this.checkProgramId(instruction.programId);
	    const instructionTypeLayout = u8('instruction');
	    const typeIndex = instructionTypeLayout.decode(instruction.data);
	    let type;

	    for (const [ixType, layout] of Object.entries(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS)) {
	      if (layout.index == typeIndex) {
	        type = ixType;
	        break;
	      }
	    }

	    if (!type) {
	      throw new Error('Instruction type incorrect; not a ComputeBudgetInstruction');
	    }

	    return type;
	  }
	  /**
	   * Decode request units compute budget instruction and retrieve the instruction params.
	   */


	  static decodeRequestUnits(instruction) {
	    this.checkProgramId(instruction.programId);
	    const {
	      units,
	      additionalFee
	    } = decodeData$1(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestUnits, instruction.data);
	    return {
	      units,
	      additionalFee
	    };
	  }
	  /**
	   * Decode request heap frame compute budget instruction and retrieve the instruction params.
	   */


	  static decodeRequestHeapFrame(instruction) {
	    this.checkProgramId(instruction.programId);
	    const {
	      bytes
	    } = decodeData$1(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestHeapFrame, instruction.data);
	    return {
	      bytes
	    };
	  }
	  /**
	   * Decode set compute unit limit compute budget instruction and retrieve the instruction params.
	   */


	  static decodeSetComputeUnitLimit(instruction) {
	    this.checkProgramId(instruction.programId);
	    const {
	      units
	    } = decodeData$1(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitLimit, instruction.data);
	    return {
	      units
	    };
	  }
	  /**
	   * Decode set compute unit price compute budget instruction and retrieve the instruction params.
	   */


	  static decodeSetComputeUnitPrice(instruction) {
	    this.checkProgramId(instruction.programId);
	    const {
	      microLamports
	    } = decodeData$1(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitPrice, instruction.data);
	    return {
	      microLamports
	    };
	  }
	  /**
	   * @internal
	   */


	  static checkProgramId(programId) {
	    if (!programId.equals(ComputeBudgetProgram.programId)) {
	      throw new Error('invalid instruction; programId is not ComputeBudgetProgram');
	    }
	  }

	}
	/**
	 * An enumeration of valid ComputeBudgetInstructionType's
	 */

	/**
	 * An enumeration of valid ComputeBudget InstructionType's
	 * @internal
	 */
	const COMPUTE_BUDGET_INSTRUCTION_LAYOUTS = Object.freeze({
	  RequestUnits: {
	    index: 0,
	    layout: struct([u8('instruction'), u32('units'), u32('additionalFee')])
	  },
	  RequestHeapFrame: {
	    index: 1,
	    layout: struct([u8('instruction'), u32('bytes')])
	  },
	  SetComputeUnitLimit: {
	    index: 2,
	    layout: struct([u8('instruction'), u32('units')])
	  },
	  SetComputeUnitPrice: {
	    index: 3,
	    layout: struct([u8('instruction'), u64('microLamports')])
	  }
	});
	/**
	 * Factory class for transaction instructions to interact with the Compute Budget program
	 */

	class ComputeBudgetProgram {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Public key that identifies the Compute Budget program
	   */


	  /**
	   * @deprecated Instead, call {@link setComputeUnitLimit} and/or {@link setComputeUnitPrice}
	   */
	  static requestUnits(params) {
	    const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestUnits;
	    const data = encodeData(type, params);
	    return new TransactionInstruction({
	      keys: [],
	      programId: this.programId,
	      data
	    });
	  }

	  static requestHeapFrame(params) {
	    const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestHeapFrame;
	    const data = encodeData(type, params);
	    return new TransactionInstruction({
	      keys: [],
	      programId: this.programId,
	      data
	    });
	  }

	  static setComputeUnitLimit(params) {
	    const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitLimit;
	    const data = encodeData(type, params);
	    return new TransactionInstruction({
	      keys: [],
	      programId: this.programId,
	      data
	    });
	  }

	  static setComputeUnitPrice(params) {
	    const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitPrice;
	    const data = encodeData(type, {
	      microLamports: BigInt(params.microLamports)
	    });
	    return new TransactionInstruction({
	      keys: [],
	      programId: this.programId,
	      data
	    });
	  }

	}
	ComputeBudgetProgram.programId = new PublicKey('ComputeBudget111111111111111111111111111111');

	const PRIVATE_KEY_BYTES$1 = 64;
	const PUBLIC_KEY_BYTES$1 = 32;
	const SIGNATURE_BYTES = 64;
	/**
	 * Params for creating an ed25519 instruction using a public key
	 */

	const ED25519_INSTRUCTION_LAYOUT = struct([u8('numSignatures'), u8('padding'), u16('signatureOffset'), u16('signatureInstructionIndex'), u16('publicKeyOffset'), u16('publicKeyInstructionIndex'), u16('messageDataOffset'), u16('messageDataSize'), u16('messageInstructionIndex')]);
	class Ed25519Program {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Public key that identifies the ed25519 program
	   */


	  /**
	   * Create an ed25519 instruction with a public key and signature. The
	   * public key must be a buffer that is 32 bytes long, and the signature
	   * must be a buffer of 64 bytes.
	   */
	  static createInstructionWithPublicKey(params) {
	    const {
	      publicKey,
	      message,
	      signature,
	      instructionIndex
	    } = params;
	    assert$1(publicKey.length === PUBLIC_KEY_BYTES$1, `Public Key must be ${PUBLIC_KEY_BYTES$1} bytes but received ${publicKey.length} bytes`);
	    assert$1(signature.length === SIGNATURE_BYTES, `Signature must be ${SIGNATURE_BYTES} bytes but received ${signature.length} bytes`);
	    const publicKeyOffset = ED25519_INSTRUCTION_LAYOUT.span;
	    const signatureOffset = publicKeyOffset + publicKey.length;
	    const messageDataOffset = signatureOffset + signature.length;
	    const numSignatures = 1;
	    const instructionData = buffer.Buffer.alloc(messageDataOffset + message.length);
	    const index = instructionIndex == null ? 0xffff // An index of `u16::MAX` makes it default to the current instruction.
	    : instructionIndex;
	    ED25519_INSTRUCTION_LAYOUT.encode({
	      numSignatures,
	      padding: 0,
	      signatureOffset,
	      signatureInstructionIndex: index,
	      publicKeyOffset,
	      publicKeyInstructionIndex: index,
	      messageDataOffset,
	      messageDataSize: message.length,
	      messageInstructionIndex: index
	    }, instructionData);
	    instructionData.fill(publicKey, publicKeyOffset);
	    instructionData.fill(signature, signatureOffset);
	    instructionData.fill(message, messageDataOffset);
	    return new TransactionInstruction({
	      keys: [],
	      programId: Ed25519Program.programId,
	      data: instructionData
	    });
	  }
	  /**
	   * Create an ed25519 instruction with a private key. The private key
	   * must be a buffer that is 64 bytes long.
	   */


	  static createInstructionWithPrivateKey(params) {
	    const {
	      privateKey,
	      message,
	      instructionIndex
	    } = params;
	    assert$1(privateKey.length === PRIVATE_KEY_BYTES$1, `Private key must be ${PRIVATE_KEY_BYTES$1} bytes but received ${privateKey.length} bytes`);

	    try {
	      const keypair = Keypair.fromSecretKey(privateKey);
	      const publicKey = keypair.publicKey.toBytes();
	      const signature = sign(message, keypair.secretKey);
	      return this.createInstructionWithPublicKey({
	        publicKey,
	        message,
	        signature,
	        instructionIndex
	      });
	    } catch (error) {
	      throw new Error(`Error creating instruction; ${error}`);
	    }
	  }

	}
	Ed25519Program.programId = new PublicKey('Ed25519SigVerify111111111111111111111111111');

	// Various per round constants calculations
	const [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []];
	const _0n$1 = BigInt(0);
	const _1n$1 = BigInt(1);
	const _2n$1 = BigInt(2);
	const _7n = BigInt(7);
	const _256n = BigInt(256);
	const _0x71n = BigInt(0x71);
	for (let round = 0, R = _1n$1, x = 1, y = 0; round < 24; round++) {
	    // Pi
	    [x, y] = [y, (2 * x + 3 * y) % 5];
	    SHA3_PI.push(2 * (5 * y + x));
	    // Rotational
	    SHA3_ROTL.push((((round + 1) * (round + 2)) / 2) % 64);
	    // Iota
	    let t = _0n$1;
	    for (let j = 0; j < 7; j++) {
	        R = ((R << _1n$1) ^ ((R >> _7n) * _0x71n)) % _256n;
	        if (R & _2n$1)
	            t ^= _1n$1 << ((_1n$1 << BigInt(j)) - _1n$1);
	    }
	    _SHA3_IOTA.push(t);
	}
	const [SHA3_IOTA_H, SHA3_IOTA_L] = u64$2.split(_SHA3_IOTA, true);
	// Left rotation (without 0, 32, 64)
	const rotlH = (h, l, s) => s > 32 ? u64$2.rotlBH(h, l, s) : u64$2.rotlSH(h, l, s);
	const rotlL = (h, l, s) => s > 32 ? u64$2.rotlBL(h, l, s) : u64$2.rotlSL(h, l, s);
	// Same as keccakf1600, but allows to skip some rounds
	function keccakP(s, rounds = 24) {
	    const B = new Uint32Array(5 * 2);
	    // NOTE: all indices are x2 since we store state as u32 instead of u64 (bigints to slow in js)
	    for (let round = 24 - rounds; round < 24; round++) {
	        // Theta θ
	        for (let x = 0; x < 10; x++)
	            B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
	        for (let x = 0; x < 10; x += 2) {
	            const idx1 = (x + 8) % 10;
	            const idx0 = (x + 2) % 10;
	            const B0 = B[idx0];
	            const B1 = B[idx0 + 1];
	            const Th = rotlH(B0, B1, 1) ^ B[idx1];
	            const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
	            for (let y = 0; y < 50; y += 10) {
	                s[x + y] ^= Th;
	                s[x + y + 1] ^= Tl;
	            }
	        }
	        // Rho (ρ) and Pi (π)
	        let curH = s[2];
	        let curL = s[3];
	        for (let t = 0; t < 24; t++) {
	            const shift = SHA3_ROTL[t];
	            const Th = rotlH(curH, curL, shift);
	            const Tl = rotlL(curH, curL, shift);
	            const PI = SHA3_PI[t];
	            curH = s[PI];
	            curL = s[PI + 1];
	            s[PI] = Th;
	            s[PI + 1] = Tl;
	        }
	        // Chi (χ)
	        for (let y = 0; y < 50; y += 10) {
	            for (let x = 0; x < 10; x++)
	                B[x] = s[y + x];
	            for (let x = 0; x < 10; x++)
	                s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
	        }
	        // Iota (ι)
	        s[0] ^= SHA3_IOTA_H[round];
	        s[1] ^= SHA3_IOTA_L[round];
	    }
	    B.fill(0);
	}
	class Keccak extends Hash {
	    // NOTE: we accept arguments in bytes instead of bits here.
	    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
	        super();
	        this.blockLen = blockLen;
	        this.suffix = suffix;
	        this.outputLen = outputLen;
	        this.enableXOF = enableXOF;
	        this.rounds = rounds;
	        this.pos = 0;
	        this.posOut = 0;
	        this.finished = false;
	        this.destroyed = false;
	        // Can be passed from user as dkLen
	        assert$3.number(outputLen);
	        // 1600 = 5x5 matrix of 64bit.  1600 bits === 200 bytes
	        if (0 >= this.blockLen || this.blockLen >= 200)
	            throw new Error('Sha3 supports only keccak-f1600 function');
	        this.state = new Uint8Array(200);
	        this.state32 = u32$1(this.state);
	    }
	    keccak() {
	        keccakP(this.state32, this.rounds);
	        this.posOut = 0;
	        this.pos = 0;
	    }
	    update(data) {
	        assert$3.exists(this);
	        const { blockLen, state } = this;
	        data = toBytes(data);
	        const len = data.length;
	        for (let pos = 0; pos < len;) {
	            const take = Math.min(blockLen - this.pos, len - pos);
	            for (let i = 0; i < take; i++)
	                state[this.pos++] ^= data[pos++];
	            if (this.pos === blockLen)
	                this.keccak();
	        }
	        return this;
	    }
	    finish() {
	        if (this.finished)
	            return;
	        this.finished = true;
	        const { state, suffix, pos, blockLen } = this;
	        // Do the padding
	        state[pos] ^= suffix;
	        if ((suffix & 0x80) !== 0 && pos === blockLen - 1)
	            this.keccak();
	        state[blockLen - 1] ^= 0x80;
	        this.keccak();
	    }
	    writeInto(out) {
	        assert$3.exists(this, false);
	        assert$3.bytes(out);
	        this.finish();
	        const bufferOut = this.state;
	        const { blockLen } = this;
	        for (let pos = 0, len = out.length; pos < len;) {
	            if (this.posOut >= blockLen)
	                this.keccak();
	            const take = Math.min(blockLen - this.posOut, len - pos);
	            out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
	            this.posOut += take;
	            pos += take;
	        }
	        return out;
	    }
	    xofInto(out) {
	        // Sha3/Keccak usage with XOF is probably mistake, only SHAKE instances can do XOF
	        if (!this.enableXOF)
	            throw new Error('XOF is not possible for this instance');
	        return this.writeInto(out);
	    }
	    xof(bytes) {
	        assert$3.number(bytes);
	        return this.xofInto(new Uint8Array(bytes));
	    }
	    digestInto(out) {
	        assert$3.output(out, this);
	        if (this.finished)
	            throw new Error('digest() was already called');
	        this.writeInto(out);
	        this.destroy();
	        return out;
	    }
	    digest() {
	        return this.digestInto(new Uint8Array(this.outputLen));
	    }
	    destroy() {
	        this.destroyed = true;
	        this.state.fill(0);
	    }
	    _cloneInto(to) {
	        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
	        to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
	        to.state32.set(this.state32);
	        to.pos = this.pos;
	        to.posOut = this.posOut;
	        to.finished = this.finished;
	        to.rounds = rounds;
	        // Suffix can change in cSHAKE
	        to.suffix = suffix;
	        to.outputLen = outputLen;
	        to.enableXOF = enableXOF;
	        to.destroyed = this.destroyed;
	        return to;
	    }
	}
	const gen = (suffix, blockLen, outputLen) => wrapConstructor(() => new Keccak(blockLen, suffix, outputLen));
	gen(0x06, 144, 224 / 8);
	/**
	 * SHA3-256 hash function
	 * @param message - that would be hashed
	 */
	gen(0x06, 136, 256 / 8);
	gen(0x06, 104, 384 / 8);
	gen(0x06, 72, 512 / 8);
	gen(0x01, 144, 224 / 8);
	/**
	 * keccak-256 hash function. Different from SHA3-256.
	 * @param message - that would be hashed
	 */
	const keccak_256 = gen(0x01, 136, 256 / 8);
	gen(0x01, 104, 384 / 8);
	gen(0x01, 72, 512 / 8);
	const genShake = (suffix, blockLen, outputLen) => wrapConstructorWithOpts((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true));
	genShake(0x1f, 168, 128 / 8);
	genShake(0x1f, 136, 256 / 8);

	// HMAC (RFC 2104)
	class HMAC extends Hash {
	    constructor(hash, _key) {
	        super();
	        this.finished = false;
	        this.destroyed = false;
	        assert$3.hash(hash);
	        const key = toBytes(_key);
	        this.iHash = hash.create();
	        if (!(this.iHash instanceof Hash))
	            throw new TypeError('Expected instance of class which extends utils.Hash');
	        const blockLen = (this.blockLen = this.iHash.blockLen);
	        this.outputLen = this.iHash.outputLen;
	        const pad = new Uint8Array(blockLen);
	        // blockLen can be bigger than outputLen
	        pad.set(key.length > this.iHash.blockLen ? hash.create().update(key).digest() : key);
	        for (let i = 0; i < pad.length; i++)
	            pad[i] ^= 0x36;
	        this.iHash.update(pad);
	        // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone
	        this.oHash = hash.create();
	        // Undo internal XOR && apply outer XOR
	        for (let i = 0; i < pad.length; i++)
	            pad[i] ^= 0x36 ^ 0x5c;
	        this.oHash.update(pad);
	        pad.fill(0);
	    }
	    update(buf) {
	        assert$3.exists(this);
	        this.iHash.update(buf);
	        return this;
	    }
	    digestInto(out) {
	        assert$3.exists(this);
	        assert$3.bytes(out, this.outputLen);
	        this.finished = true;
	        this.iHash.digestInto(out);
	        this.oHash.update(out);
	        this.oHash.digestInto(out);
	        this.destroy();
	    }
	    digest() {
	        const out = new Uint8Array(this.oHash.outputLen);
	        this.digestInto(out);
	        return out;
	    }
	    _cloneInto(to) {
	        // Create new instance without calling constructor since key already in state and we don't know it.
	        to || (to = Object.create(Object.getPrototypeOf(this), {}));
	        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
	        to = to;
	        to.finished = finished;
	        to.destroyed = destroyed;
	        to.blockLen = blockLen;
	        to.outputLen = outputLen;
	        to.oHash = oHash._cloneInto(to.oHash);
	        to.iHash = iHash._cloneInto(to.iHash);
	        return to;
	    }
	    destroy() {
	        this.destroyed = true;
	        this.oHash.destroy();
	        this.iHash.destroy();
	    }
	}
	/**
	 * HMAC: RFC2104 message authentication code.
	 * @param hash - function that would be used e.g. sha256
	 * @param key - message key
	 * @param message - message data
	 */
	const hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
	hmac.create = (hash, key) => new HMAC(hash, key);

	/*! noble-secp256k1 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
	const _0n = BigInt(0);
	const _1n = BigInt(1);
	const _2n = BigInt(2);
	const _3n = BigInt(3);
	const _8n = BigInt(8);
	const POW_2_256 = _2n ** BigInt(256);
	const CURVE = {
	    a: _0n,
	    b: BigInt(7),
	    P: POW_2_256 - _2n ** BigInt(32) - BigInt(977),
	    n: POW_2_256 - BigInt('432420386565659656852420866394968145599'),
	    h: _1n,
	    Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
	    Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
	    beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
	};
	function weistrass(x) {
	    const { a, b } = CURVE;
	    const x2 = mod(x * x);
	    const x3 = mod(x2 * x);
	    return mod(x3 + a * x + b);
	}
	const USE_ENDOMORPHISM = CURVE.a === _0n;
	class JacobianPoint {
	    constructor(x, y, z) {
	        this.x = x;
	        this.y = y;
	        this.z = z;
	    }
	    static fromAffine(p) {
	        if (!(p instanceof Point)) {
	            throw new TypeError('JacobianPoint#fromAffine: expected Point');
	        }
	        return new JacobianPoint(p.x, p.y, _1n);
	    }
	    static toAffineBatch(points) {
	        const toInv = invertBatch(points.map((p) => p.z));
	        return points.map((p, i) => p.toAffine(toInv[i]));
	    }
	    static normalizeZ(points) {
	        return JacobianPoint.toAffineBatch(points).map(JacobianPoint.fromAffine);
	    }
	    equals(other) {
	        if (!(other instanceof JacobianPoint))
	            throw new TypeError('JacobianPoint expected');
	        const { x: X1, y: Y1, z: Z1 } = this;
	        const { x: X2, y: Y2, z: Z2 } = other;
	        const Z1Z1 = mod(Z1 ** _2n);
	        const Z2Z2 = mod(Z2 ** _2n);
	        const U1 = mod(X1 * Z2Z2);
	        const U2 = mod(X2 * Z1Z1);
	        const S1 = mod(mod(Y1 * Z2) * Z2Z2);
	        const S2 = mod(mod(Y2 * Z1) * Z1Z1);
	        return U1 === U2 && S1 === S2;
	    }
	    negate() {
	        return new JacobianPoint(this.x, mod(-this.y), this.z);
	    }
	    double() {
	        const { x: X1, y: Y1, z: Z1 } = this;
	        const A = mod(X1 ** _2n);
	        const B = mod(Y1 ** _2n);
	        const C = mod(B ** _2n);
	        const D = mod(_2n * (mod((X1 + B) ** _2n) - A - C));
	        const E = mod(_3n * A);
	        const F = mod(E ** _2n);
	        const X3 = mod(F - _2n * D);
	        const Y3 = mod(E * (D - X3) - _8n * C);
	        const Z3 = mod(_2n * Y1 * Z1);
	        return new JacobianPoint(X3, Y3, Z3);
	    }
	    add(other) {
	        if (!(other instanceof JacobianPoint))
	            throw new TypeError('JacobianPoint expected');
	        const { x: X1, y: Y1, z: Z1 } = this;
	        const { x: X2, y: Y2, z: Z2 } = other;
	        if (X2 === _0n || Y2 === _0n)
	            return this;
	        if (X1 === _0n || Y1 === _0n)
	            return other;
	        const Z1Z1 = mod(Z1 ** _2n);
	        const Z2Z2 = mod(Z2 ** _2n);
	        const U1 = mod(X1 * Z2Z2);
	        const U2 = mod(X2 * Z1Z1);
	        const S1 = mod(mod(Y1 * Z2) * Z2Z2);
	        const S2 = mod(mod(Y2 * Z1) * Z1Z1);
	        const H = mod(U2 - U1);
	        const r = mod(S2 - S1);
	        if (H === _0n) {
	            if (r === _0n) {
	                return this.double();
	            }
	            else {
	                return JacobianPoint.ZERO;
	            }
	        }
	        const HH = mod(H ** _2n);
	        const HHH = mod(H * HH);
	        const V = mod(U1 * HH);
	        const X3 = mod(r ** _2n - HHH - _2n * V);
	        const Y3 = mod(r * (V - X3) - S1 * HHH);
	        const Z3 = mod(Z1 * Z2 * H);
	        return new JacobianPoint(X3, Y3, Z3);
	    }
	    subtract(other) {
	        return this.add(other.negate());
	    }
	    multiplyUnsafe(scalar) {
	        const P0 = JacobianPoint.ZERO;
	        if (typeof scalar === 'bigint' && scalar === _0n)
	            return P0;
	        let n = normalizeScalar(scalar);
	        if (n === _1n)
	            return this;
	        if (!USE_ENDOMORPHISM) {
	            let p = P0;
	            let d = this;
	            while (n > _0n) {
	                if (n & _1n)
	                    p = p.add(d);
	                d = d.double();
	                n >>= _1n;
	            }
	            return p;
	        }
	        let { k1neg, k1, k2neg, k2 } = splitScalarEndo(n);
	        let k1p = P0;
	        let k2p = P0;
	        let d = this;
	        while (k1 > _0n || k2 > _0n) {
	            if (k1 & _1n)
	                k1p = k1p.add(d);
	            if (k2 & _1n)
	                k2p = k2p.add(d);
	            d = d.double();
	            k1 >>= _1n;
	            k2 >>= _1n;
	        }
	        if (k1neg)
	            k1p = k1p.negate();
	        if (k2neg)
	            k2p = k2p.negate();
	        k2p = new JacobianPoint(mod(k2p.x * CURVE.beta), k2p.y, k2p.z);
	        return k1p.add(k2p);
	    }
	    precomputeWindow(W) {
	        const windows = USE_ENDOMORPHISM ? 128 / W + 1 : 256 / W + 1;
	        const points = [];
	        let p = this;
	        let base = p;
	        for (let window = 0; window < windows; window++) {
	            base = p;
	            points.push(base);
	            for (let i = 1; i < 2 ** (W - 1); i++) {
	                base = base.add(p);
	                points.push(base);
	            }
	            p = base.double();
	        }
	        return points;
	    }
	    wNAF(n, affinePoint) {
	        if (!affinePoint && this.equals(JacobianPoint.BASE))
	            affinePoint = Point.BASE;
	        const W = (affinePoint && affinePoint._WINDOW_SIZE) || 1;
	        if (256 % W) {
	            throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
	        }
	        let precomputes = affinePoint && pointPrecomputes.get(affinePoint);
	        if (!precomputes) {
	            precomputes = this.precomputeWindow(W);
	            if (affinePoint && W !== 1) {
	                precomputes = JacobianPoint.normalizeZ(precomputes);
	                pointPrecomputes.set(affinePoint, precomputes);
	            }
	        }
	        let p = JacobianPoint.ZERO;
	        let f = JacobianPoint.ZERO;
	        const windows = 1 + (USE_ENDOMORPHISM ? 128 / W : 256 / W);
	        const windowSize = 2 ** (W - 1);
	        const mask = BigInt(2 ** W - 1);
	        const maxNumber = 2 ** W;
	        const shiftBy = BigInt(W);
	        for (let window = 0; window < windows; window++) {
	            const offset = window * windowSize;
	            let wbits = Number(n & mask);
	            n >>= shiftBy;
	            if (wbits > windowSize) {
	                wbits -= maxNumber;
	                n += _1n;
	            }
	            if (wbits === 0) {
	                let pr = precomputes[offset];
	                if (window % 2)
	                    pr = pr.negate();
	                f = f.add(pr);
	            }
	            else {
	                let cached = precomputes[offset + Math.abs(wbits) - 1];
	                if (wbits < 0)
	                    cached = cached.negate();
	                p = p.add(cached);
	            }
	        }
	        return { p, f };
	    }
	    multiply(scalar, affinePoint) {
	        let n = normalizeScalar(scalar);
	        let point;
	        let fake;
	        if (USE_ENDOMORPHISM) {
	            const { k1neg, k1, k2neg, k2 } = splitScalarEndo(n);
	            let { p: k1p, f: f1p } = this.wNAF(k1, affinePoint);
	            let { p: k2p, f: f2p } = this.wNAF(k2, affinePoint);
	            if (k1neg)
	                k1p = k1p.negate();
	            if (k2neg)
	                k2p = k2p.negate();
	            k2p = new JacobianPoint(mod(k2p.x * CURVE.beta), k2p.y, k2p.z);
	            point = k1p.add(k2p);
	            fake = f1p.add(f2p);
	        }
	        else {
	            const { p, f } = this.wNAF(n, affinePoint);
	            point = p;
	            fake = f;
	        }
	        return JacobianPoint.normalizeZ([point, fake])[0];
	    }
	    toAffine(invZ = invert(this.z)) {
	        const { x, y, z } = this;
	        const iz1 = invZ;
	        const iz2 = mod(iz1 * iz1);
	        const iz3 = mod(iz2 * iz1);
	        const ax = mod(x * iz2);
	        const ay = mod(y * iz3);
	        const zz = mod(z * iz1);
	        if (zz !== _1n)
	            throw new Error('invZ was invalid');
	        return new Point(ax, ay);
	    }
	}
	JacobianPoint.BASE = new JacobianPoint(CURVE.Gx, CURVE.Gy, _1n);
	JacobianPoint.ZERO = new JacobianPoint(_0n, _1n, _0n);
	const pointPrecomputes = new WeakMap();
	class Point {
	    constructor(x, y) {
	        this.x = x;
	        this.y = y;
	    }
	    _setWindowSize(windowSize) {
	        this._WINDOW_SIZE = windowSize;
	        pointPrecomputes.delete(this);
	    }
	    static fromCompressedHex(bytes) {
	        const isShort = bytes.length === 32;
	        const x = bytesToNumber(isShort ? bytes : bytes.subarray(1));
	        if (!isValidFieldElement(x))
	            throw new Error('Point is not on curve');
	        const y2 = weistrass(x);
	        let y = sqrtMod(y2);
	        const isYOdd = (y & _1n) === _1n;
	        if (isShort) {
	            if (isYOdd)
	                y = mod(-y);
	        }
	        else {
	            const isFirstByteOdd = (bytes[0] & 1) === 1;
	            if (isFirstByteOdd !== isYOdd)
	                y = mod(-y);
	        }
	        const point = new Point(x, y);
	        point.assertValidity();
	        return point;
	    }
	    static fromUncompressedHex(bytes) {
	        const x = bytesToNumber(bytes.subarray(1, 33));
	        const y = bytesToNumber(bytes.subarray(33, 65));
	        const point = new Point(x, y);
	        point.assertValidity();
	        return point;
	    }
	    static fromHex(hex) {
	        const bytes = ensureBytes(hex);
	        const len = bytes.length;
	        const header = bytes[0];
	        if (len === 32 || (len === 33 && (header === 0x02 || header === 0x03))) {
	            return this.fromCompressedHex(bytes);
	        }
	        if (len === 65 && header === 0x04)
	            return this.fromUncompressedHex(bytes);
	        throw new Error(`Point.fromHex: received invalid point. Expected 32-33 compressed bytes or 65 uncompressed bytes, not ${len}`);
	    }
	    static fromPrivateKey(privateKey) {
	        return Point.BASE.multiply(normalizePrivateKey(privateKey));
	    }
	    static fromSignature(msgHash, signature, recovery) {
	        msgHash = ensureBytes(msgHash);
	        const h = truncateHash(msgHash);
	        const { r, s } = normalizeSignature(signature);
	        if (recovery !== 0 && recovery !== 1) {
	            throw new Error('Cannot recover signature: invalid recovery bit');
	        }
	        const prefix = recovery & 1 ? '03' : '02';
	        const R = Point.fromHex(prefix + numTo32bStr(r));
	        const { n } = CURVE;
	        const rinv = invert(r, n);
	        const u1 = mod(-h * rinv, n);
	        const u2 = mod(s * rinv, n);
	        const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
	        if (!Q)
	            throw new Error('Cannot recover signature: point at infinify');
	        Q.assertValidity();
	        return Q;
	    }
	    toRawBytes(isCompressed = false) {
	        return hexToBytes(this.toHex(isCompressed));
	    }
	    toHex(isCompressed = false) {
	        const x = numTo32bStr(this.x);
	        if (isCompressed) {
	            const prefix = this.y & _1n ? '03' : '02';
	            return `${prefix}${x}`;
	        }
	        else {
	            return `04${x}${numTo32bStr(this.y)}`;
	        }
	    }
	    toHexX() {
	        return this.toHex(true).slice(2);
	    }
	    toRawX() {
	        return this.toRawBytes(true).slice(1);
	    }
	    assertValidity() {
	        const msg = 'Point is not on elliptic curve';
	        const { x, y } = this;
	        if (!isValidFieldElement(x) || !isValidFieldElement(y))
	            throw new Error(msg);
	        const left = mod(y * y);
	        const right = weistrass(x);
	        if (mod(left - right) !== _0n)
	            throw new Error(msg);
	    }
	    equals(other) {
	        return this.x === other.x && this.y === other.y;
	    }
	    negate() {
	        return new Point(this.x, mod(-this.y));
	    }
	    double() {
	        return JacobianPoint.fromAffine(this).double().toAffine();
	    }
	    add(other) {
	        return JacobianPoint.fromAffine(this).add(JacobianPoint.fromAffine(other)).toAffine();
	    }
	    subtract(other) {
	        return this.add(other.negate());
	    }
	    multiply(scalar) {
	        return JacobianPoint.fromAffine(this).multiply(scalar, this).toAffine();
	    }
	    multiplyAndAddUnsafe(Q, a, b) {
	        const P = JacobianPoint.fromAffine(this);
	        const aP = a === _0n || a === _1n || this !== Point.BASE ? P.multiplyUnsafe(a) : P.multiply(a);
	        const bQ = JacobianPoint.fromAffine(Q).multiplyUnsafe(b);
	        const sum = aP.add(bQ);
	        return sum.equals(JacobianPoint.ZERO) ? undefined : sum.toAffine();
	    }
	}
	Point.BASE = new Point(CURVE.Gx, CURVE.Gy);
	Point.ZERO = new Point(_0n, _0n);
	function sliceDER(s) {
	    return Number.parseInt(s[0], 16) >= 8 ? '00' + s : s;
	}
	function parseDERInt(data) {
	    if (data.length < 2 || data[0] !== 0x02) {
	        throw new Error(`Invalid signature integer tag: ${bytesToHex(data)}`);
	    }
	    const len = data[1];
	    const res = data.subarray(2, len + 2);
	    if (!len || res.length !== len) {
	        throw new Error(`Invalid signature integer: wrong length`);
	    }
	    if (res[0] === 0x00 && res[1] <= 0x7f) {
	        throw new Error('Invalid signature integer: trailing length');
	    }
	    return { data: bytesToNumber(res), left: data.subarray(len + 2) };
	}
	function parseDERSignature(data) {
	    if (data.length < 2 || data[0] != 0x30) {
	        throw new Error(`Invalid signature tag: ${bytesToHex(data)}`);
	    }
	    if (data[1] !== data.length - 2) {
	        throw new Error('Invalid signature: incorrect length');
	    }
	    const { data: r, left: sBytes } = parseDERInt(data.subarray(2));
	    const { data: s, left: rBytesLeft } = parseDERInt(sBytes);
	    if (rBytesLeft.length) {
	        throw new Error(`Invalid signature: left bytes after parsing: ${bytesToHex(rBytesLeft)}`);
	    }
	    return { r, s };
	}
	class Signature {
	    constructor(r, s) {
	        this.r = r;
	        this.s = s;
	        this.assertValidity();
	    }
	    static fromCompact(hex) {
	        const arr = isUint8a(hex);
	        const name = 'Signature.fromCompact';
	        if (typeof hex !== 'string' && !arr)
	            throw new TypeError(`${name}: Expected string or Uint8Array`);
	        const str = arr ? bytesToHex(hex) : hex;
	        if (str.length !== 128)
	            throw new Error(`${name}: Expected 64-byte hex`);
	        return new Signature(hexToNumber(str.slice(0, 64)), hexToNumber(str.slice(64, 128)));
	    }
	    static fromDER(hex) {
	        const arr = isUint8a(hex);
	        if (typeof hex !== 'string' && !arr)
	            throw new TypeError(`Signature.fromDER: Expected string or Uint8Array`);
	        const { r, s } = parseDERSignature(arr ? hex : hexToBytes(hex));
	        return new Signature(r, s);
	    }
	    static fromHex(hex) {
	        return this.fromDER(hex);
	    }
	    assertValidity() {
	        const { r, s } = this;
	        if (!isWithinCurveOrder(r))
	            throw new Error('Invalid Signature: r must be 0 < r < n');
	        if (!isWithinCurveOrder(s))
	            throw new Error('Invalid Signature: s must be 0 < s < n');
	    }
	    hasHighS() {
	        const HALF = CURVE.n >> _1n;
	        return this.s > HALF;
	    }
	    normalizeS() {
	        return this.hasHighS() ? new Signature(this.r, CURVE.n - this.s) : this;
	    }
	    toDERRawBytes(isCompressed = false) {
	        return hexToBytes(this.toDERHex(isCompressed));
	    }
	    toDERHex(isCompressed = false) {
	        const sHex = sliceDER(numberToHexUnpadded(this.s));
	        if (isCompressed)
	            return sHex;
	        const rHex = sliceDER(numberToHexUnpadded(this.r));
	        const rLen = numberToHexUnpadded(rHex.length / 2);
	        const sLen = numberToHexUnpadded(sHex.length / 2);
	        const length = numberToHexUnpadded(rHex.length / 2 + sHex.length / 2 + 4);
	        return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
	    }
	    toRawBytes() {
	        return this.toDERRawBytes();
	    }
	    toHex() {
	        return this.toDERHex();
	    }
	    toCompactRawBytes() {
	        return hexToBytes(this.toCompactHex());
	    }
	    toCompactHex() {
	        return numTo32bStr(this.r) + numTo32bStr(this.s);
	    }
	}
	function concatBytes(...arrays) {
	    if (!arrays.every(isUint8a))
	        throw new Error('Uint8Array list expected');
	    if (arrays.length === 1)
	        return arrays[0];
	    const length = arrays.reduce((a, arr) => a + arr.length, 0);
	    const result = new Uint8Array(length);
	    for (let i = 0, pad = 0; i < arrays.length; i++) {
	        const arr = arrays[i];
	        result.set(arr, pad);
	        pad += arr.length;
	    }
	    return result;
	}
	function isUint8a(bytes) {
	    return bytes instanceof Uint8Array;
	}
	const hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
	function bytesToHex(uint8a) {
	    if (!(uint8a instanceof Uint8Array))
	        throw new Error('Expected Uint8Array');
	    let hex = '';
	    for (let i = 0; i < uint8a.length; i++) {
	        hex += hexes[uint8a[i]];
	    }
	    return hex;
	}
	function numTo32bStr(num) {
	    if (num > POW_2_256)
	        throw new Error('Expected number < 2^256');
	    return num.toString(16).padStart(64, '0');
	}
	function numTo32b(num) {
	    return hexToBytes(numTo32bStr(num));
	}
	function numberToHexUnpadded(num) {
	    const hex = num.toString(16);
	    return hex.length & 1 ? `0${hex}` : hex;
	}
	function hexToNumber(hex) {
	    if (typeof hex !== 'string') {
	        throw new TypeError('hexToNumber: expected string, got ' + typeof hex);
	    }
	    return BigInt(`0x${hex}`);
	}
	function hexToBytes(hex) {
	    if (typeof hex !== 'string') {
	        throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
	    }
	    if (hex.length % 2)
	        throw new Error('hexToBytes: received invalid unpadded hex' + hex.length);
	    const array = new Uint8Array(hex.length / 2);
	    for (let i = 0; i < array.length; i++) {
	        const j = i * 2;
	        const hexByte = hex.slice(j, j + 2);
	        const byte = Number.parseInt(hexByte, 16);
	        if (Number.isNaN(byte) || byte < 0)
	            throw new Error('Invalid byte sequence');
	        array[i] = byte;
	    }
	    return array;
	}
	function bytesToNumber(bytes) {
	    return hexToNumber(bytesToHex(bytes));
	}
	function ensureBytes(hex) {
	    return hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes(hex);
	}
	function normalizeScalar(num) {
	    if (typeof num === 'number' && Number.isSafeInteger(num) && num > 0)
	        return BigInt(num);
	    if (typeof num === 'bigint' && isWithinCurveOrder(num))
	        return num;
	    throw new TypeError('Expected valid private scalar: 0 < scalar < curve.n');
	}
	function mod(a, b = CURVE.P) {
	    const result = a % b;
	    return result >= _0n ? result : b + result;
	}
	function pow2(x, power) {
	    const { P } = CURVE;
	    let res = x;
	    while (power-- > _0n) {
	        res *= res;
	        res %= P;
	    }
	    return res;
	}
	function sqrtMod(x) {
	    const { P } = CURVE;
	    const _6n = BigInt(6);
	    const _11n = BigInt(11);
	    const _22n = BigInt(22);
	    const _23n = BigInt(23);
	    const _44n = BigInt(44);
	    const _88n = BigInt(88);
	    const b2 = (x * x * x) % P;
	    const b3 = (b2 * b2 * x) % P;
	    const b6 = (pow2(b3, _3n) * b3) % P;
	    const b9 = (pow2(b6, _3n) * b3) % P;
	    const b11 = (pow2(b9, _2n) * b2) % P;
	    const b22 = (pow2(b11, _11n) * b11) % P;
	    const b44 = (pow2(b22, _22n) * b22) % P;
	    const b88 = (pow2(b44, _44n) * b44) % P;
	    const b176 = (pow2(b88, _88n) * b88) % P;
	    const b220 = (pow2(b176, _44n) * b44) % P;
	    const b223 = (pow2(b220, _3n) * b3) % P;
	    const t1 = (pow2(b223, _23n) * b22) % P;
	    const t2 = (pow2(t1, _6n) * b2) % P;
	    return pow2(t2, _2n);
	}
	function invert(number, modulo = CURVE.P) {
	    if (number === _0n || modulo <= _0n) {
	        throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
	    }
	    let a = mod(number, modulo);
	    let b = modulo;
	    let x = _0n, u = _1n;
	    while (a !== _0n) {
	        const q = b / a;
	        const r = b % a;
	        const m = x - u * q;
	        b = a, a = r, x = u, u = m;
	    }
	    const gcd = b;
	    if (gcd !== _1n)
	        throw new Error('invert: does not exist');
	    return mod(x, modulo);
	}
	function invertBatch(nums, p = CURVE.P) {
	    const scratch = new Array(nums.length);
	    const lastMultiplied = nums.reduce((acc, num, i) => {
	        if (num === _0n)
	            return acc;
	        scratch[i] = acc;
	        return mod(acc * num, p);
	    }, _1n);
	    const inverted = invert(lastMultiplied, p);
	    nums.reduceRight((acc, num, i) => {
	        if (num === _0n)
	            return acc;
	        scratch[i] = mod(acc * scratch[i], p);
	        return mod(acc * num, p);
	    }, inverted);
	    return scratch;
	}
	const divNearest = (a, b) => (a + b / _2n) / b;
	const POW_2_128 = _2n ** BigInt(128);
	function splitScalarEndo(k) {
	    const { n } = CURVE;
	    const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15');
	    const b1 = -_1n * BigInt('0xe4437ed6010e88286f547fa90abfe4c3');
	    const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8');
	    const b2 = a1;
	    const c1 = divNearest(b2 * k, n);
	    const c2 = divNearest(-b1 * k, n);
	    let k1 = mod(k - c1 * a1 - c2 * a2, n);
	    let k2 = mod(-c1 * b1 - c2 * b2, n);
	    const k1neg = k1 > POW_2_128;
	    const k2neg = k2 > POW_2_128;
	    if (k1neg)
	        k1 = n - k1;
	    if (k2neg)
	        k2 = n - k2;
	    if (k1 > POW_2_128 || k2 > POW_2_128) {
	        throw new Error('splitScalarEndo: Endomorphism failed, k=' + k);
	    }
	    return { k1neg, k1, k2neg, k2 };
	}
	function truncateHash(hash) {
	    const { n } = CURVE;
	    const byteLength = hash.length;
	    const delta = byteLength * 8 - 256;
	    let h = bytesToNumber(hash);
	    if (delta > 0)
	        h = h >> BigInt(delta);
	    if (h >= n)
	        h -= n;
	    return h;
	}
	class HmacDrbg {
	    constructor() {
	        this.v = new Uint8Array(32).fill(1);
	        this.k = new Uint8Array(32).fill(0);
	        this.counter = 0;
	    }
	    hmac(...values) {
	        return utils.hmacSha256(this.k, ...values);
	    }
	    hmacSync(...values) {
	        if (typeof utils.hmacSha256Sync !== 'function')
	            throw new Error('utils.hmacSha256Sync is undefined, you need to set it');
	        const res = utils.hmacSha256Sync(this.k, ...values);
	        if (res instanceof Promise)
	            throw new Error('To use sync sign(), ensure utils.hmacSha256 is sync');
	        return res;
	    }
	    incr() {
	        if (this.counter >= 1000) {
	            throw new Error('Tried 1,000 k values for sign(), all were invalid');
	        }
	        this.counter += 1;
	    }
	    async reseed(seed = new Uint8Array()) {
	        this.k = await this.hmac(this.v, Uint8Array.from([0x00]), seed);
	        this.v = await this.hmac(this.v);
	        if (seed.length === 0)
	            return;
	        this.k = await this.hmac(this.v, Uint8Array.from([0x01]), seed);
	        this.v = await this.hmac(this.v);
	    }
	    reseedSync(seed = new Uint8Array()) {
	        this.k = this.hmacSync(this.v, Uint8Array.from([0x00]), seed);
	        this.v = this.hmacSync(this.v);
	        if (seed.length === 0)
	            return;
	        this.k = this.hmacSync(this.v, Uint8Array.from([0x01]), seed);
	        this.v = this.hmacSync(this.v);
	    }
	    async generate() {
	        this.incr();
	        this.v = await this.hmac(this.v);
	        return this.v;
	    }
	    generateSync() {
	        this.incr();
	        this.v = this.hmacSync(this.v);
	        return this.v;
	    }
	}
	function isWithinCurveOrder(num) {
	    return _0n < num && num < CURVE.n;
	}
	function isValidFieldElement(num) {
	    return _0n < num && num < CURVE.P;
	}
	function kmdToSig(kBytes, m, d) {
	    const k = bytesToNumber(kBytes);
	    if (!isWithinCurveOrder(k))
	        return;
	    const { n } = CURVE;
	    const q = Point.BASE.multiply(k);
	    const r = mod(q.x, n);
	    if (r === _0n)
	        return;
	    const s = mod(invert(k, n) * mod(m + d * r, n), n);
	    if (s === _0n)
	        return;
	    const sig = new Signature(r, s);
	    const recovery = (q.x === sig.r ? 0 : 2) | Number(q.y & _1n);
	    return { sig, recovery };
	}
	function normalizePrivateKey(key) {
	    let num;
	    if (typeof key === 'bigint') {
	        num = key;
	    }
	    else if (typeof key === 'number' && Number.isSafeInteger(key) && key > 0) {
	        num = BigInt(key);
	    }
	    else if (typeof key === 'string') {
	        if (key.length !== 64)
	            throw new Error('Expected 32 bytes of private key');
	        num = hexToNumber(key);
	    }
	    else if (isUint8a(key)) {
	        if (key.length !== 32)
	            throw new Error('Expected 32 bytes of private key');
	        num = bytesToNumber(key);
	    }
	    else {
	        throw new TypeError('Expected valid private key');
	    }
	    if (!isWithinCurveOrder(num))
	        throw new Error('Expected private key: 0 < key < n');
	    return num;
	}
	function normalizeSignature(signature) {
	    if (signature instanceof Signature) {
	        signature.assertValidity();
	        return signature;
	    }
	    try {
	        return Signature.fromDER(signature);
	    }
	    catch (error) {
	        return Signature.fromCompact(signature);
	    }
	}
	function getPublicKey(privateKey, isCompressed = false) {
	    return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
	}
	function bits2int(bytes) {
	    const slice = bytes.length > 32 ? bytes.slice(0, 32) : bytes;
	    return bytesToNumber(slice);
	}
	function bits2octets(bytes) {
	    const z1 = bits2int(bytes);
	    const z2 = mod(z1, CURVE.n);
	    return int2octets(z2 < _0n ? z1 : z2);
	}
	function int2octets(num) {
	    if (typeof num !== 'bigint')
	        throw new Error('Expected bigint');
	    const hex = numTo32bStr(num);
	    return hexToBytes(hex);
	}
	function initSigArgs(msgHash, privateKey, extraEntropy) {
	    if (msgHash == null)
	        throw new Error(`sign: expected valid message hash, not "${msgHash}"`);
	    const h1 = ensureBytes(msgHash);
	    const d = normalizePrivateKey(privateKey);
	    const seedArgs = [int2octets(d), bits2octets(h1)];
	    if (extraEntropy != null) {
	        if (extraEntropy === true)
	            extraEntropy = utils.randomBytes(32);
	        const e = ensureBytes(extraEntropy);
	        if (e.length !== 32)
	            throw new Error('sign: Expected 32 bytes of extra data');
	        seedArgs.push(e);
	    }
	    const seed = concatBytes(...seedArgs);
	    const m = bits2int(h1);
	    return { seed, m, d };
	}
	function finalizeSig(recSig, opts) {
	    let { sig, recovery } = recSig;
	    const { canonical, der, recovered } = Object.assign({ canonical: true, der: true }, opts);
	    if (canonical && sig.hasHighS()) {
	        sig = sig.normalizeS();
	        recovery ^= 1;
	    }
	    const hashed = der ? sig.toDERRawBytes() : sig.toCompactRawBytes();
	    return recovered ? [hashed, recovery] : hashed;
	}
	function signSync(msgHash, privKey, opts = {}) {
	    const { seed, m, d } = initSigArgs(msgHash, privKey, opts.extraEntropy);
	    let sig;
	    const drbg = new HmacDrbg();
	    drbg.reseedSync(seed);
	    while (!(sig = kmdToSig(drbg.generateSync(), m, d)))
	        drbg.reseedSync();
	    return finalizeSig(sig, opts);
	}
	Point.BASE._setWindowSize(8);
	const crypto$1 = {
	    node: nodeCrypto,
	    web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined,
	};
	const TAGGED_HASH_PREFIXES = {};
	const utils = {
	    isValidPrivateKey(privateKey) {
	        try {
	            normalizePrivateKey(privateKey);
	            return true;
	        }
	        catch (error) {
	            return false;
	        }
	    },
	    privateAdd: (privateKey, tweak) => {
	        const p = normalizePrivateKey(privateKey);
	        const t = normalizePrivateKey(tweak);
	        return numTo32b(mod(p + t, CURVE.n));
	    },
	    privateNegate: (privateKey) => {
	        const p = normalizePrivateKey(privateKey);
	        return numTo32b(CURVE.n - p);
	    },
	    pointAddScalar: (p, tweak, isCompressed) => {
	        const P = Point.fromHex(p);
	        const t = normalizePrivateKey(tweak);
	        const Q = Point.BASE.multiplyAndAddUnsafe(P, t, _1n);
	        if (!Q)
	            throw new Error('Tweaked point at infinity');
	        return Q.toRawBytes(isCompressed);
	    },
	    pointMultiply: (p, tweak, isCompressed) => {
	        const P = Point.fromHex(p);
	        const t = bytesToNumber(ensureBytes(tweak));
	        return P.multiply(t).toRawBytes(isCompressed);
	    },
	    hashToPrivateKey: (hash) => {
	        hash = ensureBytes(hash);
	        if (hash.length < 40 || hash.length > 1024)
	            throw new Error('Expected 40-1024 bytes of private key as per FIPS 186');
	        const num = mod(bytesToNumber(hash), CURVE.n - _1n) + _1n;
	        return numTo32b(num);
	    },
	    randomBytes: (bytesLength = 32) => {
	        if (crypto$1.web) {
	            return crypto$1.web.getRandomValues(new Uint8Array(bytesLength));
	        }
	        else if (crypto$1.node) {
	            const { randomBytes } = crypto$1.node;
	            return Uint8Array.from(randomBytes(bytesLength));
	        }
	        else {
	            throw new Error("The environment doesn't have randomBytes function");
	        }
	    },
	    randomPrivateKey: () => {
	        return utils.hashToPrivateKey(utils.randomBytes(40));
	    },
	    bytesToHex,
	    hexToBytes,
	    concatBytes,
	    mod,
	    invert,
	    sha256: async (...messages) => {
	        if (crypto$1.web) {
	            const buffer = await crypto$1.web.subtle.digest('SHA-256', concatBytes(...messages));
	            return new Uint8Array(buffer);
	        }
	        else if (crypto$1.node) {
	            const { createHash } = crypto$1.node;
	            const hash = createHash('sha256');
	            messages.forEach((m) => hash.update(m));
	            return Uint8Array.from(hash.digest());
	        }
	        else {
	            throw new Error("The environment doesn't have sha256 function");
	        }
	    },
	    hmacSha256: async (key, ...messages) => {
	        if (crypto$1.web) {
	            const ckey = await crypto$1.web.subtle.importKey('raw', key, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign']);
	            const message = concatBytes(...messages);
	            const buffer = await crypto$1.web.subtle.sign('HMAC', ckey, message);
	            return new Uint8Array(buffer);
	        }
	        else if (crypto$1.node) {
	            const { createHmac } = crypto$1.node;
	            const hash = createHmac('sha256', key);
	            messages.forEach((m) => hash.update(m));
	            return Uint8Array.from(hash.digest());
	        }
	        else {
	            throw new Error("The environment doesn't have hmac-sha256 function");
	        }
	    },
	    sha256Sync: undefined,
	    hmacSha256Sync: undefined,
	    taggedHash: async (tag, ...messages) => {
	        let tagP = TAGGED_HASH_PREFIXES[tag];
	        if (tagP === undefined) {
	            const tagH = await utils.sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
	            tagP = concatBytes(tagH, tagH);
	            TAGGED_HASH_PREFIXES[tag] = tagP;
	        }
	        return utils.sha256(tagP, ...messages);
	    },
	    taggedHashSync: (tag, ...messages) => {
	        if (typeof utils.sha256Sync !== 'function')
	            throw new Error('utils.sha256Sync is undefined, you need to set it');
	        let tagP = TAGGED_HASH_PREFIXES[tag];
	        if (tagP === undefined) {
	            const tagH = utils.sha256Sync(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
	            tagP = concatBytes(tagH, tagH);
	            TAGGED_HASH_PREFIXES[tag] = tagP;
	        }
	        return utils.sha256Sync(tagP, ...messages);
	    },
	    precompute(windowSize = 8, point = Point.BASE) {
	        const cached = point === Point.BASE ? point : new Point(point.x, point.y);
	        cached._setWindowSize(windowSize);
	        cached.multiply(_3n);
	        return cached;
	    },
	};

	// library interoperable with the synchronous APIs in web3.js.

	utils.hmacSha256Sync = (key, ...msgs) => {
	  const h = hmac.create(sha256, key);
	  msgs.forEach(msg => h.update(msg));
	  return h.digest();
	};

	const ecdsaSign = (msgHash, privKey) => signSync(msgHash, privKey, {
	  der: false,
	  recovered: true
	});
	utils.isValidPrivateKey;
	const publicKeyCreate = getPublicKey;

	const PRIVATE_KEY_BYTES = 32;
	const ETHEREUM_ADDRESS_BYTES = 20;
	const PUBLIC_KEY_BYTES = 64;
	const SIGNATURE_OFFSETS_SERIALIZED_SIZE = 11;
	/**
	 * Params for creating an secp256k1 instruction using a public key
	 */

	const SECP256K1_INSTRUCTION_LAYOUT = struct([u8('numSignatures'), u16('signatureOffset'), u8('signatureInstructionIndex'), u16('ethAddressOffset'), u8('ethAddressInstructionIndex'), u16('messageDataOffset'), u16('messageDataSize'), u8('messageInstructionIndex'), blob(20, 'ethAddress'), blob(64, 'signature'), u8('recoveryId')]);
	class Secp256k1Program {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Public key that identifies the secp256k1 program
	   */


	  /**
	   * Construct an Ethereum address from a secp256k1 public key buffer.
	   * @param {Buffer} publicKey a 64 byte secp256k1 public key buffer
	   */
	  static publicKeyToEthAddress(publicKey) {
	    assert$1(publicKey.length === PUBLIC_KEY_BYTES, `Public key must be ${PUBLIC_KEY_BYTES} bytes but received ${publicKey.length} bytes`);

	    try {
	      return buffer.Buffer.from(keccak_256(toBuffer(publicKey))).slice(-ETHEREUM_ADDRESS_BYTES);
	    } catch (error) {
	      throw new Error(`Error constructing Ethereum address: ${error}`);
	    }
	  }
	  /**
	   * Create an secp256k1 instruction with a public key. The public key
	   * must be a buffer that is 64 bytes long.
	   */


	  static createInstructionWithPublicKey(params) {
	    const {
	      publicKey,
	      message,
	      signature,
	      recoveryId,
	      instructionIndex
	    } = params;
	    return Secp256k1Program.createInstructionWithEthAddress({
	      ethAddress: Secp256k1Program.publicKeyToEthAddress(publicKey),
	      message,
	      signature,
	      recoveryId,
	      instructionIndex
	    });
	  }
	  /**
	   * Create an secp256k1 instruction with an Ethereum address. The address
	   * must be a hex string or a buffer that is 20 bytes long.
	   */


	  static createInstructionWithEthAddress(params) {
	    const {
	      ethAddress: rawAddress,
	      message,
	      signature,
	      recoveryId,
	      instructionIndex = 0
	    } = params;
	    let ethAddress;

	    if (typeof rawAddress === 'string') {
	      if (rawAddress.startsWith('0x')) {
	        ethAddress = buffer.Buffer.from(rawAddress.substr(2), 'hex');
	      } else {
	        ethAddress = buffer.Buffer.from(rawAddress, 'hex');
	      }
	    } else {
	      ethAddress = rawAddress;
	    }

	    assert$1(ethAddress.length === ETHEREUM_ADDRESS_BYTES, `Address must be ${ETHEREUM_ADDRESS_BYTES} bytes but received ${ethAddress.length} bytes`);
	    const dataStart = 1 + SIGNATURE_OFFSETS_SERIALIZED_SIZE;
	    const ethAddressOffset = dataStart;
	    const signatureOffset = dataStart + ethAddress.length;
	    const messageDataOffset = signatureOffset + signature.length + 1;
	    const numSignatures = 1;
	    const instructionData = buffer.Buffer.alloc(SECP256K1_INSTRUCTION_LAYOUT.span + message.length);
	    SECP256K1_INSTRUCTION_LAYOUT.encode({
	      numSignatures,
	      signatureOffset,
	      signatureInstructionIndex: instructionIndex,
	      ethAddressOffset,
	      ethAddressInstructionIndex: instructionIndex,
	      messageDataOffset,
	      messageDataSize: message.length,
	      messageInstructionIndex: instructionIndex,
	      signature: toBuffer(signature),
	      ethAddress: toBuffer(ethAddress),
	      recoveryId
	    }, instructionData);
	    instructionData.fill(toBuffer(message), SECP256K1_INSTRUCTION_LAYOUT.span);
	    return new TransactionInstruction({
	      keys: [],
	      programId: Secp256k1Program.programId,
	      data: instructionData
	    });
	  }
	  /**
	   * Create an secp256k1 instruction with a private key. The private key
	   * must be a buffer that is 32 bytes long.
	   */


	  static createInstructionWithPrivateKey(params) {
	    const {
	      privateKey: pkey,
	      message,
	      instructionIndex
	    } = params;
	    assert$1(pkey.length === PRIVATE_KEY_BYTES, `Private key must be ${PRIVATE_KEY_BYTES} bytes but received ${pkey.length} bytes`);

	    try {
	      const privateKey = toBuffer(pkey);
	      const publicKey = publicKeyCreate(privateKey, false
	      /* isCompressed */
	      ).slice(1); // throw away leading byte

	      const messageHash = buffer.Buffer.from(keccak_256(toBuffer(message)));
	      const [signature, recoveryId] = ecdsaSign(messageHash, privateKey);
	      return this.createInstructionWithPublicKey({
	        publicKey,
	        message,
	        signature,
	        recoveryId,
	        instructionIndex
	      });
	    } catch (error) {
	      throw new Error(`Error creating instruction; ${error}`);
	    }
	  }

	}
	Secp256k1Program.programId = new PublicKey('KeccakSecp256k11111111111111111111111111111');

	/**
	 * Address of the stake config account which configures the rate
	 * of stake warmup and cooldown as well as the slashing penalty.
	 */

	const STAKE_CONFIG_ID = new PublicKey('StakeConfig11111111111111111111111111111111');
	/**
	 * Stake account authority info
	 */

	class Authorized {
	  /** stake authority */

	  /** withdraw authority */

	  /**
	   * Create a new Authorized object
	   * @param staker the stake authority
	   * @param withdrawer the withdraw authority
	   */
	  constructor(staker, withdrawer) {
	    this.staker = void 0;
	    this.withdrawer = void 0;
	    this.staker = staker;
	    this.withdrawer = withdrawer;
	  }

	}

	/**
	 * Stake account lockup info
	 */
	class Lockup {
	  /** Unix timestamp of lockup expiration */

	  /** Epoch of lockup expiration */

	  /** Lockup custodian authority */

	  /**
	   * Create a new Lockup object
	   */
	  constructor(unixTimestamp, epoch, custodian) {
	    this.unixTimestamp = void 0;
	    this.epoch = void 0;
	    this.custodian = void 0;
	    this.unixTimestamp = unixTimestamp;
	    this.epoch = epoch;
	    this.custodian = custodian;
	  }
	  /**
	   * Default, inactive Lockup value
	   */


	}
	Lockup.default = new Lockup(0, 0, PublicKey.default);

	/**
	 * Stake Instruction class
	 */
	class StakeInstruction {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Decode a stake instruction and retrieve the instruction type.
	   */


	  static decodeInstructionType(instruction) {
	    this.checkProgramId(instruction.programId);
	    const instructionTypeLayout = u32('instruction');
	    const typeIndex = instructionTypeLayout.decode(instruction.data);
	    let type;

	    for (const [ixType, layout] of Object.entries(STAKE_INSTRUCTION_LAYOUTS)) {
	      if (layout.index == typeIndex) {
	        type = ixType;
	        break;
	      }
	    }

	    if (!type) {
	      throw new Error('Instruction type incorrect; not a StakeInstruction');
	    }

	    return type;
	  }
	  /**
	   * Decode a initialize stake instruction and retrieve the instruction params.
	   */


	  static decodeInitialize(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 2);
	    const {
	      authorized,
	      lockup
	    } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Initialize, instruction.data);
	    return {
	      stakePubkey: instruction.keys[0].pubkey,
	      authorized: new Authorized(new PublicKey(authorized.staker), new PublicKey(authorized.withdrawer)),
	      lockup: new Lockup(lockup.unixTimestamp, lockup.epoch, new PublicKey(lockup.custodian))
	    };
	  }
	  /**
	   * Decode a delegate stake instruction and retrieve the instruction params.
	   */


	  static decodeDelegate(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 6);
	    decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Delegate, instruction.data);
	    return {
	      stakePubkey: instruction.keys[0].pubkey,
	      votePubkey: instruction.keys[1].pubkey,
	      authorizedPubkey: instruction.keys[5].pubkey
	    };
	  }
	  /**
	   * Decode an authorize stake instruction and retrieve the instruction params.
	   */


	  static decodeAuthorize(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    const {
	      newAuthorized,
	      stakeAuthorizationType
	    } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Authorize, instruction.data);
	    const o = {
	      stakePubkey: instruction.keys[0].pubkey,
	      authorizedPubkey: instruction.keys[2].pubkey,
	      newAuthorizedPubkey: new PublicKey(newAuthorized),
	      stakeAuthorizationType: {
	        index: stakeAuthorizationType
	      }
	    };

	    if (instruction.keys.length > 3) {
	      o.custodianPubkey = instruction.keys[3].pubkey;
	    }

	    return o;
	  }
	  /**
	   * Decode an authorize-with-seed stake instruction and retrieve the instruction params.
	   */


	  static decodeAuthorizeWithSeed(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 2);
	    const {
	      newAuthorized,
	      stakeAuthorizationType,
	      authoritySeed,
	      authorityOwner
	    } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed, instruction.data);
	    const o = {
	      stakePubkey: instruction.keys[0].pubkey,
	      authorityBase: instruction.keys[1].pubkey,
	      authoritySeed: authoritySeed,
	      authorityOwner: new PublicKey(authorityOwner),
	      newAuthorizedPubkey: new PublicKey(newAuthorized),
	      stakeAuthorizationType: {
	        index: stakeAuthorizationType
	      }
	    };

	    if (instruction.keys.length > 3) {
	      o.custodianPubkey = instruction.keys[3].pubkey;
	    }

	    return o;
	  }
	  /**
	   * Decode a split stake instruction and retrieve the instruction params.
	   */


	  static decodeSplit(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    const {
	      lamports
	    } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Split, instruction.data);
	    return {
	      stakePubkey: instruction.keys[0].pubkey,
	      splitStakePubkey: instruction.keys[1].pubkey,
	      authorizedPubkey: instruction.keys[2].pubkey,
	      lamports
	    };
	  }
	  /**
	   * Decode a merge stake instruction and retrieve the instruction params.
	   */


	  static decodeMerge(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Merge, instruction.data);
	    return {
	      stakePubkey: instruction.keys[0].pubkey,
	      sourceStakePubKey: instruction.keys[1].pubkey,
	      authorizedPubkey: instruction.keys[4].pubkey
	    };
	  }
	  /**
	   * Decode a withdraw stake instruction and retrieve the instruction params.
	   */


	  static decodeWithdraw(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 5);
	    const {
	      lamports
	    } = decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Withdraw, instruction.data);
	    const o = {
	      stakePubkey: instruction.keys[0].pubkey,
	      toPubkey: instruction.keys[1].pubkey,
	      authorizedPubkey: instruction.keys[4].pubkey,
	      lamports
	    };

	    if (instruction.keys.length > 5) {
	      o.custodianPubkey = instruction.keys[5].pubkey;
	    }

	    return o;
	  }
	  /**
	   * Decode a deactivate stake instruction and retrieve the instruction params.
	   */


	  static decodeDeactivate(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    decodeData$1(STAKE_INSTRUCTION_LAYOUTS.Deactivate, instruction.data);
	    return {
	      stakePubkey: instruction.keys[0].pubkey,
	      authorizedPubkey: instruction.keys[2].pubkey
	    };
	  }
	  /**
	   * @internal
	   */


	  static checkProgramId(programId) {
	    if (!programId.equals(StakeProgram.programId)) {
	      throw new Error('invalid instruction; programId is not StakeProgram');
	    }
	  }
	  /**
	   * @internal
	   */


	  static checkKeyLength(keys, expectedLength) {
	    if (keys.length < expectedLength) {
	      throw new Error(`invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`);
	    }
	  }

	}
	/**
	 * An enumeration of valid StakeInstructionType's
	 */

	/**
	 * An enumeration of valid stake InstructionType's
	 * @internal
	 */
	const STAKE_INSTRUCTION_LAYOUTS = Object.freeze({
	  Initialize: {
	    index: 0,
	    layout: struct([u32('instruction'), authorized(), lockup()])
	  },
	  Authorize: {
	    index: 1,
	    layout: struct([u32('instruction'), publicKey('newAuthorized'), u32('stakeAuthorizationType')])
	  },
	  Delegate: {
	    index: 2,
	    layout: struct([u32('instruction')])
	  },
	  Split: {
	    index: 3,
	    layout: struct([u32('instruction'), ns64('lamports')])
	  },
	  Withdraw: {
	    index: 4,
	    layout: struct([u32('instruction'), ns64('lamports')])
	  },
	  Deactivate: {
	    index: 5,
	    layout: struct([u32('instruction')])
	  },
	  Merge: {
	    index: 7,
	    layout: struct([u32('instruction')])
	  },
	  AuthorizeWithSeed: {
	    index: 8,
	    layout: struct([u32('instruction'), publicKey('newAuthorized'), u32('stakeAuthorizationType'), rustString('authoritySeed'), publicKey('authorityOwner')])
	  }
	});
	/**
	 * Stake authorization type
	 */

	/**
	 * An enumeration of valid StakeAuthorizationLayout's
	 */
	const StakeAuthorizationLayout = Object.freeze({
	  Staker: {
	    index: 0
	  },
	  Withdrawer: {
	    index: 1
	  }
	});
	/**
	 * Factory class for transactions to interact with the Stake program
	 */

	class StakeProgram {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Public key that identifies the Stake program
	   */


	  /**
	   * Generate an Initialize instruction to add to a Stake Create transaction
	   */
	  static initialize(params) {
	    const {
	      stakePubkey,
	      authorized,
	      lockup: maybeLockup
	    } = params;
	    const lockup = maybeLockup || Lockup.default;
	    const type = STAKE_INSTRUCTION_LAYOUTS.Initialize;
	    const data = encodeData(type, {
	      authorized: {
	        staker: toBuffer(authorized.staker.toBuffer()),
	        withdrawer: toBuffer(authorized.withdrawer.toBuffer())
	      },
	      lockup: {
	        unixTimestamp: lockup.unixTimestamp,
	        epoch: lockup.epoch,
	        custodian: toBuffer(lockup.custodian.toBuffer())
	      }
	    });
	    const instructionData = {
	      keys: [{
	        pubkey: stakePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: SYSVAR_RENT_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    };
	    return new TransactionInstruction(instructionData);
	  }
	  /**
	   * Generate a Transaction that creates a new Stake account at
	   *   an address generated with `from`, a seed, and the Stake programId
	   */


	  static createAccountWithSeed(params) {
	    const transaction = new Transaction();
	    transaction.add(SystemProgram.createAccountWithSeed({
	      fromPubkey: params.fromPubkey,
	      newAccountPubkey: params.stakePubkey,
	      basePubkey: params.basePubkey,
	      seed: params.seed,
	      lamports: params.lamports,
	      space: this.space,
	      programId: this.programId
	    }));
	    const {
	      stakePubkey,
	      authorized,
	      lockup
	    } = params;
	    return transaction.add(this.initialize({
	      stakePubkey,
	      authorized,
	      lockup
	    }));
	  }
	  /**
	   * Generate a Transaction that creates a new Stake account
	   */


	  static createAccount(params) {
	    const transaction = new Transaction();
	    transaction.add(SystemProgram.createAccount({
	      fromPubkey: params.fromPubkey,
	      newAccountPubkey: params.stakePubkey,
	      lamports: params.lamports,
	      space: this.space,
	      programId: this.programId
	    }));
	    const {
	      stakePubkey,
	      authorized,
	      lockup
	    } = params;
	    return transaction.add(this.initialize({
	      stakePubkey,
	      authorized,
	      lockup
	    }));
	  }
	  /**
	   * Generate a Transaction that delegates Stake tokens to a validator
	   * Vote PublicKey. This transaction can also be used to redelegate Stake
	   * to a new validator Vote PublicKey.
	   */


	  static delegate(params) {
	    const {
	      stakePubkey,
	      authorizedPubkey,
	      votePubkey
	    } = params;
	    const type = STAKE_INSTRUCTION_LAYOUTS.Delegate;
	    const data = encodeData(type);
	    return new Transaction().add({
	      keys: [{
	        pubkey: stakePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: votePubkey,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: SYSVAR_CLOCK_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: STAKE_CONFIG_ID,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: authorizedPubkey,
	        isSigner: true,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a Transaction that authorizes a new PublicKey as Staker
	   * or Withdrawer on the Stake account.
	   */


	  static authorize(params) {
	    const {
	      stakePubkey,
	      authorizedPubkey,
	      newAuthorizedPubkey,
	      stakeAuthorizationType,
	      custodianPubkey
	    } = params;
	    const type = STAKE_INSTRUCTION_LAYOUTS.Authorize;
	    const data = encodeData(type, {
	      newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
	      stakeAuthorizationType: stakeAuthorizationType.index
	    });
	    const keys = [{
	      pubkey: stakePubkey,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: SYSVAR_CLOCK_PUBKEY,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: authorizedPubkey,
	      isSigner: true,
	      isWritable: false
	    }];

	    if (custodianPubkey) {
	      keys.push({
	        pubkey: custodianPubkey,
	        isSigner: false,
	        isWritable: false
	      });
	    }

	    return new Transaction().add({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a Transaction that authorizes a new PublicKey as Staker
	   * or Withdrawer on the Stake account.
	   */


	  static authorizeWithSeed(params) {
	    const {
	      stakePubkey,
	      authorityBase,
	      authoritySeed,
	      authorityOwner,
	      newAuthorizedPubkey,
	      stakeAuthorizationType,
	      custodianPubkey
	    } = params;
	    const type = STAKE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed;
	    const data = encodeData(type, {
	      newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
	      stakeAuthorizationType: stakeAuthorizationType.index,
	      authoritySeed: authoritySeed,
	      authorityOwner: toBuffer(authorityOwner.toBuffer())
	    });
	    const keys = [{
	      pubkey: stakePubkey,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: authorityBase,
	      isSigner: true,
	      isWritable: false
	    }, {
	      pubkey: SYSVAR_CLOCK_PUBKEY,
	      isSigner: false,
	      isWritable: false
	    }];

	    if (custodianPubkey) {
	      keys.push({
	        pubkey: custodianPubkey,
	        isSigner: false,
	        isWritable: false
	      });
	    }

	    return new Transaction().add({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * @internal
	   */


	  static splitInstruction(params) {
	    const {
	      stakePubkey,
	      authorizedPubkey,
	      splitStakePubkey,
	      lamports
	    } = params;
	    const type = STAKE_INSTRUCTION_LAYOUTS.Split;
	    const data = encodeData(type, {
	      lamports
	    });
	    return new TransactionInstruction({
	      keys: [{
	        pubkey: stakePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: splitStakePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: authorizedPubkey,
	        isSigner: true,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a Transaction that splits Stake tokens into another stake account
	   */


	  static split(params) {
	    const transaction = new Transaction();
	    transaction.add(SystemProgram.createAccount({
	      fromPubkey: params.authorizedPubkey,
	      newAccountPubkey: params.splitStakePubkey,
	      lamports: 0,
	      space: this.space,
	      programId: this.programId
	    }));
	    return transaction.add(this.splitInstruction(params));
	  }
	  /**
	   * Generate a Transaction that splits Stake tokens into another account
	   * derived from a base public key and seed
	   */


	  static splitWithSeed(params) {
	    const {
	      stakePubkey,
	      authorizedPubkey,
	      splitStakePubkey,
	      basePubkey,
	      seed,
	      lamports
	    } = params;
	    const transaction = new Transaction();
	    transaction.add(SystemProgram.allocate({
	      accountPubkey: splitStakePubkey,
	      basePubkey,
	      seed,
	      space: this.space,
	      programId: this.programId
	    }));
	    return transaction.add(this.splitInstruction({
	      stakePubkey,
	      authorizedPubkey,
	      splitStakePubkey,
	      lamports
	    }));
	  }
	  /**
	   * Generate a Transaction that merges Stake accounts.
	   */


	  static merge(params) {
	    const {
	      stakePubkey,
	      sourceStakePubKey,
	      authorizedPubkey
	    } = params;
	    const type = STAKE_INSTRUCTION_LAYOUTS.Merge;
	    const data = encodeData(type);
	    return new Transaction().add({
	      keys: [{
	        pubkey: stakePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: sourceStakePubKey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: SYSVAR_CLOCK_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: authorizedPubkey,
	        isSigner: true,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a Transaction that withdraws deactivated Stake tokens.
	   */


	  static withdraw(params) {
	    const {
	      stakePubkey,
	      authorizedPubkey,
	      toPubkey,
	      lamports,
	      custodianPubkey
	    } = params;
	    const type = STAKE_INSTRUCTION_LAYOUTS.Withdraw;
	    const data = encodeData(type, {
	      lamports
	    });
	    const keys = [{
	      pubkey: stakePubkey,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: toPubkey,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: SYSVAR_CLOCK_PUBKEY,
	      isSigner: false,
	      isWritable: false
	    }, {
	      pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
	      isSigner: false,
	      isWritable: false
	    }, {
	      pubkey: authorizedPubkey,
	      isSigner: true,
	      isWritable: false
	    }];

	    if (custodianPubkey) {
	      keys.push({
	        pubkey: custodianPubkey,
	        isSigner: false,
	        isWritable: false
	      });
	    }

	    return new Transaction().add({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a Transaction that deactivates Stake tokens.
	   */


	  static deactivate(params) {
	    const {
	      stakePubkey,
	      authorizedPubkey
	    } = params;
	    const type = STAKE_INSTRUCTION_LAYOUTS.Deactivate;
	    const data = encodeData(type);
	    return new Transaction().add({
	      keys: [{
	        pubkey: stakePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: SYSVAR_CLOCK_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: authorizedPubkey,
	        isSigner: true,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    });
	  }

	}
	StakeProgram.programId = new PublicKey('Stake11111111111111111111111111111111111111');
	StakeProgram.space = 200;

	/**
	 * Vote account info
	 */

	class VoteInit {
	  /** [0, 100] */
	  constructor(nodePubkey, authorizedVoter, authorizedWithdrawer, commission) {
	    this.nodePubkey = void 0;
	    this.authorizedVoter = void 0;
	    this.authorizedWithdrawer = void 0;
	    this.commission = void 0;
	    this.nodePubkey = nodePubkey;
	    this.authorizedVoter = authorizedVoter;
	    this.authorizedWithdrawer = authorizedWithdrawer;
	    this.commission = commission;
	  }

	}
	/**
	 * Create vote account transaction params
	 */

	/**
	 * Vote Instruction class
	 */
	class VoteInstruction {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Decode a vote instruction and retrieve the instruction type.
	   */


	  static decodeInstructionType(instruction) {
	    this.checkProgramId(instruction.programId);
	    const instructionTypeLayout = u32('instruction');
	    const typeIndex = instructionTypeLayout.decode(instruction.data);
	    let type;

	    for (const [ixType, layout] of Object.entries(VOTE_INSTRUCTION_LAYOUTS)) {
	      if (layout.index == typeIndex) {
	        type = ixType;
	        break;
	      }
	    }

	    if (!type) {
	      throw new Error('Instruction type incorrect; not a VoteInstruction');
	    }

	    return type;
	  }
	  /**
	   * Decode an initialize vote instruction and retrieve the instruction params.
	   */


	  static decodeInitializeAccount(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 4);
	    const {
	      voteInit
	    } = decodeData$1(VOTE_INSTRUCTION_LAYOUTS.InitializeAccount, instruction.data);
	    return {
	      votePubkey: instruction.keys[0].pubkey,
	      nodePubkey: instruction.keys[3].pubkey,
	      voteInit: new VoteInit(new PublicKey(voteInit.nodePubkey), new PublicKey(voteInit.authorizedVoter), new PublicKey(voteInit.authorizedWithdrawer), voteInit.commission)
	    };
	  }
	  /**
	   * Decode an authorize instruction and retrieve the instruction params.
	   */


	  static decodeAuthorize(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    const {
	      newAuthorized,
	      voteAuthorizationType
	    } = decodeData$1(VOTE_INSTRUCTION_LAYOUTS.Authorize, instruction.data);
	    return {
	      votePubkey: instruction.keys[0].pubkey,
	      authorizedPubkey: instruction.keys[2].pubkey,
	      newAuthorizedPubkey: new PublicKey(newAuthorized),
	      voteAuthorizationType: {
	        index: voteAuthorizationType
	      }
	    };
	  }
	  /**
	   * Decode an authorize instruction and retrieve the instruction params.
	   */


	  static decodeAuthorizeWithSeed(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    const {
	      voteAuthorizeWithSeedArgs: {
	        currentAuthorityDerivedKeyOwnerPubkey,
	        currentAuthorityDerivedKeySeed,
	        newAuthorized,
	        voteAuthorizationType
	      }
	    } = decodeData$1(VOTE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed, instruction.data);
	    return {
	      currentAuthorityDerivedKeyBasePubkey: instruction.keys[2].pubkey,
	      currentAuthorityDerivedKeyOwnerPubkey: new PublicKey(currentAuthorityDerivedKeyOwnerPubkey),
	      currentAuthorityDerivedKeySeed: currentAuthorityDerivedKeySeed,
	      newAuthorizedPubkey: new PublicKey(newAuthorized),
	      voteAuthorizationType: {
	        index: voteAuthorizationType
	      },
	      votePubkey: instruction.keys[0].pubkey
	    };
	  }
	  /**
	   * Decode a withdraw instruction and retrieve the instruction params.
	   */


	  static decodeWithdraw(instruction) {
	    this.checkProgramId(instruction.programId);
	    this.checkKeyLength(instruction.keys, 3);
	    const {
	      lamports
	    } = decodeData$1(VOTE_INSTRUCTION_LAYOUTS.Withdraw, instruction.data);
	    return {
	      votePubkey: instruction.keys[0].pubkey,
	      authorizedWithdrawerPubkey: instruction.keys[2].pubkey,
	      lamports,
	      toPubkey: instruction.keys[1].pubkey
	    };
	  }
	  /**
	   * @internal
	   */


	  static checkProgramId(programId) {
	    if (!programId.equals(VoteProgram.programId)) {
	      throw new Error('invalid instruction; programId is not VoteProgram');
	    }
	  }
	  /**
	   * @internal
	   */


	  static checkKeyLength(keys, expectedLength) {
	    if (keys.length < expectedLength) {
	      throw new Error(`invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`);
	    }
	  }

	}
	/**
	 * An enumeration of valid VoteInstructionType's
	 */

	const VOTE_INSTRUCTION_LAYOUTS = Object.freeze({
	  InitializeAccount: {
	    index: 0,
	    layout: struct([u32('instruction'), voteInit()])
	  },
	  Authorize: {
	    index: 1,
	    layout: struct([u32('instruction'), publicKey('newAuthorized'), u32('voteAuthorizationType')])
	  },
	  Withdraw: {
	    index: 3,
	    layout: struct([u32('instruction'), ns64('lamports')])
	  },
	  AuthorizeWithSeed: {
	    index: 10,
	    layout: struct([u32('instruction'), voteAuthorizeWithSeedArgs()])
	  }
	});
	/**
	 * VoteAuthorize type
	 */

	/**
	 * An enumeration of valid VoteAuthorization layouts.
	 */
	const VoteAuthorizationLayout = Object.freeze({
	  Voter: {
	    index: 0
	  },
	  Withdrawer: {
	    index: 1
	  }
	});
	/**
	 * Factory class for transactions to interact with the Vote program
	 */

	class VoteProgram {
	  /**
	   * @internal
	   */
	  constructor() {}
	  /**
	   * Public key that identifies the Vote program
	   */


	  /**
	   * Generate an Initialize instruction.
	   */
	  static initializeAccount(params) {
	    const {
	      votePubkey,
	      nodePubkey,
	      voteInit
	    } = params;
	    const type = VOTE_INSTRUCTION_LAYOUTS.InitializeAccount;
	    const data = encodeData(type, {
	      voteInit: {
	        nodePubkey: toBuffer(voteInit.nodePubkey.toBuffer()),
	        authorizedVoter: toBuffer(voteInit.authorizedVoter.toBuffer()),
	        authorizedWithdrawer: toBuffer(voteInit.authorizedWithdrawer.toBuffer()),
	        commission: voteInit.commission
	      }
	    });
	    const instructionData = {
	      keys: [{
	        pubkey: votePubkey,
	        isSigner: false,
	        isWritable: true
	      }, {
	        pubkey: SYSVAR_RENT_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: SYSVAR_CLOCK_PUBKEY,
	        isSigner: false,
	        isWritable: false
	      }, {
	        pubkey: nodePubkey,
	        isSigner: true,
	        isWritable: false
	      }],
	      programId: this.programId,
	      data
	    };
	    return new TransactionInstruction(instructionData);
	  }
	  /**
	   * Generate a transaction that creates a new Vote account.
	   */


	  static createAccount(params) {
	    const transaction = new Transaction();
	    transaction.add(SystemProgram.createAccount({
	      fromPubkey: params.fromPubkey,
	      newAccountPubkey: params.votePubkey,
	      lamports: params.lamports,
	      space: this.space,
	      programId: this.programId
	    }));
	    return transaction.add(this.initializeAccount({
	      votePubkey: params.votePubkey,
	      nodePubkey: params.voteInit.nodePubkey,
	      voteInit: params.voteInit
	    }));
	  }
	  /**
	   * Generate a transaction that authorizes a new Voter or Withdrawer on the Vote account.
	   */


	  static authorize(params) {
	    const {
	      votePubkey,
	      authorizedPubkey,
	      newAuthorizedPubkey,
	      voteAuthorizationType
	    } = params;
	    const type = VOTE_INSTRUCTION_LAYOUTS.Authorize;
	    const data = encodeData(type, {
	      newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
	      voteAuthorizationType: voteAuthorizationType.index
	    });
	    const keys = [{
	      pubkey: votePubkey,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: SYSVAR_CLOCK_PUBKEY,
	      isSigner: false,
	      isWritable: false
	    }, {
	      pubkey: authorizedPubkey,
	      isSigner: true,
	      isWritable: false
	    }];
	    return new Transaction().add({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction that authorizes a new Voter or Withdrawer on the Vote account
	   * where the current Voter or Withdrawer authority is a derived key.
	   */


	  static authorizeWithSeed(params) {
	    const {
	      currentAuthorityDerivedKeyBasePubkey,
	      currentAuthorityDerivedKeyOwnerPubkey,
	      currentAuthorityDerivedKeySeed,
	      newAuthorizedPubkey,
	      voteAuthorizationType,
	      votePubkey
	    } = params;
	    const type = VOTE_INSTRUCTION_LAYOUTS.AuthorizeWithSeed;
	    const data = encodeData(type, {
	      voteAuthorizeWithSeedArgs: {
	        currentAuthorityDerivedKeyOwnerPubkey: toBuffer(currentAuthorityDerivedKeyOwnerPubkey.toBuffer()),
	        currentAuthorityDerivedKeySeed: currentAuthorityDerivedKeySeed,
	        newAuthorized: toBuffer(newAuthorizedPubkey.toBuffer()),
	        voteAuthorizationType: voteAuthorizationType.index
	      }
	    });
	    const keys = [{
	      pubkey: votePubkey,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: SYSVAR_CLOCK_PUBKEY,
	      isSigner: false,
	      isWritable: false
	    }, {
	      pubkey: currentAuthorityDerivedKeyBasePubkey,
	      isSigner: true,
	      isWritable: false
	    }];
	    return new Transaction().add({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction to withdraw from a Vote account.
	   */


	  static withdraw(params) {
	    const {
	      votePubkey,
	      authorizedWithdrawerPubkey,
	      lamports,
	      toPubkey
	    } = params;
	    const type = VOTE_INSTRUCTION_LAYOUTS.Withdraw;
	    const data = encodeData(type, {
	      lamports
	    });
	    const keys = [{
	      pubkey: votePubkey,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: toPubkey,
	      isSigner: false,
	      isWritable: true
	    }, {
	      pubkey: authorizedWithdrawerPubkey,
	      isSigner: true,
	      isWritable: false
	    }];
	    return new Transaction().add({
	      keys,
	      programId: this.programId,
	      data
	    });
	  }
	  /**
	   * Generate a transaction to withdraw safely from a Vote account.
	   *
	   * This function was created as a safeguard for vote accounts running validators, `safeWithdraw`
	   * checks that the withdraw amount will not exceed the specified balance while leaving enough left
	   * to cover rent. If you wish to close the vote account by withdrawing the full amount, call the
	   * `withdraw` method directly.
	   */


	  static safeWithdraw(params, currentVoteAccountBalance, rentExemptMinimum) {
	    if (params.lamports > currentVoteAccountBalance - rentExemptMinimum) {
	      throw new Error('Withdraw will leave vote account with insuffcient funds.');
	    }

	    return VoteProgram.withdraw(params);
	  }

	}
	VoteProgram.programId = new PublicKey('Vote111111111111111111111111111111111111111');
	VoteProgram.space = 3731;

	const VALIDATOR_INFO_KEY = new PublicKey('Va1idator1nfo111111111111111111111111111111');
	/**
	 * @internal
	 */

	const InfoString = type({
	  name: string(),
	  website: optional(string()),
	  details: optional(string()),
	  keybaseUsername: optional(string())
	});
	/**
	 * ValidatorInfo class
	 */

	class ValidatorInfo {
	  /**
	   * validator public key
	   */

	  /**
	   * validator information
	   */

	  /**
	   * Construct a valid ValidatorInfo
	   *
	   * @param key validator public key
	   * @param info validator information
	   */
	  constructor(key, info) {
	    this.key = void 0;
	    this.info = void 0;
	    this.key = key;
	    this.info = info;
	  }
	  /**
	   * Deserialize ValidatorInfo from the config account data. Exactly two config
	   * keys are required in the data.
	   *
	   * @param buffer config account data
	   * @return null if info was not found
	   */


	  static fromConfigData(buffer$1) {
	    let byteArray = [...buffer$1];
	    const configKeyCount = decodeLength(byteArray);
	    if (configKeyCount !== 2) return null;
	    const configKeys = [];

	    for (let i = 0; i < 2; i++) {
	      const publicKey = new PublicKey(byteArray.slice(0, PUBLIC_KEY_LENGTH));
	      byteArray = byteArray.slice(PUBLIC_KEY_LENGTH);
	      const isSigner = byteArray.slice(0, 1)[0] === 1;
	      byteArray = byteArray.slice(1);
	      configKeys.push({
	        publicKey,
	        isSigner
	      });
	    }

	    if (configKeys[0].publicKey.equals(VALIDATOR_INFO_KEY)) {
	      if (configKeys[1].isSigner) {
	        const rawInfo = rustString().decode(buffer.Buffer.from(byteArray));
	        const info = JSON.parse(rawInfo);
	        assert(info, InfoString);
	        return new ValidatorInfo(configKeys[1].publicKey, info);
	      }
	    }

	    return null;
	  }

	}

	const VOTE_PROGRAM_ID = new PublicKey('Vote111111111111111111111111111111111111111');

	/**
	 * See https://github.com/solana-labs/solana/blob/8a12ed029cfa38d4a45400916c2463fb82bbec8c/programs/vote_api/src/vote_state.rs#L68-L88
	 *
	 * @internal
	 */
	const VoteAccountLayout = struct([publicKey('nodePubkey'), publicKey('authorizedWithdrawer'), u8('commission'), nu64(), // votes.length
	seq(struct([nu64('slot'), u32('confirmationCount')]), offset(u32(), -8), 'votes'), u8('rootSlotValid'), nu64('rootSlot'), nu64(), // authorizedVoters.length
	seq(struct([nu64('epoch'), publicKey('authorizedVoter')]), offset(u32(), -8), 'authorizedVoters'), struct([seq(struct([publicKey('authorizedPubkey'), nu64('epochOfLastAuthorizedSwitch'), nu64('targetEpoch')]), 32, 'buf'), nu64('idx'), u8('isEmpty')], 'priorVoters'), nu64(), // epochCredits.length
	seq(struct([nu64('epoch'), nu64('credits'), nu64('prevCredits')]), offset(u32(), -8), 'epochCredits'), struct([nu64('slot'), nu64('timestamp')], 'lastTimestamp')]);

	/**
	 * VoteAccount class
	 */
	class VoteAccount {
	  /**
	   * @internal
	   */
	  constructor(args) {
	    this.nodePubkey = void 0;
	    this.authorizedWithdrawer = void 0;
	    this.commission = void 0;
	    this.rootSlot = void 0;
	    this.votes = void 0;
	    this.authorizedVoters = void 0;
	    this.priorVoters = void 0;
	    this.epochCredits = void 0;
	    this.lastTimestamp = void 0;
	    this.nodePubkey = args.nodePubkey;
	    this.authorizedWithdrawer = args.authorizedWithdrawer;
	    this.commission = args.commission;
	    this.rootSlot = args.rootSlot;
	    this.votes = args.votes;
	    this.authorizedVoters = args.authorizedVoters;
	    this.priorVoters = args.priorVoters;
	    this.epochCredits = args.epochCredits;
	    this.lastTimestamp = args.lastTimestamp;
	  }
	  /**
	   * Deserialize VoteAccount from the account data.
	   *
	   * @param buffer account data
	   * @return VoteAccount
	   */


	  static fromAccountData(buffer) {
	    const versionOffset = 4;
	    const va = VoteAccountLayout.decode(toBuffer(buffer), versionOffset);
	    let rootSlot = va.rootSlot;

	    if (!va.rootSlotValid) {
	      rootSlot = null;
	    }

	    return new VoteAccount({
	      nodePubkey: new PublicKey(va.nodePubkey),
	      authorizedWithdrawer: new PublicKey(va.authorizedWithdrawer),
	      commission: va.commission,
	      votes: va.votes,
	      rootSlot,
	      authorizedVoters: va.authorizedVoters.map(parseAuthorizedVoter),
	      priorVoters: getPriorVoters(va.priorVoters),
	      epochCredits: va.epochCredits,
	      lastTimestamp: va.lastTimestamp
	    });
	  }

	}

	function parseAuthorizedVoter({
	  authorizedVoter,
	  epoch
	}) {
	  return {
	    epoch,
	    authorizedVoter: new PublicKey(authorizedVoter)
	  };
	}

	function parsePriorVoters({
	  authorizedPubkey,
	  epochOfLastAuthorizedSwitch,
	  targetEpoch
	}) {
	  return {
	    authorizedPubkey: new PublicKey(authorizedPubkey),
	    epochOfLastAuthorizedSwitch,
	    targetEpoch
	  };
	}

	function getPriorVoters({
	  buf,
	  idx,
	  isEmpty
	}) {
	  if (isEmpty) {
	    return [];
	  }

	  return [...buf.slice(idx + 1).map(parsePriorVoters), ...buf.slice(0, idx).map(parsePriorVoters)];
	}

	const endpoint = {
	  http: {
	    devnet: 'http://api.devnet.solana.com',
	    testnet: 'http://api.testnet.solana.com',
	    'mainnet-beta': 'http://api.mainnet-beta.solana.com/'
	  },
	  https: {
	    devnet: 'https://api.devnet.solana.com',
	    testnet: 'https://api.testnet.solana.com',
	    'mainnet-beta': 'https://api.mainnet-beta.solana.com/'
	  }
	};

	/**
	 * Retrieves the RPC API URL for the specified cluster
	 */
	function clusterApiUrl(cluster, tls) {
	  const key = tls === false ? 'http' : 'https';

	  if (!cluster) {
	    return endpoint[key]['devnet'];
	  }

	  const url = endpoint[key][cluster];

	  if (!url) {
	    throw new Error(`Unknown ${key} cluster: ${cluster}`);
	  }

	  return url;
	}

	/**
	 * Send and confirm a raw transaction
	 *
	 * If `commitment` option is not specified, defaults to 'max' commitment.
	 *
	 * @param {Connection} connection
	 * @param {Buffer} rawTransaction
	 * @param {BlockheightBasedTransactionConfirmationStrategy} confirmationStrategy
	 * @param {ConfirmOptions} [options]
	 * @returns {Promise<TransactionSignature>}
	 */

	/**
	 * @deprecated Calling `sendAndConfirmRawTransaction()` without a `confirmationStrategy`
	 * is no longer supported and will be removed in a future version.
	 */
	// eslint-disable-next-line no-redeclare
	// eslint-disable-next-line no-redeclare
	async function sendAndConfirmRawTransaction(connection, rawTransaction, confirmationStrategyOrConfirmOptions, maybeConfirmOptions) {
	  let confirmationStrategy;
	  let options;

	  if (confirmationStrategyOrConfirmOptions && Object.prototype.hasOwnProperty.call(confirmationStrategyOrConfirmOptions, 'lastValidBlockHeight')) {
	    confirmationStrategy = confirmationStrategyOrConfirmOptions;
	    options = maybeConfirmOptions;
	  } else {
	    options = confirmationStrategyOrConfirmOptions;
	  }

	  const sendOptions = options && {
	    skipPreflight: options.skipPreflight,
	    preflightCommitment: options.preflightCommitment || options.commitment,
	    minContextSlot: options.minContextSlot
	  };
	  const signature = await connection.sendRawTransaction(rawTransaction, sendOptions);
	  const commitment = options && options.commitment;
	  const confirmationPromise = confirmationStrategy ? connection.confirmTransaction(confirmationStrategy, commitment) : connection.confirmTransaction(signature, commitment);
	  const status = (await confirmationPromise).value;

	  if (status.err) {
	    throw new Error(`Raw transaction ${signature} failed (${JSON.stringify(status)})`);
	  }

	  return signature;
	}

	/**
	 * There are 1-billion lamports in one SOL
	 */

	const LAMPORTS_PER_SOL = 1000000000;

	exports.Account = Account;
	exports.AddressLookupTableAccount = AddressLookupTableAccount;
	exports.AddressLookupTableInstruction = AddressLookupTableInstruction;
	exports.AddressLookupTableProgram = AddressLookupTableProgram;
	exports.Authorized = Authorized;
	exports.BLOCKHASH_CACHE_TIMEOUT_MS = BLOCKHASH_CACHE_TIMEOUT_MS;
	exports.BPF_LOADER_DEPRECATED_PROGRAM_ID = BPF_LOADER_DEPRECATED_PROGRAM_ID;
	exports.BPF_LOADER_PROGRAM_ID = BPF_LOADER_PROGRAM_ID;
	exports.BpfLoader = BpfLoader;
	exports.COMPUTE_BUDGET_INSTRUCTION_LAYOUTS = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS;
	exports.ComputeBudgetInstruction = ComputeBudgetInstruction;
	exports.ComputeBudgetProgram = ComputeBudgetProgram;
	exports.Connection = Connection;
	exports.Ed25519Program = Ed25519Program;
	exports.Enum = Enum;
	exports.EpochSchedule = EpochSchedule;
	exports.FeeCalculatorLayout = FeeCalculatorLayout;
	exports.Keypair = Keypair;
	exports.LAMPORTS_PER_SOL = LAMPORTS_PER_SOL;
	exports.LOOKUP_TABLE_INSTRUCTION_LAYOUTS = LOOKUP_TABLE_INSTRUCTION_LAYOUTS;
	exports.Loader = Loader;
	exports.Lockup = Lockup;
	exports.MAX_SEED_LENGTH = MAX_SEED_LENGTH;
	exports.Message = Message;
	exports.MessageAccountKeys = MessageAccountKeys;
	exports.MessageV0 = MessageV0;
	exports.NONCE_ACCOUNT_LENGTH = NONCE_ACCOUNT_LENGTH;
	exports.NonceAccount = NonceAccount;
	exports.PACKET_DATA_SIZE = PACKET_DATA_SIZE;
	exports.PUBLIC_KEY_LENGTH = PUBLIC_KEY_LENGTH;
	exports.PublicKey = PublicKey;
	exports.SIGNATURE_LENGTH_IN_BYTES = SIGNATURE_LENGTH_IN_BYTES;
	exports.SOLANA_SCHEMA = SOLANA_SCHEMA;
	exports.STAKE_CONFIG_ID = STAKE_CONFIG_ID;
	exports.STAKE_INSTRUCTION_LAYOUTS = STAKE_INSTRUCTION_LAYOUTS;
	exports.SYSTEM_INSTRUCTION_LAYOUTS = SYSTEM_INSTRUCTION_LAYOUTS;
	exports.SYSVAR_CLOCK_PUBKEY = SYSVAR_CLOCK_PUBKEY;
	exports.SYSVAR_EPOCH_SCHEDULE_PUBKEY = SYSVAR_EPOCH_SCHEDULE_PUBKEY;
	exports.SYSVAR_INSTRUCTIONS_PUBKEY = SYSVAR_INSTRUCTIONS_PUBKEY;
	exports.SYSVAR_RECENT_BLOCKHASHES_PUBKEY = SYSVAR_RECENT_BLOCKHASHES_PUBKEY;
	exports.SYSVAR_RENT_PUBKEY = SYSVAR_RENT_PUBKEY;
	exports.SYSVAR_REWARDS_PUBKEY = SYSVAR_REWARDS_PUBKEY;
	exports.SYSVAR_SLOT_HASHES_PUBKEY = SYSVAR_SLOT_HASHES_PUBKEY;
	exports.SYSVAR_SLOT_HISTORY_PUBKEY = SYSVAR_SLOT_HISTORY_PUBKEY;
	exports.SYSVAR_STAKE_HISTORY_PUBKEY = SYSVAR_STAKE_HISTORY_PUBKEY;
	exports.Secp256k1Program = Secp256k1Program;
	exports.SendTransactionError = SendTransactionError;
	exports.SolanaJSONRPCError = SolanaJSONRPCError;
	exports.SolanaJSONRPCErrorCode = SolanaJSONRPCErrorCode;
	exports.StakeAuthorizationLayout = StakeAuthorizationLayout;
	exports.StakeInstruction = StakeInstruction;
	exports.StakeProgram = StakeProgram;
	exports.Struct = Struct$1;
	exports.SystemInstruction = SystemInstruction;
	exports.SystemProgram = SystemProgram;
	exports.Transaction = Transaction;
	exports.TransactionExpiredBlockheightExceededError = TransactionExpiredBlockheightExceededError;
	exports.TransactionExpiredTimeoutError = TransactionExpiredTimeoutError;
	exports.TransactionInstruction = TransactionInstruction;
	exports.TransactionMessage = TransactionMessage;
	exports.VALIDATOR_INFO_KEY = VALIDATOR_INFO_KEY;
	exports.VERSION_PREFIX_MASK = VERSION_PREFIX_MASK;
	exports.VOTE_PROGRAM_ID = VOTE_PROGRAM_ID;
	exports.ValidatorInfo = ValidatorInfo;
	exports.VersionedMessage = VersionedMessage;
	exports.VersionedTransaction = VersionedTransaction;
	exports.VoteAccount = VoteAccount;
	exports.VoteAuthorizationLayout = VoteAuthorizationLayout;
	exports.VoteInit = VoteInit;
	exports.VoteInstruction = VoteInstruction;
	exports.VoteProgram = VoteProgram;
	exports.clusterApiUrl = clusterApiUrl;
	exports.sendAndConfirmRawTransaction = sendAndConfirmRawTransaction;
	exports.sendAndConfirmTransaction = sendAndConfirmTransaction;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
//# sourceMappingURL=index.iife.js.map
