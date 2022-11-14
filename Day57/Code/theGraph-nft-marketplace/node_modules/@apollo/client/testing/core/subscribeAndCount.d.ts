import { ObservableSubscription, Observable } from '../../utilities';
export default function subscribeAndCount<TResult>(reject: (reason: any) => any, observable: Observable<TResult>, cb: (handleCount: number, result: TResult) => any): ObservableSubscription;
//# sourceMappingURL=subscribeAndCount.d.ts.map