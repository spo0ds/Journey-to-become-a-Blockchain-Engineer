## **Ethereum Transaction On a Live  Blockchain**

First thing that we're going to need is an `ethereum wallet`.So go to `metamask` because it's one of the most popular wallet and one of the easiest to use.Download the wallet and it's going to be a little extension in the top right corner of your browser.This way we can really easily see at any time what we have in our wallet.This will store all our ethereum based currencies.Go ahead and install metamask.

**Wallet Creation**

![Metamask](/Images/Day1/a1.png)

We're going to create a brand new wallet so go head and hit create wallet.If you already have a wallet, you can actually import it via seed phrase.

![Metamask](/Images/Day1/a2.png)

Now we'll create our password and make sure this is really secure.If you want to use an account and actually put real ethereum and put real money into it, you absolutely need to back it up.

![Metamask](/Images/Day1/a3.png)

This is just a demo however if you show this secret phrase to anybody else they will have access to your all funds.So everything that we're gonna do, we're gonna use fake money.

![Metamask](/Images/Day1/a4.png)

Hit confirm and it gives couple of tips.Remember definitely take the tips seriously especially if you're gonna use the account for real money.

![Metamask](/Images/Day1/a5.png)

We can see the user interface of this wallet and if you look in your extensions, you can pin it in your browser and you can even just click it to get the same interface.

Our mnemonic phrase that secret phrase that we got has given us access to a new account.

![Metamask](/Images/Day1/a6.png)

**Etherscan**

The address of our account, we can use a tool like `etherscan`.

![Metamask](/Images/Day1/a7.png)

So if we look at this address that we just created, we can see that no transactions have happened.It's empty.It has zero ether.It has zero dollars worth of value.Address above is the unique address which represents exclusively the single account that we just created.

**Multiple Accounts**

We can even click the circle and create more account and give it a different account name.

![Metamask](/Images/Day1/a8.png)

Account 2 will have different account address.

**Mnemonic ,  Public & Private keys**

The mnemonic that we've been given gives us access to create multiple accounts with the same mnemonic.So havin that mnemonic will give us access to every single account that's ever created with that mnemonic.This is why securing your mnemonic is so crucial especially if you create multiple different accounts.Each account has a unique identifier with them as well.The account address is the public address.However there's also a private key to work with this account a secret key.We can view it by clicking three dots, go to account details and export private key.

![Metamask](/Images/Day1/a9.png)

This is a single password associated with this account.If you give somebody access to this private key, they'll have access to account 2.They won't have access to my account 1 because private key of account 2 is only associated with account 2.The mnemonic however is associated with all accounts.

**Mnemonic vs Private vs Public keys**

This is why when people say store your keys in safe place, they're referring to both private keys and mnemonic.If you lose your private key, you'll lose access to that account.If you lose your mnemonic you loose access to all your accounts.

**Mainnet & Testnets**

What else is going on in metamask is we can see this section here that says `Ethereum mainnet`.If we click it we can actually see a bunch of other networks in here.

![Metamask](/Images/Day1/a10.png)

When you buy eth and work with eth you're working on the ethereum mainnet.When you interact with smart contracts or defi you're going to be working on mainnet with real value.However since we're engineers oftentimes we're going to want to test our applications or do some type of integration tests or just make sure our code actually works.So there's also test nets.These are networks that resemble ethereum and work exactly the same way as ethereum does however they're not with real money and it's just for testing applications.We can even go to `Rinkeby Etherscan` and see the `Rinkeby Testnet Explorer`, we lookup our address and it's the exact the same information here.

![Metamask](/Images/Day1/a11.png)

Later on we're actually going to show you how to work with other evm compatible chains.Don't worry about evm compatible means for now but we can work with avalanche, polygon and other applications through networks interface as well.

**Initiating our first Transaction**

Infact we're going to make our first transaction on the Rinkeby Testnet and this will simulate exactly what it's like to make the transaction on the ethereum mainnet.

We're going to go to this application called the `Rinkeby Faucet`.This is where we're going to make our first transaction.Rinkeby is going to be one of the two testnets that we're actually gonna work with.The other test net that we're gonna work with is going to be `Coven`.It's important to know how to switch between testnets and evm compatible chains which is why we're going to be working with both.For now we're just be working with Rinkeby.

