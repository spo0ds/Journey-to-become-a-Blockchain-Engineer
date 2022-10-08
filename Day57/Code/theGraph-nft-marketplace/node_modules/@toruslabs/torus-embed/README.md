# Torus Embed — New Frictionless login for Dapps by [Web3Auth](https://docs.tor.us)

[![npm version](https://badge.fury.io/js/%40toruslabs%2Ftorus-embed.svg)](https://badge.fury.io/js/%40toruslabs%2Ftorus-embed)
![npm](https://img.shields.io/npm/dw/@toruslabs/torus-embed)
[![minzip](https://img.shields.io/bundlephobia/minzip/@toruslabs/torus-embed?label=%22%22)](https://bundlephobia.com/result?p=@toruslabs/torus-embed)

> [Web3Auth](https://web3auth.io) is where passwordless auth meets non-custodial key infrastructure for Web3 apps and wallets. By aggregating OAuth (Google, Twitter, Discord) logins, different wallets and innovative Multi Party Computation (MPC) - Web3Auth provides a seamless login experience to every user on your application.

## 📖 Documentation

Checkout the official [Torus Documentation for Torus Embed](https://docs.tor.us/wallet/api-reference/installation) to get started.

## 🔗 Installation

```shell
npm install --save @toruslabs/torus-embed
```

## ⚡ Quick Start

### Get your Client ID from Web3Auth Dashboard

Hop on to the [Web3Auth Dashboard](https://dashboard.web3auth.io/) and create a new Torus Wallet project. Use the Client ID of the project to start your integration.

![Web3Auth Dashboard - Torus Wallets](https://user-images.githubusercontent.com/6962565/187207423-d7b8f085-3388-477c-b945-c7db1b991839.png)

## Initialize & Login

```ts
import Torus from "@toruslabs/torus-embed";
import Web3 from "web3";

const torus = new Torus();
await torus.init();
await torus.login(); // await torus.ethereum.enable()
const web3 = new Web3(torus.provider); 
```

## 🩹 Examples

Checkout the example of `Torus Embed` in our [example directory.](https://github.com/torusresearch/torus-embed/tree/develop/examples)

## 🌐 Demo

Checkout the [Torus Embed Demo](https://demo-eth.tor.us) to see how `Torus Embed` can be used in your application.

## 💬 Troubleshooting and Discussions

- Have a look at our [GitHub Discussions](https://github.com/Web3Auth/Web3Auth/discussions?discussions_q=sort%3Atop) to see if anyone has any questions or issues you might be having.
- Checkout our [Troubleshooting Documentation Page](https://web3auth.io/docs/troubleshooting) to know the common issues and solutions
- Join our [Discord](https://discord.gg/web3auth) to join our community and get private integration support or help with your integration.

## Introduction

This module generates the javascript to include in a DApp via a script tag.
It creates an iframe that loads the Torus page and sets up communication streams between
the iframe and the DApp javascript context.

Please refer to docs for API Reference available [here](https://docs.tor.us/wallet/api-reference/installation) or [change log](https://docs.tor.us/torus-wallet/changelog).

## Features

- Typescript compatible. Includes Type definitions

Please refer to docs for API Reference available [here](https://docs.tor.us/wallet/api-reference/installation) or [change log](https://docs.tor.us/torus-wallet/changelog).

## Installation

### Bundling

This module is distributed in 3 formats

- `commonjs` build `dist/torus.cjs.js` in es5 format
- `umd` build `dist/torus.umd.min.js` in es5 format without polyfilling corejs minified
- `umd` build `dist/torus.polyfill.umd.min.js` in es5 format with polyfilling corejs minified

By default, the appropriate format is used for your specified usecase
You can use a different format (if you know what you're doing) by referencing the correct file

The cjs build is not polyfilled with core-js.
It is upto the user to polyfill based on the browserlist they target

### Directly in Browser

CDN's serve the non-core-js polyfilled version by default. You can use a different

jsdeliver

```js
<script src="https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed"></script>
```

unpkg

```js
<script src="https://unpkg.com/@toruslabs/torus-embed"></script>
```

### Tips for NUXT

This is a plugin that works [only on the client side](https://nuxtjs.org/guide/plugins/#client-side-only). So please register it as a ssr-free plugin.

## Usage

Please refer to the [examples](examples) folder for details on usage using dynamic import.

## Rehydration

Torus uses `window.sessionStorage` to store user details.

So, if the user reloads the page, all his data would be rehydrated and the user doesn't need to log in.

The samples provided in the [examples](examples) folder illustrate the above case.

## Build

Ensure you have a `Node.JS` development environment setup:

```
git clone https://github.com/torusresearch/torus-embed.git
cd torus-embed
npm install
npm run build
```

To run tests:

```
npm run test:e2e:headful
npm run test:build-embed
```

entry-point: `index.js`

## Requirements

- This package requires a peer dependency of `@babel/runtime`
- Node 14+

## License

`torus-embed` is [MIT Licensed](LICENSE)
