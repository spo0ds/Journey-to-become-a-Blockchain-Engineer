import * as React from 'react';
import { ApolloClient } from '../../core';
import type { RenderPromises } from '../ssr';
export interface ApolloContextValue {
    client?: ApolloClient<object>;
    renderPromises?: RenderPromises;
}
export declare function getApolloContext(): React.Context<ApolloContextValue>;
export { getApolloContext as resetApolloContext };
//# sourceMappingURL=ApolloContext.d.ts.map