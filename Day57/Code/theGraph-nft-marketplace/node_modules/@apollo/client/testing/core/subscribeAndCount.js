import { asyncMap } from "../../utilities/index.js";
export default function subscribeAndCount(reject, observable, cb) {
    var queue = Promise.resolve();
    var handleCount = 0;
    var subscription = asyncMap(observable, function (result) {
        return queue = queue.then(function () {
            return cb(++handleCount, result);
        }).catch(error);
    }).subscribe({ error: error });
    function error(e) {
        subscription.unsubscribe();
        reject(e);
    }
    return subscription;
}
//# sourceMappingURL=subscribeAndCount.js.map