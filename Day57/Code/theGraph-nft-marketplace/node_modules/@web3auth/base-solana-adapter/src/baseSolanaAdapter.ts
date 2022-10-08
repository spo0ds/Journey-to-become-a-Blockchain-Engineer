import {
  ADAPTER_STATUS,
  BaseAdapter,
  checkIfTokenIsExpired,
  clearToken,
  getSavedToken,
  saveToken,
  signChallenge,
  UserAuthInfo,
  verifySignedChallenge,
  WalletLoginError,
} from "@web3auth/base";
import bs58 from "bs58";

export abstract class BaseSolanaAdapter<T> extends BaseAdapter<T> {
  async authenticateUser(): Promise<UserAuthInfo> {
    if (!this.provider || !this.chainConfig?.chainId) throw WalletLoginError.notConnectedError();

    const { chainNamespace, chainId } = this.chainConfig;

    if (this.status !== ADAPTER_STATUS.CONNECTED) throw WalletLoginError.notConnectedError("Not connected with wallet, Please login/connect first");
    const accounts = await this.provider.request<string[]>({
      method: "getAccounts",
    });
    if (accounts && accounts.length > 0) {
      const existingToken = getSavedToken(accounts[0] as string, this.name);
      if (existingToken) {
        const isExpired = checkIfTokenIsExpired(existingToken);
        if (!isExpired) {
          return { idToken: existingToken };
        }
      }

      const payload = {
        domain: window.location.origin,
        uri: window.location.href,
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        version: "1",
        nonce: Math.random().toString(36).slice(2),
        issuedAt: new Date().toISOString(),
      };

      const challenge = await signChallenge(payload, chainNamespace);
      const encodedMessage = new TextEncoder().encode(challenge);
      const signedMessage = await this.provider.request<Uint8Array>({
        method: "signMessage",
        params: {
          message: encodedMessage,
          display: "utf8",
        },
      });
      const idToken = await verifySignedChallenge(chainNamespace, bs58.encode(signedMessage as Uint8Array), challenge, this.name, this.sessionTime);
      saveToken(accounts[0] as string, this.name, idToken);
      return {
        idToken,
      };
    }
    throw WalletLoginError.notConnectedError("Not connected with wallet, Please login/connect first");
  }

  async disconnect(): Promise<void> {
    if (this.status !== ADAPTER_STATUS.CONNECTED) throw WalletLoginError.disconnectionError("Not connected with wallet");
    const accounts = await this.provider.request<string[]>({
      method: "getAccounts",
    });
    if (accounts && accounts.length > 0) {
      clearToken(accounts[0], this.name);
    }
  }
}
