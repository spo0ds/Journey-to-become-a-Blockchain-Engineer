import { Transaction } from "@solana/web3.js";
import { JRPCRequest } from "@toruslabs/openlogin-jrpc";
import bs58 from "bs58";
import { ethErrors } from "eth-rpc-errors";

import { IBaseWalletProvider } from "../../../interface";
import { IProviderHandlers } from "../../../rpc/solanaRpcMiddlewares";

export const getBaseProviderHandlers = (injectedProvider: IBaseWalletProvider): IProviderHandlers => {
  const providerHandlers: IProviderHandlers = {
    requestAccounts: async () => {
      return injectedProvider.publicKey ? [bs58.encode(injectedProvider.publicKey.toBytes())] : [];
    },
    getAccounts: async () => (injectedProvider.publicKey ? [bs58.encode(injectedProvider.publicKey.toBytes())] : []),
    getPrivateKey: async () => {
      throw ethErrors.rpc.methodNotSupported();
    },
    getSecretKey: async () => {
      throw ethErrors.rpc.methodNotSupported();
    },
    signTransaction: async (req: JRPCRequest<{ message: Transaction }>): Promise<Transaction> => {
      const transaction = await injectedProvider.signTransaction(req.params.message);
      return transaction;
    },
    signMessage: async (req: JRPCRequest<{ message: Uint8Array; display?: "utf8" | "hex" }>): Promise<Uint8Array> => {
      const sigData = await injectedProvider.signMessage(req.params.message, req.params.display);
      return sigData.signature;
    },
    signAllTransactions: async (req: JRPCRequest<{ message: Transaction[] }>): Promise<Transaction[]> => {
      if (!req.params?.message || !req.params?.message.length) {
        throw ethErrors.rpc.invalidParams("message");
      }
      const transaction = await injectedProvider.signAllTransactions(req.params.message);
      return transaction;
    },
    signAndSendTransaction: async (req: JRPCRequest<{ message: Transaction }>): Promise<{ signature: string }> => {
      const txRes = await injectedProvider.signAndSendTransaction(req.params.message);
      return { signature: txRes.signature };
    },
  };
  return providerHandlers;
};
