function makeDefaultQueryInfo() {
    return {
        seen: false,
        observable: null
    };
}
var RenderPromises = (function () {
    function RenderPromises() {
        this.queryPromises = new Map();
        this.queryInfoTrie = new Map();
        this.stopped = false;
    }
    RenderPromises.prototype.stop = function () {
        if (!this.stopped) {
            this.queryPromises.clear();
            this.queryInfoTrie.clear();
            this.stopped = true;
        }
    };
    RenderPromises.prototype.registerSSRObservable = function (observable) {
        if (this.stopped)
            return;
        this.lookupQueryInfo(observable.options).observable = observable;
    };
    RenderPromises.prototype.getSSRObservable = function (props) {
        return this.lookupQueryInfo(props).observable;
    };
    RenderPromises.prototype.addQueryPromise = function (queryInstance, finish) {
        if (!this.stopped) {
            var info = this.lookupQueryInfo(queryInstance.getOptions());
            if (!info.seen) {
                this.queryPromises.set(queryInstance.getOptions(), new Promise(function (resolve) {
                    resolve(queryInstance.fetchData());
                }));
                return null;
            }
        }
        return finish ? finish() : null;
    };
    RenderPromises.prototype.addObservableQueryPromise = function (obsQuery) {
        return this.addQueryPromise({
            getOptions: function () { return obsQuery.options; },
            fetchData: function () { return new Promise(function (resolve) {
                var sub = obsQuery.subscribe({
                    next: function (result) {
                        if (!result.loading) {
                            resolve();
                            sub.unsubscribe();
                        }
                    },
                    error: function () {
                        resolve();
                        sub.unsubscribe();
                    },
                    complete: function () {
                        resolve();
                    },
                });
            }); },
        });
    };
    RenderPromises.prototype.hasPromises = function () {
        return this.queryPromises.size > 0;
    };
    RenderPromises.prototype.consumeAndAwaitPromises = function () {
        var _this = this;
        var promises = [];
        this.queryPromises.forEach(function (promise, queryInstance) {
            _this.lookupQueryInfo(queryInstance).seen = true;
            promises.push(promise);
        });
        this.queryPromises.clear();
        return Promise.all(promises);
    };
    RenderPromises.prototype.lookupQueryInfo = function (props) {
        var queryInfoTrie = this.queryInfoTrie;
        var query = props.query, variables = props.variables;
        var varMap = queryInfoTrie.get(query) || new Map();
        if (!queryInfoTrie.has(query))
            queryInfoTrie.set(query, varMap);
        var variablesString = JSON.stringify(variables);
        var info = varMap.get(variablesString) || makeDefaultQueryInfo();
        if (!varMap.has(variablesString))
            varMap.set(variablesString, info);
        return info;
    };
    return RenderPromises;
}());
export { RenderPromises };
//# sourceMappingURL=RenderPromises.js.map