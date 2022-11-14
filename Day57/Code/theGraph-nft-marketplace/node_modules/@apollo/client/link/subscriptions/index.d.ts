import type { Client } from "graphql-ws";
import { ApolloLink, Operation, FetchResult } from "../core";
import { Observable } from "../../utilities";
export declare class GraphQLWsLink extends ApolloLink {
    readonly client: Client;
    constructor(client: Client);
    request(operation: Operation): Observable<FetchResult>;
}
//# sourceMappingURL=index.d.ts.map