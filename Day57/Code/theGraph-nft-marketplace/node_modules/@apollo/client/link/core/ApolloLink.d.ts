import { Observable, Observer } from '../../utilities';
import { NextLink, Operation, RequestHandler, FetchResult, GraphQLRequest } from './types';
export declare class ApolloLink {
    static empty(): ApolloLink;
    static from(links: (ApolloLink | RequestHandler)[]): ApolloLink;
    static split(test: (op: Operation) => boolean, left: ApolloLink | RequestHandler, right?: ApolloLink | RequestHandler): ApolloLink;
    static execute(link: ApolloLink, operation: GraphQLRequest): Observable<FetchResult>;
    static concat(first: ApolloLink | RequestHandler, second: ApolloLink | RequestHandler): ApolloLink;
    constructor(request?: RequestHandler);
    split(test: (op: Operation) => boolean, left: ApolloLink | RequestHandler, right?: ApolloLink | RequestHandler): ApolloLink;
    concat(next: ApolloLink | RequestHandler): ApolloLink;
    request(operation: Operation, forward?: NextLink): Observable<FetchResult> | null;
    protected onError(error: any, observer?: Observer<FetchResult>): false | void;
    setOnError(fn: ApolloLink["onError"]): this;
}
//# sourceMappingURL=ApolloLink.d.ts.map