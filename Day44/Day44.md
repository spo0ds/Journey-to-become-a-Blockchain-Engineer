Back to our LotteryEntrance function.We just automated the process of updating our ABI's and then our contracts.Now we can import them into our files.We could import them at different line like `import abi from "../constants/abi.json"` or we could export them into the same file.So we'll create a new file inside components directory called "index.js" and in here we can import them and export them in one file.

```javascript
const contractAddress = require("./contractAddresses.json")
const abi = require("./abi.json")

module.exports = {
    abi,
    contractAddress,
}
```

Now we export them like this back in our LotteryEntrance, we can import them in just one line.

```javascript
import { abi, contractAddresses } from "../constants"
```

we can just specify the folder instead of each individual files because we've index.js which basically represents the whole folder.


**runContractFunction**

Back in our runContractFunction, let's uncomment and fill what we've.

```javascript
const {runContractFunction: enterRaffle} = useWeb3Contract({
        abi:abi,
        contractAddress: contractAddresses, // specify network Id
        functionName:"enterRaffle",
        params: {},
        msgValue://,
    })
```

How do we get the chainId and the msgValue?

ChainId is something that we can get easily with moralis.Once again we're going to import useMoralis hook from react-moralis.

```javascript
const {chainId} = useMoralis()
console.log(chainId)
```

The reason that moralis knows about what chain we're on is because back in our header component, the header actually passes up all the information about the MetaMask to the Moralis provider and then the Moralis provider pass it down to all the components inside those Moralis provider tags. 

![chainId](Images/m85.png)

This result is the hex version of our chainId.So chainId gives the hex edition of the chainId.

```javascript
const { chainId: chainIdHex } = useMoralis()
console.log(parseInt(chainIdHex))
```

![intChainId](Images/m86.png)

Now the raffle address is something that we're actually going to use it alot, we might as well have it at the top of our code.We're going to be changing the raffle address.So we don't need to put it in a hook.We're going to be technically changing the address when we change networks but our header app takes care of rerendering and dealing with all that.

`const { chainId: chainIdHex } = useMoralis()` This line means pull out the chainId object and then rename it to chainIdHex.

```javascript
const { chainId: chainIdHex } = useMoralis()
const chainId = parseInt(chainIdHex)
// console.log(parseInt(chainIdHex))
const raffleAddress = chainIdHex in contractAddresses ? contractAddresses[chainId][0] : null
```

Now we've a raffle address and we can stick it on our function.

```javascript
const {runContractFunction: enterRaffle} = useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress, // specify network Id
        functionName:"enterRaffle",
        params: {},
        msgValue://,
    })
```

All we need now is the msgValue.If you remember back to our raffle we actually set that fee dynamically.We have i_entrance fee passed in constructor, so we wanna call the getEntranceFee function .This is one of the ways we send a transaction and also send functions.

One of the ways that we're going to do it is right when our lotteryEntrance loads, we're going to run a function to read that entrance fee value.How do we do that? Well we can use one of our hooks again.

```javascript
useEffect(() => {})
```

useEffect can run when something changes.We only try to get that raffle entrance fee, if web3 is enabled.So we'll pull isWeb3Enabled from useMoralis.

```javascript
const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
```

So in our function, we could say if web3 is enabled, we'll try to read the entrance fee.

```javascript
useEffect(() => {
    if (isWeb3Enabled) {
        // try to read the entrance fee
    }
})
```

We can use the useWeb3Contract wagan again.Let's go ahead and copy paste it and we'll use the same setup there.Except instead of enterRaffle, we're going to be doing getEntranceFee.functionName will also be getEntranceFee and msg.value nothing.

```javascript
const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify network Id
        functionName: "getEntranceFee",
        params: {},
    })
```

We're going to be calling the getEntranceFee function and now I'll show you how to actually call one of these in our contracts.Down in our useEffect, we're going to call useWeb3Contract.

Now if we just call getEntranceFee like this.
```javascript
if (isWeb3Enabled) {
            // try to read the entrance fee
            const entranceFee = getEntranceFee()
            console.log(entranceFee)
        }
```

If we look at our logs, we don't see anything.getEntranceFee is going to be an async function.Once again we need to do await getEntranceFee.But there's an issue:

![issue](Images/m87.png)

well we can actually make an async function and stick these code inside the function.

```javascript
if (isWeb3Enabled) {
            // try to read the entrance fee
            async function updateUI() {
                const entranceFee = await getEntranceFee()
                console.log(entranceFee)
            }

            updateUI()
        }
```

Now if we go to our frontend, we still see nothing.Well isWeb3Enabled actually changes.So the first time the useEffect hook runs, isWeb3Enabled is probably is false but when it turns to true, we want to run the section.In our little dependency array, we're going to add isWeb3Enabled.The reason that it's false to start with is because of exactly what we showed in that manual header.Well in manual header, it first checks to see after we do a refresh, if `window.localStorage.getItem("connected")` then we call enableWeb3 which will make it enabled.So in our lotteryEntrance, isWeb3Enabled starts off as false when we do refresh and then the browser checks the local storage and says "Oh web3 should be enabled.Let's enable it." and turns it to true.

