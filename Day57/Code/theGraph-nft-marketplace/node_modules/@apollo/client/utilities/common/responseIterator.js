import { canUseAsyncIteratorSymbol } from "./canUse.js";
export function isNodeResponse(value) {
    return !!value.body;
}
export function isReadableStream(value) {
    return !!value.getReader;
}
export function isAsyncIterableIterator(value) {
    return !!(canUseAsyncIteratorSymbol &&
        value[Symbol.asyncIterator]);
}
export function isStreamableBlob(value) {
    return !!value.stream;
}
export function isBlob(value) {
    return !!value.arrayBuffer;
}
export function isNodeReadableStream(value) {
    return !!value.pipe;
}
//# sourceMappingURL=responseIterator.js.map