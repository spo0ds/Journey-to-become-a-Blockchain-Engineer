import { FieldPolicy, Reference } from '../../cache';
declare type KeyArgs = FieldPolicy<any>["keyArgs"];
export declare function concatPagination<T = Reference>(keyArgs?: KeyArgs): FieldPolicy<T[]>;
export declare function offsetLimitPagination<T = Reference>(keyArgs?: KeyArgs): FieldPolicy<T[]>;
export declare type TRelayEdge<TNode> = {
    cursor?: string;
    node: TNode;
} | (Reference & {
    cursor?: string;
});
export declare type TRelayPageInfo = {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    startCursor: string;
    endCursor: string;
};
export declare type TExistingRelay<TNode> = Readonly<{
    edges: TRelayEdge<TNode>[];
    pageInfo: TRelayPageInfo;
}>;
export declare type TIncomingRelay<TNode> = {
    edges?: TRelayEdge<TNode>[];
    pageInfo?: TRelayPageInfo;
};
export declare type RelayFieldPolicy<TNode> = FieldPolicy<TExistingRelay<TNode> | null, TIncomingRelay<TNode> | null, TIncomingRelay<TNode> | null>;
export declare function relayStylePagination<TNode = Reference>(keyArgs?: KeyArgs): RelayFieldPolicy<TNode>;
export {};
//# sourceMappingURL=pagination.d.ts.map