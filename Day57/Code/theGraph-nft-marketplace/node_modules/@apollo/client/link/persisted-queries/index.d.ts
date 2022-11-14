import { DocumentNode, ExecutionResult, GraphQLError } from 'graphql';
import { ApolloLink, Operation } from '../core';
import { NetworkError } from '../../errors';
export declare const VERSION = 1;
export interface ErrorResponse {
    graphQLErrors?: readonly GraphQLError[];
    networkError?: NetworkError;
    response?: ExecutionResult;
    operation: Operation;
}
declare type SHA256Function = (...args: any[]) => string | PromiseLike<string>;
declare type GenerateHashFunction = (document: DocumentNode) => string | PromiseLike<string>;
export declare namespace PersistedQueryLink {
    interface BaseOptions {
        disable?: (error: ErrorResponse) => boolean;
        useGETForHashedQueries?: boolean;
    }
    interface SHA256Options extends BaseOptions {
        sha256: SHA256Function;
        generateHash?: never;
    }
    interface GenerateHashOptions extends BaseOptions {
        sha256?: never;
        generateHash: GenerateHashFunction;
    }
    export type Options = SHA256Options | GenerateHashOptions;
    export {};
}
export declare const createPersistedQueryLink: (options: PersistedQueryLink.Options) => ApolloLink;
export {};
//# sourceMappingURL=index.d.ts.map