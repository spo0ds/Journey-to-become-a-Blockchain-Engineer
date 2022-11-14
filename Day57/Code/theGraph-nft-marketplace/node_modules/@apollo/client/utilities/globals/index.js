import { invariant, InvariantError } from "ts-invariant";
import DEV from "./DEV.js";
export { DEV };
export function checkDEV() {
    __DEV__ ? invariant("boolean" === typeof DEV, DEV) : invariant("boolean" === typeof DEV, 38);
}
import { removeTemporaryGlobals } from "./fix-graphql.js";
removeTemporaryGlobals();
export { maybe } from "./maybe.js";
export { default as global } from "./global.js";
export { invariant, InvariantError };
checkDEV();
//# sourceMappingURL=index.js.map