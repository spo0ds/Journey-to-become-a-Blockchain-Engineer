"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file The `Apply` class provides the `ap` which is used to apply a function to an argument under a type constructor.
 *
 * `Apply` can be used to lift functions of two or more arguments to work on values wrapped with the type constructor
 * `f`.
 *
 * Instances must satisfy the following law in addition to the `Functor` laws:
 *
 * 1. Associative composition: `F.ap(F.ap(F.map(fbc, bc => ab => a => bc(ab(a))), fab), fa) = F.ap(fbc, F.ap(fab, fa))`
 *
 * Formally, `Apply` represents a strong lax semi-monoidal endofunctor.
 */
var function_1 = require("./function");
function applyFirst(F) {
    return function (fa, fb) { return F.ap(F.map(fa, function_1.constant), fb); };
}
exports.applyFirst = applyFirst;
function applySecond(F) {
    return function (fa, fb) { return F.ap(F.map(fa, function () { return function (b) { return b; }; }), fb); };
}
exports.applySecond = applySecond;
// tslint:disable-next-line: deprecation
function liftA2(F) {
    return function (f) { return function (fa) { return function (fb) { return F.ap(F.map(fa, f), fb); }; }; };
}
exports.liftA2 = liftA2;
function liftA3(F
// tslint:disable-next-line: deprecation
) {
    return function (f) { return function (fa) { return function (fb) { return function (fc) { return F.ap(F.ap(F.map(fa, f), fb), fc); }; }; }; };
}
exports.liftA3 = liftA3;
function liftA4(F
// tslint:disable-next-line: deprecation
) {
    return function (f) { return function (fa) { return function (fb) { return function (fc) { return function (fd) { return F.ap(F.ap(F.ap(F.map(fa, f), fb), fc), fd); }; }; }; }; };
}
exports.liftA4 = liftA4;
function getSemigroup(F, S) {
    var f = function (a) { return function (b) { return S.concat(a, b); }; };
    return function () { return ({
        concat: function (x, y) { return F.ap(F.map(x, f), y); }
    }); };
}
exports.getSemigroup = getSemigroup;
var tupleConstructors = {};
function getTupleConstructor(len) {
    if (!tupleConstructors.hasOwnProperty(len)) {
        // tslint:disable-next-line: deprecation
        tupleConstructors[len] = function_1.curried(function_1.tuple, len - 1, []);
    }
    return tupleConstructors[len];
}
function sequenceT(F) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var len = args.length;
        var f = getTupleConstructor(len);
        var fas = F.map(args[0], f);
        for (var i = 1; i < len; i++) {
            fas = F.ap(fas, args[i]);
        }
        return fas;
    };
}
exports.sequenceT = sequenceT;
function getRecordConstructor(keys) {
    var len = keys.length;
    // tslint:disable-next-line: deprecation
    return function_1.curried(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var r = {};
        for (var i = 0; i < len; i++) {
            r[keys[i]] = args[i];
        }
        return r;
    }, len - 1, []);
}
function sequenceS(F) {
    return function (r) {
        var keys = Object.keys(r);
        var len = keys.length;
        var f = getRecordConstructor(keys);
        var fr = F.map(r[keys[0]], f);
        for (var i = 1; i < len; i++) {
            fr = F.ap(fr, r[keys[i]]);
        }
        return fr;
    };
}
exports.sequenceS = sequenceS;
