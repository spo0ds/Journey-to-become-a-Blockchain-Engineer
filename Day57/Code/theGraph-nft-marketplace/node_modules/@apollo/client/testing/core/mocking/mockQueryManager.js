import { QueryManager } from "../../../core/QueryManager.js";
import { mockSingleLink } from "./mockLink.js";
import { InMemoryCache } from "../../../cache/index.js";
export default (function(reject) {
    var mockedResponses = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        mockedResponses[_i - 1] = arguments[_i];
    }
    return new QueryManager({
        link: mockSingleLink.apply(void 0, mockedResponses),
        cache: new InMemoryCache({ addTypename: false }),
    });
});
//# sourceMappingURL=mockQueryManager.js.map