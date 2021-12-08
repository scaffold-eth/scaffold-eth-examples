# 🏗 Scaffold-ETH

> is everything you need to get started building decentralized applications powered by smart contracts.
> 
> This tutorial is part 1 of a series on how to integrate Chainlink technology with Scaffold-ETH.
> 
> In this tutorial you learn how to use **Chainlink VRF** (verifiable randomness) 🎲
> 
> There are 3 example contracts (simple to advanced) for you to ape into! 🦍


🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

```bash
git clone -b chainlink-tutorial-1 https://github.com/austintgriffith/scaffold-eth-examples.git

# 🏄‍♂️ Quick Start

### Manual setup

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth-examples:

```bash
git clone https://github.com/austintgriffith/scaffold-eth-examples.git
```

We **skip local development** since it would require mock contracts. Going directly to testnet makes the first steps simpler.

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


🔏 Edit your smart contract `RandomNumberConsumer.sol` in `packages/hardhat/contracts`
🔏 Edit your smart contract `DiceRolls.sol` in `packages/hardhat/contracts`
🔏 Edit your smart contract `MultiDiceRolls.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment script `deploy.js` in `packages/hardhat/scripts`

📱 Open http://localhost:3000 to see the app

📚 Keep [solidity by example](https://solidity-by-example.org) handy and check out the [Solidity globals and units](https://docs.soliditylang.org/en/v0.8.10/units-and-global-variables.html)

> With everything up your UI should look something like this:

![Screenshot 2021-12-07 at 22 02 29](https://user-images.githubusercontent.com/32189942/145098108-029cc108-a0e8-47ad-a6d2-6bee39ccf9e8.png)

## RandomNumberConsumer

> Fund the contract with LINK 

> ** Side Quest - use deploy.js to fund the contract with LINK after funding deployer account. **

- Testnet LINK is available from https://faucets.chain.link/

Copy the contract address and send it some link. You don't need much, average oracle costs .1 LINK.
![image](https://user-images.githubusercontent.com/9419140/106750100-645ad780-65f5-11eb-95c9-ce07ef0ed2e2.png)

> To test just go to requestRandomNumber and click send.

![Screenshot 2021-12-07 at 22 45 14](https://user-images.githubusercontent.com/32189942/145103508-00d4688e-536d-466b-b7e8-d129d60e46aa.png)

Once the transaction is mined you will see the requestId updated:

![Screenshot 2021-12-07 at 22 46 01](https://user-images.githubusercontent.com/32189942/145103639-4b1dd89c-e21f-48ab-b001-594d018feec2.png)

This value identifies the request that your contract just made to the Chainlink VRF contract.

It takes about 1 minute for the Oracle to call your contract with a response. 
After waiting for 1 minute you should see the randomResult updated:

![Screenshot 2021-12-07 at 22 49 10](https://user-images.githubusercontent.com/32189942/145103963-2c6afd57-38af-4550-8ab3-00647e14e383.png)

In the Example UI you'll find an example of how to manage UI state when making such requests:

![Screenshot 2021-12-07 at 22 51 37](https://user-images.githubusercontent.com/32189942/145104307-281b1d0c-af95-4c33-bb05-4f198483e4f9.png)

![Screenshot 2021-12-07 at 22 51 44](https://user-images.githubusercontent.com/32189942/145104318-733d4637-2ff4-42b3-8d91-f1a2b745a50f.png)

> ** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 1- **How secure** is it to expose our requestId publicly? **
> Can we hack 🥷 the system and fulfill the request before the Oracle does? 

> Since you know the latest requestId, call rawFulfillRandomness() on RandomNumberConsumer, **just like the Oracle would**. 
> 
> Use the Debug Contracts tab. Make the rawFulfillRandomness() call and provide any random number you want. See if you can make the contract store your bogus random number.
> 
> The transaction reverted. Why didn't it work?
> Check out the actual code and see what the reason might be. You won't find the function directly in RandomNumberConsumer though...

> **Takeaway:** randomness from Chainlink VRF is a two-step process. 
> - You trigger the first when you ask for a random number.
> - The VRF contract triggers the second step when it responds with a random number. 

> When receiving randomness your contract can do something useful with it.
> 
> Let's see an example!

## DiceRolls

Let's roll some dice... 

Make sure your DiceRolls contract is deployed and has some LINK.

Make sure to **uncomment** the DiceRolls code in App.jsx, in order to see it in the Debug Contracts Tab

You should find it below the RandomNumberConsumer:


![Screenshot 2021-12-08 at 20 05 55](https://user-images.githubusercontent.com/32189942/145260498-ee8bbc4a-a013-4c07-bea3-12159fc04894.png)

Go to the Example UI and click on the Roll Dice! button. After 1 minute or so the Oracle should have responded.

You will see a new entry in the events UI:

![Screenshot 2021-12-08 at 20 12 19](https://user-images.githubusercontent.com/32189942/145261552-885afd2b-fd8f-4fe3-a893-1cf6276b2e73.png)

You will see the event data in the console:

![Screenshot 2021-12-08 at 20 12 11](https://user-images.githubusercontent.com/32189942/145261613-a849de83-9aa8-4e32-b93b-50583d76924a.png)

> Check out the code in the Events.jsx component

![Screenshot 2021-12-08 at 20 15 05](https://user-images.githubusercontent.com/32189942/145261779-e6416e41-8c79-490f-aa41-06852d712edd.png)


> Here is the solidity code broken down

![Screenshot 2021-12-08 at 20 17 39](https://user-images.githubusercontent.com/32189942/145262183-3c646529-ed84-4d62-9ba4-7968e9397d52.png)

> This solidity code is far from optimal, it will charge a lot of gas. 
> It shows you a generic way to create several random numbers from a single one.
> Our problem is quite simple though: we have a large random number and we need 6 small random numbers (between 1 and 6 each)

> ** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 2! **Find a cheaper solution** which doesn't use the expand() function. **
> Check out Utilities.sol, it contains some code to get you started. Keep the original solution.

> ** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 3! **Compare gas costs** **
> Find a way to see how much gas was consumed in the transaction which produced the dice roll event (hint: browser console / etherscan)
> Do this with your cheaper implementation and redeploy with the original one, then compare the results.

> ** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 4! **Dice Roll UX** **
> Try to improve the UX in the Example UI. Replicate what the Request Random Number! button does - a spinner should appear while waiting for the Oracle response.


--- 


# What follows below should go into parts 2 and 3 of the chainlink tutorial, on different branches, IMO



## Multi Dice Rolls (part2)

What if we wanted to keep track of dice rolls from multiple users at once? Maybe for a game that picks a winner after everyone has rolled?

Make sure your MultiDiceRolls contract is deployed and has some LINK.

Uncomment the MultiDiceRolls code in App.jsx. You should find it in the Debug Contracts Tab.

This contract allows each address to roll once. An attempt to roll again will revert.

... Work in progress

side quest 1: create a function that picks a winner from all who rolled.
A winner would be the one who has the maximum total points. Example: (1,2,1,4,1,5) => total of 1+2+1+4+1+5=14.
If there are several addresses with the maximum total, the first one to have rolled should be the winner.

side quest 2: several rounds?
Can you reset the state of the smart contract so that it can do several rounds? How would you "clear" the array of rollers?

side quest 3: implement the withdraw link function and test it. You'll need to interact with the LINK token contract on kovan.
For this you will need the contract address and the contract interface. If this is your first time, consider this quest to be 
a great challenge. Congrats if you succeed!



---

## Request Off-Chain Data (part3)
> There are two other Chainlink examples...

APIConsumer.sol

- This contract shows you how to use any API to make a get request.

![image](https://user-images.githubusercontent.com/9419140/106782214-e52acb00-6617-11eb-9213-b119e1eb94f3.png)

CoinGeckoConsumer.sol

- This contract shows you how to use existing Chainlink jobs.

![image](https://user-images.githubusercontent.com/9419140/106782323-04295d00-6618-11eb-9ff7-4de13698b23f.png)


> 🔁    You can `yarn deploy` any time and get a fresh new contract in the frontend:

Make sure to edit your deploy.js if you don't want to redeploy all of your contracts.

![deploy](https://user-images.githubusercontent.com/2653167/93149199-f8fa8280-f6b2-11ea-9da7-3b26413ec8ab.gif)


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


---------------------------------------------------

BELOW is the readme from the master branch
- SEE WHAT TO INCLUDE IN THE ABOVE (do we deploy locally in the tutorial?)
- See what to change / add in the above (mocks etc.)




----------------------------------------------------
FROM MASTER 



yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🌍 You need an RPC key for production deployments/Apps, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js`

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

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
