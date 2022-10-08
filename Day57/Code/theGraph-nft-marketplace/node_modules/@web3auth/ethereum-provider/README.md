# Web3Auth Ethereum Provider

[![npm version](https://img.shields.io/npm/v/@web3auth/ethereum-provider?label=%22%22)](https://www.npmjs.com/package/@web3auth/ethereum-provider/v/latest)
[![minzip](https://img.shields.io/bundlephobia/minzip/@web3auth/ethereum-provider?label=%22%22)](https://bundlephobia.com/result?p=@web3auth/ethereum-provider@latest)

> Web3Auth is where passwordless auth meets non-custodial key infrastructure for Web3 apps and wallets. By aggregating OAuth (Google, Twitter, Discord) logins, different wallets and innovative Multi Party Computation (MPC) - Web3Auth provides a seamless login experience to every user on your application.

Web3Auth Ethereum Provider can be used to interact with wallet or connected EVM compatible chain using RPC calls. This is an EIP-1193 compatible JRPC provider. This package exposes a class `EthereumPrivateKeyProvider`, which accepts a `secp251k1` private key and returns `EIP1193` compatible provider, which can be used with various wallet sdks.

## 📖 Documentation

Read more about Web3Auth Ethereum Provider in the [official Web3Auth Documentation](https://web3auth.io/docs/sdk/web/providers/evm#getting-a-provider-from-any-secp512k1-private-key/).

## 🔗 Installation

```shell
npm install --save @web3auth/ethereum-provider
```

## 🩹 Example

```ts
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import type { SafeEventEmitterProvider } from "@web3auth/base";
const signEthMessage = async (provider: SafeEventEmitterProvider): Promise<string> => {
  const web3 = new Web3(provider as any);
  const accounts = await web3.eth.getAccounts();
  // hex message
  const message = "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
  const signature = await web3.eth.sign(message, accounts[0]);
  return signature;
};

(async () => {
  const provider = await EthereumPrivateKeyProvider.getProviderInstance({
    chainConfig: {
      rpcTarget: "https://polygon-rpc.com",
      chainId: "0x89", // hex chain id
      networkName: "matic",
      ticker: "matic",
      tickerName: "matic",
    },
    privKey: "4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318",
  });
  const signedMessage = await signEthMessage(provider);
})();
```

Checkout the examples for your preferred blockchain and platform in our [examples repository](https://github.com/Web3Auth/examples/)

## 🌐 Demo

Checkout the [Web3Auth Demo](https://demo-app.web3auth.io/) to see how Web3Auth can be used in your application.

## 💬 Troubleshooting and Discussions

- Have a look at our [GitHub Discussions](https://github.com/Web3Auth/Web3Auth/discussions?discussions_q=sort%3Atop) to see if anyone has any questions or issues you might be having.
- Checkout our [Troubleshooting Documentation Page](https://web3auth.io/docs/troubleshooting) to know the common issues and solutions
- Join our [Discord](https://discord.gg/web3auth) to join our community and get private integration support or help with your integration.
