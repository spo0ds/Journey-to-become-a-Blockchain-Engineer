**Hardhat Starter Kit**

[SmartContract](https://github.com/smartcontractkit) comes packed with a ton of starter kits that we can use to start deploying our projects.Let's learn to use the hardhat starter kit so that we can grab the repo and go which already have some boilerplate code and good looking repo to start your projects with.We come to the [hardhat starter kit](https://github.com/smartcontractkit/hardhat-starter-kit) repo, and if you're working with Github, we can just click "Use this template" button and it'll automatically generate you a new Github repo with the hardhat strater kit.

If you don't want to create a repo, you can copy the url and clone it.`git clone *url*` and then open the folder in VScode.

You'll see in the repo, it comes packed with a ton of contracts, deployments, scripts, tasks, tests everything you name it to really get started in a professional environment.If we look in the contract section, we've a couple of sample contracts.We have a contract for making an API call to a chainlink node, working with keepers, working with pricefeed and working with Chainlink VRFV2.We got some test contracts and additionally have fuzzing folder which we'll talk about later.

Once we're in the repo, we can run some familiar commands.We can do `yarn` to install all of our packages.Everything that we're going to do if you get lost, you can always come back to the [repo](https://github.com/smartcontractkit/hardhat-starter-kit) and can follow along with the getting started and the Quickstart.Once we install all the dependencies, we can run `yarn hardhat test`.

So if you're ever looking to start a new project and you want some boilerplate code, hardhat starter kit is a great place to get started.

## Hardhat ERC20s

We're going to learn how to create our own ERC20 or EIP20 or BEP20 or AEP20.Any of these tokens on the blockchain.Before we can understand what an ERC20 is or even what one of these tokens are, we first need to understand what is an ERC and then also what is an EIP.

**What is an ERC? 
What is an EIP?**

In Ethereum, Avalanche, Binance and Polygon all these blockchains have what's called the improvement proposals and for Ethereum they're called Ethereum Improvement Proposals or [EIPs](https://eips.ethereum.org/EIPS/eip-20) and what people would do is they come up with the ideas to improve Ethereum or improve these layer 1's like Polygon, Avalanche etc. On some Github or open source repository, they'll add these new EIP to make these protocols better.Now these improvements can be really anything.They can be anything from a core blockchain update to some standard, that is going to be the best practice for the entire community to adopt.

Once an EIP get's enough insight, they also create an [ERC](https://github.com/ethereum/EIPs/issues/677) which stands for Ethereum Requests for Comments.ERC can be BEP, PEP etc for all different blockchains.Both the improvement proposals and the request for comments all have the different tags.They're numbered chronologically so something like ERC-20 is going to be the 20th ERC/EIP.The ERC and EIP share that same number.There're website like `eips.ethereum.org` that keep track of all new Ethereum Improvement Proposals and you can actually see them real time go through the process of being adopted by the community.

One of these EIPs or ERCs is going to be the ERC20 or the token standard for smartcontracts.This is an improvement proposals that talks about how to actually create tokens and smart contract tokens.

**What is an ERC20?**

ERC20s are tokens that are deployed on a chain using ERC20 token standard.It's a smart contract that actually represents a token.So it's both token and the smart contract.Tether, Chainlink, Uni Token and DAI are all examples of ERC20s.Technically Chainlink is in the ERC677 as there as upgrades to the ERC20 that some tokens take that are still backwards compatible with ERC20s.So basically you can think of them as ERC20s with a little additional functionality.

**Why make an ERC20?**

- Governance Tokens
- Secure an underlying network
- Create a synthetic asset
- Or anything else

How do we build one of these tokens?

Well all we have to do is build a smart contract that follows the [token standard](https://eips.ethereum.org/EIPS/eip-20).All we have to do is build a smart contract that has the functions like name, symbol, decimals etc.We need to be able to transfer it, get the balance of it etc.If you want to checkout some of the improvements that are still ERC20 compatible like the [ERC677](https://github.com/ethereum/EIPs/issues/677) or the [ERC77](https://eips.ethereum.org/EIPS/eip-777) you definately go check those out and build one of those instead.

**Manually Creating an ERC20 Token**

Now that we know what one of these ERC20s is, we can go ahead and create our own.In our terminal make a new directory `mkdir hardhat-erc20` and go inside the folder `cd hardhat-erc20/`.We're going to create a new hardhat project exact same way we've been doing `yarn add --dev hardhat`


