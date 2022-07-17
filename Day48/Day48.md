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
