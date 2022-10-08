**The Graph Front End**

We've done all of the frontend using the moralis.Instead of indexing all of our events with the centralized server now we're going to build this using the graph which is a decentralized event indexer.Alot of the code is going to be exactly the same.So instead of us starting from new, we're going to copy everything into new folder "theGraph-nft-marketplace" and open it up in VScode.

First thing we're going to do is deploy our contract to Goerli.We'll grab our Marketplace.sol and run deploy script on goerli.

`yarn hardhat deploy --network goerli`

Be sure to take note of the deployed marketplace and basicNft contract because we need them in our graph section.

We've deployed it to goerli but we also need to update our networkMapping.If we did everything correctly, we can see network mapping gets updated in our frontend section.So we can copy that network mapping in our theGraph section as well.

```json
{
    "5": {
        "NftMarketplace": [
            "0x7C79E5158f8A1D90aE6AaFe1239DbAa38AB6d6F8"
        ]
    },
    "31337": {
        "NftMarketplace": [
            "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        ]
    }
}
```
We're going to delete the cloudFunction folder beause we're not working with the server anymore.There's not going to be any backend to run.We don't need frp anymore because we're not going to connecting our local blockchain to the graph.We're only going to be working with the testnet here.In our app.js, we're connecting to moralis provider like this:

```javascript
<MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
```

We're going to switch it back to false.

```javascript
<MoralisProvider initializeOnMount={false}>
```

We'll not connect to the moralis database like we did.We're just going to use the hooks.The only thing that's going to change is index.js.Right now in our index.js we're getting  our list of NFTs from our Moralis query.So we're going to change this.Let's update the readme.

```markdown
1. Instead of reading the events from Moralis, we will
    1. Index them with The Graph
    2. Read from The Graph
```

**What is The Graph?**

Graph is going to be a decentralized layer for storing event data.There are all these different blockchain and storage networks and the graph is a network of different nodes that read from blockchain and index the data.It exposes an API for us to call to read that data.

**Building a Subgraph**

If we try to run the app as it is, it will fail because index.js right now is reading from Moralis.First thing we need to do is index from the graph and we can adjust the project to read from the graph.

In order for us to tell the graph network to start indexing the events from our contract, we go to graph.com then to products and then to [subgraph studio](https://thegraph.com/studio/).This is going to help us enable us to create a subgraph for other nodes to start indexing our events.So we're going to connect our wallet.We're going to get a signature request from the graph similar to the website  that we just built.The subgraph website has some signing functionality with the database on the backend.So we're seeing in real life, exactly the methods that we just use.So instead of signing with Moralis, they just have their own custom sign in here.
