# Web3Auth Torus Solana Wallet Adapter

[![npm version](https://img.shields.io/npm/v/@web3auth/torus-solana-adapter?label=%22%22)](https://www.npmjs.com/package/@web3auth/torus-solana-adapter/v/latest)
[![minzip](https://img.shields.io/bundlephobia/minzip/@web3auth/torus-solana-adapter?label=%22%22)](https://bundlephobia.com/result?p=@web3auth/torus-solana-adapter@latest)

> Web3Auth is where passwordless auth meets non-custodial key infrastructure for Web3 apps and wallets. By aggregating OAuth (Google, Twitter, Discord) logins, different wallets and innovative Multi Party Computation (MPC) - Web3Auth provides a seamless login experience to every user on your application.

Torus solana adapter allows allows your Web3Auth Instance to connect with torus wallet for solana blockchain.  
## 📖 Documentation

Read more about the Web3Auth Torus Solana Wallet Adapter in the [official Web3Auth Documentation](https://web3auth.io/docs/sdk/web/adapters/torus-solana).

## 📄 Basic Details

- Adapter Name: `torus-solana`

- Package Name: [`@web3auth/torus-solana-adapter`](https://web3auth.io/docs/sdk/web/adapters/torus-solana)

- authMode: `DAPP`

- chainNamespace: `SOLANA`

- Default: `YES`

## 🔗 Installation

```shell
npm install --save @web3auth/torus-solana-adapter
```

## 🩹 Example


```ts
import { SolanaWalletAdapter } from "@web3auth/torus-solana-adapter";
const solanaWalletAdapter = new SolanaWalletAdapter({
  adapterSettings: {
    modalZIndex: 99999,
  },
  loginSettings: {
    loginProvider: "google",
  },
  initParams: {
    buildEnv: "testing",
  },
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    rpcTarget: "https://api.testnet.solana.com",
    blockExplorer: "https://explorer.solana.com",
    chainId: "0x2",
    displayName: "testnet",
    ticker: "sol",
    tickerName: "solana",
  },
});

// it will add/update  the torus-solana adapter in to web3auth class
web3auth.configureAdapter(solanaWalletAdapter);
```

Checkout the examples for your preferred blockchain and platform in our [examples repository](https://github.com/Web3Auth/examples/)

## 🌐 Demo

Checkout the [Web3Auth Demo](https://demo-app.web3auth.io/) to see how Web3Auth can be used in your application.

## 💬 Troubleshooting and Discussions

- Have a look at our [GitHub Discussions](https://github.com/Web3Auth/Web3Auth/discussions?discussions_q=sort%3Atop) to see if anyone has any questions or issues you might be having.
- Checkout our [Troubleshooting Documentation Page](https://web3auth.io/docs/troubleshooting) to know the common issues and solutions
- Join our [Discord](https://discord.gg/web3auth) to join our community and get private integration support or help with your integration.
