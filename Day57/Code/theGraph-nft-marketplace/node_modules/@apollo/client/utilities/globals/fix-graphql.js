import { remove } from "ts-invariant/process/index.js";
import { Source } from 'graphql';
export function removeTemporaryGlobals() {
    return typeof Source === "function" ? remove() : remove();
}
//# sourceMappingURL=fix-graphql.js.map