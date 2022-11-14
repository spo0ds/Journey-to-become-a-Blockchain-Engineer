import 'whatwg-fetch';
export interface MockedIResponse {
    ok: boolean;
    status: number;
    statusText?: string;
    json(): Promise<Object>;
}
export interface MockedFetchResponse {
    url: string;
    opts: RequestInit;
    result: MockedIResponse;
    delay?: number;
}
export declare function createMockedIResponse(result: Object, options?: any): MockedIResponse;
export declare class MockFetch {
    private mockedResponsesByKey;
    constructor(...mockedResponses: MockedFetchResponse[]);
    addMockedResponse(mockedResponse: MockedFetchResponse): void;
    fetch(url: string, opts: RequestInit): Promise<unknown>;
    fetchParamsToKey(url: string, opts: RequestInit): string;
    getFetch(): any;
}
export declare function createMockFetch(...mockedResponses: MockedFetchResponse[]): any;
//# sourceMappingURL=mockFetch.d.ts.map