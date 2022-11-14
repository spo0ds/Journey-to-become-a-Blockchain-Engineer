import { __assign, __extends } from "tslib";
import { print } from "graphql";
import { ApolloLink } from "../core/index.js";
import { isNonNullObject, Observable } from "../../utilities/index.js";
import { ApolloError } from "../../errors/index.js";
function isLikeCloseEvent(val) {
    return isNonNullObject(val) && 'code' in val && 'reason' in val;
}
var GraphQLWsLink = (function (_super) {
    __extends(GraphQLWsLink, _super);
    function GraphQLWsLink(client) {
        var _this = _super.call(this) || this;
        _this.client = client;
        return _this;
    }
    GraphQLWsLink.prototype.request = function (operation) {
        var _this = this;
        return new Observable(function (observer) {
            return _this.client.subscribe(__assign(__assign({}, operation), { query: print(operation.query) }), {
                next: observer.next.bind(observer),
                complete: observer.complete.bind(observer),
                error: function (err) {
                    if (err instanceof Error) {
                        return observer.error(err);
                    }
                    if (isLikeCloseEvent(err)) {
                        return observer.error(new Error("Socket closed with event ".concat(err.code, " ").concat(err.reason || "")));
                    }
                    return observer.error(new ApolloError({
                        graphQLErrors: Array.isArray(err) ? err : [err],
                    }));
                },
            });
        });
    };
    return GraphQLWsLink;
}(ApolloLink));
export { GraphQLWsLink };
//# sourceMappingURL=index.js.map