**Advanced deploy_and_create.py**

Now let's create our advanced collectible scripts and alot of what we're going to do is going to be the same as the simple one deploy_and_create.py.Copy paste everything of simple collectible deploy_and_create.py to advanced collectible deploy_and_create.py script but we're going to change a couple of things.

**Refactoring**

Opeansea url we're accessing in couple of different scripts.So we're actually gonna take it and move it to our helpful_scripts.

![openseaURL](Images/l61.png)

Now in our simple deploy_and_create, import OPENSEA_URL from helpful_scripts.

![openSEAURLImporting](Images/l62.png)

Now OPENSEA_URL is going to come from helpful_scripts and same for deploy_and_create for Advanced.So I've now copied and pasted all the code form deploy_and_create of Simple Collectible to deploy_and_create of AdvancedCollectible.Let's go ahead and modify this now.

![advancedDeploynCreate](Images/l63.png)

This is going to be our starting point.

**Deploying AdvancedCollectible**

Our advanced collectible has a different constructor.It's got a VRFCoordinator, link token, keyHash and a fee.So we're gonna have to add those as the parameters.We wanna work with rinkeby for this because the opensea marketplace right now for testnets only works with rinkeby.So let's get started and grab those rinkeby addresses first.

Our advanced collectible needs a VRFCoordinator and a link token.So if we head over to [chainlink documentation](https://docs.chain.link/docs/vrf-contracts/#rinkeby) for the VRF, grab the VRF Coordinator for Rinkeby and same as before we'll jump into our config add it there.We'll do need the link token, keyHash and fee as well.

![rinkeby](Images/l64.png)

Now in our advanced collectible deploy_and_create, we can go ahead and add those variables.Since we're going to be interacting with actual contracts that are on-chain and we're going to want to be able to flip back and forth between the mock versions of them we're gonna bring back that get_contract function that we used before.This is the function that's going to be smart enough to know if we need to deploy a mock or just grab from an actual contract.

Feel free to copy and paste from our last project.Something that we do need to talk about though is our deploy_mocks function.The syntax here is basically exactly the same however we do need to deploy a couple of mocks.So make sure you have these in your deploy_mocks function.

![deployMocks](Images/l65.png)

**Continuing our deploy script**

We can go back to our advanced collectible deploy_and_create, import get_contract from helpful_scripts.

![getContract](Images/l66.png)

Then for keyHash and fee since these can be whatever we want and these aren't really contracts, we can go back to our config we'll add the development network and add keyHash and fee.

![development](Images/l67.png)

So keyHash and fee on our deploy_mocks gonna be:

![keyandFee](Images/l68.png)

and get the VRFCoordinatorMock.sol and LinkToken.sol file inside contracts directory.

![contracts](Images/l69.png)

Now let's go ahead and run this on the development network.

`brownie run scripts/deploy_and_create.py`

IF you get this error:

`cannot import VRFCoordinator Mock from brownie`

In your deploy_and_create.py script do the import changes.

![importInDeployandCreate](Images/l70.png)

and then in your helpful_scripts.py do this import.

![importInHelpfulScripts](Images/l71.png)

then run `brownie run scripts/deploy_and_create.py`

It should be fine now :)

![output](Images/l72.png)

We can see we did couple of things here.First we deployed the Mock LinkToken, then we deployed our Mock VRFCoordintor and then we deployed our AdvancedCollectible all on a local network.

Once we deploy this code we're gonna want to fund this contract with some LINK because we can call the random number.I like to have my funding with link also in a function and we'll give it the address of the advanced_collectible.Let's go ahead and create fund_with_link function.Feel free to copy this function from past projects.

![fund_with_link](Images/l73.png)

and call that function in deploy_mocks.

![callingFundWithLink](Images/l74.png)

All we have to do now is call our createCollectible function .

![callingCreateCollectible](Images/l75.png)

We definitely want to test this because we've number of custom scripts.So let's go ahead and do a manual test.

`brownie run scripts/deploy_and_create.py`

If you get this error:

`createCollectible Sequence has incorrect length, expected 1 but got 0`

![AdvancedCollectibleParameter](Images/l76.png)

Now ideally we would have ofcourse write some tests but I want to show some things that are easier to demonstrate on an actual testnet.So we're gonna go ahead and deploy this to an actual testnet before we write our tests. 

`brownie run scripts/deploy_and_create.py --network rinkeby`

