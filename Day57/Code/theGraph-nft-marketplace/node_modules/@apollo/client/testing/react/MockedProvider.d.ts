import * as React from 'react';
import { ApolloClient, DefaultOptions } from '../../core';
import { MockedResponse } from '../core';
import { ApolloLink } from '../../link/core';
import { Resolvers } from '../../core';
import { ApolloCache } from '../../cache';
export interface MockedProviderProps<TSerializedCache = {}> {
    mocks?: ReadonlyArray<MockedResponse>;
    addTypename?: boolean;
    defaultOptions?: DefaultOptions;
    cache?: ApolloCache<TSerializedCache>;
    resolvers?: Resolvers;
    childProps?: object;
    children?: any;
    link?: ApolloLink;
}
export interface MockedProviderState {
    client: ApolloClient<any>;
}
export declare class MockedProvider extends React.Component<MockedProviderProps, MockedProviderState> {
    static defaultProps: MockedProviderProps;
    constructor(props: MockedProviderProps);
    render(): JSX.Element | null;
    componentWillUnmount(): void;
}
//# sourceMappingURL=MockedProvider.d.ts.map