```javascript
useEffect(() => {
        if (isWeb3Enabled) {
            // try to read the entrance fee
            async function updateUI() {
                const entranceFee = await getEntranceFee()
                console.log(entranceFee)
            }

            updateUI()
        }
    }, [isWeb3Enabled])
```

Now if we hit refresh, in our console, we can now see a logged out entrancefee.


**useState**

Now we also want to show the entrance fee in our UI.So if we do `let entranceFee = ""`

```javascript
 async function updateUI() {
                entranceFee = (await getEntranceFee()).toString()
                console.log(entranceFee)
            }
            
return (
        <div>
            Hi from lottery<div>{entranceFee}</div>
        </div>
    )
```

If we hit refresh, there's still an issue here.We don't see entrance fee in the UI but we do see it in console.What's going on here?

Well useEffect is going to rerender our browser and that's what we want and isWeb3Enabled goes from false to true, our browser rerenders. But once we get our entranceFee, does our browser rerender?

No it doesn't because entrancefee is just one of these normal variables.So we want to actually change it from being just a normal variable to being a hook because entranceFee does get updated but it's not triggering a rerender.So we actually want to change it to being a `useState` hook.

```javascript
const [entranceFee, setEntranceFee] = useState("0")
```

entranceFee is going to be the variable that we call to get the entrance fee.setEntranceFee is going to be the function that we call to update or set that entrance fee and whenever that the entranceFee variable is set, we trigger a rerender from the frontend.And in our useState, we're giving a starting value.We're saying entranceFee is going to start with 0.

```javascript
async function updateUI() {
                const entranceFeeFromCall = (await getEntranceFee()).toString()
                setEntranceFee(entranceFeeFromCall)
                console.log(entranceFee)
            }
```

Now we can see that the entranceFee has indeed been rerendered.

Now to make it more human readable form, let's change it to ethers.

```javascript
return (
        <div>
            Hi from lottery
            <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
        </div>
    )
```

**Calling Functions in NextJS**

Finally we've the entranceFee and now use it to enter the lottery.For msgValue we're going to be use the entranceFee.

```javascript
const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify network Id
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })
```

We want to make our code that all works even if we're connected to supported chain.If we switch from hardhat to ethereum mainnet, we're going to get an error because we're calling getEntranceFee on an address that doesn't exist.So let's add a little button so that we can enter the raffle.Before we actually do that let's make sure that we can only call the function so long as there's actually is a raffle address.

```javascript
    return (
        <div>
            Hi from lottery
            {raffleAddress ? (
                <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
            ) : (
                <div> No Raffle Address Detected</div>
            )}
        </div>
    )
```

Now inside of the div where there's a raffle address found, let's add a button.

```javascript
<button
        onClick={async function () {
            await enterRaffle()
        }}
        >
        Enter Raffle
</button>
```

Now we can see "Enter Raffle" button on our UI.When we hit "Enter Raffle", MetaMask does indeed pops up and we can see our transaction goes through.We can now enter our Raffle.

**useNotification**

As you saw, we just got the MetaMask pop up and that's pretty much it.It's not very helpful for the users who're following along with this to look at this and go "Okat did it go through?Or did we fail like what happened?"So what we wanna do is create what's called notification's.We want a pop up saying "You sent your transaction."Again we're going to use the web3uikit which comes with the notifications that we can go ahead and use.

So back in our app.js, we're going to import NotificationProvider.

```javascript
import { NotificationProvider } from "web3uikit"
```

and inside of the MoralisProvider but outside of the components, we're going to do NotificationProvider.

```javascript
<MoralisProvider initializeOnMount={false}>
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
```

So wrapping our components in the notification thing.This is going to allow us to actually make notifications.Back in our LotteryEntrance, we're going to import a hook for those notifications.

```javascript
import { useNotification } from "web3uikit"
```

This useNotification gives us `dispatch`.

```javascript
const [entranceFee, setEntranceFee] = useState("0")

const dispatch = useNotification()
```

This dispatch is like a little pop up that will give us.So when we call enterRaffle, we're going to give to some parameters. 

```javascript
await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
                })
```

```javascript
const handleSuccess = async function (tx) {
        await tx.await(1)
        handleNewNotification(tx)
    }

const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }
```

