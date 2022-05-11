## Chainlink Mix

That was a lot of stuff to code and quite frankly I don't think any of us want to have to do that every single time have to code everything from scratch.There's actually even easier way first to start with a blank project here and this is with [brownie mixes](https://github.com/brownie-mix).It has ton of boilerplate code for us to go ahead and get started to start start developing.The one we're gonna be working with is chainlink-mix piece.This gives us some wonderful contracts, tests, brownie config and really everything we need to do to get started.If you've brownie installed, you can just bake this mix.

`brownie bake chainlink-mix`

We'll get new chainlink folder with everything inside of it.In contracts we've a whole bunnch of different samples of working with the vrf, pricefeed, keepers to automate our smart contracts and making api calls and delivering any api call that we want to the blockchain.It also has a brownie config which already has a number of wonderful pieces in each networks.So that we don't have to go copy paste and add it in here.It's even got support for testnets like avalanche, polygon, binance and more.It has a number of really powerful tests including testing some pricefeeds.It has whole bunch of deployment scripts, some mocking scripts, some helpful scripts and really everything that we need to get started and get going.For starters we can run  `brownie test` and it's going to compile everything and then on a development chain run all the unit tests and if we want to test on a real testnet, we could do `brownie test --network rinkeby`

If you're looking for a good starter place that has alot of really powerful smart contracts for you to get started, I highly recommend using this mix as a boilerplate starting point for any of your contracts or any of your projects.


## ERC20s, EIPs, and Token Standards

We've learned a ton of fundamentals of working with brownie and smart contracts.Now that we've kind of all the building blocks though we can actually code alot of these much faster and much more efficiently than before.

One of the things that we've seen over and over again is working with tokens and the ERC-20 token standard.We're going to learn how to build our own token.Before we do that let's understand why we'd even want to do this.

![tokens](/Images/Day11/j1.png)

ERC20s are tokens that are deployed on a chain using what's called the ERC20 token standard.You can read more about ERC-20 token standard [here](https://eips.ethereum.org/EIPS/eip-20).Well basically it's a smart contract that actually represents a token.So it's a token with a smart contract.It's both.Tether, chainlink, uni token and dai are all examples of ERC-20s.Technically chainlink is in the ERC677 as there as upgrades to the ERC20 that some tokens take that are still backwards compatible with ERC20s.So basically you can think of them as a ERC20s with a little additional functionality.

**Why make an ERC20?**

- Governance Tokens
- Secure an underlying network
- Create a synthetic asset


**How do we build one of these tokens?**

All we have to do is build a smart contract that follows the token standard.Build the smart contract that has functions like name, symbol, decimals etc as mentioned in [here](https://eips.ethereum.org/EIPS/eip-20).We need to be able to transfer it, get balance of it etc.Again if you want to check out some of the improvements that are still ERC20 compatible like the ERC677 or the ERC777, you can definitely check those out and build one of those instead.Let's create our new folder and get started.To create new brownie file:

`brownie init`

It's going to startup our repository and everything that we're going to work with here.We can kind of actually just jump in and start with our contracts.Let's create a new file inside contracts directory called "OurToken.sol" and this is where we're gonna add all of our token code.

Since [this](https://eips.ethereum.org/EIPS/eip-20) is an EIP, we could grab all the functions and past them inside our file "OurToken.sol" and then you know code all these up like these does some stuff blah blah.Or we could do it the much easier way.Since we're engineers we don't always want to reinvent the wheel.So once again our friend OpenZeppelin have some amazing [contract packages](https://docs.openzeppelin.com/contracts/4.x/erc20) for building our own ERC20 token.

![ERC20](/Images/Day11/j2.png)

This is the entirety of the code that is needed to make an ERC20.We can copy and paste this.Boom we've our ERC20 token.Let's actually change the name of everything here though.We're gonna be using solidity version 0.8 which I know I've done alot of this in 0.6 but I highly recommend working with 0.8 because it has a lot of really fantastic improvements to solidity.

**Solidity 0.8**

You'll notice this is our first dive into using a different version of solidity.You'll notice that most of the syntax is exactly the same.There are like I said couple of nice improvements with 0.8.The main one being you no longer have to use those safeMath functions that we talked about before.

Then we go ahead and import openzeppelin.Since we're importing openzeppelin, we're gonna add this to our brownie config and before we even get started, you technically have all the tools that you need to code and deploy your own ERC20 token.

Now I'm actually gonna challenge you to go ahead and try to start a brownie project, create your own token using openzeppelin packages and then deploy it on a testnet.I'm going to show you how to do all of it anyways but challenging yourself and trying to do things your own way and exploring is really one of the fastest ways to learn and grow in this space.

We need to add dependencies in our brownie-config file.

![dependencies](/Images/Day11/j3.png)

If you go to Github of [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts), you can see the latest release.4.5.0 is the latest relaease at this time.So I used it.

![openZeppelingVersion](/Images/Day11/j4.png)

Now we can import ERC20.sol contract from OpenZeppelin.Let's change the contract name to OurToken which we're going to inherit from [ERC20 from OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol).In our constructor, we're going to add our initial supply which is going to be in a wei and we're going to use the constructor of ERC20.It uses name and a symbol.We'll give a name to our token as "OurToken" and the symbol we'll do "OT".This is literally all we need for our token here.

![OurToken](/Images/Day11/j5.png)

**1_deploy_token.py**

For scripts all we have to do is create a new file "1_deploy_token.py" and "helpful_scripts.py".We'll quickly add get_account function in our helpful_scripts.You can go ahead and just copy paste from the last one.And to make sure add __init__.py inside scripts folder too.

![helpfulScripts](/Images/Day11/j6.png)

Now in our deployment token script,we'll do our imports.

![imports](/Images/Day11/j7.png)

Since we knoe that we need an initial supply in our "OurToken" contract, let's go ahead and go that.

![tokenDeployment](/Images/Day11/j8.png)

If you don't have your environment variable set, add your .env file where you can add private key, web3 infura project id and ether scan api.And then last but not least we'll add .env in our config.If you want to actually deploy this to testnet, you need to make brownie know where to grab private key from.

![privateKey](/Images/Day11/j9.png)

We can run the scripts

`brownie run scripts/1_deploy_token.py` and you will see our token is printed out.

![output](/Images/Day11/j10.png)

We can see we've our token deployed on our local ganache.I can run this again on rinkeby.

![rinkeby](/Images/Day11/j11.png)

Grab the address and go to rinkeby etherscan, pop it in and after quick refresh, You can see contract been added.You can even go to your metamask then to assets, add the address to our metamask, add the token and you'll see you'll be the owners of "OurToken".

**Don't do this now**

Something else you might wanna do is add this to a liquidity pool or add this to a place where you can actually go ahead and sell it and put it on the market.You can do something like that as easily as just popping onto uniswap, going to pool, hitting more, creating a pool and then adding our token.We'd have to manage the token list and be sure to add the token, create our own pool and automatically put it on uniswap.That's how easy it is to actually sell it on one of these pools.
