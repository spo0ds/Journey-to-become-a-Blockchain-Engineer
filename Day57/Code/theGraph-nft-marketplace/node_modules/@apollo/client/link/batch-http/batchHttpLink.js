import { __assign, __extends, __rest } from "tslib";
import { ApolloLink } from "../core/index.js";
import { Observable } from "../../utilities/index.js";
import { fromError } from "../utils/index.js";
import { serializeFetchParameter, selectURI, parseAndCheckHttpResponse, checkFetcher, selectHttpOptionsAndBodyInternal, defaultPrinter, fallbackHttpConfig, createSignalIfSupported, } from "../http/index.js";
import { BatchLink } from "../batch/index.js";
var BatchHttpLink = (function (_super) {
    __extends(BatchHttpLink, _super);
    function BatchHttpLink(fetchParams) {
        var _this = _super.call(this) || this;
        var _a = fetchParams || {}, _b = _a.uri, uri = _b === void 0 ? '/graphql' : _b, fetcher = _a.fetch, _c = _a.print, print = _c === void 0 ? defaultPrinter : _c, includeExtensions = _a.includeExtensions, preserveHeaderCase = _a.preserveHeaderCase, batchInterval = _a.batchInterval, batchDebounce = _a.batchDebounce, batchMax = _a.batchMax, batchKey = _a.batchKey, requestOptions = __rest(_a, ["uri", "fetch", "print", "includeExtensions", "preserveHeaderCase", "batchInterval", "batchDebounce", "batchMax", "batchKey"]);
        checkFetcher(fetcher);
        if (!fetcher) {
            fetcher = fetch;
        }
        var linkConfig = {
            http: { includeExtensions: includeExtensions, preserveHeaderCase: preserveHeaderCase },
            options: requestOptions.fetchOptions,
            credentials: requestOptions.credentials,
            headers: requestOptions.headers,
        };
        _this.batchDebounce = batchDebounce;
        _this.batchInterval = batchInterval || 10;
        _this.batchMax = batchMax || 10;
        var batchHandler = function (operations) {
            var chosenURI = selectURI(operations[0], uri);
            var context = operations[0].getContext();
            var clientAwarenessHeaders = {};
            if (context.clientAwareness) {
                var _a = context.clientAwareness, name_1 = _a.name, version = _a.version;
                if (name_1) {
                    clientAwarenessHeaders['apollographql-client-name'] = name_1;
                }
                if (version) {
                    clientAwarenessHeaders['apollographql-client-version'] = version;
                }
            }
            var contextConfig = {
                http: context.http,
                options: context.fetchOptions,
                credentials: context.credentials,
                headers: __assign(__assign({}, clientAwarenessHeaders), context.headers),
            };
            var optsAndBody = operations.map(function (operation) {
                return selectHttpOptionsAndBodyInternal(operation, print, fallbackHttpConfig, linkConfig, contextConfig);
            });
            var loadedBody = optsAndBody.map(function (_a) {
                var body = _a.body;
                return body;
            });
            var options = optsAndBody[0].options;
            if (options.method === 'GET') {
                return fromError(new Error('apollo-link-batch-http does not support GET requests'));
            }
            try {
                options.body = serializeFetchParameter(loadedBody, 'Payload');
            }
            catch (parseError) {
                return fromError(parseError);
            }
            var controller;
            if (!options.signal) {
                var _b = createSignalIfSupported(), _controller = _b.controller, signal = _b.signal;
                controller = _controller;
                if (controller)
                    options.signal = signal;
            }
            return new Observable(function (observer) {
                fetcher(chosenURI, options)
                    .then(function (response) {
                    operations.forEach(function (operation) { return operation.setContext({ response: response }); });
                    return response;
                })
                    .then(parseAndCheckHttpResponse(operations))
                    .then(function (result) {
                    observer.next(result);
                    observer.complete();
                    return result;
                })
                    .catch(function (err) {
                    if (err.name === 'AbortError')
                        return;
                    if (err.result && err.result.errors && err.result.data) {
                        observer.next(err.result);
                    }
                    observer.error(err);
                });
                return function () {
                    if (controller)
                        controller.abort();
                };
            });
        };
        batchKey =
            batchKey ||
                (function (operation) {
                    var context = operation.getContext();
                    var contextConfig = {
                        http: context.http,
                        options: context.fetchOptions,
                        credentials: context.credentials,
                        headers: context.headers,
                    };
                    return selectURI(operation, uri) + JSON.stringify(contextConfig);
                });
        _this.batcher = new BatchLink({
            batchDebounce: _this.batchDebounce,
            batchInterval: _this.batchInterval,
            batchMax: _this.batchMax,
            batchKey: batchKey,
            batchHandler: batchHandler,
        });
        return _this;
    }
    BatchHttpLink.prototype.request = function (operation) {
        return this.batcher.request(operation);
    };
    return BatchHttpLink;
}(ApolloLink));
export { BatchHttpLink };
//# sourceMappingURL=batchHttpLink.js.map