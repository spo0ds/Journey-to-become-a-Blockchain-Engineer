# Web3Auth Plug and Play Modal

[![npm version](https://img.shields.io/npm/v/@web3auth/web3auth?label=%22%22)](https://www.npmjs.com/package/@web3auth/web3auth/v/latest)
[![minzip](https://img.shields.io/bundlephobia/minzip/@web3auth/web3auth?label=%22%22)](https://bundlephobia.com/result?p=@web3auth/web3auth@latest)

> Web3Auth is where passwordless auth meets non-custodial key infrastructure for Web3 apps and wallets. By aggregating OAuth (Google, Twitter, Discord) logins, different wallets and innovative Multi Party Computation (MPC) - Web3Auth provides a seamless login experience to every user on your application.

This package provides main class for using default Web3Auth Modal. The package includes all of our packages and gives you a simple way of implementing Web3Auth within your interface. Additionally, it is a child class of [`@web3auth/core`](https://web3auth.io/docs/sdk/web/core/) package. Hence, you can still call all the functions available in the [`@web3auth/core`](https://web3auth.io/docs/sdk/web/core/) package.

## 📖 Documentation

Checkout the official [Web3Auth Documentation](https://web3auth.io/docs/sdk/web/web3auth/) to get started.
## 🔗 Installation

```shell
npm install --save @web3auth/web3auth
```

## ⚡ Quick Start

### Get your Client ID from Web3Auth Dashboard

Hop on to the [Web3Auth Dashboard](https://dashboard.web3auth.io/) and create a new project. Use the Client ID of the project to start your integration.

![Web3Auth Dashboard](https://web3auth.io/docs/assets/images/project_plug_n_play-89c39ec42ad993107bb2485b1ce64b89.png)

### Initialize Web3Auth for your preferred blockchain

Web3Auth needs to initialise as soon as your app loads up to enable the user to log in. Preferably done within a constructor, initialisation is the step where you can pass on all the configurations for Web3Auth you want. A simple integration for Ethereum blockchain will look like this:

```js
import { Web3Auth } from "@web3auth/web3auth";

//Initialize within your constructor
const web3auth = new Web3Auth({
  clientId: "", // Get your Client ID from Web3Auth Dashboard
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x1",
  },
});

await web3auth.initModal();
```

### Login your User

Once you're done initialising, just create a button that triggers to open the login modal for the user on their request. Logging in is as easy as:

```js
await web3auth.connect();
```

## 🩹 Examples

Checkout the examples for your preferred blockchain and platform in our [examples repository](https://github.com/Web3Auth/examples/tree/main/web-modal-sdk)

## 🌐 Demo

Checkout the [Web3Auth Demo](https://demo-app.web3auth.io/) to see how Web3Auth can be used in your application.

## 💬 Troubleshooting and Discussions

- Have a look at our [GitHub Discussions](https://github.com/Web3Auth/Web3Auth/discussions?discussions_q=sort%3Atop) to see if anyone has any questions or issues you might be having.
- Checkout our [Troubleshooting Documentation Page](https://web3auth.io/docs/troubleshooting) to know the common issues and solutions
- Join our [Discord](https://discord.gg/web3auth) to join our community and get private integration support or help with your integration.
