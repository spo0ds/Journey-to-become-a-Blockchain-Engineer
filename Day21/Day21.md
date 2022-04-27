**Integration Testing**

Let's go ahead and make a integration test.Our integration test is actually going to look really similar to our advanced collectible unit test.So I'm just going to go ahead and copy everything.Create a new folder under tests called "integration" and paste everything on a file inside "test_advanced_collectible_integration.py".

The only thing that we're going to change is that we're not going to be the ones to callBackWithRandomness function and also don't need the requestID anymore since the chainlink node is going to be responding.This means the breed that we're gonna get is actually gonna be random.

![removingForIntegration](Images/l93.png)

All we need to do is wait for the transaction to get called back.So we're going to import time and instead of us calling  with randomness we're just going to do and we're giving a different function name.

 ![sleep](Images/l94.png)
 
 
 Now we should be able to tests this on a rinkeby chain and our token counter should indeed increase with the chainlink node actually responding.
 
 `brownie test -k test_can_create_advanced_collectible_integration --networks rinkeby`
 
 ![output](Images/l95.png)
 
 Oh whoops right now we're skipping it because we're saying only for Local testing.Since this is going to be our integration test we're going to do the opposite.
 
 ![IntegrationTesting](Images/l96.png)
 
 So now we've quick and dirty integration testing that we can run.We're not going to run it for now because we're going to be working alot with this rinkeby chain and we're going to de deploying alot of different things and we don't want to wait so long.
 
 We've a way to deploy this, we've a way to get these new collectible tokens and create them but if we're to take this address righ now and try to view this token on something like opensea, we'd get nothing back.We wouldn't get any result.Right now our token doesn't have a way to be viewed or be visible by everybody else.These NFT platforms don't know what they look like and again this is where that setTokenURI is going to come into play.So we have to figure out a way to host an image and host all the metadat for our token URI and the way we're gonna do this is by using `IPFS` and this is lot better than actually hosting on our own server because anybody then can go ahead and host the image or metadata themselves.
 
 Now there's further improvements with Filecoin where you actually pay to have your image hosted forever.However IPFS can hook into Filecoin in the future and and is going to be a good enough solution for what we're looking to do here.Just keep in mind what we don't want to do is run this on a centralized sever.When we spin up our IPFS node, we'll be the only node that actually runs and actually hosts our image.However the image is open for anyone to pin to their nodes as well.So it's much easier for us to host our images in a decentralized manner.What's bad obviously is if we just had the image stored on our centralized server because if our server goes down then that url no longer exists.If at least 1 node on the IPFS network is hosting the image, it'll be available for anybody to see.So that's why it's going to be a much better solution than some centralized server.As I mentioned decentralized storage is a topic that's getting better and better and we're looking forward to seeing more and more ways to interact with them.
 
 In any case we need to create an IPFS node that's gonna host some metadata or like what we saw with our SimpleCollectible it needs to host metadata.We both have to host a metadata file and an image URI file which will host the actual image.Both of these needs to be stored in IPFS.So let's go ahead and create a new scripts called "create_metadata.py".
 
 **create_metadata.py**
 
 It'll read off-chain and create our metadata file.
 
 ![RecentlyDeployed](Images/l97.png)
 
 Once we've this advanced collectible we can loop through all of the tokens and actually figure out the metadata for each one of them.
 
 ![numOfTokenCounter](Images/l98.png)
 
 Because we want this create_metadata to create the metadata for every single token that we've created.
 
 We even run this real quick.
 
 `brownie run scripts/create_metadata.py --network rinkeby`
 
![output](Images/l99.png)

If I were to run our create_collectible script again and then our create_metadata script would of course get more but right now we only have one collectible.

Now loop through all these collectibles and create their metadata, so we're going to create that file that has metadata which is going to have the name which is going to be based off of the random breed that I got, going to have description which is based off of the random breed again, going to have an image which is also based on the random breed.

![loop](Images/l100.png)

**get_breed**

Now Advanced Collectible.tokenIDToBreed is going to return an integer because again in our AdvancedCollectible.sol, the enum Breed is going to be 0, 1 or 2.We actually want to create a quick mapping that represents that 0 is persian, 1 is bengal and 2 is minx.So I'd actually like to create in a helpful_scripts called get_breed.

![get_breed](Images/l101.png)

So Instead of doing "advanced_collectible.tokenIDToBreed(token_ID)", we can now just do:

![getBreedcalling](Images/l102.png)

Now that we've the breed we can start creating the metadata file.We're going to have some type of format for our contract to always pull from.So I'll create a new folder called metadata and in this folder I'll have a new file called "sample_metadata.py".

**sample_metadata.py**

![template](Images/l103.png)

Attributes should be blank because we don't actually have any on-chain attrubutes but I'm just gonna go ahead and add some to show you what you could do if you wanted to give your cat some stats.You know maybe cuteness, maybe power, maybe speed whatever you want to do.

So now once we've this sample_metadata file, we can import this to our scripts in create_metadata.

![importingTemplate](Images/l104.png)

Another quick note you might want to put a "__init__.py" file in that metadata folder if you're working on older versions of python and we start creating our new metadata file for the breed.We want to save each collectible under their network and with their token id.Let's go ahead and create new folder inside metadata called rinkeby and this is where we'll save all of the rinkeby metadata for all the token ids.Before we actually save it though we should just check to make sure that the file doesn't already exist because if the file already exists that means that we've already created the metadata for that token and we don't need to.

![metadataFileName](Images/l105.png)

We can even just print this out to do a quick mannual test :

`brownie run scripts/create_metadata.py --network rinkeby`

![output](Images/l106.png)

Now we can actually check this to see if this already exists and we're going to use a python library called `path`.

![path](Images/l107.png)

![metadataCreating](Images/l108.png)

So let's go ahead and start creating metadata file.We have to give it a name, description and image uri.Since template in a dictionary or a mapping in python, we can actually just go ahead and start mapping.

![givingMetadata](Images/l109.png)

Now we're gonna need for image uri.

**Uploading Image to IPFS**

This is where we're going to have our image already uploaded to IPFS so we can assign it to our metadata.Well we're probably gonna need some upload_to_ipfs function which returns our image uri and then we can just set that image_uri to the collectible metadata of image.So let's go ahead and start doing that.

Now in order to upload to IPFS, we ofcourse need to have our images ourselves.To make this little bit generic, we'll have this upload to IPFS take a filepath that way we can pass the image uri upload to IPFS.We're going to give it some type of file path.So we'll grab that image file name.

![imageFileName](Images/l110.png)

Then we can pass this to upload to IPFS.So this filepath is going to be the location of the object that we're going to upload to IPFS.We're going to use path library to actually grab that path to upload it to IPFS.

![imageBinary](Images/l111.png)

What we're doing is we're taking the "filepath", opening the file, "rb" means we're gonna open it in binary.Since these are images that's how we open it and upload the binary actually to IPFS.As "fp" So we're saying is opened file is gonna be named fp.And fp.read is how we read the whole binary.Now the whole image is stored as binary.
   
 
