import { ExecutionResult } from 'graphql';
import { NetworkError, GraphQLErrors } from '../../errors';
import { Observable } from '../../utilities';
import { ApolloLink, Operation, FetchResult, NextLink } from '../core';
export interface ErrorResponse {
    graphQLErrors?: GraphQLErrors;
    networkError?: NetworkError;
    response?: ExecutionResult;
    operation: Operation;
    forward: NextLink;
}
export declare namespace ErrorLink {
    interface ErrorHandler {
        (error: ErrorResponse): Observable<FetchResult> | void;
    }
}
export import ErrorHandler = ErrorLink.ErrorHandler;
export declare function onError(errorHandler: ErrorHandler): ApolloLink;
export declare class ErrorLink extends ApolloLink {
    private link;
    constructor(errorHandler: ErrorLink.ErrorHandler);
    request(operation: Operation, forward: NextLink): Observable<FetchResult> | null;
}
//# sourceMappingURL=index.d.ts.map