`Faucet` is a testnet application that gives us free test ethereum.Hence why it has no value because anybody can get it for free from one of these faucets.So to get testnet ethereum with faucet.rinkeby.io, we actually have to post a tweet or a facebook post with the tweet.

![Metamask](/Images/Day1/a12.png)

Now after the tweet we're gonna `copy link to tweet` and place it in Rinkeby Faucet and hit give me ether(18.75 ether/3days).

If we take the account address and go over to Rinkeby Etherscan, we now see the balance is 18.75.

![Metamask](/Images/Day1/a13.png)

But if we look at `Ethereum Mainnet` we've nothing there.We've just made our first transaction.And if we refresh the page, we can also see this is our first transaction that was made.Some account sent us 18.75 ether.We can even look at the details of the transaction.

**Transaction details**

Etherscan is what's known as `Block Explorer`.Block Explorer is an application that allows us to to see details of things that happen on a blockchain easily.We can see the transaction details of the transaction that we made and whenever we work with `Smart Contract` we'll also see them in a transaction similar to what we'll see in a transaction detail.

![Metamask](/Images/Day1/a14.png)

We can see a number of information above.We see a unique `transaction hash`.This hash or unique identifier uniquely identifies this transaction as the key of what this transaction is.

We can see the block number which we can see in a little bit.

We can see from this unique account which is the faucet account.

**Gas fees, Transaction fees, Gas limit, Gas price**

Gas refers to the fee paid to node operators for successfully including a transaction in a blockchain.Now exactly how this works is actually going to change pretty soon but the concept is basically anytime you want to change the state of blockchain wheteher this is a sending some ethereum or making any type of transaction, you actually have to pay a little bit of ethereum or a little bit of that native blockchain token to actually execute that transaction.Whenever we do something on the blockchain,it costs gas and if we do something that would take a lot of energy for the blockchain to do, it will cost more gas.So if I send single transaction that's gonna cost 21000 gas.However if I were to send a transaction that called the smart contract function and did a whole bunch of other stuff, it'd cost more gas.We see here whoever sent us eth also paid the blockchain miners or blockchain validators a little bit of ethereum to include our transaction.We actually get to pick how much of a fee we want to send with our transactions.  

![Metamask](/Images/Day1/a15.png)

**Gas vs Gas price vs Gas Limit vs Transaction fee**

Why would we ever wanna pay more gas price? Why do I even have the option to pay more?

Blockchain can only process so many transactions at a time and nodes and blockchain nodes can only process so many at a time.So when I make a transaction a node has to decide why they want to include my transaction into the block.If there're ton of people looking to make these transactions then the nodes are going to be highly incentivized to pick the transactions that're going to give them a high price that are going to give them alot of money for including that transaction.

**Gas estimator**

In ethgasstation.info, we could get the gas estimator of the blockchain.

![Metamask](/Images/Day1/a16.png)

It currently says that if you wanna get your transaction in right away, it's gonna cost you 81 wei to do so.If you wanna get it in less than 5mins, it's gonna take take you about 62wei.

So the gas price of the ethereum fluctuate with how much people use it and the gas prices of all these blockchains fluctuate with how much people use it.

![Metamask](/Images/Day1/a17.png)

So typically when you're setting your gas price in a transaction, you can take a look-see at your gas station to see the price based on your needs but it all depends on how many people are looking to work with this blcokchain at the same time.

The reason that these gas prices exist is because nodes can only put so many transactions into a block  so they're highly incentivized to input the transactions that are going to give them a higher fee.So in times when alot of people are looking to use a blockchain, prices will get very high and when very few people are using blockchain, prices will be very low.

With just this little bit of information, you now know how to interact with blockchains and interact with ethereum protocol.So if you don't want to learn how to code anything, you can go and you can start interacting with ethereum and interact with protocols with just this information.

Let's look under the hood of ethereum and what is actually going on with these transactions and with these gas and with these blockchains and what's really going on.Let's learn all the fundamentals of a blockchain.

## **How Blockchain works/whats going on Inside the Blockchain**


** Hash or Hashing or SHA256**

