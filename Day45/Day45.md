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

Now that we know what one of these ERC20s is, we can go ahead and create our own.In our terminal make a new directory `mkdir hardhat-erc20` and go inside the folder `cd hardhat-erc20/`.We're going to create a new hardhat project exact same way we've been doing `yarn add --dev hardhat`.

Let's create a new hardhat project `yarn hardhat` and select on empty config.js.Copy paste your .env and hardhat.config.js from previous project cause we're going to need them.Update the hardhat.config solidity version to 0.8.9.

As we've heard this EIP20 or the ERC20, all it needs to have it's functions in its token standard so that we can transfer tokens.We can do all the stuffs in the ERC20 contract itself,it really is just keeping track of how much each people have.So the smart contract kind of in a weird way it keeps track of itself.To get started we're going to do this in a mannual way.We're going to create our own manual token or a really minimalistic one anyways.So let's create a contracts folder and create a new file called "Token.sol".

So to get started, we can do as pretty usual.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

contract Token {}

```

The main reason this token smart contract works is that there's some balances mapping.So we've a mapping of addresses to uint256 usually public called balanceOf.

```solidity
contract Token {
    mapping(address => uint) public balanceOf;
}
```

The key is going to be every single address on the planet and then how much they have and basically when we transfer tokens, we're just subtracting from address amount and adding to the address.So a really minimalistic way to implement this would be to create a trasfer function first.   

```solidity
function transfer(
        address from,
        address to,
        uint256 amount
    ) public {
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }
```

Technically this is all we need for a pseudocode.We probably want to do some assertions and requires to make sure all of our number makes sense but really at the end this is all the function is doing.
  
Transfer works when the caller is sending money directly into another address but what happens if we want to allow some smart contracts to work with our token or we want to allow somebody else to work with our token you know maybe to deposit it in the protocol or do some more functionality with it.There will be some approve function that will approve that contract to do that and then we'll have a function `transferFrom` which will implement taking funds.

```solidity
function transferFrom() public {
    // implement taking funds from a user
}
```

At the top will be some type of allowances mapping that will tell who's allowed which address to take how much token.

```solidity
mapping(address => mapping(address => uint)) public allowance;
```

We're going to say address "Spoods" is going to allow address "Spoods Brother" to use 25 tokens.That how the allowance works and in our transferFrom, it'll check the allowance mapping and say "Hmm did Spoods give you authorization to borrow those tokens?"If yes, it'll let us use transferFrom.

```solidity
function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // implement taking funds from a user
        require(_value <= allowance[_from][msg.sender]);
        allowance[_from][msg.sender] -= _value;
        transfer(_from, _to, _value);
        return true;
    }
```

We need an approve function to update the allowance.Usually we've initialSupply.This will be like how many tokens they are starting with, how many tokens are there total, sometimes we'll add a mint function to add more functions but you start to to see this contract ramping up.One thing we could do is go through the [spec](https://eips.ethereum.org/EIPS/eip-20) line by line and build our token ourself.

**Creating an ERC20 Token with OpenZeppelin**

We can use an open source library like OpenZeppelin to actually get some boilerplate code to work with.OpenZeppelin is almost considered kind of standard library of solidity.They have a list of open source contracts that anybody can use and import into their contracts that have a ton of boilerplate so that you don't have to manually write everything out.We can see all their code in the [Github repository](https://github.com/OpenZeppelin/openzeppelin-contracts).We're going to be using them alot moving forward.Let's go ahead and use OpenZeppelin to create our token.

Let's create a new file inside contracts called "Token2.sol".

```solidity
// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

contract Token2 {}

```

We're going to import OpenZeppelin contracts into our hardhat projects.We're going to do the same way we did with Chainlink and any other packages in the future.

`yarn add --dev @openzeppelin/contracts`

This is going to add `@openzeppelin/contracts` npm package to our project and one of the code pieces that they have is the ERC20 contract that we can use and we can have our token inherit all the functions.

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token2 is ERC20 {}
```

Just like that our token is almost done.You might get the little wiggle red line saying "Token2 should be marked abstract" and that's because if we look into the ERC20.sol of OpenZeppelin, 

```solidity
constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }
```

we'll see that it has a constructor.So in order for us to inherit ERC20 token, we've to use the ERC20 constructor.We just need to give our token a name and a symbol.

```solidity
contract Token2 is ERC20 {
    constructor() ERC20("Token", "Tok") {}
}
```

This ERC20 token also comes with a mint functionality which is essentially a function that allows us to create tokens because right now we actually get initialized with zero tokens.Nobody actually allowed to have any tokens.So we want to mint the initial amount of tokens and then who owns all those tokens to start with.

Usually you'll see a _mint function where we passed msg.sender to indicate who ever deploys Token2 contract owns all the token and give it an initail Supply.

```solidity
contract Token2 is ERC20 {
    constructor(uint256 initialSupply) ERC20("Token", "Tok") {
        _mint(msg.sender, initialSupply);
    }
}
```

**Recap**

So ERC20 tokens or EIP20 tokens or BIP or PEP or any of the -20 improvements proposals are what's know as token standard and the token standard, these tokens on chain actually just tokens that are smart contracts.Now these tokens are actually different than the layer one tokens like Ethereum or Avalanche or Polygon.These are not going to be smart contract.Those are blockchain native tokens.ERC20 are just smart contracts and they're just kind of a combination of the functions that represent how many token each address has.We can create our own token with all the specifications added or we can just use OpenZeppelin's to import a token in.

Now another popular repo like openZeppelin is going to be from Rari-Capital called soulmate and they've both aimed to be standard library for solidity.One important thing to keep in mind is that these tokens have the allowance mapping.You can allow other addresses to have access to your tokens and move your tokens around.This is important especially when we get to later on when working with DEFI when we want to give some smart contracts access to our tokens so that they can input it into their DEFI protocol.It's also a little bit tricky and you want to make sure you're not allowing malicious contracts to interact with your tokens.We'll also see when we're interacting with these tokens more before any contract can interact with our tokens, we need to approve them to interact with our tokens.
