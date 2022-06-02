## Ethers.js Simple Storage

Before we can actually learn `HardHat`, we've to learn `Ethers.js` which is a javascript based library for working with smart contracts and it also powers Hardhat.Under the hood of hardhat, there's lot of ethers.js.So it's important for us to learn Ethers.js so that we can understand what hardhat is actually doing.

**Installation**

Once you've VS code installed, the next thing that we're going to install is going to be [node js](https://nodejs.org/en/download/).

`sudo apt install nodejs`

next we're going to install git

`sudo apt install git-all`

Now we're going to start working with ethers and start learning to code our transactions and our contract deployment everything programmatically at a relatively low level.We're going to learn how to deploy and interact with the contract using the `ethers.js` package.

Now let's create a folder where we put all our contracts.

`mkdir ethers-simple-storage`

to go inside the folder

`cd ethers-simple-storage/`

We can create a new file called "SimpleStorage.sol".Change the verion to 0.8.0.

Let's also add our default formatter for our JavaScript code.Let's create our new file called "deploy.js".

Install `prettier` extension in VS code and then open settings.json

![js](Images/m1.png)

which will format our JS code when we hit save.

We got our JS formatter as well.Let's start writing some JavaScript code.

