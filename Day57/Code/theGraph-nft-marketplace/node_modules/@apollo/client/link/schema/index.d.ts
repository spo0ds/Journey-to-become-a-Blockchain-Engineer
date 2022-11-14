import { GraphQLSchema } from 'graphql';
import { ApolloLink, Operation, FetchResult } from '../core';
import { Observable } from '../../utilities';
export declare namespace SchemaLink {
    type ResolverContext = Record<string, any>;
    type ResolverContextFunction = (operation: Operation) => ResolverContext | PromiseLike<ResolverContext>;
    interface Options {
        schema: GraphQLSchema;
        rootValue?: any;
        context?: ResolverContext | ResolverContextFunction;
        validate?: boolean;
    }
}
export declare class SchemaLink extends ApolloLink {
    schema: SchemaLink.Options["schema"];
    rootValue: SchemaLink.Options["rootValue"];
    context: SchemaLink.Options["context"];
    validate: boolean;
    constructor(options: SchemaLink.Options);
    request(operation: Operation): Observable<FetchResult>;
}
//# sourceMappingURL=index.d.ts.map