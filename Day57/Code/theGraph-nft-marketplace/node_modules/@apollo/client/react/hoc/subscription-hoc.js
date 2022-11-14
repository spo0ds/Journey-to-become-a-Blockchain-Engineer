import { __assign, __extends, __rest } from "tslib";
import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { parser } from "../parser/index.js";
import { Subscription } from "../components/index.js";
import { getDisplayName, GraphQLBase, calculateVariablesFromProps, defaultMapPropsToOptions, defaultMapPropsToSkip } from "./hoc-utils.js";
export function withSubscription(document, operationOptions) {
    if (operationOptions === void 0) { operationOptions = {}; }
    var operation = parser(document);
    var _a = operationOptions.options, options = _a === void 0 ? defaultMapPropsToOptions : _a, _b = operationOptions.skip, skip = _b === void 0 ? defaultMapPropsToSkip : _b, _c = operationOptions.alias, alias = _c === void 0 ? 'Apollo' : _c, shouldResubscribe = operationOptions.shouldResubscribe;
    var mapPropsToOptions = options;
    if (typeof mapPropsToOptions !== 'function')
        mapPropsToOptions = function () { return options; };
    var mapPropsToSkip = skip;
    if (typeof mapPropsToSkip !== 'function')
        mapPropsToSkip = function () { return skip; };
    var lastResultProps;
    return function (WrappedComponent) {
        var graphQLDisplayName = "".concat(alias, "(").concat(getDisplayName(WrappedComponent), ")");
        var GraphQL = (function (_super) {
            __extends(GraphQL, _super);
            function GraphQL(props) {
                var _this = _super.call(this, props) || this;
                _this.state = { resubscribe: false };
                return _this;
            }
            GraphQL.prototype.updateResubscribe = function (resubscribe) {
                this.setState({ resubscribe: resubscribe });
            };
            GraphQL.prototype.componentDidUpdate = function (prevProps) {
                var resubscribe = !!(shouldResubscribe &&
                    shouldResubscribe(prevProps, this.props));
                if (this.state.resubscribe !== resubscribe) {
                    this.updateResubscribe(resubscribe);
                }
            };
            GraphQL.prototype.render = function () {
                var _this = this;
                var props = this.props;
                var shouldSkip = mapPropsToSkip(props);
                var opts = shouldSkip
                    ? Object.create(null)
                    : mapPropsToOptions(props);
                if (!shouldSkip && !opts.variables && operation.variables.length > 0) {
                    opts.variables = calculateVariablesFromProps(operation, props);
                }
                return (React.createElement(Subscription, __assign({}, opts, { displayName: graphQLDisplayName, skip: shouldSkip, subscription: document, shouldResubscribe: this.state.resubscribe }), function (_a) {
                    var _b, _c;
                    var data = _a.data, r = __rest(_a, ["data"]);
                    if (operationOptions.withRef) {
                        _this.withRef = true;
                        props = Object.assign({}, props, {
                            ref: _this.setWrappedInstance
                        });
                    }
                    if (shouldSkip) {
                        return (React.createElement(WrappedComponent, __assign({}, props, {})));
                    }
                    var result = Object.assign(r, data || {});
                    var name = operationOptions.name || 'data';
                    var childProps = (_b = {}, _b[name] = result, _b);
                    if (operationOptions.props) {
                        var newResult = (_c = {},
                            _c[name] = result,
                            _c.ownProps = props,
                            _c);
                        lastResultProps = operationOptions.props(newResult, lastResultProps);
                        childProps = lastResultProps;
                    }
                    return (React.createElement(WrappedComponent, __assign({}, props, childProps)));
                }));
            };
            GraphQL.displayName = graphQLDisplayName;
            GraphQL.WrappedComponent = WrappedComponent;
            return GraphQL;
        }(GraphQLBase));
        return hoistNonReactStatics(GraphQL, WrappedComponent, {});
    };
}
//# sourceMappingURL=subscription-hoc.js.map