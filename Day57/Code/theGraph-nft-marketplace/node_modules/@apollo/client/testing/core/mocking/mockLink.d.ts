import { ApolloLink, Operation, GraphQLRequest, FetchResult } from '../../../link/core';
import { Observable } from '../../../utilities';
export declare type ResultFunction<T> = () => T;
export interface MockedResponse<TData = Record<string, any>> {
    request: GraphQLRequest;
    result?: FetchResult<TData> | ResultFunction<FetchResult<TData>>;
    error?: Error;
    delay?: number;
    newData?: ResultFunction<FetchResult>;
}
export declare class MockLink extends ApolloLink {
    operation: Operation;
    addTypename: Boolean;
    private mockedResponsesByKey;
    constructor(mockedResponses: ReadonlyArray<MockedResponse>, addTypename?: Boolean);
    addMockedResponse(mockedResponse: MockedResponse): void;
    request(operation: Operation): Observable<FetchResult> | null;
    private normalizeMockedResponse;
}
export interface MockApolloLink extends ApolloLink {
    operation?: Operation;
}
export declare function mockSingleLink(...mockedResponses: Array<any>): MockApolloLink;
//# sourceMappingURL=mockLink.d.ts.map