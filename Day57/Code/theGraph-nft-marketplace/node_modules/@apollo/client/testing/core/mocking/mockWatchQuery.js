import { __spreadArray } from "tslib";
import mockQueryManager from "./mockQueryManager.js";
export default (function(reject) {
    var mockedResponses = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        mockedResponses[_i - 1] = arguments[_i];
    }
    var queryManager = mockQueryManager.apply(void 0, __spreadArray([reject], mockedResponses, false));
    var firstRequest = mockedResponses[0].request;
    return queryManager.watchQuery({
        query: firstRequest.query,
        variables: firstRequest.variables,
        notifyOnNetworkStatusChange: false
    });
});
//# sourceMappingURL=mockWatchQuery.js.map