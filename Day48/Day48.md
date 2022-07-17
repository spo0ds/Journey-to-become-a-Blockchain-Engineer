## Random NFT

Let's move now to a random IPFS hosted NFT where we're going to do everything pretty much programmatically.In our contracts, we're going to create a new file "RandomIpfsNFT.sol".

```solidity
// SPDX-License-Identifier: MIT

pragma solidity 0.8.8;

contract RandomNft {}
```

So what is this one going to do?

Instead of just minting any NFT, when we mint an NFT, we'll trigger a Chainlink VRF call to get us a random number.Using that number, we'll get a random NFT.Whenever someone mints NFT, they're going to get from the RandomIpfs folder and we're going to make it so that each one have a different rarity.We'll make each rare by different amounts.So let's go ahead and start building this.

We're probably going to have to make a function called "requestNft" because we're going to need to kickoff a Chainlink VRF, "fulfillRandomWords".Let's also go one step further so that users have to pay to mint an NFT then the owner of the contract can withdraw the ETH.So basically we're paying the artists here to create these NFTs and they can be the ones actually withdraw the payment for all these NFTs.We're also going to need a function "tokenURI".

```solidity
function requestNft() public {}

function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal {}

function tokenURI(uint256) public {}
```

Again to request a random number,we can follow the guide [here](https://docs.chain.link/docs/get-a-random-number/).Since we know that we're going to work with Chainlink, we want to add @chainlink/contracts.

`yarn add --dev @chainlink/contracts`

We're going to import that VRFConsumerBaseV2 and the VRFCoordinatorInterface into our code because we know that we're going to use both of these.

```solidity
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
```

Since we're going to be using the VRFConsumerBase, we want to inherit it.

```solidity
contract RandomNft is VRFConsumerBaseV2 {}
```

Squiggly lines shows up in fulfillRandomWords indicating this needs to be override.So let's do that.

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {}
```

In order for us to request an NFT, we're going to have to call `COORDINATOR.requestRandomWords` where we pass all the stuff in.

```solidity
s_requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
```

Let's go ahead and get all the stuff for VRFCoordinator in our constructor.We're going to use VRFComsumerBaseV2 constructor to create our constructor.

```solidity
constructor() VRFConsumerBaseV2() {}
```

VRFConsumerBaseV2 needs an address in here for the VRFConsumerBase.

```solidity
constructor(address vrfCoordinatorV2) VRFConsumerBaseV2(vrfCoordinatorV2) {}
```

We wanna save that address to the global variable so we can call requestRandomWords on it.

```solidity
VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
```

Then in our constrcutor, we're going to do:

```solidity
constructor(address vrfCoordinatorV2) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    }
```

Now let's just add all the variables.

```solidity
uint64 private immutable i_subscriptionId;
bytes32 private immutable i_gasLane;
uint32 private immutable i_callbackGasLimit;
uint16 private constant REQUEST_CONFIRMATIONS = 3;
uint32 private constant NUM_WORDS = 1;
```

We get the red squiggly line, let's go ahead and add all of our immutable variables in our constructor.

```solidity
constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }
```

Now we've all these variables, in our requestNft, we can request a random number to get for our random NFT.

```solidity
function requestNft() public returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
    }
```

**Mapping ChainLink VRF Requests**

Here's the thing though.We want whoever called the requestNft function, to be their NFT.If we saw in our BasicNFT, when we minted the NFT, we called the safeMint which needed the owner and the tokenCounter.When we request a random number for our NFT, it's going to happen in two transactions.We're going to request and then later on we're going to fulfill and it's going to be the Chainlink node that's calling fulfillRandomWords.So if in the fulfill function, we just do `_safeMint(msg.sender, s_tokenCounter)`, the owner of the NFT is actually going to be the Chainlink node that fulfilled our random words.So we don't want that.What we wanna do is we want to create a mapping between requestIds and whoever called this so that when we call fulfillRandomWords which returns with that exact same requestId, we can say "Your requestId X you belong to the person who called the requestNFT."We're going to create a mapping between people who called requestNft and their requestIds so that when we fulfillRandomWords, we can properly assign the cats to them.

```solidity
// VRF Helpers
mapping(uint256 => address) public s_requestIdToSender;
```

Then when we call the requestNft, we'll set the requestId to msg.sender.

```solidity
function requestNft() public returns (uint256 requestId) {
        s_requestIdToSender[requestId] = msg.sender;
    }
