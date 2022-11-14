import { SubscriptionClient, ClientOptions } from 'subscriptions-transport-ws';
import { ApolloLink, Operation, FetchResult } from '../core';
import { Observable } from '../../utilities';
export declare namespace WebSocketLink {
    interface Configuration {
        uri: string;
        options?: ClientOptions;
        webSocketImpl?: any;
    }
}
export import WebSocketParams = WebSocketLink.Configuration;
export declare class WebSocketLink extends ApolloLink {
    private subscriptionClient;
    constructor(paramsOrClient: WebSocketLink.Configuration | SubscriptionClient);
    request(operation: Operation): Observable<FetchResult> | null;
}
//# sourceMappingURL=index.d.ts.map