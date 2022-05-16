## Leveraged Trading in DeFi 

When we're talking about leveraged trading or leveraged investing, it really just means we're borrowing some asset or borrowing some money so we can invest or trade more.It's "leverage" because we're using more than we initially start with and this is great because when you pick correctly you'll profit more but when you pick wrong, you'll loose more as well.

[`Margin trading`](https://www.wealthwithin.com.au/learning-centre/leveraged-trading/leverage-trading-the-pros-and-cons) and [`short selling`](https://www.investopedia.com/terms/s/shortselling.asp) are both types of leveraged trading because they both involve borrowing assets.In margin trading we borrow some cash or some assets so that we can go buy more and in short selling we borrow some assets so we can sell that asset in the hopes that the price of that actually goes down.You call it margin trading when you borrow some cash to buy something that you hope will go up.You call it short selling when you borrow some asset to sell it in the hopes that goes down.

Let's get into the demo into the [UI](https://staging.aave.com/).Everything that we're going to do here is going to work on mainnet as well.We need to get some [testnet ethereum](https://docs.chain.link/docs/link-token-contracts/) for Kovan and Rinkeby.In order for us to actually short sell or margin trade, we need to deposit some collateral.We need to deposit some collateral in order to borrow.This way we never repay back the loan that we took out or the amount that we borrowed.AAVE will just go ahead and take the collateral that we put in there.It'll do what's called a `liquidation` call and that's why it's a little bit safer than short selling in traditional markets because if your collateral is less than how much you've borrowed, you'll immediately get liquidated but you still lose a bunch of money.So like don't get liquidated.

In our UI, we wanna scroll to ethereum, connect our wallet and deposit the eth.

![depositedEth](Images/m30.png)

If we go to our dashboard, we could see we've some ether.

![ether](Images/m31.png)

It's got some APY which is like the percentage return that we're going to get back for depositing into AAVE and we used it as a collateral.We can go ahead and borrow now.Whenever we borrow one of the assets, the APY is the percentage that over the course of a year that we're going to have to pay in order to actually borrow the asset.

![borrowSection](Images/m32.png)

So we're actually going to borrow some DAI because DAI is a stable coin.It's worth a dollar.In a way you could call this taking out the margin because we're taking out DAI to borrow and another way we could say we're shorting DAI.

You get to choose how much you want to borrow and you'll see health factor.Health factor is how close to being liquidated you're.This means how close we're to AAVE saying "We're taking your funds."If it goes below 1 at any time, somebody can liquidate you and take a lot of that deposit that we put in.There's some math behind what the health factor is.You can head over to the [AAVE documentation](https://docs.aave.com/faq/borrowing).

We're going to borrow 300 DAI and a variable APY.

![borrow](Images/m33.png)

After transaction completes, we're going to go to the dashboard and we can see:

![dashboardAfterBorrow](Images/m34.png)

This is basically the defination of margin.We could take this DAI and can use it to but other things.So all we really need to do now is sell this DAI for some other asset and we've essentially shorted DAI.

All we need to do is swap it.So if I grab my wallet address and go to Kovan etherscan and paste the address there.I could see:

![assets](Images/m35.png)

We could see that I've got some interest bearing Ethereum and our DAI.

I could take the DAI and go to sushi swap and swap it.That's how you short it.You'll see you still have to repay at some point.









