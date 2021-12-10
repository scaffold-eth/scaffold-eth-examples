# 🏗 Scaffold-ETH

> is everything you need to get started building decentralized applications powered by smart contracts.
> 
> This tutorial is **PART 3** of a series on how to integrate Chainlink technology with Scaffold-ETH.
>
> To learn Chainlink VRF, check out [PART 1](https://github.com/scaffold-eth/scaffold-eth-examples/tree/chainlink-tutorial-1) and [PART 2](https://github.com/scaffold-eth/scaffold-eth-examples/tree/chainlink-tutorial-2).

## Price Feeds & API calls

> In this tutorial you learn how to use **Chainlink Price Feeds** and how to request data from public APIs via **Chainlink Adapters**
> 
> There are a few example contracts for you to tinker with! 🔬 🛠 💻


🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

```bash
git clone -b chainlink-tutorial-3 https://github.com/scaffold-eth/scaffold-eth-examples.git

# 🏄‍♂️ Quick Start

### Manual setup

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth-examples:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-examples.git
```

We **skip local development** since the Chainlink Adapters for API calls would require mock contracts. Going directly to testnet makes the first steps simpler.

> generate your account to deploy to testnet:

```bash
cd scaffold-eth-examples
yarn generate
```

The warnings are normal and you can ignore.
![image](https://user-images.githubusercontent.com/9419140/106749563-ac2d2f00-65f4-11eb-91a5-d736e30f4b97.png)


``` bash
yarn account
```

You will need to fund your deployer account with kovan ETH before you can deploy your contracts.

Testnet ETH is available from https://faucets.chain.link/

![image](https://user-images.githubusercontent.com/9419140/106749192-36c15e80-65f4-11eb-8365-64f66569c899.png)


```bash
yarn deploy

```

![image](https://user-images.githubusercontent.com/9419140/106748708-9b2fee00-65f3-11eb-90c6-3c28c09f7540.png)


🔏 Edit your smart contract `CoinGeckoConsumer.sol` in `packages/hardhat/contracts`

🔏 Edit your smart contract `PriceConsumerV3.sol` in `packages/hardhat/contracts`

🔏 Edit your smart contract `ApiConsumer.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment script `00_deploy_your_contract.js` in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

📚 Keep [solidity by example](https://solidity-by-example.org) handy and check out the [Solidity globals and units](https://docs.soliditylang.org/en/v0.8.10/units-and-global-variables.html)

> With everything up your UI should look something like this:

(SCREENSHOT)

## PriceConsumerV3.sol

- This contract shows you how to use Chainlink Price feeds. 

Chainlink offers many kinds of Data Feeds.

These **data feeds are contracts** that we can interact with on-chain. They keep track of off-chain data. Chainlink technology makes sure that the data is of high quality and can't be easily corrupted.

Our example demonstrates how to get the ETH/USD price in a solidity contract. 

We've deploying on Kovan so we've specifically used the address of the ETH/USD price feed from Kovan.

![Screenshot 2021-12-10 at 15 33 01](https://user-images.githubusercontent.com/32189942/145581975-e9bbb679-a6fc-4b76-af9f-12e4137afe92.png)

> Check out the Debug UI

![Screenshot 2021-12-10 at 15 33 48](https://user-images.githubusercontent.com/32189942/145582068-ec5f9257-f444-482c-960d-bad72c74345d.png)

🧐 Notice how the price is displayed as a long integer. Why is that?

📝 There are **no floating point values on Ethereum**. 

If we want precision, we just make numbers longer. Then we always consider that the last n places are actually decimals.

Our ETH/USD price feed provides values with **8 decimals** "added".

```
We get the response 417233000000 
and we interpret    4172.33000000

```

> 🥷 💻 Challenge Time! 
> 
> Change the contract so it displays the BTC / ETH price.

- Find the price feed address in the chainlink docs: https://docs.chain.link/docs/ethereum-addresses/ . Make sure to go to the Kovan section 🧐

- Redeploy and check the results in your Debug UI.

Do you notice a difference in the display? Why do we see a decimal point?

![Screenshot 2021-12-10 at 00 58 24](https://user-images.githubusercontent.com/32189942/145582426-03d0df16-7e15-47e6-a8f4-07b44b548e41.png)

There was no decimal point number when we got our ETH / USD price.

📝 The ETH/USD feed used **8 decimals** for precision. The BTC/ETH feed uses **18 decimals**, so it returns quite large numbers. 
Try the function call ```latestRoundData()``` on [Etherscan](https://kovan.etherscan.io/address/0xF7904a295A029a3aBDFFB6F12755974a958C7C25#readContract)

![Screenshot 2021-12-10 at 01 09 31](https://user-images.githubusercontent.com/32189942/145582799-126afd72-471d-40d5-8a12-a7422a1bd1a5.png)


📝 By default, the **Scaffold-Eth** Debug UI applies a s**pecial treatment to large numbers**. It assumes they are wei values and need to be divided by 10 ** 18 (so it "moves" the comma 18 decimal places to the left). 

So...
- the BTC / ETH data feed adds exactly 18 decimals
- our frontend assumes there to be exactly 18 decimals
- ==> we see what we would expect (at the time of writing this: 1 BTC is ~11 ETH)


## APIConsumer.sol

- This contract shows you how to use any API to make an http GET request.

This happens via a **generic Chainlink Job** that **performs http get requests**. See [more in the docs](https://docs.chain.link/docs/make-a-http-get-request/).
In the current implementation our contract requests data about ETH USD trading volume in a 24 hour interval.
It uses the Chainlink GET job and instructs it to get data from the public API at https://min-api.cryptocompare.com

![Screenshot 2021-12-10 at 15 44 54](https://user-images.githubusercontent.com/32189942/145583533-19311b0f-618e-48da-938e-6b933ddec4cf.png)

### Here is the on-chain / off-chain / on-chain process:

Since your contract inherits from ```ChainlinkClient```, it knows how to call the Chainlink Oracle.

> 1. When you request data (```sendChainlinkRequestTo(oracle, request, fee)```), you actually **call the Chainlink Oracle** contract.
> 2. The Oracle contract offers your request as a job to a Chainlink Node
> 3. A **Chainlink Node** (off-chain) **takes the job**.
> 4. Since you've attached some instructions in the request,
>    1. the Chainlink node performs the http GET request for you;
>    2. from the response it receives, it "plucks" out the specific data you need;
>    3. it **returns that data to the Chainlink Oracle** contract.
> 5.  The Chainlink **Oracle contract calls your** ```fulfill(bytes32 _requestId, uint256 _volume)``` function and passes it the data


Unlike our PriceConsumerV3, the APIConsumer **needs LINK** in order to pay for the Chainlink nodes that perform the actual http GET requests. 

> Fund the contract with LINK

** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 0 - use 00_deploy_your_contract.js to fund the contract with LINK after funding deployer account. **

Testnet LINK is available from https://faucets.chain.link/
Copy the contract address and send it some link. You don't need much, average oracle costs .1 LINK.

> In ```App.jsx```, uncomment the code contract for the Debug UI:

![Screenshot 2021-12-10 at 15 47 26](https://user-images.githubusercontent.com/32189942/145583808-4b76d2d1-5c26-4a11-bb47-909e45a79aa3.png)

> In ```Example.UI```, uncomment the code related to APIConsumer

![Screenshot 2021-12-10 at 15 49 24](https://user-images.githubusercontent.com/32189942/145584010-23ea650c-ff9d-4aac-8b8c-28b6934a4bb2.png)

> Make sure the ```hardhat/deployments/00_deploy_your_contract.js``` script includes this contract. If not, make the changes and redeploy.

**Now let's try it!** 

> In the Debug UI, call ```requestVolumeData```

After a minute you should see the response:

![Screenshot 2021-12-10 at 01 54 23](https://user-images.githubusercontent.com/32189942/145584346-23be76c9-e4dc-4244-8d56-02c3ab27959d.png)

APIConsumer stores the value in its public "volume" variable. 

> Make a request for volume data from the ExampleUI. Observe the state changes.

![Screenshot 2021-12-10 at 16 01 45](https://user-images.githubusercontent.com/32189942/145585789-31a91944-0505-45ab-a703-2536d818b6dd.png)
![Screenshot 2021-12-10 at 16 02 41](https://user-images.githubusercontent.com/32189942/145585954-c2624e8f-eb20-4ee1-a1dc-3df7bb56be8a.png)
![Screenshot 2021-12-10 at 16 02 51](https://user-images.githubusercontent.com/32189942/145585976-241fef4a-b156-43d1-bd26-c43271c4c1c2.png)
![Screenshot 2021-12-10 at 16 10 23](https://user-images.githubusercontent.com/32189942/145586969-5ec89acf-c1cb-4dca-bebf-d16350e2d9d8.png)


> 📝 **Takeaways** 
> - Depending on how often you perform this request/response cycle, your in-contract volume data will be more or less "real-time"
> - Depending on what kind of data you need to GET, different chainlink jobs can/should be used. 
> - You can make requests for **any GET call**. As long as you attach **correct instructions** (and they match with the data).

Learn more about these Jobs in the [Chainlink docs](https://docs.chain.link/docs/decentralized-oracles-ethereum-mainnet/)

> 😂 **side quest for fun** Put some cute doggy names on-chain? 😎  Alright, cat names is cool to. There *must* be APIs that suggest those, right?

Of course, this APIConsumer is quite flexible. Instead of https://min-api.cryptocompare.com, we could have used https://api.coingecko.com/api/v3 which also lets us query volume data. 
But for some very common requests there are **specialized chainlink jobs** where the chainlink node has everything set up for you, so you won't need to pass it any instructions. 

Lets look at an example!

## CoinGeckoConsumer.sol

- This contract shows you how to use a more specialized Chainlink Job.

This [chainlink job](https://market.link/jobs/f05be653-b391-4acb-83cb-3f64a251d81c) gets you ETH-USD price data from CoinGecko and you don't need to instruct the Chainlink Node in any way.
It knows the API endpoint and it knows how to process the resonse from the API in order to return to you only the value you need.

![Screenshot 2021-12-10 at 15 59 02](https://user-images.githubusercontent.com/32189942/145585423-ae57fdda-5556-430f-afa7-5e86a4ea0b0e.png)

Before you use it, remember to fund the contract with LINK. It's very similar to APIConsumer, in that it needs LINK in order to make a request to the Chainlink Oracle, which publishes the job so that a qualified Chainlink Node may take it.

### Disclaimer 
Some of the specific **Chainlink Jobs on Kovan** are not reliable at the time of writing this. You may experience that this approach doesn't work, in that you perform your request, but the job is never fulfilled.
Then parts of this tutorial, like Side Quest 1, will not be applicable. But read on, we'll make it worthwile 😉

> ** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 1! **UX improvements**
> In your Example UI create a section for the CoinGeckoConsumer. The user should see the current ethPrice and be able to request for a refresh of the price, just like it's possible with the APIConsumer.
> Consider that you'll also need to make some changes in your CoingeckoConsumer.sol.

---
## So many approaches! 🤷‍♀️

> 📝 As you can see, there are several ways to get data on-chain. 
> 
> -  📝 ⛽️ **If you simply need on-chain price data**, reading them from Chainlink Price Feeds is probably the way to go. 
> 
> Contracts that read from Chainlink price feeds are definitely **the cheapest to deploy**, and you **don't have to pay any LINK** when you retrieve prices. (The Price Feeds are actively maintained and they perform the necessary price updates. Various companies or big crypto projects are sponsoring them as a public service)
> 
> Here you can compare the costs of deploying PriceConsumerV3 vs. the other contracts:
> 
> ![Screenshot 2021-12-10 at 16 03 43](https://user-images.githubusercontent.com/32189942/145586077-f041cf3d-d28f-4726-8d08-5c67ded124e3.png)
> 
> In our case the APIConsumer is the most expensive, but also the most flexible. 
>
> 🧐 APIs like CoinGecko give you more than current prices. 
>
> - 📝 ⚙️ ⚙️ ⚙️ **If your use case is more complex** (your contract needs several price pairs, historical data, etc.) you need a setup like APIConsumer of CoinGeckoConsumer.

 
** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 2! **Various data from CoinGecko**
 
How would you create a contract that uses CoinGecko ETH/USD and ETH/EUR price data? 
Implement one that stores the data in the contract state. 
There should be one single request (```function updatePrices()```) that triggers both price updates via a Chainlink Oracle.

1. Would you use a generic approach, like our APIConsumer? 
OR
2. Would you look for specialized Chainlink Jobs, like our CoinGeckoConsumer?
 
If you go with the generic APIConsumer, here is the [CoinGecko API](https://www.coingecko.com/en/api/documentation) to get you started.

If you go with dedicated Chainlink jobs, pick the two that you need from the Chainlink [marketplace](https://market.link/search/jobs?query=coingecko&hierarchicalMenu%5BhierarchicalCategories.lvl0%5D=Ethereum%20%3E%20Kovan).

Depending on how the chainlink marketplace evolves, you may discover that there are dedicated Chainlink jobs for CoinGecko prices, but there are none for requests that involve historical data.

## Getting ETH Prices on the Frontend

> 📝 In Scaffold-ETH we use the useExchangeEthPrice() hook. If you ever need the ETH price in your frontend, you don't need to deploy contracts like the Price Consumer and query them.

--- 

> 🔁    You can `yarn deploy --reset ` any time and get fresh new contracts in the frontend:

Make sure to edit your 00_deploy_your_contract.js if you don't want to redeploy all of your contracts.

![Screenshot 2021-12-10 at 16 11 20](https://user-images.githubusercontent.com/32189942/145587097-8bf41c6e-794f-4ffa-8e99-d7665d879182.png)

--- 

Check out [PART 1](https://github.com/scaffold-eth/scaffold-eth-examples/tree/chainlink-tutorial-1) for a basic Chainlink VRF setup.

Check out [PART 2](https://github.com/scaffold-eth/scaffold-eth-examples/tree/chainlink-tutorial-2) for an advanced VRF setup!

---

🔐 Global variables like `msg.sender` and `msg.value` are cryptographically backed and can be used to make rules

📝 Keep this [cheat sheet](https://solidity.readthedocs.io/en/v0.7.0/cheatsheet.html?highlight=global#global-variables) handy

⏳ Maybe we could use `block.timestamp` or `block.number` to track time in our contract

🔏 Or maybe keep track of an `address public owner;` then make a rule like `require( msg.sender == owner );` for an important function

🧾 Maybe create a smart contract that keeps track of a `mapping ( address => uint256 ) public balance;`

🏦 It could be like a decentralized bank that you `function deposit() public payable {}` and `withdraw()`

📟 Events are really handy for signaling to the frontend. [Read more about events here.](https://solidity-by-example.org/events)

📲 Spend some time in `App.jsx` in `packages/react-app/src` and learn about the 🛰 [Providers](https://github.com/austintgriffith/scaffold-eth#-web3-providers)

⚠️ Big numbers are stored as objects: `formatEther` and `parseEther` (ethers.js) will help with WEI->ETH and ETH->WEI.

🧳 The single page (searchable) [ethers.js docs](https://docs.ethers.io/v5/single-page/) are pretty great too.

🐜 The UI framework `Ant Design` has a [bunch of great components](https://ant.design/components/overview/).

📃 Check the console log for your app to see some extra output from hooks like `useContractReader` and `useEventListener`.

🏗 You'll notice the `<Contract />` component that displays the dynamic form as scaffolding for interacting with your contract.

🔲 Try making a `<Button/>` that calls `writeContracts.YourContract.setPurpose("👋 Hello World")` to explore how your UI might work...

💬 Wrap the call to `writeContracts` with a `tx()` helper that uses BlockNative's [Notify.js](https://www.blocknative.com/notify).

🧬 Next learn about [structs](https://solidity-by-example.org/structs/) in Solidity.

🗳 Maybe an make an array `YourStructName[] public proposals;` that could call be voted on with `function vote() public {}`

🔭 Your dev environment is perfect for *testing assumptions* and learning by prototyping.

📝 Next learn about the [fallback function](https://solidity-by-example.org/fallback/)

💸 Maybe add a `receive() external payable {}` so your contract will accept ETH?

🚁 OH! Programming decentralized money! 😎 So rad!

🛰 Ready to deploy to a testnet? Change the `defaultNetwork` in `packages/hardhat/hardhat.config.js`

🔐 Generate a deploy account with `yarn generate` and view it with `yarn account`

🔑 Create wallet links to your app with `yarn wallet` and `yarn fundedwallet`

⬇️ Installing a new package to your frontend? You need to `cd packages/react-app` and then `yarn add PACKAGE`

⬇️ Installing a new package to your backend? You need to `cd packages/harthat` and then `yarn add PACKAGE`

( You will probably want to take some of the 🔗 [hooks](#-hooks), 🎛 [components](#-components) with you from 🏗 scaffold-eth so we started 🖇 [eth-hooks](https://www.npmjs.com/package/eth-hooks) )

🚀 Good luck!

### Automated with Gitpod

To deploy this project to Gitpod, click this button:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

# 🔭 Learning Solidity

📕 Read the docs: https://docs.soliditylang.org

📚 Go through each topic from [solidity by example](https://solidity-by-example.org) editing `YourContract.sol` in **🏗 scaffold-eth**

- [Primitive Data Types](https://solidity-by-example.org/primitives/)
- [Mappings](https://solidity-by-example.org/mapping/)
- [Structs](https://solidity-by-example.org/structs/)
- [Modifiers](https://solidity-by-example.org/function-modifier/)
- [Events](https://solidity-by-example.org/events/)
- [Inheritance](https://solidity-by-example.org/inheritance/)
- [Payable](https://solidity-by-example.org/payable/)
- [Fallback](https://solidity-by-example.org/fallback/)

📧 Learn the [Solidity globals and units](https://solidity.readthedocs.io/en/v0.6.6/units-and-global-variables.html)

# 🛠 Buidl

Check out all the [active branches](https://github.com/austintgriffith/scaffold-eth/branches/active), [open issues](https://github.com/austintgriffith/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!

  
 - 🚤  [Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)


 - 🎟  [Create your first NFT](https://github.com/austintgriffith/scaffold-eth/tree/simple-nft-example)
 - 🥩  [Build a staking smart contract](https://github.com/austintgriffith/scaffold-eth/tree/challenge-1-decentralized-staking)
 - 🏵  [Deploy a token and vendor](https://github.com/austintgriffith/scaffold-eth/tree/challenge-2-token-vendor)
 - 🎫  [Extend the NFT example to make a "buyer mints" marketplace](https://github.com/austintgriffith/scaffold-eth/tree/buyer-mints-nft)
 - 🎲  [Learn about commit/reveal](https://github.com/austintgriffith/scaffold-eth/tree/commit-reveal-with-frontend)
 - ✍️  [Learn how ecrecover works](https://github.com/austintgriffith/scaffold-eth/tree/signature-recover)
 - 👩‍👩‍👧‍👧  [Build a multi-sig that uses off-chain signatures](https://github.com/austintgriffith/scaffold-eth/tree/meta-multi-sig)
 - ⏳  [Extend the multi-sig to stream ETH](https://github.com/austintgriffith/scaffold-eth/tree/streaming-meta-multi-sig)
 - ⚖️  [Learn how a simple DEX works](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90)
 - 🦍  [Ape into learning!](https://github.com/austintgriffith/scaffold-eth/tree/aave-ape)

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!
