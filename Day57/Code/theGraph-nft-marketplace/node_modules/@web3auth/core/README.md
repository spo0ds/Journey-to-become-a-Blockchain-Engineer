# Web3Auth Plug and Play Core

[![npm version](https://img.shields.io/npm/v/@web3auth/core?label=%22%22)](https://www.npmjs.com/package/@web3auth/core/v/latest)
[![minzip](https://img.shields.io/bundlephobia/minzip/@web3auth/core?label=%22%22)](https://bundlephobia.com/result?p=@web3auth/core@latest)

> Web3Auth is where passwordless auth meets non-custodial key infrastructure for Web3 apps and wallets. By aggregating OAuth (Google, Twitter, Discord) logins, different wallets and innovative Multi Party Computation (MPC) - Web3Auth provides a seamless login experience to every user on your application.

Web3Auth Plug and Play Core is the main SDK that consists of the core module of Web3Auth Plug and Play. This SDK gives you all the needed modules for implementing the Web3Auth features, giving you the flexibility of implementing your own UI to use all the functionalities. 

## 📖 Documentation

Checkout the official [Web3Auth Documentation](https://web3auth.io/docs/sdk/web/core/) to get started.
## 🔗 Installation

```shell
npm install --save @web3auth/core
```
## ⚡ Quick Start

### Get your Client ID from Web3Auth Dashboard

Hop on to the [Web3Auth Dashboard](https://dashboard.web3auth.io/) and create a new project. Use the Client ID of the project to start your integration.

![Web3Auth Dashboard](https://web3auth.io/docs/assets/images/project_plug_n_play-89c39ec42ad993107bb2485b1ce64b89.png)

### Initialize Web3Auth for your preferred blockchain

Web3Auth needs to initialise as soon as your app loads up to enable the user to log in. Preferably done within a constructor, initialisation is the step where you can pass on all the configurations for Web3Auth you want. A simple integration for Ethereum blockchain will look like this:

```js
import { Web3AuthCore } from "@web3auth/core";

//Initialize within your constructor
const web3auth = new Web3AuthCore({
  clientId: "", // Get your Client ID from Web3Auth Dashboard
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x1",
  },
});

await web3auth.init();
```
### Login your User

Once you're done initialising, just create a button that triggers login for your preferred social channel for the user on their request. You can further use the returned provider for making RPC calls to the blockchain.

```js
const web3authProvider = await web3auth.connectTo(
    "openlogin",
    {
        loginProvider: 'google',
    },
)
```

## 🩹 Examples

Checkout the examples for your preferred blockchain and platform in our [examples repository](https://github.com/Web3Auth/examples/tree/main/web-core-sdk)

## 🌐 Demo

Checkout the [Web3Auth Demo](https://demo-app.web3auth.io/) to see how Web3Auth can be used in your application.

## 💬 Troubleshooting and Discussions

- Have a look at our [GitHub Discussions](https://github.com/Web3Auth/Web3Auth/discussions?discussions_q=sort%3Atop) to see if anyone has any questions or issues you might be having.
- Checkout our [Troubleshooting Documentation Page](https://web3auth.io/docs/troubleshooting) to know the common issues and solutions
- Join our [Discord](https://discord.gg/web3auth) to join our community and get private integration support or help with your integration.
