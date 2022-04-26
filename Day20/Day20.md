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

