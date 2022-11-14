'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var graphql = require('graphql');
var core = require('../core');
var utilities = require('../../utilities');
var errors = require('../../errors');

function isLikeCloseEvent(val) {
    return utilities.isNonNullObject(val) && 'code' in val && 'reason' in val;
}
var GraphQLWsLink = (function (_super) {
    tslib.__extends(GraphQLWsLink, _super);
    function GraphQLWsLink(client) {
        var _this = _super.call(this) || this;
        _this.client = client;
        return _this;
    }
    GraphQLWsLink.prototype.request = function (operation) {
        var _this = this;
        return new utilities.Observable(function (observer) {
            return _this.client.subscribe(tslib.__assign(tslib.__assign({}, operation), { query: graphql.print(operation.query) }), {
                next: observer.next.bind(observer),
                complete: observer.complete.bind(observer),
                error: function (err) {
                    if (err instanceof Error) {
                        return observer.error(err);
                    }
                    if (isLikeCloseEvent(err)) {
                        return observer.error(new Error("Socket closed with event ".concat(err.code, " ").concat(err.reason || "")));
                    }
                    return observer.error(new errors.ApolloError({
                        graphQLErrors: Array.isArray(err) ? err : [err],
                    }));
                },
            });
        });
    };
    return GraphQLWsLink;
}(core.ApolloLink));

exports.GraphQLWsLink = GraphQLWsLink;
//# sourceMappingURL=subscriptions.cjs.map
