import { Observable, } from 'zen-observable-ts';
import 'symbol-observable';
var prototype = Observable.prototype;
var fakeObsSymbol = '@@observable';
if (!prototype[fakeObsSymbol]) {
    prototype[fakeObsSymbol] = function () { return this; };
}
export { Observable };
//# sourceMappingURL=Observable.js.map