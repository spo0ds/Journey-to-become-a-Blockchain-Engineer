import * as React from 'react';
import { ApolloClient } from '../../core';
export interface ApolloConsumerProps {
    children: (client: ApolloClient<object>) => React.ReactChild | null;
}
export declare const ApolloConsumer: React.FC<ApolloConsumerProps>;
//# sourceMappingURL=ApolloConsumer.d.ts.map