Before we get started, we need to take a look at this thing that we call SHA256 hash.Hash looks like bunch of random numbers and it's a fingerprint of some digital data.

hash below starts with `e3b0` which is the hash of nothing.

![Metamask](/Images/Day1/a18.png)

It just so happens it's a fingerprint of whatever I type in this box.If I type the text 'blockchain' into this box, you can see the hash has changed.

![Metamask](/Images/Day1/a19.png)

This is hash of the text 'blockchain' all lowercase which starts with 5318.If I delete the text and type the same text again, it'll have same hash.It's the `digital fingerprint` of the text 'blockchain'.

You could type tons and tons of text and you'd get a hash and the interesting thing about is if there's a tiny amount of information, no information or entire library of congress, you're always gonna get a hash that is this long shown above.You're not gonna be able to pre guess what it is.You'd always get exactly the same hash regardless of how many times you put exactly the same information in.

**Block**

Let's extend the idea of hash into something that we're gonna call block.

![Metamask](/Images/Day1/a20.png)

This is a block and it's exactly like the hash.It's just data section have been broken out into three sections: one called block:this is just some kind of number/block number, a nonce which is just another number and just some more data very similar to the way that we had it before. However the hash this block which includes all of the information up here in above figure which begins with four zeros.It's an relatively unsual hash and most of them are not really going to start with four zeros like the above hash.This one happens to and because it does totally arbitrarily, we can say the block is signed.
        
So what would happen if I were to change any one information in the above block ?

![Metamask](/Images/Day1/a21.png)

The above hash doesn't start with four zeros and the big background has turned red.Now we know this block with this informaton in it is not a valid or a signed block and that's where `Nonce` comes in.This Nonce is just a number that you can set to try to find a number that fits so that the above hash starts with four zeros again.

Above you can see `mine` button.When I click mine button, it's gonna run through all the numbers from 1 all the way up to try find one where the hash starts with four zeros and this process is called mining.

![Metamask](/Images/Day1/a22.png)

It stopped at 64,658 and that one just happens to hash out to something that starts with four zeros and it satisfies little definition of what a `signed block` is.

**Blockchain**

Blockchain is just the chain of these block.How do you put them together? Let's do that.

![Metamask](/Images/Day1/a23.png)

Block number 1 has nonce just like before, there's some data area too but then it has this `Prev` which is a bunch of zeros in first block.

![Metamask](/Images/Day1/a24.png)

The prev is block 2 starts with '0000ae' which is the hash of previous block (block 4).Each block points backwards to the one before it.You remember that the first block, there actually is no previous so it's prev is just a bunch of zeros.It actually just a fake number.

Just like we did before what happens if I change some information in block 5?

It's going to change the hash of this block and it's gonna invalidate it.

![Metamask](/Images/Day1/a25.png)

What would happen if I change something in block 4?

It's going to change the hash but that hash will get copied to the prev hash section of block 5 which change block 5 too.So it should break both blocks.

![Metamask](/Images/Day1/a26.png)

We can go back as far as we want to some point in the past and break that block and it'll break all the blocks since then.Everything before is green.

If I wanted to change something in the blockchian, I could go over to block number 5 and could change it then we could remine it and pick a different nonce.We could essentially alter the change.  

![Metamask](/Images/Day1/a27.png)

What if I go back in past and break block 3? 

![Metamask](/Images/Day1/a28.png)

Now I need to mine block 3 which picks nonce that makes the hash out to four zeros but block 4 and block 5 will still be broken.Although block 3 start with four zeros, adding the four zeros with different stuff in prev section of block 4, still makes the block 4 hash out incorrectly.So I also need to mine block 4 and similarly block 5.

What I wanted to tell is that if I go and change the last block, all I've to do is remine that last block.If I go way back in time to one of the block and make a change, I need to mine from that block.So more block I go by in the past, it's harder and harder to make a change.That's how a blockchain is going to resist mutation/change.

`How do I know that my blockchain has been remined ?`

**Decentralized/Distributed Blockchain**

Let's take a look at `Distributed Blockchain`.

![Metamask](/Images/Day1/a29.png)

![Metamask](/Images/Day1/a30.png)

It looks exactly like the last blockchain but has different peer for the blockchain.You can see peer B having the same blockchain structure like in Peer A.List could go out forever.There's many many peers out on the internet and they all have a complete copy of the blockchain.

