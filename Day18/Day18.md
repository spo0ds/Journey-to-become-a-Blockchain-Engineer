## Lesson 11: NFTs

NFTs are hot right right now.NFTs also known as `ERC-721s` are a token standard that was created on the Ethereum platform.NFT stands for `Non-Fungible Token` and is a token standard similar to ERC20.Again ERC20s like LINK, AAVE, MAKER all those goodies that are found on the Ethereum chain.An NFT is a token that is non-fungible.This means that they are starkly unique from eachother and one token isn't interchangeable with any of the token of it's class.A good way to think about is one dollar is interchangeable with any other dollar.One dollar is going to have the same value of another dollar.Those are fungible tokens.That's like ERC20s(Technically ERC677).One LINK is always going to be equivalent to one other LINK.

By contrast is going to be NFTs like Pokemon.Your one pokemon is going to have different stats, different move sets and isn't interchangeable with any other pokemon or more relatable is unique piece of art like Picasso.That's what these NFTs are.They are non-fungible, non-interchangeable tokens that for the moment are best represented or thought about as digital pieces of art that are incorruptable and have a permanent history who's owned them, deployed them etc.

Now like I said NTFs are just a token standard.You can actually do them much more than just be art.You can give them stats.You can make them battle.You can do really unique things with them.You can do pretty much whatever you want with them but right now the easiest way to think about it and the most popular way is by calling them art or some type of collectible or just anything that's unique.

They've been getting ton and buzz recently because we've been seening more and more these being sold at insane prices like we saw AXIE INFINITY sold nine plots of their unique land for $1.5 million.We also saw the original creator of the NEON CAT sold for like 300 ETH.Like I said they're just tokens that are deployed on a smart contract platform and you can view them on different NFT platforms like [opensea](https://opensea.io/).This is the NFT marketplace that let people buy and sell them.You obviously can do that without the marketplaces because it's a decentralized but they help and give a good UI.So that's the basic gist of it.


**ERC-721**

The ERC-721 standard or the NFT standard this is the basis of it all.There's another standard that's semi-fungible tokens the `ERC-1155`.We're not gonna talk about that here but you can check it out.The main differences between a 721 and ERC20 are ERC20s have a real simple mapping between address and how much that address holds.

![ERC20Mapping](Images/l1.png)

721 has unique token ids.Each token id has a unique owner.

![721Mapping](Images/l2.png)

In addition they've what's called a token URI which we'll talk about in a minute.

![TokenURI](Images/l3.png)

Each token is unique.Each token id represents a unique asset.So since these assets are unique, we want to be able to visualize them and show what they look like.We need to define those attributes of the object.If it's a piece of art, we need to define a way to define what that art looks like.If it's some type of character in game, we need a way to define that character's stats in the NFT.

**Metadata**

This is where metadat and token URI come in.So if you know anything about ethereum, you know that sometimes gas prices gets pretty high.Especially when it comes to storing a lot of space, it can get really really expensive.So one of your first question might be "Are they storing these images and these art pieces on chain?" and the answer is sometimes.Back when they're coming up with NFTs and artists were deploying stuff, the ETH devs and the artists realize that if they put all this art on chain it's gonna be incredibly expensive.So to get around this what they did put in the standard what's called the token uri.


**Token URI**

Token URI is a universally unique indicator of what that asset or what that token looks like and what the attributes of the token are.You can use something like a centralized API or IPFS to actually get the token URI.A token URI is just a simple API call.

Typical token URI has to return something in the below image format.It has name, image location, desription and any attributes below.The image URI is a seperate URL that points to an image.

![TokenURIReturnFormat](Images/l4.png)

Your first question probably be "We pull from a single source seems pretty centralized"This is the current limitation of the NFT ecosystem.There's often this talk of on-chain metadata vs off-chain metadata because it's so much easier and cheaper to store all your metadata off-chain.A lot of people use something like `IPFS` that is decentralized but does take a little bit of centrality to keep persisting but they can also use their own centralized API.However if that goes down then you loose your image you loose everything associated with your NFT.Because of this most NFT marketplaces actually can't and won't read off on-chain attributes or on-chain metadata because they're so used to looking for the token uri.

Obviously if you do off-chain metadata, you can't do anything really cool or interesting or have any games with your NFTs.For example if you wanted to create an on-chain pokemon game, all your attributes would need to be on-chain in order for your pokemon to interact with eachother because if it was off chain then that becomes alot harder to cryptographically prove.So if you're new with NFT and you're like "wait this is kind of like lots of information", I'll make it easier for you.

IF you're looking to render an image of an NfT
- add your image to IPFS
- add a metadata file pointing(token URI json) to that image file on IPFS
- then grab that token URI and put it and set it as your NFT

The [chainlink dnd article](https://blog.chain.link/build-deploy-and-sell-your-own-dynamic-nft/) does a great job of walking you through this and showing you how to do this.Be sure to read that if you're looking to learn how to do that.
