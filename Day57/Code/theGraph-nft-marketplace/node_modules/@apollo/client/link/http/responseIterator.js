import { isAsyncIterableIterator, isBlob, isNodeResponse, isNodeReadableStream, isReadableStream, isStreamableBlob, } from "../../utilities/common/responseIterator.js";
import asyncIterator from "./iterators/async.js";
import nodeStreamIterator from "./iterators/nodeStream.js";
import promiseIterator from "./iterators/promise.js";
import readerIterator from "./iterators/reader.js";
export function responseIterator(response) {
    var body = response;
    if (isNodeResponse(response))
        body = response.body;
    if (isAsyncIterableIterator(body))
        return asyncIterator(body);
    if (isReadableStream(body))
        return readerIterator(body.getReader());
    if (isStreamableBlob(body)) {
        return readerIterator(body.stream().getReader());
    }
    if (isBlob(body))
        return promiseIterator(body.arrayBuffer());
    if (isNodeReadableStream(body))
        return nodeStreamIterator(body);
    throw new Error("Unknown body type for responseIterator. Please pass a streamable response.");
}
//# sourceMappingURL=responseIterator.js.map