If you get error like:

`ValueError: Gas estimation failed: 'execution reverted'. This transaction will likely revert. If you wish to broadcast, you must set the gas limit manually.`

I was following the VRF v2 guide but my code was using the vrf v1 and thus I was using the wrong contract address and keyhash. In order to fix it, I need to retrieved the contract address and keyhash of [VRFV1](https://docs.chain.link/docs/vrf-contracts/v1/).

`
 vrf_coordinator: '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B'
 link_token: '0x01BE23585060835E02B77ef475b0Cc51aA1e0709'
 keyhash: '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311'
 `
 
 ![output](Images/l77.png)

We can grab the contract address paste it into the [rinkeby etherscan](https://rinkeby.etherscan.io/). We can see we've given a little bit of LINK, we can see our two function calls.

![twoFunctionCalls](Images/l78.png)

One is contract creation and another is create Collectible.

In our scripts, we're going to create a new script called "create_collectible.py"

**create_collectible.py**

Here we'll just create a collectible.

![createCollectible](Images/l79.png)

Now let's go ahead and run this:

`brownie run scripts/create_collectible.py --network rinkeby`

What we're going to do is fund our advanced collectible with link which is 0.1 then we're going to create a new NFT.

 Now we've token and it's randomly assigned to breeds.
 
 As you can see we're doing kind of a lot of manual testing work here.So what we're probably wanna do instead is automate these tests.
 
 **Back to testing**
 
 Copy and paste everything written in test_simple_collectible.py code and we'll refactor it now for advanced collectible.
 
 ![testAdvancedCollectible](Images/l80.png)
 
 Now we need to call deploy_and_create function.
 
 ![deployNcreate](Images/l81.png)
 
 In deploy_and_create function we'd probably want to return advanced_collectible contract  so we can make sure that we actually get what we want.
 
 ![returningAC](Images/l82.png)
 
 So in our test script, we'll say:
 
 ![AC](Images/l83.png)
 
 This will returned our advanced collectible.However we know that since we're working with the Mock VRFCoordinator, if we look at our AdvancedCollectible.sol, we know that the bulk of the work actually comes from fulfillRandomness function and we're gonna have to tell our mock to actually return and call the fulfillRandomness function.So inorder to do that we should probably also return the creating_txn so that we can get the request_ID.Remember how in our lottery we actually just directly called everything and we needed requestID to call callBackWithRandomness function.
 
 ![lotteryTest](Images/l84.png)
 
 In our test here we're actually using our scripts little bit.So we could either just go ahead and write out all the steps similar to what we did in the lottery or we could adjust our scripts a little bit.For simplicity here we're just going to return the creating_txn in our deploy_and_create function.This way we can go ahead and get the request_ID.
 
 ![creatingTxn](Images/l85.png)
 
 So back in our test we need to do :
 
 ![returningBoth](Images/l86.png)
 
 Now that we've creation_txn we can use it to get our events and again if we look back in our AdvancedCollectible.sol we could see we're emitting the requestedCollectible with requestID.
 
 ![emit](Images/l87.png)
 
 So we can go ahead and do:
 
 ![gettingRequestID](Images/l88.png)
 
 Once we've the requestID we can then go ahead and grab the VRFCoordinator.So from our scripts we need to import get_contract.We've coded out get_contract in a way that if the mock has already been deployed then we just going to grab the recent deployed one.So we don't have to re deploy it.
 
 ![getContract](Images/l89.png)
 
 Remember we're gonna be calling callBackWithRandomness.This is what a real chainlink node is actually gonna callback.It needs requestID, randomness number and a consumer contract.
 
 Now we can move into our assert phase.So first if the get_contract is correct, token_counter should be atleast 1.
 
 ![assert1](Images/l90.png)
 
 We also should technically be able to get the breed and figure out the first token, of this first  collectible.Let's go ahead and parameterize the 777.
 
 ![assert2](Images/l91.png)
 
 In our fulfillRandomness, we're gonna assign the tokenID to being the breed and the breed is going to be the random number mod 3.tokenIDToBreed[0] cause 777 mod 3 is 0.
 
 let's go ahead and run this.
 
 `brownie test -k test_advanced_collectible.py`
 
 Even though we skipped this test brownie still compiles it to make sure that everything makes sense.Our AdvancedCollectible unit test has worked perfectly.
 
 
 
 

