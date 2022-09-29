**Updating the Listing**

Now if you own the NFT, you can update the listing.Let's figure it out if somebody is actually the owner of the NFT.Well we can get the person Metamask by grabbing the account from useMoralis.

```javascript
export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis()
    ....
}
```

Then we can check for the account.

```javascript
const isOwnedByUser = seller === account
```

or if the seller is undefined.

```javascript
const isOwnedByUser = seller === account || seller == undefined
```

Now instead of saying owned by seller on the frontend, we could say:

```javascript
const formattedSellerAddress = isOwnedByUser ? "You" : seller
...
<div className="italic text-sm">Owned by {formattedSellerAddress}</div>
...
```

Now if I go to my Metamask and switch account to owned account, I can see owned by me.Since when we switch back and forth, the diameter of the image actually changes, so we want to truncate the seller address.Let's create a function outside of the export default function because it doesn't depend anything inside our app.

```javascript
const truncateString = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const separatorLength = separator.length
    const charsToShow = strLen - separatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return fullStr.subString(0, frontChars) + seperator + fullStr.subString(fullStr.length - backChars)
}
```

```javascript
const formattedSellerAddress = isOwnedByUser ? "You" : truncateString(seller || "", 15)
```

Now we need to figure out the way to update the listing.If the NFT is owned by us, when we clicked on the NFT, we want to update the listing on the marketplace.So to do this, we're going to create a new component called "UpdateListingModal.js".Modal is something that pops up.For example while connecting a wallet, different wallet pops us.So that's the modal.We probably want to pass the parameters from the NFTBox so the modal knows what function it needs to call in our NFT marketplace.The way we're going to update the listing is by calling the updateListing function and it takes nftAddress, tokenId and new price as a parameter.

```javascript
export default function UpdateListingModal({ nftAddress, tokenId }) {

}
```

To make the little pop up, we're not going to code it ourselves, we're once again use the web3uikit.
```javascript
import { Modal } from "web3uikit"
```

One of the key thing in modal is weather or not it should be visible.

```javascript
export default function UpdateListingModal({ nftAddress, tokenId, isVisible }) {
    return (
        <Modal
            isVisible={isVisible}
        >

        </Modal>
    )
}
```

In our NFTBox, we need to tell our modal when it's visible.We'll make that code in a little bit.Inside of the modal we're giving the input field for how to update it.

```javascript
return (
        <Modal
            isVisible={isVisible}
        >
            <Input
                label="Update Listing price in L1 Currency(ETH)"
                name="New listing price"
                type="number"
            />

        </Modal>
    )
```

When the modal pops up, it's going to have input in there.We can import this component in our NFTBox.

```javascript
import UpdateListingModal from "./UpdateListingModal"
```

So right below imageURI we'll add div and inside it we'll call the UpdateListingModal and for now we'll set isVisible to true. 

```javascript
{imageURI ?
                    <div>
                        <UpdateListingModal
                            isVisible={true}
                        />
                        .....
```

Now if our frontend we'll get a little box to update the price.If we've multiple NFTs then we need to close the pop up to the total number of NFT present.So we need to tell the modal only to pop up when somebody clicks the NFT that they own.To make this work, we're going to update the Card.So whenever we click our card, we're going to create a function called handleCardClick and it'll update a variable for whether or not we should show the modal.

```javascript
const handleCardClick = () => {
        isOwnedByUser ? // show the modal : buyItem
    }
```

Since we want our whole UI to rerender once we change the variable to show the modal, we're going to do this as a useState.

```javascript
const [showModal, setShowModal] = useState(false)
```

Setting to false because by default we don't want to show the modal but if it's owned by the user  we're going to set it to true, else for now we'll log to "Let's Buy!".

```javascript
const handleCardClick = () => {
        isOwnedByUser ? setShowModal(true) : console.log("Let's Buy!")
    }
```

Now instead of isVisible to false, we'll set it to showModal.Now we've a way for that modal to actually show up correcty.
