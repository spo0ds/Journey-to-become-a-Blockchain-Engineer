import { ApolloLink, RequestHandler } from '../core';
import { HttpOptions } from './selectHttpOptionsAndBody';
export declare class HttpLink extends ApolloLink {
    options: HttpOptions;
    requester: RequestHandler;
    constructor(options?: HttpOptions);
}
//# sourceMappingURL=HttpLink.d.ts.map