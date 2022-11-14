import { maybe } from "./maybe.js";
export default (maybe(function () { return globalThis; }) ||
    maybe(function () { return window; }) ||
    maybe(function () { return self; }) ||
    maybe(function () { return global; }) || maybe(function () { return maybe.constructor("return this")(); }));
//# sourceMappingURL=global.js.map