**Build a DAO**

**What is a DAO**

DAOs for decentralized autonomous organizations which describes any group that is governed by transparent set of rules found on a blockchain or smart contract.Some people say "Bitcoin is DAO because the miners choose whether or not to upgrade their software."Other people think that DAOs must use transparent smart contracts, which have the rules ingrained right into them.

It's not to be confused with "The DAO" which was an implementation of a DOW back in 2016, which set the record for the hack at that time.DAO term is used in alot of different ways but in essence imagine if all the users of Google were given voting power into what Google should do next and the rules of the voting was immutable, transparent and decentralized. This solves an old age problem of trust, centrality and transparency and giving the power to users of different protocols and applications instead of everything happening behind closed doors and this voting piece is a cornerstone of how these operate.

This can be summarized by "Company or Organization operated exclusevely through code."To really understand this, we're going to look under the hood of the protocol that's setting the precedent for all other DAOs "[Compound](https://compound.finance/)" then once we look at compound, we'll understand what goes into building one of these and all the trade-offs, all the different architectural choices mean for your group.

Compound is a borrowing and lending application that alows users to borrow and lend their assets and everything about the application is built in smart contracts.Now oftentimes, they're going to do alot of new things, maybe they want to add a new token to allow borrowing and lending, maybe they're gonna want to change some of the APY parameters, maybe wanna block certain coins, there's a lot of different things that they might want to do.So that's what we're going to head to [governance](https://compound.finance/governance).

This is where you can find a user interface for list of all proposals and all the different ballots that came to be.So here's the list of some of the governance proposals that this protocol has actually been making to improve.

![proposals](Images/m129.png)

So if we click on the proposal, we can actually see everything about the proposal; who voted for, who voted against and the proposal history.Now the first thing to one of these proposals is somebody has to actually create the proposal in a proposed transaction and we can see it right [here](https://etherscan.io/tx/0xabfaeb6d3b39b69fbaee824a08d7b7a11726c03f8990411f0bb27ecf46b76769).If we decode the input data, we can actually see the exact set of parameters they use to make the proposal.The way they're typically divided is that they've list of addresses, functions to call on those addresses and the parameters to pass thoses addresses.

![decodedInput](Images/m130.png)

So this proposal is saying,"I would like to call setFactory on those first and second address, deployAndUpgradeTo to on those two address and the parameters that we're going to pass is on calldata which is encoded in bytes and a description string provides what it is doing and why we're actually doing this."The reason that we've to do this proposal governance process is that these contracts likely have access controls where only the owner of these contracts can call those functions and the owner of these contracts  is likely going to be governance DAO.

Once the proposal has been created, after a short delay it becomes active and this is when people can actually start voting on them.This delay between the proposal and an act of vote can be changed or modified, depending on your DAO.Then people will have some time to start voting on them and if it passes, it reaches succeeded.

If we go to the [compound governance](https://etherscan.io/address/0xc0da02939e1441f497fd74f78ce7decb17b66529) contract, go to contract, write as Proxy and we can see the exact function that people call to vote namely castVote, castVoteBySig and castVoteWithReason.We'll talk a little bit about exact differences between these in a little bit but these are the functions that they're actually calling and if you go to the compound app and go over to [vote](https://app.compound.finance/#vote) This is a user interface you can actually vote through to make it easier  if you're not as tech savy or you could send the transaction yourself.

Once all those votes happen, it reaches the queued stage.Before proposal actually becomes active, there's a minimum delay between a proposal passing and a proposal being executed.So somebody has to call this queued function and it only can be called if a vote passes  and it says "The proposal ID has been queued and we're going to execute it soon."Now if we go to the different proposal, we could see executed  where they executed the proposal with proposal ID.

Now oftentimes just putting one of these proposals through isn't really enough to really garner some votes for it, you generally want a forum or some type of discussion place to talk about these proposals and why you like them or don't like them.Oftentime a [discourse](https://www.discourse.org/) is one of the main places that people are going to argue for why something is good or why something is bad so people can vote on these changes.Snapshot might be one of these tools that you use to figure out if your community even wants something before it even goes to vote, you can join one of these and with your tokens you can actually vote on them without being executed just to get the sentiment  or you can build your protocol in a way that snapshot actually helps you with the voting process.

Now that we know what a DAO looks like, let's talk about the architecture and tools that go into building one of these and additionally the trade offs that they have.The first thing to talk about is the `Voting Mechanis`.

Now voting in decentralized governance is critical to these DAOS because sometimes they do need to update and change to keep up with the time,Not all protocols need to have a DAO, but those that do need to have a DAO need a way for participants to engage.This is one of the most important questions to ask and tell your communities `How do I participate? How do I engage in this DAO? How do I help make a decisions?` and you'll find this is a bit of a tricky problem to solve.

Now an easy approach to this problem is going to be using an ERC20 or an NFT token as voting power similar to what we saw in compound.We use compo token to vote for different proposals.Now this actually might be right approach for certain doubts but it also runs the risk of actually being less fair because when you tokenize the voting power, you're essentially auctioning off voting power to whoever's got the deepest pockets.So if it's only the rich people to get to vote then it's highly likely that all the changes in the protocol are going to benefit the rich which doesn't seem like that great of an improvement over our current world.Additionally if you buy a whole bunch of votes and you make a bad decision and then sell all your votes.You as an individual don't really get punished, you just punish the group as a whole.But you being malicious, you can get away with pretty scot free.

Now this voting mechanis is going to be correct for some groups bur for other groups maybe not.It really depends on what your DAO community setup is going to look like.








