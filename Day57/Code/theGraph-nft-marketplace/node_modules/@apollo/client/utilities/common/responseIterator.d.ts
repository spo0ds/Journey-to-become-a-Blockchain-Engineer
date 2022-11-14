/// <reference types="node" />
import { Response as NodeResponse } from "node-fetch";
import { Readable as NodeReadableStream } from "stream";
export declare function isNodeResponse(value: any): value is NodeResponse;
export declare function isReadableStream(value: any): value is ReadableStream<any>;
export declare function isAsyncIterableIterator(value: any): value is AsyncIterableIterator<any>;
export declare function isStreamableBlob(value: any): value is Blob;
export declare function isBlob(value: any): value is Blob;
export declare function isNodeReadableStream(value: any): value is NodeReadableStream;
//# sourceMappingURL=responseIterator.d.ts.map