If I look at the hash of Peer A block 5, it starts with '0000e4' and If I go down to PeerB block 5, it also has hash that start with '0000e4'.They must be identical.

If I type something on Peer B block 4 and remine block 4 and block 5.

![Metamask](/Images/Day1/a31.png)

All the block in Peer B is green.However the Peer A chain says that last hash start with '0000e4', Peer C says '0000e4' but the middle one says '00004c'.So just by glancing Peer B hash, something is wrong with that Peer B even though all of the hash start with four zeros.Essentially it's two against one.Peer A argues it's '0000e4', Peer B argues it's '00004c' and Peer C argues it's '0000e4'.So '0000e4' wins.So that's how a completely distributed copy having a copy on many different computers they can all very quickly see if all of the blocks are identical.Blockchains can have 400000/500000 blocks very easily so rather than checking through all of them, all you really have to do is to look at the hash of the most recent one and you can that if anything in the past was altered.You can tell by looking at the last block in the chain.


**Tokens/Transaction History**

That's the entire thing.There's no more to it than that but it's kind of not really useful because we don't have something in this data area that means anything I keep typing any text that's sort of irrelevant information.So what we really want is a `token`.Let's do a token on our blockchain.

![Metamask](/Images/Day1/a32.png)

Above tokens are totally arbitrarily which tells 25 dollars from 'Darcy' to 'Bingle'. 4.27 from 'Elizabeth' to 'Jane'.It's basically all the transactions that are happening.Replaced the data with these transactions and just like we saw before there's multiple blocks.It doesn't matter how many transaction there are.If we go down to other peers, we notice we have all these other copies of the same block.Now here's where the immutability is important.If I change something in Peer A block 4, the hash of the last block will be totally different from other peer's last block hash.If I were to go back in time and change some value, we would notice.That's the whole point of using the blockchain to resist any kind of modifications that have happened in the past.

We're not listing 'Darcy' has 100 dollars and she's 25 dollars to 'Bingle'.The only thing we're saying is 'Darcy' gives 25 to 'Bingle'.We're not remembering a bank account balance, only remembering money movements.So this begs the question `"Does Darcy have 25$ ?"`

We've a problem in this version of the blockchain: we don't actually know if Darcy has 25 dollars.So let's look at a `Coinbase` transaction.

![Metamask](/Images/Day1/a33.png)

Coinbase is gonna add a coinbase transaction to our blocks.This is saying that we're going to invest a 100 dollars out of thin air and give it to 'Anders' and there's no transaction in the block because nobody had any money previous to this.

In the next block, another 100 dollars comes out of nowhere and goes to 'Anders'.Now we've transaction and they're all from 'Anders' because 'Anders' is the only one who has any money at the point.'Anders' is sending 10 of his dollars to 'Sophie'.`Do 'Anders' have 10 dollars?` Yes he does because coinbase transaction has given him the 100 dollars.Add all the transaction 'Anders' is sending and they don't go over 100 and it follows sort of a basic rule of a currency that you can't invent it out of thin air, you can't create money out of thin air.It's dispersion is controlled.

![Metamask](/Images/Day1/a34.png)

If we look at this blockchain that we've created and zip forward in time and we notice that 'Jackson' is giving 'Alexa' 2 dollars.Does Jackson have 2 dollars? We go back a block before and see that 'Emily' had gotten 10 dollars from 'Andres' gave 10 to 'Jackson'.So 'Jackson' does have the money.That's actually one of the benefit's of having a previous in the block.It's easy to go backwards.


**Summary**

- Ethereum actually runs on Keccak256.
- Hash is a unique fixed length string to identify a piece of data.
- Hash algorithm is a function that computes data into a unique hash.
- Mining is the process of finding a "solution" to the blockchain "problem".
- Nodes get paid for mining blocks.
- Block is a list of transactions mined together.
- Blockchains are decentralized and distributed because many independent users are going to run this blockchain software and they'll check and compare against eachother to see which blockchains are acting honestly and which ones are acting maliciously.
- Nonce is a "number used once" to find the "solution" to the blockchain problem.
- Nonce is also used to define the transaction number for an account/address.
