## Full Stack NFT Marketplace

This is going to be the most complicated frontend using the web3 stack and using a lot of really advanced web3 and blockchain tools.In this project we're going to learn more about how events are so important and why events are so important especially for off-chain services.We're actually going to look at two different ways to work with them.One using the Moralis or centralized database and then one using The Graph.Oftentimes, when people are looking to scale the projects, looking to get things done really quickly, taking a more centralized approach can often be a little quicker and you can sometimes add more functionality to your website.There's still lot of protocols that have decentralized backends and centralized front ends.One such example is OpenSea.It has the ability to actually like different NFTs.Now this isn't something that we'd actually want to spend gas on but it is something that we're going to have to store in some type of database somewhere, so that people have the ability to do that.

**NFT Marketplace Contracts**

**Hardhat Setup**

We're going to create a new folder called "hardhat-nft-marketplace" and open the folder in VScode.Run the below command in the terminal.

`yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv`

Copy paste the .prettierrc and .prettierignore file from the Github Repo.For linting with solidity, also grab .solhint.json and .solhintignore.We're also going to bring our hardhat.config.json from lottery, utils folder and .env.

Before we write our contracts, let's go ahead and write a little docs saying what our contract is even going to do.We're going to create a decentralized NFT marketplace.What does that mean? Well we'll probably need some type of `listItem` function because we want to list NFTs on the marketplace.We need some typeof buyItem to buy the NFTs, need maybe like a `cancelItem` to no longer want to sell it, maybe an `updateListing` to update price  and then maybe a `withdrawProceeds` to withdraw payment for bought NFTs.So when somebody buys NFT, I'm going to have to withdraw from the contract since the contract is going to be the one to actually hold those funds.

So let's create a new folder "contracts", create a new file called "NFTMarketplace.sol".

**NFTMarketplace.sol**

So let's get our boilerplate.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract NftMarketplace {}

```

So let's start with listing the items.How are we going to keep track of listing people's items? We're going to start with listItem function and we're going to make it look really really good.so we're going to do natSpec and everything.It's going to be an external function because we probably don't want any of our internal funtions calling listItem.It's going to be called by external projects or external accounts.We probably going to need NFT address, the token id and set a price.

```solidity
function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external {}
```

So first off, we probably want the price to be greater than zero.So we'll put a if statement inside the function.

```solidity
if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
```

Now in order for us to list this,we can actually do this one of two ways.We could send the NFT to the contract.This would require us doing like a `transfer`.We could have the contract hold the NFT.We could do this but this is kind of `gas expensive` for someone to list NFT or we can have the owner of the NFT be our NFT marketplace.The issue with this though is that the market place will own the NFT and user won't be able to say like "Hey I own this NFT.It's in this marketplace."They technically would be able to but they would have to withdraw it.

We might do this in a slightly different way where we might say where we can say Owners can still hold their NFT and give the marketplace approval to sell the NFT for them.Now of course owners of the NFT could withraw approval at any time and the marketplace wouldn't be able to sell it anymore.However this would be really easy for people to actually read.All they have to do is read like is approved for marketplace and they can actually see if the item was really listed or not.We're going to go ahead and write it the second way.This is the least intrusive way to to have the marketplace.People will still have the ownership of their NFTs, and the marketplace will just have approval to actually swap and sell their NFT once their prices are met.

So since we want to make sure the marketplace has approval, let's make sure the marketplace has approval.So we can call `getApproved`(EIP-721) function on that tokenId to make sure that the marketplace is approved to work with the NFT.To do this, we're going to need IERC721 Interface and we can actually grab that from OpenZeppelin.The Interface will wrap around an address and we can call getApproved on that address.

```solidity
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";;
```

Since we're doing an import from OpenZeppelin, we'll do `yarn add --dev @openzeppelin/contracts`

Now that we've the IERC721 interface, we'll wrap around the nftAddress.

```solidity
IERC721 nft = IERC721(nftAddress);
```

And then we'll check whether the tokenId is approved or not.

```solidity
if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }
```

Now that we've got this, we probably want to have some type of data structure to list all the NFTs.Typically we get to choose either to use array or mapping.What do you think it makes more sense to put in an array or mapping?

If you said mapping I would agree with you.You could do an array and you wouldn't necessarily be wrong but it's not the way that I would go about that.for an array anytime someone wants to buy an item, we're going to have to traverse through the array.We're going to have to make massive dynamic array and might get little bit dicey as the array gets really really big.So we're going to go ahead and make this a mapping which is going to be the state variable.

`mapping(address => mapping(uint256 => ??));`

We want the tokenId to map with price but we also want to keep track of sellers.So we could make another two mappings or just create a new type of type "Listing".

```solidity
 struct Listing {
        uint256 price;
        address seller;
    }
```

Now that we've the new type, we'll map tokenId with the new type "Listing".

```solidity
// NFT Contract Address -> NFT TokenID -> Listing
mapping(address => mapping(uint256 => Listing)) private s_listings;
```

Now in our listItems function, we're going to update that s_listings.

```solidity
s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
```

Selle is msg.sender because they're the one who's actually listing the item.Since we're updating the mapping here, we need to emit an event.Especially for this project you're going to see why emitting an events is so helpful.

```solidity
// below mapping declaration 
event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

emit ItemListed(msg.sender, nftAddress, tokenId, price);
```

This looks pretty good however we probably want to make sure we only list NFTs that haven't already been listed.So we can add like an if then here and this is where preference comes in a little bit but I'm going to create a modifier called "notListed".So we make sure we don't re-list NFTs that are already listed.

```solidity
modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }
```

Let's just make sure this actually compile `yarn hardhat compile`

We'll add the modifier to the listItems function listItem function.

```solidity
function listItems(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) {
        
    }
```

What else should we check for? Well we should also check that the NFT that's being listed is owned by msg.sender.This way only the owners of the NFT can actually list here.So we'll add "isOwner" modifier.

```solidity
modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }
```

Now we'll also add isOwner modifier.

```solidity
function listItems(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
    }
```

So now our listItem checks to see if it's already listed, make sure that only the owner of the NFT of that tokenId can list it and then it goes ahead and list it.

This is our listItem method here.Let's go ahead and do a little bit of natSpec here.

```solidity
/*
 * @notice Method for listing your NFT on the marketplace
 * @param nftAddress: Address of the NFT
 * @param tokenId: the Token ID of the NFT
 * @param price: sale price of the listed NFT
 * @dev Technically, we could have the contract be the escrow for the NFTs
 * but this way people can still hold their NFTs when listed.
 */
```

Now that we've a listItem function.What's next? Let's make a buyItem function for people to buy the NFTs after they have been listed.
