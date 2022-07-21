## Dynamic SVG On-Chain NFT

We don't need to host the data on IPFS.We can actually host our data and metadata directly on-chain if we want to.However there's some pros and cons.

Hosting on IPFS
- Pros: Cheap
- Cons: Someone needs to pin our data

Dynamic SVG NFT
- Pros: The data is on-chain and you never have to worry about somebody actually pinning the data.
- Cons: Much more expensive

The images are actually surprisingly large and storing them on-chain can actually get pretty expensive.So instead on pngs that we were using, we're going to use svgs.

**What is a SVG?**

[SVG](https://www.w3schools.com/graphics/svg_intro.asp) stands for Scalable Vector Graphics and these are much much more minimalistic files that we can go ahead and upload to the blockchain.So that's why we're going to use them because since there's so much more minimalistic, they're alot cheaper to upload.Remember the more data that you upload to the blockchain, the more expensive it is.SVG actually work right in HTML.So if you want to use these for your websites, you can as well.We're going to go one step further, we're going to make it dynamic.We're going to make this actually change based off of some data on-chain.

We're going to make the NFT dynamic in the sense that if the price of ETH is above some number then we're going to have it be happy face and then if it's below, we're going to make it a frowny face.Our NFT is going to change based off of some real world parameters and this is obviously really powerful and really cool because we can have an NFT that changes based off stats or really whatever.We're going to store all the data 100% on-chain.It's going to be little bit more expensive.

**Initial Code**

So we're going to create a new contract called "DynamicSvfNft.sol" and it's going to look really similar to what we've been doing.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

contract DynamicSvgNft {}
```

Now let's talk about what the architecture of this is going to look like.It's going to look like pretty normal Nft with a couple of caveats.We're going to give it a mint function to mint the NFTs.We also need to store SVG information somewhere and then we need to have some logic to say "Show X image" or "Show Y image" which is just switching the tokenUri.So let's go into how we'd actually do this.

So first we know this is going to be an ERC721.We can go ahead and import that from OpenZeppelin.

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DynamicSvgNft is ERC721 {}
```

We're not going to call that setTokenURI function.So we can just use the raw ERC721.

Now we'll call the constructor of the ERC721.

```solidity
constructor() ERC721("Dynamic SVG NFT", "DSN") {}
```

Then we also need a mint function.

```solidity
uint256 private s_tokenCounter;

function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
    }
```

We've a way to mint and we've done some basics here.But what is this token going to look like ? We want these to look like SVGs and we want it to be based off the price of some asset.

**Base64 Encoding**

In our constructor, we'll add low and high arguments and in our code, we'll save the low and high which will be the images that we'll import as parameters here.

```solidity
string private immutable i_lowImageURI;
string private immutable i_highImageURI;

constructor(string memory lowSvg, string memory highSvg) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
    }
```

But if we just passed the SVG data, SVG data is going to look like HTML which is definately not an imageURI.We need the imageURI.Right now the way that we're going to pass it in is like the with the SVG code because we want to just pass the SVG code and then have the contract handle everything else.So how do we actually do this?

We can create a function called "svgToImageURI" and on-chain we can convert from SVGs to imageURIs.So instead of having IPFS as their start, we're going to use something called `Base64 encoding`.You can actually encode any SVG to a [base64](https://en.wikipedia.org/wiki/Base64) image URL.We can convert SVG stuff to am image URL.That's exactly what we want.

Now if you take the SVG image from the Github repo, right click and copy the image address, head over to the [base64.Guru](https://base64.guru/converter/encode/image) site, change the data type to remote URL and paste the image address there and click on "Encode SVG to Base64".

![base64](Images/m100.png)

This Base64 encoding represents the SVG that we just got and in our browser if we type `data:image/svg+xml;base64,*paste that encoding here*` and you'll get that svg.With this base64 encoded image, we can use this on chain as the image URI for our images and then for our metadata, we'll just bake that directly into our tokenURI.

```solidity
function svgToImageURI(string memory svg) public pure returns (string memory) {}
```

We're going to give this function an SVG which we're going to pass in from our constructor and we're going to return a string which is going to be that base64 encoded URL.

```solidity
string private constant BASE64_ENCODED_SVG_PREFIX = "data:image/svg+xml;base64,";
```

We'll use this to generate our SVG.We're going to encode the SVG in base64 ourself by adding the base64 encoding on-chain.We don't really have to rewrite that ourselves because somebody has already done [this](https://www.npmjs.com/package/base64-sol/v/1.0.1).We can add the Github code where they have basically everything that we need to encode and decode base64.

`yarn add --dev base64-sol`

Once we've added it, we can go ahead and import it.

```solidity
import "base64-sol/base64.sol";
```

This contract comes with an encoder.

```solidity
function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded));
    }
```

Just these function will take an any SVG and spit us back out URI.

**Advanced Section Encoding, Opcodes and Calls**




