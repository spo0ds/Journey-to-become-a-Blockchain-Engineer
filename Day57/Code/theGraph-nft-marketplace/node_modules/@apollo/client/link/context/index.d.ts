import { ApolloLink, GraphQLRequest } from '../core';
export declare type ContextSetter = (operation: GraphQLRequest, prevContext: any) => Promise<any> | any;
export declare function setContext(setter: ContextSetter): ApolloLink;
//# sourceMappingURL=index.d.ts.map