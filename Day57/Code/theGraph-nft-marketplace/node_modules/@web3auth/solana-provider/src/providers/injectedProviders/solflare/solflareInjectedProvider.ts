import { SolflareWallet } from "../../../interface";
import { IProviderHandlers } from "../../../rpc/solanaRpcMiddlewares";
import { BaseInjectedProvider } from "../base/baseInjectedProvider";
import { getSolflareHandlers } from "./providerHandlers";

export class SolflareInjectedProvider extends BaseInjectedProvider<SolflareWallet> {
  protected getProviderHandlers(injectedProvider: SolflareWallet): IProviderHandlers {
    return getSolflareHandlers(injectedProvider, this.getProviderEngineProxy.bind(this));
  }
}
