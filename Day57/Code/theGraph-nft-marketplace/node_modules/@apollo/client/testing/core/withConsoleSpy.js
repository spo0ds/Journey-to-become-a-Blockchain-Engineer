function wrapTestFunction(fn, consoleMethodName) {
    return function () {
        var _this = this;
        var args = arguments;
        var spy = jest.spyOn(console, consoleMethodName);
        spy.mockImplementation(function () { });
        return new Promise(function (resolve) {
            resolve(fn === null || fn === void 0 ? void 0 : fn.apply(_this, args));
        }).finally(function () {
            expect(spy).toMatchSnapshot();
            spy.mockReset();
        });
    };
}
export function withErrorSpy(it) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    args[1] = wrapTestFunction(args[1], "error");
    return it.apply(void 0, args);
}
export function withWarningSpy(it) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    args[1] = wrapTestFunction(args[1], "warn");
    return it.apply(void 0, args);
}
export function withLogSpy(it) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    args[1] = wrapTestFunction(args[1], "log");
    return it.apply(void 0, args);
}
//# sourceMappingURL=withConsoleSpy.js.map