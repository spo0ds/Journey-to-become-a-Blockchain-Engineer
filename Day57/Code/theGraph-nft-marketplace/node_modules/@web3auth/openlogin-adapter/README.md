# Web3Auth Openlogin Adapter

[![npm version](https://img.shields.io/npm/v/@web3auth/openlogin-adapter?label=%22%22)](https://www.npmjs.com/package/@web3auth/openlogin-adapter/v/latest)
[![minzip](https://img.shields.io/bundlephobia/minzip/@web3auth/openlogin-adapter?label=%22%22)](https://bundlephobia.com/result?p=@web3auth/openlogin-adapter@latest)

> Web3Auth is where passwordless auth meets non-custodial key infrastructure for Web3 apps and wallets. By aggregating OAuth (Google, Twitter, Discord) logins, different wallets and innovative Multi Party Computation (MPC) - Web3Auth provides a seamless login experience to every user on your application.


This adapter is a wrapper around the [`openlogin`](https://www.npmjs.com/package/@toruslabs/openlogin) library from Web3Auth (previously Torus) and enables the main social login features of Web3Auth. By default, Web3Auth has
certain configuration set to enable a quick integration, however, for customising features, like Whitelabel,
Custom Authentication, etc. you need to customise the Openlogin Adapter. With the Openlogin Adapter package installed and
instantiated, you can explore a number of options and can customise the login experience of the user as per your needs.

## 📖 Documentation

Read more about the Web3Auth Openlogin Adapter in the [official Web3Auth Documentation](https://web3auth.io/docs/sdk/web/openlogin).


## 📄 Basic Details

- Adapter Name: `openlogin`

- Package Name: [`@web3auth/openlogin-adapter`](https://web3auth.io/docs/sdk/web/openlogin)

- authMode: `WALLET`, `DAPP`

- chainNamespace: `EIP155`,`SOLANA`

- Default: `YES`

## 🔗 Installation

```shell
npm install --save @web3auth/openlogin-adapter
```

## 🩹 Example

### Using with `web3auth/web3auth` (Web3Auth Plug and Play Modal Package)

```js
const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    clientId,
    network: "testnet",
    uxMode: "popup",
    whiteLabel: {
      name: "Your app Name",
      logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
      logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
      defaultLanguage: "en",
      dark: true, // whether to enable dark mode. defaultValue: false
    },
    loginConfig: {
      // Add login configs corresponding to the providers on modal
      // Google login
      google: {
        name: "Custom Auth Login",
        verifier: "YOUR_GOOGLE_VERIFIER_NAME", // Please create a verifier on the developer dashboard and pass the name here
        typeOfLogin: "google", // Pass on the login provider of the verifier you've created
        clientId: "GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Pass on the clientId of the login provider here - Please note this differs from the Web3Auth ClientID. This is the JWT Client ID
      },
      // Facebook login
      facebook: {
        name: "Custom Auth Login",
        verifier: "YOUR_FACEBOOK_VERIFIER_NAME", // Please create a verifier on the developer dashboard and pass the name here
        typeOfLogin: "facebook", // Pass on the login provider of the verifier you've created
        clientId: "FACEBOOK_CLIENT_ID_1234567890", // Pass on the clientId of the login provider here - Please note this differs from the Web3Auth ClientID. This is the JWT Client ID
      },
      // Add other login providers here
    },
  },
  loginSettings: {
    mfaLevel: "mandatory",
  },¯
});
web3auth.configureAdapter(openloginAdapter);
```

### Using with `web3auth/core` (Web3Auth Plug and Play Core Package)

```js
const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    clientId,
    network: "testnet",
    uxMode: "popup",
    whiteLabel: {
      name: "Your app Name",
      logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
      logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
      defaultLanguage: "en",
      dark: true, // whether to enable dark mode. defaultValue: false
    },
    loginConfig: {
      jwt: {
        name: "Web3Auth-Auth0-JWT",
        verifier: "web3auth-auth0",
        typeOfLogin: "jwt",
        clientId: "294QRkchfq2YaXUbPri7D6PH7xzHgQMT",
      },
    },
  },
});
web3auth.configureAdapter(openloginAdapter);
```

Checkout the examples for your preferred blockchain and platform in our [examples repository](https://github.com/Web3Auth/examples/)

## 🌐 Demo

Checkout the [Web3Auth Demo](https://demo-app.web3auth.io/) to see how Web3Auth can be used in your application.

## 💬 Troubleshooting and Discussions

- Have a look at our [GitHub Discussions](https://github.com/Web3Auth/Web3Auth/discussions?discussions_q=sort%3Atop) to see if anyone has any questions or issues you might be having.
- Checkout our [Troubleshooting Documentation Page](https://web3auth.io/docs/troubleshooting) to know the common issues and solutions
- Join our [Discord](https://discord.gg/web3auth) to join our community and get private integration support or help with your integration.
