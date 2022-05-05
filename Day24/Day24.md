## Lesson 13: Full Stack Defi

This is going to be the most advanced project and combine all the knowledge that we've learned so far into one project.Then we're additionally going to put a `frontend` or a `User Interface` onto this project.When we build our own applications, we're going to need a way for non-devs to actually interact with it in a meaningful way.

**Staking and Depositing**

Our application allows users to stake or deposit their tokens into token farm contract.Once they've some token deposited, that's when you can kind of go get creative with what you want those tokens to do.You could use it as staking in some governance.You could go ahead and invest it in something like AAVE or another defi protocol to gain interest.You could build a yeild aggregator.There's a ton of different features that you can do once you've users stake their tokens.

Here's how we do from the UI side.We'll be having a butten called "Connect" which we could go ahead and click connect on.Metamask is going to pop up and we're automatically gonna sign in.That's going to connect our metamask to the User Interface.After getting connected, I could stake some of my tokens into the contract which is `WETH`, `FAU` which is mimicking DAI and `DAPP` token.The DAPP token is going to be the reward token that our platform gives users as an incentive for staking on our platform.Once we stake, we can actually then unstake.

I'm going to go ahead and make a new directory called "defi-stake-yeild-brownie" and open the folder in VS code.First thing that we want to work with is going to be our contract.

`brownie init`

**DappToken.sol**

We're going to make our DappToken.sol.This is going to be the token that we're going to give out to users who are staking on a platform.This is our reward token.You might have heard of yeild farming or liquidity mining.This is our token that allows users to actually engage and participate in that and this is regular old ERC20.So you guys already know we've done this before.We're going to go ahead and use [open zeppelin](https://docs.openzeppelin.com/contracts/2.x/erc20) again.We can even just copy paste the import from the documentation.As we're using @openzeppelin in the import, we need to add dependencies.

![dependencies](Images/n1.png)

We can go back to DappToken.sol and do some basic ERC20 bits there.

![DappToken](Images/n2.png)

Now that we've our first contract we can try to compile it.

`brownie compile`

**TokenFarm.sol**

We're gonna go on and create our more interesting contract "TokenFarm.sol".We can even take a quick second and figure out what we want this to be able to do.We want to be able to stake tokens, unstake tokens, issue tokens(token rewards), add allowed tokens(add more tokens to be allowed to be staked on our contract) and we're probably going to want some type of getETHValue function where we can actually get the value of the underlying stake tokens in the platform.Let's go ahead and start with the staking of the tokens because that's going to be the most important piece of our application.

We want to stake some amount of some token(address).There's couple of things we need to keep in mind here.
- What tokens can they stake?
- How much can they stake?

For our application we're just going to say "You can stake any amount greater than 0".We can even add that.

![requireAmount](Images/n3.png)

Now we only want specific tokens to be stacked on our platform, we could say :

![forToken](Images/n4.png)

So we might have to actually create a token is allowed function.Let's go ahead and create that.
