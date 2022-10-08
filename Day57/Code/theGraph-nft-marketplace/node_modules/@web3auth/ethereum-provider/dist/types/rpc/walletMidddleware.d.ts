import { JRPCMiddleware } from "@toruslabs/openlogin-jrpc";
import type { WalletMiddlewareOptions } from "./interfaces";
export declare function createWalletMiddleware({ getAccounts, getPrivateKey, processDecryptMessage, processEncryptionPublicKey, processEthSignMessage, processPersonalMessage, processTransaction, processSignTransaction, processTypedMessage, processTypedMessageV3, processTypedMessageV4, }: WalletMiddlewareOptions): JRPCMiddleware<string, unknown>;
