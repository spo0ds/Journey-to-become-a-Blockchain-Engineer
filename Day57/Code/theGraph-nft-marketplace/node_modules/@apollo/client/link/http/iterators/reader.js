import { canUseAsyncIteratorSymbol } from "../../../utilities/index.js";
export default function readerIterator(reader) {
    var iterator = {
        next: function () {
            return reader.read();
        },
    };
    if (canUseAsyncIteratorSymbol) {
        iterator[Symbol.asyncIterator] = function () {
            return this;
        };
    }
    return iterator;
}
//# sourceMappingURL=reader.js.map