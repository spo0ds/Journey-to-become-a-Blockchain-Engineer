import { __assign } from "tslib";
import { useCallback, useEffect, useRef, useState } from 'react';
import { mergeOptions, } from "../../core/index.js";
import { equal } from '@wry/equality';
import { DocumentType, verifyDocumentType } from "../parser/index.js";
import { ApolloError } from "../../errors/index.js";
import { useApolloClient } from "./useApolloClient.js";
export function useMutation(mutation, options) {
    var client = useApolloClient(options === null || options === void 0 ? void 0 : options.client);
    verifyDocumentType(mutation, DocumentType.Mutation);
    var _a = useState({
        called: false,
        loading: false,
        client: client,
    }), result = _a[0], setResult = _a[1];
    var ref = useRef({
        result: result,
        mutationId: 0,
        isMounted: true,
        client: client,
        mutation: mutation,
        options: options,
    });
    {
        Object.assign(ref.current, { client: client, options: options, mutation: mutation });
    }
    var execute = useCallback(function (executeOptions) {
        if (executeOptions === void 0) { executeOptions = {}; }
        var _a = ref.current, client = _a.client, options = _a.options, mutation = _a.mutation;
        var baseOptions = __assign(__assign({}, options), { mutation: mutation });
        if (!ref.current.result.loading && !baseOptions.ignoreResults && ref.current.isMounted) {
            setResult(ref.current.result = {
                loading: true,
                error: void 0,
                data: void 0,
                called: true,
                client: client,
            });
        }
        var mutationId = ++ref.current.mutationId;
        var clientOptions = mergeOptions(baseOptions, executeOptions);
        return client.mutate(clientOptions).then(function (response) {
            var _a, _b, _c;
            var data = response.data, errors = response.errors;
            var error = errors && errors.length > 0
                ? new ApolloError({ graphQLErrors: errors })
                : void 0;
            if (mutationId === ref.current.mutationId &&
                !clientOptions.ignoreResults) {
                var result_1 = {
                    called: true,
                    loading: false,
                    data: data,
                    error: error,
                    client: client,
                };
                if (ref.current.isMounted && !equal(ref.current.result, result_1)) {
                    setResult(ref.current.result = result_1);
                }
            }
            (_b = (_a = ref.current.options) === null || _a === void 0 ? void 0 : _a.onCompleted) === null || _b === void 0 ? void 0 : _b.call(_a, response.data, clientOptions);
            (_c = executeOptions.onCompleted) === null || _c === void 0 ? void 0 : _c.call(executeOptions, response.data, clientOptions);
            return response;
        }).catch(function (error) {
            var _a, _b, _c, _d;
            if (mutationId === ref.current.mutationId &&
                ref.current.isMounted) {
                var result_2 = {
                    loading: false,
                    error: error,
                    data: void 0,
                    called: true,
                    client: client,
                };
                if (!equal(ref.current.result, result_2)) {
                    setResult(ref.current.result = result_2);
                }
            }
            if (((_a = ref.current.options) === null || _a === void 0 ? void 0 : _a.onError) || clientOptions.onError) {
                (_c = (_b = ref.current.options) === null || _b === void 0 ? void 0 : _b.onError) === null || _c === void 0 ? void 0 : _c.call(_b, error, clientOptions);
                (_d = executeOptions.onError) === null || _d === void 0 ? void 0 : _d.call(executeOptions, error, clientOptions);
                return { data: void 0, errors: error };
            }
            throw error;
        });
    }, []);
    var reset = useCallback(function () {
        if (ref.current.isMounted) {
            setResult({ called: false, loading: false, client: client });
        }
    }, []);
    useEffect(function () {
        ref.current.isMounted = true;
        return function () {
            ref.current.isMounted = false;
        };
    }, []);
    return [execute, __assign({ reset: reset }, result)];
}
//# sourceMappingURL=useMutation.js.map