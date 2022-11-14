import { maybe } from "../globals/index.js";
export var canUseWeakMap = typeof WeakMap === 'function' &&
    maybe(function () { return navigator.product; }) !== 'ReactNative';
export var canUseWeakSet = typeof WeakSet === 'function';
export var canUseSymbol = typeof Symbol === 'function' &&
    typeof Symbol.for === 'function';
export var canUseAsyncIteratorSymbol = canUseSymbol && Symbol.asyncIterator;
export var canUseDOM = typeof maybe(function () { return window.document.createElement; }) === "function";
var usingJSDOM = maybe(function () { return navigator.userAgent.indexOf("jsdom") >= 0; }) || false;
export var canUseLayoutEffect = canUseDOM && !usingJSDOM;
//# sourceMappingURL=canUse.js.map