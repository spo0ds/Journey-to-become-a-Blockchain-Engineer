## HTML / JavaScript Fund Me
#### Intro to front end / full stack

In this section we're going to see some of the differences between node js between that backend javascript and javascript in the browser or front end javascript.

People can programmatically interact with smart contracts at any time.However most of our users are not going to be developers.So we need to create a website, create a User Interface for them to interact with our smart contract and interact with our protocols.It's going to be an introduction to building these front ends on top of our smart contracts.Here we're actually going to make our first front end, our first website using the blockchain using web3 and it's going to be incredibly minimalistic website.We're not going to have any styling.We're just going to show you how to get the functionality.We're going to do couple of things that aren't really recommended and are definitely not best practices.The reason we're going to do this is the same reason that in math class before you learn the tricks for derivatives, you learn what a derivative actually is.So that you can understand what's going on the websites when you interact with them and when you work with them.

We saw already with faucets.chain.link where we can connect our wallet and we can work with the faucets.All decentralized applications have this website and have this setup where you can connect your wallet and then you can interact by clicking buttons which make these function calls to the blockchain.This section is just going to teach what's going on under the hood so you can really understand how to build these applications at a professional level.

When building Dapps, you usually have 2 repos
- One for the smart contracts
- One for the front end / website

It's going to be the combination of these two repos which makes up the full stack.So when people are talking about full stacks, they're talking about smart contracts which is going to be our backend plus html / javascript / website stuff which is going to be our frontend.

`Full Stakc = Smart contracts (backend) + Html / Javascript / Website stuff (frontend)`

We need to understand what exactly is going on when work with websites that use the blockchain.

**How websites work with web3 wallet?**

Typically you'll see connect button and when you click metamask or some other wallet connector will pop up.After the buttons shows connected, you can execute functions and interact with our smartcontracts.This is something that you see in AAVE.So what is actually going on in the browser when we connect and what we need to do?

Right click and hit inspect and on the right side debugger will pop up.Now if you go over to sources, you'll see few things like file explorer in VS code.We'll see url which will be localhost and a metamask wallet.Metamask is what injected from our browser extensions.The reason that we see metamask thing is because I've metamask installed.Now what happens when we have extensions installed is they automatically get injected into a window object in JavaScript.

If we do `window.ethereum` in the console, we'll see the object.This object only exists if we have a metamask.If you want to look at some other web3 wallet, you do `window.solana`.In order for our browsers to know there's metamask those extensional automatically add them to our window objects and that's something that we can check for in our JavaScript.

