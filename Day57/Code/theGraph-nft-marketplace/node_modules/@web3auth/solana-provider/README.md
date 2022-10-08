# Web3Auth Solana Provider

[![npm version](https://img.shields.io/npm/v/@web3auth/solana-provider?label=%22%22)](https://www.npmjs.com/package/@web3auth/solana-provider/v/latest)
[![minzip](https://img.shields.io/bundlephobia/minzip/@web3auth/solana-provider?label=%22%22)](https://bundlephobia.com/result?p=@web3auth/solana-provider@latest)

> Web3Auth is where passwordless auth meets non-custodial key infrastructure for Web3 apps and wallets. By aggregating OAuth (Google, Twitter, Discord) logins, different wallets and innovative Multi Party Computation (MPC) - Web3Auth provides a seamless login experience to every user on your application.

Web3Auth Solana Provider can be used to interact with wallet or connected Solana chain using RPC calls. This is a Solana chain compatible JRPC provider.

## 📖 Documentation

Read more about Web3Auth Ethereum Provider in the [official Web3Auth Documentation](https://web3auth.io/docs/sdk/web/providers/solana).

## 🔗 Installation

```shell
npm install --save @web3auth/solana-provider
```

## 🩹 Example

```ts
import { PrivateKeyWallet } from "@web3auth/solana-provider";

/*
privKey: any secp512k1 private key.
*/

async setProvider(privKey: string) {
    this.PrivateKeyProvider = new PrivateKeyWallet({
    config: {
        /*
        pass the chain config that you want to connect with
        all chainConfig fields are required.
        */
        chainConfig: {
        rpcTarget: "https://ssc-dao.genesysgo.net", // This is the testnet RPC we have added, please pass on your own endpoint while creating an app
        displayName: "solana",
        ticker: "SOL",
        tickerName: "Solana",
        },
    },
    });
    /*
    pass user's private key here.
    after calling setupProvider, we can use
    this.ethereumPrivateKeyProvider._providerProxy as a eip1193 provider
    */
    const provider = await this.PrivateKeyProvider.solanaPrivateKey(privKey);
}
```

Checkout the examples for your preferred blockchain and platform in our [examples repository](https://github.com/Web3Auth/examples/)

## 🌐 Demo

Checkout the [Web3Auth Demo](https://demo-app.web3auth.io/) to see how Web3Auth can be used in your application.

## 💬 Troubleshooting and Discussions

- Have a look at our [GitHub Discussions](https://github.com/Web3Auth/Web3Auth/discussions?discussions_q=sort%3Atop) to see if anyone has any questions or issues you might be having.
- Checkout our [Troubleshooting Documentation Page](https://web3auth.io/docs/troubleshooting) to know the common issues and solutions
- Join our [Discord](https://discord.gg/web3auth) to join our community and get private integration support or help with your integration.