You can find all these stuff right [here](https://web3ui.github.io/web3uikit/?path=/docs/5-popup-notification--hook-demo).

We're saying once the enterRaffle transaction is successfull, call handleSuccess function which is going to call handleNewNotification.

**Reading and Displaying Contract Data**

Now let's add a little bit more so that users know what else is going on with the lottery.Let's display how many people are in this lottery.We can do this because we've a numPlayers command.We also probably want to get the recentWinner.

```javascript
const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify network Id
        functionName: "getNumberOfPlayers",
        params: {},
    })

const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify network Id
        functionName: "getRecentWinner",
        params: {},
    })
```

To store the value, we're going to use useState.

```javascript
const [numPlayers, setNumPlayers] = useState("0")
const [recentWinner, setRecentWinner] = useState("0")
```

In our useEffect let's do more than just the getEntranceFee.

```javascript
 async function updateUI() {
                const entranceFeeFromCall = (await getEntranceFee()).toString()
                const numPlayersFromCall = (await getNumberOfPlayers()).toString()
                const recentWinnerFromCall = await getRecentWinner()
                setEntranceFee(entranceFeeFromCall)
                setNumPlayers(numPlayersFromCall)
                setRecentWinner(recentWinnerFromCall)
            }
```

```javascript
Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH Number of
Players: {numPlayers}
Recent Winner: {recentWinner}
```

If we go ahead and enter the raffle, once our transaction goes through, if we do refresh, we see number of players has been updated.But we had to refresh.We want to set something up so we automatically re-render.Guess what's going to do that.The handleSuccess that we're talking before.All of the updateUI stuff, we can actually pull out of useEffect and have it's be it's own stand alone function.

```javascript
 async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])
```

and then in our handleSuccess, whenever s successful transaction goes through, we're going to update the UI.

```javascript
const handleSuccess = async function (tx) {
        await tx.await(1)
        handleNewNotification(tx)
        updateUI()
    }
```

Now we want to test getting a recent winner.What we can do is back in our hardhat project, we want to create a new script, that's going to mock being a chainlinkVRF and mock being a keepers.You can copy paste from github repo cause all it's doing is pretty much what we did in our test.So in our hardhat lottery, we'll run both script.

`yarn hardhat run scripts/mockOffchain.js --network localhost`

If we hit a refresh in our website, we can see our winner gets updated.

**A note about onSuccess**

onSuccess isn't checking that the transaction has a block confirmations.It's just checking to see that the transaction was successfully sent to MetaMask.So onSuccess checks to see a transaction is successfully sent to the MetaMask.That why in handleSuccess function, we did tx.wait because that's the piece that's actually waits for the transaction to be confirmed.

Right now we're using Moralis to make once we call that mocking script, I had to refresh the browser to see the winner.That's not ideal.Ideally we want our UI to just automatically update when some events gets fired.In our raffle contract, we get the event emitted.Instead in our code doing the await success, what we could do is we could set up a portion to listen for that event being emitted and update the frontend accordingly.With that knowledge we can also listen for the winner event being emitted.We could update our frontend instead of having to refresh.

**Tailwind & Styling**

We've pretty much finished all the functionality.Let's make our UI look at least a little bit nicer.There's two things to think about when it comes to building these frontends.There's components libraries like web3uikit which we're using which gives us kind of like components that gives us blocks of code like the connect button that are already formatted for us.And then there's CSS libraries that actually will help us format the rest of our stuff.

We're also going to be use one of these formatting libraries and the library that we're going to use is `tailwind`.The reason that we're going to use tailwindcss is because it's really popular.

`yarn add --dev tailwindcss postcss autoprefixer`

Three of these basically make up tailwind with NextJS.Once we've those we're going to basically init tailwind and make a config file for tailwind.

`yarn tailwindcss init -p`

In our tailwind.config.js and styles/globals.css copy the exact code from it's [guide](https://tailwindcss.com/docs/guides/nextjs).

And if you see the red underline on your globals.css, you need to install `PostCSS Language Support` extension.

Now pre usual we can do `yarn run dev` and start adding tailwind to our divs.

Tailwind allows us in our divs to set everything as a class name and set some real minimilistic text in the class name.

Let's update our header.We want to give our header a border.

```javascript
<div className="border-b-2">
    Decentralized Raffle
    <ConnectButton moralisAuth={false} />
</div>
```

We need to kill the frontend and re-run with yarn dev.

```javascript
<div className="p-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 font-blog text-3xl">Decentralized Raffle</h1>
            <div className="ml-auto py-2 px-4">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
```

We can see now our connect button is on the side and are sepereated which kind of look nice.

Now we're going to go back to out LotteryEntrance.

```javascript
<div className="p-5">
            Hi from lottery
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick=.....................
```

Some functionality, we didn't add in out button.

```javascript
onClick={async function () {
                            await enterRaffle({}}

                        disabled= {}
                    >
                        Enter Raffle
                    </button>
```

In our enterRaffle, it comes with isLoading and isFetching.

```javascript
const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({})
```

Now if our transaction is loading or fetching, we'll just make the button disabled.

```javascript
disabled={isLoading || isFetching}
```

Something else we wanna do when it comes to loading or fetching.When it's loading or fetching, we probably want it to have that little spinny thing.

```javascript
{isLoading || isFetching ? (<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
```

```javascript
<div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH.</div>
<div>Number of Players: {numPlayers}</div>
<div>Recent Winner: {recentWinner}</div>
```