The reson that these wallets are so important is built into them underneath the hood, they have a blockchain node connected to them and in order to interact with the blockchain, we always need a node.And you might have seen URLs from alchemy or infura because you need them to interact with the blockchain.Alchemy and Infura are third party blockchains that you can interact with and basically rent but you need them to create the provider or a node to send your transactions to.So you could do it in Javascript show in [alchemy documentation](https://docs.alchemy.com/alchemy/introduction/getting-started/sending-txs).You take that Alchemy URL stick it into some object and use that to send your transaction.This is a way you can do in the backend.

But on the front end, you normally want to use the user's metamask.There are ton of other different types of wallet to connect like ledger, mew wallet, coinbase etc and there are different ways to set those up but they all do the same thing where they expose some URL, expose some node under the hood.The way metamask does it with `windows.ethereum`.If we go to the network section of Metamask, we can see the RPC URL of each network.It's the HTTP RPL URL connection of the blockchain node that's running.Metamask just has a really nice way of taking that URL, sticking it in the browser for us in the window.ethereum.This is the main thing that we need to know.We always need the connection with the blockchain and the browsers wallet are an easy way to do that.

**HTML Setup**

In this section we're going to be using raw HTML and JavaScript conjunction with our smart contracts to build the website.Let's go ahead and create our HTML for our website.We'll call it "index.html" and this is going to be the basic scaffolding or the basic bones of what our website is going to look like.In VS code if you type `!` and press enter, it'll automatically populate you file with some basic html setup.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```

However for simplicity we don't need most of these.So we're going to make this a little bit easier.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Fund Me Website</title>
</head>
<body>
    
</body>
</html>
```

And then inside of body, we can do something like:

```html
<body>
    Hello!
</body>
```

Now we've a bare bone to create a website just with this.Now to show this on a website, I recommend to install the extension `live server`.This allows us to easily spin up html website.Once this is installed, you should have `go live` button at the bottom.

**Connecting HTML to MetaMask**

Let's update the HTML so that it has those buttons and it can actually connect and work with any blockchain.Something else you can do in html is you can actually write JavaScript inside your HTML and the way we can do it is by `script` tag.

```html
<body>
    Hello!
    <script>
        
    </script>
</body>
```

Anything inside script tag is going to be JavaScript.So I could do something like `console.log("Hi!!")`, go back to our frontend, right click and hit inspect, go to console and we could see "Hi!!" printed out. As we learned before that in the console, we can check for window.ethereum to see if metamask is installed.Again alot of what we are working on is right in the [metamask documentation](https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider).Using window.ethereum is just one of the ways we're actually going to connect to the blockchain.There's actually multiple ways because there's multiple different kinds of wallets out there.But for now, we're just going to pretend that window.ethereum and the metamask is the only extension out there.

So we want to check to see if the window.ethereum exists.This is the first thing that we should be doing because if this doesn't exist, this means that they can connect to the blockchain.

```html
    <script>
        if (typeof window.ethereum != "undefined"){
            console.log("I see metamask wallet :D")
        }
    </script>
```

We could automatically try to connect to metamask if we see that there's a metamask.We could run `eth_requestAccounts` method that is basically going to be how we connect our MetaMask.This is specified by new `EIP-1102` but in older documentation and tutorials, you might see `ethereum.enable()` which essentially does the exact same thing.

```html
<script>
        if (typeof window.ethereum != "undefined"){
            window.ethereum.request({method: "eth_requestAccounts"})
        }else {
            console.log("No metamask :(")
        }
</script>
```

Now if you save it, you can actually see metamask pop of and say let's connect.We'll automatically connect our metamask to our website and if we look at our metamask, we can see the connected thing.It's saying our account is connected to the website.This means that the website can now make API calls to our metamask.We still have to be the one to approve them but it can go ahead and connect and try to run transactions.

The way that we've our code currently is anytime we hit refresh, metamask is going to pop up which is going to be really annoying.We're going to wrap the if statement into asynchronous function.

```html
<script>
        async function connect(){
            if (typeof window.ethereum != "undefined"){
                window.ethereum.request({method: "eth_requestAccounts"})
            }else {
                console.log("No metamask :(")
            }
         }
</script>
```

We need to call connect function. We can add a button underneath our script tag.We'll give it an id, and call the button "Connect".When we click it, we'll call the connect function.

```html
<button id="connectButton" onclick="connect()"> Connect </button>
```

So if we save and go back to our frontend, we now see we've  little "Connect" button and if we press connect, metamask is going to pop up and connect it.We can add await to the connection so that we can finish before moving on.

```javascript
await window.ethereum.request({method: "eth_requestAccounts"})
```

We can also update our website accordingly so that we can let users know that we're connected.We can grab the connect button element id and say that we're connected, once we're connected.

```html
<script>
        async function connect(){
            if (typeof window.ethereum != "undefined"){
                await window.ethereum.request({method: "eth_requestAccounts"})
                document.getElementById("connectButton").innerHTML = "Connected!"
            }else {
                document.getElementById("connectButton").innerHTML = "Please install MetaMask"
            }
         }
</script>
```

After metamask is connected, our button will look like this:

![button](Images/m54.png)

***JavaScript in it's own files***

Now we want to actually go ahead and do some functions here.This is where we want to create some more functions and more buttons that we're going to use ethers that package that we've become so familiar with.As we code our script section is going to get bigger and bigger so oftentimes, we actually want to put our code in a JavaScript file itself.

We're going to create a new file "index.js" and instead of putting our JavaScript inside script tags, we're going to put it in the index and then import the index.js into our html.

```html
<body>
    Hello!
    <script src="./index.js" type="text/javascript"> </script>
    <button id="connectButton" onclick="connect()"> Connect </button>
</body>
```

Even with index.js in different file, when we hit connect, it still calls our connect function.

**ES6 (FrontEnd JS) VS NodeJS**

Now we want to create our fund function and then later on, we're going to create withdraw function.This is where frontend JavaScript code and nodeJS are a little bit different.In nodeJS we've been using the `require` keyword to import dependencies.In fronend JavaScript, you can't use require.Later on we're going to use the import keyword which is the better way to do this and this is where our first differences going to be.Using the import keyword for frontend is much better than the require keyword especially since the require keyword doesn't actually work.

To make our fund function, what we normally do?Well, we'd create an async function called fund.In this fund function, we probably want to take some eth amount as a parameter because we want to fund it with some amount of ethereum.

```javascript
async function fund(ethAmount) {
}
```

We can call this fund function, the same way we call connect.So in our index.html, we'll create a new button.

```html
<button id="fund" onclick="fund()"> Fund </button>
```

To send the transaction, what are the things that we need? Well we need a provider/ connection to the blockchain, signer / wallet / someone with some gas to actually send it and we probably need the contract that we're interacting with.To get that contract, we're going to need ABI and address.With these all together, we can send any transaction.

So get our provider, we're actually going to go ahead and work with ethers again.We're going to do a little bit differently.Before the way we worked with ethers is `const { ethers } = require("ethers")`.This is how we pulled ethers.Like I just said to you though, require doesn't work in the frontend and we actually don't want to install ethers with a node modules package.

If we go to the [ethers documentation](https://docs.ethers.io/v5/getting-started/), they've a section about importing using node js which uses require or imports and then they also have some documentation for working with the web browser.So instead of doing node modules, we'll copy the [ethers library](https://cdn.ethers.io/lib/ethers-5.6.esm.min.js) to our own directories and serve it our selves. Copy the massive file which is ethers but in frontend addition, and make a new file "ethers-5.6.esm.min.js" and paste all that massive thing in here.Now we can import this file in our index.js.

```javascript
import { ethers } from "./ethers-5.6.esm.min.js"
```

Now we only need to do this weird copy pasting of the file import thing in this HTML / JavaScript.In future with nodeJS, we're going to do yarn add ethers kinda like we've normally seen. The frameworks like react and nextJS that we're going to use are going to automatically convert those yarn added packages to their frontend version.But for now this is how we're going to import the ethers package.

The other thing that we've to do is in our frontend is we've to change `type="text/javascript"` to `type="module"`.Changing this to module allows us to import modules into our code which we're going to be importing `ethers` and we're going to import another modules as well.

Instead of calling "Connect" function from the frontend like we did, we're going to remove the `onClick`'s 

```html
<body>
    Hello!
    <script src="./index.js" type="module"> </script>
    <button id="connectButton"> Connect </button>
    <button id="fundButton"> Fund </button>
</body>
```

and in our index.js we'll add those connect buttons.

```javascript
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
```

Then we'll say:

```javascript
connectButton.onclick = connect // function name
fundButton.onclick = fund
```

This is all due to type being module.If it was text/javascript, that onclick button adding was as it as.

Since we've got `connectButton` and `fundButton` in our index.js we might as well update the button inner html change.

```javascript
async function connect() {
  if (typeof window.ethereum != "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectButton.innerHTML = "Connected!"
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}
```

Now connect button is going to be same as running `document.getElementById`.

```javascript
const connectButton = document.getElementById("connectButton")
```

**Sending a Transaction from a Website**

Let's go back to continuing our fund function.

```javascript
if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
  }
```

Web3Provider is an object in ethers that allows us to basically wrap around stuff like MetaMask.The Web3Provider is really similar to that `JsonRpcProvider` where we put in exactly that our alchemy endpoint.Web3Provider takes that http endpoint and automatically sticks it in ethers for us. 

This line of code basically looks at our MetaMask and goes "Okay I found the HTTP endpoint inside their MetaMask."That's going to be what we're going to use as our provider.

Since our provider is connected to MetaMask, we can get a signer or we can get a wallet just by :

```javascript
const signer = provider.getSigner()
```

This is going to return whichever wallet is connected from the provider.If we're connected as the Account1, it's going to return Account1 as the signer.After we console.log(signer), when we hit fund, we've our JsonRpcSigner.The signer is going to be the account that we've connected to our frontend.

We've provider and the signer.Now we're going to need our contract by getting the ABI and the address.How are we going to get our contract?Well this is where we're going to need to know the ABI and the address of what we're working with.Typically what you'll see alot of projects so since once a contract is deployed, the addresses is going to change is they're going to have some type of constants file "constants.js" and inside the file, they'll add address, abi and anything like that for us to use in our fund piece here.

As we're developing and as we're building, the backend and the frontend team are gonna have to interact a little bit or if it's just you doing the full stack, you're going to have to interact with your backend.So this is why it's so important it have both your frontend and your backend code nearby.so if we go back to our hardhat fund me project that we just made, we can find the abi if we go to artifacts/contracts/FundMe.sol/FundMe.json. Copy the ABI and save it as variable in "constant.js" and back in our index.js, we can import it with:

```javascript
import { abi } from "./constants.js"
```

Well we've the ABI but what about the address? Since we're going to be running this locally, we want to get the contract address of the locally run contract.We can do that a couple of ways.One way is you can have two windows open one with your frontend code and one with your backend code.The one with your backend code, you can run `yarn hardhat node` which will spin up our blockchain node for us and give us the address.

Or what we can do is in your window with your frontend code, create a new terminal and in second one, we're going to run `yarn hardhat node` only if we're inside the hardhat-fund-me directory.
