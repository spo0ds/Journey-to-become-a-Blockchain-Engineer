##  Lesson 10: Defi & Aave

I thought we know a little bit more about Defi and why it's such an amazing technology that only works in the blockchain world.Let's look at this site [defi pulse](https://www.defipulse.com/) or if you want to look at another one called [defilamma](https://defillama.com/) which also shows alot of different protocols.So defipulse is an application that shows some of the top defi projects based on how much total asset is locked into each protocol.Aave which currently is the number one ranked defi application with 9.32 billion in assets under management in terms of USD.We've some fantastic ones like curve, compound, maker, InstaDApp etc.Now we're gonna be looking at two of these protocols in particular.The first one ofcourse being Aave and second one is gonna be what's called a decentralized exchange "paraswap".You start with aava.We're going to go to [testnet.aave.com](https://staging.aave.com/) that looks something like this with please connect your wallet and everything will be pretty empty.

**Decentralized Exchange(DEX)**

[Paraswap](https://app.paraswap.io/#/?network=ethereum) is what's known as a dex or a decentralized exchange.It allows us to trade tokens incredibly easy on the blockchain.Now there's not a whole lot of testnet indexes that actually work.So we're just going to look at them and simulate as if we're working on them.For example if I wanted to trade 1 eth for some usdt or maybe some wrapped bitcoin or some dai or some aave or really any token that we wanted, all we need to do is connect to our wallet and swap button would show up and we could go ahead and hit swap.Some of these really powerful these dexes and really popular ones are going to be curve finance, uniswap and it's really really easy way to go ahead and swap your tokens for one another depending on what you're looking to do.

Aave is incredibly powerful and it's going to be one that we're going to be working alot with because it has pretty much all the fundamentals of working with the defi protocol that we're looking for and it has a [testnet](https://v3-test.aave.com/#/dashboard) that we can go ahead and test and simulate actually working with some of these protocols.So we're gonna first work with the UI or the user interface and then we're going to do everything here programmatically.

**Get some Kovan ETH**

First things first if you don't already have it make sure you've some testnet ethereum at least.You can get some testnet ethereum from looking at the [link token contracts](https://docs.chain.link/docs/link-token-contracts/) and going to Kovan.Once we see some eth in our Kovan testnet we can go back to aave.So whereas paraswap allows you to simply swap between assets and do a lot of buying and selling of tokens, aave is a lending and borrowing application.So we can actually put down a token as collateral and we can borrow and we can generate some yeild from interacting with this protocol.Borrowing and lending is a critical piece to doing any type of really interesting financial applications or financial instruments such as short selling, being exposed to more assests etc.You can also gain some percentage back.

![apy](/Images/Day12/k1.png)

If you look at apy, it'll tell you how much percentage over a year you'll actually get in returns from staking or depsiting an asset.We're gonna connect the application using metamask and you'll see on a asset to supply, we can see our balance.

**Depositing tokens/ Lending**

What we can now do is click on ethereum, click on max button to deposit some ethereum, hit continue and a little dashboard will pop up asking us "would you like to deposit?".Clicking the deposit button will actually have us deposit right onto the aave contract on the Kovan testnet.Make sure once you hit the deposit that you're actually on a tetnet.

![depositEth](/Images/Day12/k2.png)

I did it on a rinkeby testnet.Idk why my Kovan isn't working while doing this.

![aaveDeposit](/Images/Day12/k3.png)


**WETHGateway**

Funnily enough you'll see that this is the WETHGateway.

![WETHGateway](/Images/Day12/k4.png)

When we deposit our Rinkeby Eth, it actually gets transferred into an ERC20 version of our Ethereum and then it'll go ahead and deposit in into the aave contract.

**Interest Bearing Token (aToken)**

aETH is what's called an interest-bearing token and it goes up in real time.You'll see if eth amount going up if I looked my wallet for longer period of time.This is the profit given to us from other people borrowing the ETH that we've deposited into aave.If we go to our dashboard now,

![ETHDeposited](/Images/Day12/k5.png)

We can see we've 0.393 ETH deposited and if you roll over it, you'll constantly see amount go up and up.We can go ahead and withdraw our eth which will convert our aETH back into ETH with the additional interest that we got from depositing.So depositing into aave will give us interest back as a payment for other people borrowing the ETH that we've deposited.We can also use this ETH as what's called collateral.

If I go to the borrow tab, I can actually use the ETH to borrow some other asset.Maybe I wanna borrow dai which is a stable coin meant to always equal one dollar.USDC and USDT also are meant to always reflect a dollar.We can borrow what's called wrapped bitcoin(WBTC) which represents the Bitcoin price.

**Why borrow?**

Now borrowing as asset is incredibly incredibly powerful.By borrowing you're allowed to obtain liquidity without selling your assets and borrowing is one of the first pieces in order to actually short sell.Borrowing in defi protocols is absolutely massive because it allows you to:
- Frictionlessly short sell
- Obtaining liquidity without closing your positions
- Gaining yeild on some deposited collateral
- Massive number of new things only in defi world such as flash loans

`Important Note`:
                Since we're just borrowing on testnet and this isn't real money.This is 100% okay to experiment with and work with.However if you borrow an asset and you do not pay attention to how much you've for an underlying collatera, you could get liquidated and loose some of your funds.So be very careful and pay alot of attention if you're gonna do this on an actual network.
                
Let's say we wanna borrow aave token for example.We click into aave and we choose the amount we want to borrow.Since we've placed down some collateral 0.3ETH, if the amount that we borrow ends up being too high, we'll actually get what's called liquidated.Everytime we borrow an asset, we get some type of health factor.The health factor represents how close to being liquidated you're.Once your health factor reaches 1, the collateral that you've actually deposited will get liquidated and somebody else will get paid to take some of your collateral.This is so that the aave application is always `solvent`.Being solvent means It's never in debt.

When I wanna borrow I want to choose some amount that might be a little bit safe here.So that I'm not going to get liquidated.I'm gonna choose some number where I see a health factor maybe like 5.4.

![healthFactor](/Images/Day12/k6.png)

and hit continue.Now we'll have to choose our interest rate.

![Interest](/Images/Day12/k7.png)

**Stable Vs Variable Interest Rate**

When we borrow an asset, we actually have to pay some interest.This payment is actually going to go to the people who are depositing the asset.The interest rate that we're gonna pay is actually gonna be paid to those who are depositing the asset that we're borrowing.So like how we're getting interest on our deposited collateral, others are getting interest on their deposited collateral based off of how often people are  borrowing it.We choose a stable apy which will always be 9.42% or a variable apy which will change based off of how volatile and how in demand this asset is.For now I'm going to choose variable but you can pick whatever you want.Same interface is gonna show up so hit borrow, metamask is gonna pop up and ask us if you really want to borrow.We're gonna hit confirm.

![success](/Images/Day12/k8.png)


We've successfully borrowed link into our application.We can even hit this liitle add link to your browser wallet button, to add the token to our wallet.We can now see link is indeed in our token assets.If we go back to our dashboard, you'll see we've health factor score.

![healthFactorScored](/Images/Day12/k9.png)

This is a really important score.If you click on the little i thing, it says:

![Ithing](/Images/Day12/k10.png)

We'll see all of our deposits here.We've 0.393 ETH deposited and 16 LINK deposited.You'll see whole lot of stats for working with our application.We can withdraw our ETH, borrow more LINK or we can go ahead and repay.We can either repay from our wallet balance or from our current collateral.Let's go ahead and do from our wallet balance.We'll hit max and continue.We even get this little thing that says you don't have enough funds to repay the full amount.Well why is this the case?We just borrowed the amount.It's because already since depositing, we've accrued a little bit of extra debt.Remember we hit that variable apy and every second it's going to tick up just a little bit.So let's go ahead and pay back what we can with our wallet.

Aave is one of these applications that relies on the chainlink pricefeeds in order to understand the ratio between how much you've deposited as a collateral and then how much you can borrow and take out.

Keep in mind when working with some of this.This is a testnet and we're working is just in a testnet.Sometimes the testnet doesn't work quite as well as mainnet because it's just for testing and doesn't have the exact same support.we were just working on the testnet but if you want to go to aave for real, you can go [here](https://app.aave.com/).Connect your wallet on the ethereum mainnet and interact with it exactly the way we just did.If we're on the mainnet, we can see some additional pieces.

![AaveMain](/Images/Day12/k11.png)

**Reward token / Governance token**

When you deposit something like ETH, you get 0.33% back as interest paid to you for depositing the ETH.You also get a little bit of what's called a governance token.You'll also get a little bit of aave token.I know it's really small but this is an additional incentive that aave has given the users for working with their protocol.Since aave is a decentralized protocol, in order for anything to be improved or anything to be updated on the protocol, it actually has to go through a decentralized vote.So these governance tokens actually dectate and decide how the protocol improves moving forward.

**Programmatic interactions with Aave**

Now that we understand how to work with all of that through UI, let's actually learn how to interact with aave and defi all from our scripts.

**Qunt Defi Engineer**

Learning how to do this way will get us one step closer to being `quantitative defi engineer` or `defi researcher`.This is someone who programmatically does algorithmic trades, algorithmic modelling and just does everything in a programmatic sense making them much more efficient and powerful interacting with defi.

Create a new folder "AAVE_BROWNIE_PY" and open up with VScode to the folder.Let's get into it.

Aave has some fantastic [documentation](https://docs.aave.com/developers/getting-started/readme) that we're gonna be using.

**Aave brownie setup**

Let's go ahead and start with our basic brownie set up.

`brownie init`

**No contract deployments here**

Now for working with brownie we're actually not gonna be deploying any contracts because all the contracts that we're gonna work with are already deployed on chain.All of them are just going to be working with aave.

Create a quick README.md.We can know what we're doing here.

![readMe](/Images/Day12/k12.png)

This will be the full functionality of working with Aave in this deployed contract.But we not do 2.1 for now.

Everything that we're gonna learn here will teach you how to work with other contracts as well such as paraswap or uniswap or any other type of swapping contract that will allow us to buy and sell.

**aave_borrow.py**

So let's just go ahead and create a scripts.We'll call it aave_borrow.py.Let's create a function called main and we'll just do pass for now.

**aave brownie setup**

First thing that we need to figure out how to do is deposit some eth into aave.When we actually deposited our eth via the UI, we could actually see when we call the deposit function, oddly enough if we go to the contract address in rinkeby etherscan, we'll see the address is actually what's called a `WETHGateway`.What aave is doing like I said before is swapping our ethereum for WETH.Again WETH is a ERC20 version of ethereum and this allows to easily work with all the other ERC20s on the aave protocol.

So we actually have to do that as well.

**Converting ETH -> WETH**

So the first thing we're gonna do actually isn't deposit some of our eth, but swap our Eth for WETH.So let's even put this in it's own little script.We'll call it get_weth.py.So we're gonna have a function main and we'll just do pass for now.We actually want to use this get_weth scripts in our aave_borrowed.py.So we actually have a main and we're gonna have get_weth function as well.In our main function you're just gonna call get_weth.

![Setup](/Images/Day12/k13.png)

So how do we actually convert our ethereum to WETH or wrapped ether?

Now to save gas we'd actually interact with the WETHGateway for aave but I'm going to go through how to get WETH in general.We can look up the [WETH kovan contract etherscan](https://kovan.etherscan.io/token/0xd0a1e359811322d97991e03f863a0c30c2cf029c).

![WETHEtherScan](/Images/Day12/k14.png)

We can go to contract and we can see this is indeed verified.

![VerifiedContract](/Images/Day12/k15.png)

The way WETH works is there's withdraw and deposit (on write contract section).We deposit ETH into this contract and it transfers us some WETH.So this is the first contract that we actually want to interact with.So we need our script to be able to call the deposit contract.

So per usual the two things that we need to do this is going to be an:
- ABI 
- Address

**Get the WETH interface**

I really like just doing everything directly from the interfaces.You can get WETH interface from [here](https://github.com/PatrickAlphaC/aave_brownie_py_freecode/blob/main/interfaces/IWeth.sol).Copy and paste it inside the interface directory.You can see this has all the exact same functions as our deposit contract, symbol, name, transfer, pretty much you'd expect from ERC20 plus this extra deposit piece.

So we've an interface now and we also have an address.But again above image has an address on a Kovan network.Since we know ahead of time that we're probably gonna be using this on different networks like mainnet, rinkeby etc, we'll add our brownie-config and add our networks here.

![Kovan](/Images/Day12/k16.png)

We're going to add the rest of the pieces.

![wallets](/Images/Day12/k17.png)

and That's all we really need for now.Since we've done some work with testing we know that for testing, we could do our integration test on Kovan because there's an integration test there.But what about our local tests?Well this is something good that we're thinking about right now.We know that aave actually has all these "WETH" same contracts on the mainnet as well and we also know that we're not gonna be working with any oracles because that we don't actually have to deploy any mocks ourselves.We can if we want to but we don't have to.

What we can do is for our unit tests is we can just actually use Mainnet-fork network and just fork everything that's on the mainnet into our own local network.So instead of actually using mocks, we'll basically just mock the entire mainnet and one more time just so that we absolutely have it here.`If you're not woring with oracle's, you don't need to mock responses.We can just go ahead and use a mainnet fork to run our unit tests.If you're using oracles then it makes alot more sense to do to development the network where you can mock oracles and mock oracle responses.`


With this in mind we know that we're going to be doing alot of our tests on mainnet fork.We can go ahead and add a mainnet fork in the network and then we can just add the [mainnet weth token](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2) for mainnet fork.

Remember absolutely positively if you want to double check that the contract address that you're working with is correct, I highly recommend you to do so because if you get it wrong, you could accidentally add some money to a contract address that you don't want.

![mainnetFork](/Images/Day12/k18.png)

And in our termianl we can do  `brownie networks list`.

![networkLists](/Images/Day12/k19.png)

We can that indeed we've a mainnet fork here.That's going to use the ganache-cli to fork mainnet for us.

Now that we've the interface we know that we can actually compile it down to the abi.So back in our get_Weth, first thing we need to do to make any transaction obviously is get an account.This is where we can go back and make our helpful scripts.

![helpful_scripts](/Images/Day12/k20.png)


We've our account where we can make some transactions with.Let's go ahead and get our WETH contract.To do this we can import interfaces fromm brownie.

![gettingContract](/Images/Day12/k21.png)

**Why not get_contract?**

You might be asking "Why aren't we using the get_contract function?"Well you can absolutely 100% go ahead and use that get_contract function but since we're gonna be testing on mainnet fork I know that we're always going to be refer back to the config.So I'm confident that I'm not going to be deploying any mocks.It's better practice to go ahead and use that get_contract function but for this one we'll just make it a little simpler and use the config.

For going to mainnet or for to real production, you could also have a mainnet network and it'll just be an exact copy of mainnet-fork.And remember we want our .env files our environment variables to get pulled from that .env file.

![config](/Images/Day12/k22.png)

Now everything in our .env file will pulled in automatically.Great we've an address and abi which comes from the interface.Now we can just call deposit function where we deposit ethereum and we get WETH.

![getWETH](/Images/Day12/k23.png)

Let's go ahead and run this script then.

`brownie run scripts/get_weth.py --network kovan`

![OutputWETH](/Images/Day12/k24.png)

We can use our transaction hash, pop into Kovan etherscan, you could see transaction going through.In our wallet we'll get -0.1 eth and we'll get +0.1 weth.To add this and see in our metamask, grab the contract address and add a token.

If you wanna switch back your WETH to ETH, you can just hit the withdraw function or you can programmatically add withdraw function.

![withdraw](/Images/Day12/k25.png)

Now we've ERC20 token "WETH" that we can use to interact with the aave appliction.Now that we've get_weth function let's go ahead and start borrowing.
