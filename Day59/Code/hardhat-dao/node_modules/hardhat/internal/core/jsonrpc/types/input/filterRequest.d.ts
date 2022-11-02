import * as t from "io-ts";
export declare const rpcFilterRequest: t.TypeC<{
    fromBlock: t.Type<bigint | "pending" | "earliest" | "latest" | "safe" | "finalized" | undefined, bigint | "pending" | "earliest" | "latest" | "safe" | "finalized" | undefined, unknown>;
    toBlock: t.Type<bigint | "pending" | "earliest" | "latest" | "safe" | "finalized" | undefined, bigint | "pending" | "earliest" | "latest" | "safe" | "finalized" | undefined, unknown>;
    address: t.Type<Buffer | Buffer[] | undefined, Buffer | Buffer[] | undefined, unknown>;
    topics: t.Type<(Buffer | (Buffer | null)[] | null)[] | undefined, (Buffer | (Buffer | null)[] | null)[] | undefined, unknown>;
    blockHash: t.Type<Buffer | undefined, Buffer | undefined, unknown>;
}>;
export declare type RpcFilterRequest = t.TypeOf<typeof rpcFilterRequest>;
export declare const optionalRpcFilterRequest: t.Type<{
    fromBlock: bigint | "pending" | "earliest" | "latest" | "safe" | "finalized" | undefined;
    toBlock: bigint | "pending" | "earliest" | "latest" | "safe" | "finalized" | undefined;
    address: Buffer | Buffer[] | undefined;
    topics: (Buffer | (Buffer | null)[] | null)[] | undefined;
    blockHash: Buffer | undefined;
} | undefined, {
    fromBlock: bigint | "pending" | "earliest" | "latest" | "safe" | "finalized" | undefined;
    toBlock: bigint | "pending" | "earliest" | "latest" | "safe" | "finalized" | undefined;
    address: Buffer | Buffer[] | undefined;
    topics: (Buffer | (Buffer | null)[] | null)[] | undefined;
    blockHash: Buffer | undefined;
} | undefined, unknown>;
export declare type OptionalRpcFilterRequest = t.TypeOf<typeof optionalRpcFilterRequest>;
//# sourceMappingURL=filterRequest.d.ts.map