```

Now when the Chainlink node responds with fulfillRandomWords, we can set the owner of that NFT.

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftOwner = s_requestIdToSender[requestId];
    }
```

This way it's not going to be the Chainlink nodes that are going to own the NFT, but it's going to be whoever actually called requestNft.

So we've a way to request a random number for our random NFT.Now let's go ahead and mint the random NFT for the particular user.We've the user now using the mapping.Well we're going to need the tokenCounter.Let's create a tokenCounter variable.

```solidity
// NFT variables
uint256 public s_tokenCounter;

function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
    }
```

Now that we've the owner and the tokenId, we can go ahead and mint the NFT.

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        _safeMint(nftOwner, newTokenId);
    }
```

safeMint is going to be squiggly because it doesn't know where we got it from.We'll we're going to need to get it from OpenZeppelin again.

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RandomNft is VRFConsumerBaseV2, ERC721 {}
```

In our constructor right after our VRFConsumerBase, we're going to put the ERC721 and we need to give it a name and a symbol.

```solidity
constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random NFT", "RN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }
```

After importing ERC721, we can see squiggly in tokenURI function.So do this:

```solidity
function tokenURI(uint256) public view override returns (string memory) {}
```

Now we can safeMint to the owner with the tokenId.

**Creating Rare NFTs**

We don't know what the token looks like and we want to make the NFTs different rarity.So how do we actually create these NFTs with different rarities.All we could do is we create a chance array.An array to show different chances of the different NFTs.We're going to create a function "getChanceArray" which is going to return uint256 of size 3 and the chanceArray is going to represent the different chances of the different NFTs.

```solidity
uint256 internal constant MAX_CHANCE_VALUE = 100;

function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }
```

So by making this array, we're saying index 0 has a 10% chance of happening, index 1 has a 20% chance of happening.It's 30-10 so 20.Then we're saying index 2 is going to have a 60% chance of happening.We're going to use it to give the tokenId that we just minted it's cat breed.So we're going to create a new function "getBreedFromModdedRng" and the reason we're calling getBreedFromModdedRng is exactly the same way in our lottery, we got a random number.

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        _safeMint(nftOwner, newTokenId);

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        
        // getBreedFromModdedRng()
    }
```

We're going to mod any number we get by 100.Doing it like this, we're always going to get a number between 0 and 99.If the moded number that we get by modding the randomWords is between 0 and 10, it's going to be Persian, 10 and 30 is Bengal and between 30 and 100 is Minx.Please don't go in the bread.I just made them up.It has no relation with the image.That's how we get the random values.

Now that we've the moddedRng, we'll create the function getBreedFromModdedRng.

```solidity
function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {}
```

The Breed of the cat is going to be an Enum similar to the raffle state that we did before.

```solidity
// Type Declaration
    enum Breed {
        Persian,
        Bengal,
        Minx
    }
```

We're going to loop through this.

```solidity
function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Breed[i];
            }
            cumulativeSum += chanceArray[i];
        }
    }
```

Let's say moddedRng is 25, i is 0, cumulativeSum is 0 and if it's 25 it should be Bengal because it lies between 10 and 30.If moddedRng(25) >= cumulativeSum(0) and it's less than cummulativeSum(0) + chanceArray[0]=>(10) so sum is 10.Here the if condition fail.So it'll move towards next index.That's how the function is going to work.It's going to get us the breed from that modding bit.

Then if some reason some really wacky stuff happens, we want to revert because we should be returning a breed but if we don't return a breed, we should just revert.So we're going to create a new error at the top.

```solidity
error RandomNft__RangeOutOfBounds();
```

So in our function, if some reason it doesn't return anything we'll just revert.

```solidity
function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Breed[i];
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomNft__RangeOutOfBounds();
    }
```

Now we can get the breed from a moddedRng.So back in our fulfillRandomWords function, we'll uncomment the getBreedFromModdedRng function.

```solidity
Breed catBreed = getBreedFromModdedRng(moddedRng);
```

Let's move safeMint down the catBreed.

```solidity
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        Breed catBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(nftOwner, newTokenId);
    }
```

**Setting the NFT Image**
