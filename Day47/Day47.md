## The Ultimate NFT

Take a look at [Day18](https://github.com/spo0ds/Journey-to-become-a-Blockchain-Engineer/blob/main/Day18/Day18.md) for the high level view of NFTs and then we'll dive more deep into it.

Now that we know the basics of approximately what NFT is and similar to ERC20, you can see the [EIP-721](https://eips.ethereum.org/EIPS/eip-721).We're going go through alot here.We're going to go through a basic NFT, a real minimalistic NFT, IPFS hosted NFT that is dynamic and uses randomness to generate unique NFT so we can have provably rare NFTs and then we're going to do SVG NFT.These are NFTs that are 100% hosted on-chain.So you don't need an off-chain, IPFS and off-chain database.This one also going to be dynamic where it's going to use pricefeeds in order to fluctuate what the image of the NFT actually looks like based off the price of some assets.

**Hardhat Setup**

So once again in our terminal we're going to create a new directory `mkdir hardhat-nft`, go inside the folder `cd hardhat-nft/` and open that into VScode `code .`

Do `yarn add --dev hardhat`, `yarn hardhat` and select empty config, copy over prettier files, hardhat.config.js, package.json, .gitignore, env from the previous project.After copying everything mentioned above, you can do `yarn` to install.

We're going to make 3 different contracts.One is going to be basic NFT using ERC721 standard.Then we're going to make a random IPFS hosted NFT and finally we're going to do a dynamic SVG NFT.Our random NFT is going to be random at creation time.This is going to give some true scarcity and some true randomness to our NFT.It's going to be hosted on IPFS.Our dynamic SVG NFT is going to be hosted 100% on-chain and the image of it's going to change based off of some parameters.That's what makes it a dynamic SVG NFT.

**Basic NFT**

Let's go ahead and create a new folder "contracts" and we'll create a basic NFT "BasicNft.sol".

```solidity
// SPDX-License-Identifier: MIT

pragma solidity 0.8.8;

contract BasicNft {}
```

Then we'll run `yarn hardhat compile`

Based off of that NFT token standard, we go back that [EIP](https://eips.ethereum.org/EIPS/eip-721), we're going to need a whole bunch of functions. We could 100% implement these and transfer them exactly like the ERC20 or once again, we can use OpenZeppelin contract.

`yarn add --dev @openzeppelin/contracts`

Now that we've added it, we can import ERC721 from OpenZeppelin in our contract.

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
```

Same as ERC20, we're going to say BasicNft is ERC721.

```solidity
contract BasicNft is ERC721 {}
```

We can see the constructor of ERC721 takes name and a symbol.So we're going to use the contructor in our contract.

```solidity
contract BasicNft is ERC721 {
    constructor() ERC721("Jered", "JD") {}
}
```

Our basic NFT will be just this image.

![basicNft](Images/m98.png)

Now in order to create new NFTs, OpenZeppelin code comes with something called "mint" function exactly the same as the ERC20.So we're going to create a function called mint.

```solidity
function mintNft() public returns (uint256) {}
```

We'll use the safe mint function of the ERC721.

```solidity
function mintNft() public returns (uint256) {
        _safeMint(msg.sender, ??)
    }
```

We'll mint the token to whoever calls the mintNft function and then we also need to give this a tokenId.If we look at back at the code for ERC721, safeMint function takes an address "to" who is going to own the NFT and then a "tokenId"; the Id of the token based off of the address "to".So if you've collections of tokens on the same contracts, each one of them need their own unique tokenId.  

```solidity
contract BasicNft is ERC721 {
    uint256 private s_tokenCounter;

    constructor() ERC721("Jered", "JD") {
        s_tokenCounter = 0;
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        return s_tokenCounter;
    }
}
```

Obviously we can create a view function for the tokenCounter.

```solidity
function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
```

This technically is a NFT but what does this look like?Well, right now this NFT isn't going to look like anything at all.In the EIP token standard, it has `tokenURI` and it's a important function that tells us exactly what the token is going to look like.tokenURI returns some type of URL that returns some JSON.

```json
{
    "title": "Asset Metadata",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Identifies the asset to which this NFT represents"
        },
        "description": {
            "type": "string",
            "description": "Describes the asset to which this NFT represents"
        },
        "image": {
            "type": "string",
            "description": "A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive."
        }
    }
}
```

In the JSON, we're going to have image part and it's going to be the URL that's going to point to what this image actually looks like.This URL can be hosted on chain, IPFS or really wherever but ideally we're not going to use a centralized server to host it.If this is hosted on a Google Cloud or a centralized server, and our centralized server goes down, it's not going to look like anything.So we want to use some type of decentralized storage to get a URL or URI to store what the image looks like.

So create an account in [Pinata](https://www.pinata.cloud/) and pin your image and metadata there.We're going to use the TokenURI in our code.

```solidity
string public constant TOKEN_URI =
        "https://ipfs/Qmcx9T9WYxU2wLuk5bptJVwqjtxQPL8SxjgUkoEaDqWzti?filename=BasicNFT.png";
```

We made it constant because that NFT is never going to change.So that everybody who mints one will have the exact same image.The way we do that now is we need to identify the actual token URI function.

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return TOKEN_URI;
    }
```

This is going to be the most basic way to create this.If we wanted to remove warning, we comment out tokenId since we're not using it.

```solidity
function tokenURI(
        uint256 /*tokenId*/
    ) public pure override returns (string memory) {
        return TOKEN_URI;
    }
```

This is all we need for this NFT to work.Now if you deploy this to Rinkeby, jump over to opensea testnet, those Jared image will show up for all the minutes.So let's go ahead and create a deploy function.So we'll create a new folder "deploy", add a new file there "01-deploy-basic-nft.js" and this is going to look really similar to everything that we've done before.

```javascript
const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
```

So copy paste the helper-hardhat-config.js and verify.js from past project.

Now we're going to go over function implementation.

```javascript
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("------------------------")
    const args = [] // BasicNFT doesn't take any constructor parameters
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        logs: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
}
```

If we want to verify this then,

```javascript
if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(basicNft.address, args)
    }

log("--------------------------")
```

Now we've a deploy script and a BasicNft, we can test our deploy script.

`yarn hardhat deploy`
