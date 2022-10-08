import { JRPCMiddleware } from "@toruslabs/openlogin-jrpc";
import { IAccountHandlers, IChainSwitchHandlers, IProviderHandlers } from "./interfaces";
export declare function createEthMiddleware(providerHandlers: IProviderHandlers): JRPCMiddleware<unknown, unknown>;
export declare function createChainSwitchMiddleware({ addChain, switchChain }: IChainSwitchHandlers): JRPCMiddleware<unknown, unknown>;
export declare function createAccountMiddleware({ updatePrivatekey }: IAccountHandlers): JRPCMiddleware<unknown, unknown>;
