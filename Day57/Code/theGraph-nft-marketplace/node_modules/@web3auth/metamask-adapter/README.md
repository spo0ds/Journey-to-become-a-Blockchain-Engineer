# Web3Auth Metamask Adapter

[![npm version](https://img.shields.io/npm/v/@web3auth/metamask-adapter?label=%22%22)](https://www.npmjs.com/package/@web3auth/metamask-adapter/v/latest)
[![minzip](https://img.shields.io/bundlephobia/minzip/@web3auth/metamask-adapter?label=%22%22)](https://bundlephobia.com/result?p=@web3auth/metamask-adapter@latest)

> Web3Auth is where passwordless auth meets non-custodial key infrastructure for Web3 apps and wallets. By aggregating OAuth (Google, Twitter, Discord) logins, different wallets and innovative Multi Party Computation (MPC) - Web3Auth provides a seamless login experience to every user on your application.

Metamask Adapter allows your Web3Auth Instance to connect to login with Metamask Wallet. 

## 📖 Documentation

Read more about the Web3Auth Metamask Adapter in the [official Web3Auth Documentation](https://web3auth.io/docs/sdk/web/adapters/metamask).

## 📄 Basic Details

- Adapter Name: `metamask`

- Package Name: [`@web3auth/metamask-adapter`](https://web3auth.io/docs/sdk/web/adapters/metamask)

- authMode: `DAPP`

- chainNamespace: `EIP155`

- Default: `YES`

## 🔗 Installation

```shell
npm install --save @web3auth/metamask-adapter
```

## 🩹 Example

```ts
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
const metamaskAdapter = new MetamaskAdapter();

// it will add/update  the metamask adapter in to web3auth class
web3auth.configureAdapter(metamaskAdapter);
```

Checkout the examples for your preferred blockchain and platform in our [examples repository](https://github.com/Web3Auth/examples/)

## 🌐 Demo

Checkout the [Web3Auth Demo](https://demo-app.web3auth.io/) to see how Web3Auth can be used in your application.

## 💬 Troubleshooting and Discussions

- Have a look at our [GitHub Discussions](https://github.com/Web3Auth/Web3Auth/discussions?discussions_q=sort%3Atop) to see if anyone has any questions or issues you might be having.
- Checkout our [Troubleshooting Documentation Page](https://web3auth.io/docs/troubleshooting) to know the common issues and solutions
- Join our [Discord](https://discord.gg/web3auth) to join our community and get private integration support or help with your integration.
