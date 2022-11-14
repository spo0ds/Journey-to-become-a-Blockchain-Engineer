import * as React from 'react';
import { canUseSymbol } from "../../utilities/index.js";
var contextKey = canUseSymbol
    ? Symbol.for('__APOLLO_CONTEXT__')
    : '__APOLLO_CONTEXT__';
export function getApolloContext() {
    var context = React.createContext[contextKey];
    if (!context) {
        Object.defineProperty(React.createContext, contextKey, {
            value: context = React.createContext({}),
            enumerable: false,
            writable: false,
            configurable: true,
        });
        context.displayName = 'ApolloContext';
    }
    return context;
}
export { getApolloContext as resetApolloContext };
//# sourceMappingURL=ApolloContext.js.map