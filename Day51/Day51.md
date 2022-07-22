**Creating an NFT TokenURI On-Chain**

Back in our NFT and now we know all about abi.encoding stuff and what it does.svgToImageURI function till is great to get an image but we don't want just an image.We're going to need the metadata.We need to to be the JSON object not just an image URL.We need to stick base64 encoded image into the image field of our JSON.We know that ERC721 code comes with a tokenURI and it's that tokenURI points to the JSON object which tells us what our code is going to look like.We can actually base64 encode our JSON as well to turn into a JSON token URI.

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!(_exists(tokenId))) {
            revert DynamicSvgNft__NonExistentToken();
        }
    }
```

_exists function comes in ERC721.

Now we want to figure out how to make the tokenURI return a base64 encoded version of JSON.So first we know how to concatenate a string.That's going to be the first thing that we're going to do. 

```solidity
string memory imageURI = "hi!";
        abi.encodePacked(
            '{"name":"',
            name(),
            '", "description": "An NFT that changes based on the Chainlink Feed", ',
            '"attributes":[{"trait_type":"coolness", "value":100}], "image":"',
            imageURI,
            '"}'
        );
```

Doing abi.encodePacked is going to concatenate this all together.

How do we turn this into a base64 encoded tokenURI so that other people can read it?

We're going to typecast this whole thing to bytes and now the whole thing is in bytes we can do exactly what we did with the SVG.Now we can base64 encode it.

```solidity
Base64.encode(
            bytes(
                abi.encodePacked(
                    '{"name":"',
                    name(),
                    '", "description": "An NFT that changes based on the Chainlink Feed", ',
                    '"attributes":[{"trait_type":"coolness", "value":100}], "image":"',
                    imageURI,
                    '"}'
                )
            )
        );
```

This here is going to give us the URL but it's not going to give us `data:image/svg+xml;base64,` this part.So we just need to append the first bit now and we should be good to go.This `data:image/svg+xml;base64,` is the prefix for base64 svg images.The prefix for base64 JSON is going to be `data:application/json;base64,`.So we're going to do it like this instead.

Now the ERC721 has something called baseURI that we're going to override and that we're going to use.

```solidity
function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }
```

Now we can use the baseURI to append to our base64 encoded JSON.So in order to append them, once again, we're going to do abi.encodePacked.

```solidity
abi.encodePacked(
            _baseURI(),
            Base64.encode(
                bytes(
                    abi.encodePacked(
                        '{"name":"',
                        name(),
                        '", "description": "An NFT that changes based on the Chainlink Feed", ',
                        '"attributes":[{"trait_type":"coolness", "value":100}], "image":"',
                        imageURI,
                        '"}'
                    )
                )
            )
        );
```

We're going to encode baseURI to the encoded JSON.This is obviously a bytes object but we want a string.So all we gotta do is typecast it as a string and return it.

```solidity
return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description": "An NFT that changes based on the Chainlink Feed", ',
                                '"attributes":[{"trait_type":"coolness", "value":100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
```

We're creating a JSON string, we encoded in bytes that way we could encode in base64.Once we've encoded in base64, we then just append the prefix for JSON objects, we do abi.encodePacked and cast it to string.Now we've a tokenURI.All we have to do is update our imageURI with what we get from `svgToImageURI` then we'll be good to go.

**Making the NFT Dynamic**
