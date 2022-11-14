import { __assign } from "tslib";
import * as React from 'react';
import { getApolloContext } from "../context/index.js";
import { RenderPromises } from "./RenderPromises.js";
import { renderToStaticMarkup } from 'react-dom/server';
export function getDataFromTree(tree, context) {
    if (context === void 0) { context = {}; }
    return getMarkupFromTree({
        tree: tree,
        context: context,
        renderFunction: renderToStaticMarkup
    });
}
export function getMarkupFromTree(_a) {
    var tree = _a.tree, _b = _a.context, context = _b === void 0 ? {} : _b, _c = _a.renderFunction, renderFunction = _c === void 0 ? renderToStaticMarkup : _c;
    var renderPromises = new RenderPromises();
    function process() {
        var ApolloContext = getApolloContext();
        return new Promise(function (resolve) {
            var element = React.createElement(ApolloContext.Provider, { value: __assign(__assign({}, context), { renderPromises: renderPromises }) }, tree);
            resolve(renderFunction(element));
        }).then(function (html) {
            return renderPromises.hasPromises()
                ? renderPromises.consumeAndAwaitPromises().then(process)
                : html;
        }).finally(function () {
            renderPromises.stop();
        });
    }
    return Promise.resolve().then(process);
}
//# sourceMappingURL=getDataFromTree.js.map