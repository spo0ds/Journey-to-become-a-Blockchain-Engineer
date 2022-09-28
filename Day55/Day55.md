**Resetting the Local Chain**

Let's say I've closed my hardhat node .If I've stopped my hardhat node, come back to Moralis admin now I'm disconnected from the server because I'm not running my hardhat node.If I restart my node, connect local devchain command is still running,and if I refresh it, it'll now say connected.However if I go back to my hardhat-nft-marketplace smart contract and run mint-and-list script, go back to my database and do refresh, we don't see the item listed in here.On Moralis server is looking to make sure that the blockchain that we're working with is the same one.

We reset our hardhat node.So our database is going to get really confuse.We have to hit `reset local chain` to make sure that our new local chain is running  which will tell Moralis to continue doing so.Once we hit reset local chain, we're not going to see item listed in the database, however if we go back  and re-run mint-and-list, go to the moralis database and hit refresh, we now can see the item there.

**Moralis Cloud Functions**

The reason that we're doing this in the first place is that in our index.js, we can start listening for events.Now we have a database of listed NFT.We can just query ItemListed table and grab everything in there.However we've an issue here.What happened if someone buys a NFT? 

If someone buys a NFT, the ItemListed event will still be in our database but technically it won't be on the marketplace anymore.It'll be gone.So what can we do?

There's number of architectural choices we can make to get around this problem.One of the things we can do is to use [Moralis cloud functions](https://v1docs.moralis.io/moralis-dapp/cloud-code/cloud-functions).It allows us to really add anything we want our frontend to do from the Moralis server.

In our frontend code section, let's make a new folder called "cloudFunctions" and create a new file called "updateActiveItems.js"For the command, we're going to open package.json and make another moralis script.

`"moralis:cloud": "moralis-admin-cli watch-cloud-folder --moralisSubdomain gscy6u59g2ht.usemoralis.com --autoSave 1 --moralisCloudfolder ./cloudFunctions"`

Now I could run the script by `yarn moralis:cloud`.

Right now we're trying to figure out  we've ItemListed but if someone buys a NFT  technically it shouldn't be listed anymore but our ItemListed table will still have the item.

We can create a cloud function that runs whenever we want.We're going to create a cloud function that only runs whenever any one of the events are synced.We're going to create a new table called "ActiveItem", and it's active anytime it's listed but we'll remove if it's bought or canceled.

```javascript
Moralis.Cloud.afterSave("ItemListed", async (request) => {

})
```

afterSave keyword means that anytime something is saved on a table that we specify , we'll do something.It takes what table that we want to do something after it's save and some action.Anytime some item is listed in ItemListed table, we'll run some async function.We've put request in there because anytime something get's saved, it comes with a request.So anytime item is listed in ItemListed table, we want to add it to ActiveItems list.

Request comes with the flag called `confirmed` because every event gets triggered twice .Once the transaction goes through,it triggers a save and once again, once that transaction is actually confirmed.We actually only want to update ActiveItem table, when the transaction is actually confirmed.

```javascript
Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed")
})
```

Then we're also going to make logger.
```javascript
Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
})
```

We can actually write logs to our Moralis database with the logs thing.

```javascript
Moralis.Cloud.afterSave("ItemListed", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info("Looking for confirmed Tx")
})
```

In our logs, we should see "Looking for confirmed Tx", once an item listed and saved.Now to test this out, let's run `yarn moralis:cloud` and run mint-and-list script and we should get those logs.

Now in our logs here, we only see that "Looking for confirmed Tx..." once and I just told you "It actually triggers twice."If we look in our database at the ItemListed, and scroll all the way to right, we can see confirmed equals false.So we only want to count the ItemListed event in our ActiveItems when confirmed is true.So we want to update our scripts to add one block confirmations on top of our local hardhat blockchain so that these can be changed to confirmed.

So we'll create a utility script that we can utilize in our mint-and-list script.We'll create a new file inside utils called "move-blocks.js".This will be the utility to actually move the blocks.So when we run our own hardhat node, we actually have complete control over what we want our hardhat node to do.

We can actually manually mine node and actually move blocks ahead so that Moralis knows the transaction is confirmed.We're mining the block with the transaction and that's it and Moralis is just going to be forever be waiting for the next block.So we want to add some functionality to our scripts where we mine a block after it's done.

```javascript
async function moveBlocks(amount, sleepAmount = 0) {

}
```

sleepAmount is going to be the optional parameter.If we want to move blocks and sleep maybe a second between blocks to resemble a real blockchain, we can have that in here too.   

```javascript
const { network } = require("hardhat")

async function moveBlocks(amount, sleepAmount = 0) {
    console.log("Moving blocks...")
    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
    }
}  
```

This is actually the same way we can make raw calls to our blockchain nodes.

Then if we specify sleepAmount then we're also going to have the script sleep or wait a short duration.

```javascript
function sleep(timeInMs) {
    return new Promise((resolve) => setTimeout(resolve, timeInMs))
}
```

In order for us to wait for sometime, we got to use promises.Promise is going to take a function with resolve as an input parameter and sleep using setTimeout.

```javascript
if (sleepAmount) {
            console.log(`Sleeping for ${sleepAmount}`)
            await sleep(sleepAmount)
        }
```

So since sleep returns a promise, we can call it with a await to wait for the sleep function to finish.

Now we'll export the function.

```javascript
module.exports = {
    moveBlocks,
    sleep
}
```

Now back in our mint-and-list, we'll import the function.

```javascript
const { moveBlocks } = require("../utils/move-blocks")
```

Down in our script at the bottom, we'll do:

Now if we comment everything and only let sleep function to run, we can see confirmed is set to true in ItemListed table.And if we see in our logs, we could see logging item happened twice.

Back to our updateActiveItems script.If it's confirmed, we're going to do some stuff.We're going to create a ActiveItem table and add item to the ActiveItem table.

```javascript
if (confirmed) {
        logger.info("Found Item!")
        const ActiveItem = Moralis.Object.extend("ActiveItem")
    }
```

This we're saying, "If ActiveItem exists, grab it but if not create it."

```javascript
const activeItem = new ActiveItem() // creating a new entry
activeItem.set("marketplaceAddress", request.object.get("address"))
activeItem.set("nftAddress", request.object.get("nftAddress"))
activeItem.set("price", request.object.get("price"))
activeItem.set("tokenId", request.object.get("tokenId"))
activeItem.set("seller", request.object.set("seller"))
```

All of these requests from events come with the address that they're coming from which for us is the marketplace address.nftAddress, price, tokenId, seller are all the parameters of our event.

```javascript
logger.info(`Adding address: ${request.object.get("address")}, TokenId: ${request.object.get("tokenId")}`)
logger.info("Saving....")

await activeItem.save()
```

Now we've a cloud function that's going to create a new entry in a new table called ActiveItem anytime ItemListed happens.So after item is called, the trigger for our cloud function and there's a whole bunch of different triggers for different Moralis cloud functions.

Now if we upload the new script to our Moralis cloud server by `yarn moralis:cloud `, go to our database, we don't see ActiveItem table.But if we go back to our our mint-and-list script, and run it , we should see ActiveItem update.


