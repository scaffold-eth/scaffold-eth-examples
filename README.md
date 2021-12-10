# 🏗 Scaffold-ETH

> is everything you need to get started building decentralized applications powered by smart contracts.

> This tutorial is **PART 2** of a series on how to integrate Chainlink technology with Scaffold-ETH.

> In this tutorial you learn an advanced use case of **Chainlink VRF** (verifiable randomness) 🎲  where one contract handles multiple randomness-based requests at the same time.

> The code has been stripped to the use case at hand. For a VRF starter kit with more UI options / more basic VRF examples check out [**PART 1**](https://github.com/scaffold-eth/scaffold-eth-examples/tree/chainlink-tutorial-1)

🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

```bash
git clone -b chainlink-tutorial-2 https://github.com/scaffold-eth/scaffold-eth-examples/

# 🏄‍♂️ Quick Start

### Manual setup

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth-examples:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-examples.git
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

You will need to fund your deployer account with kovan ETH before you can deploy your contract.

Testnet ETH is available from https://faucets.chain.link/

![image](https://user-images.githubusercontent.com/9419140/106749192-36c15e80-65f4-11eb-8365-64f66569c899.png)


```bash
yarn deploy

```

![image](https://user-images.githubusercontent.com/9419140/106748708-9b2fee00-65f3-11eb-90c6-3c28c09f7540.png)

🔏 Edit your smart contract `MultiDiceRolls.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment script `00_deploy_your_contract.js` in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

📚 Keep [solidity by example](https://solidity-by-example.org) handy and check out the [Solidity globals and units](https://docs.soliditylang.org/en/v0.8.10/units-and-global-variables.html)

> With everything up your UI should look something like this:

![Screenshot 2021-12-09 at 21 17 48](https://user-images.githubusercontent.com/32189942/145461334-6395aaad-9396-4390-8ccb-9465726adf92.png)

## MultiDiceRolls 🎲 🎲 🎲

This contract has evolved from the **DiceRolls** contract in [PART 1](https://github.com/scaffold-eth/scaffold-eth-examples/tree/chainlink-tutorial-1). With the simple contract we were able to request a dice roll and after a while receive a result. Each new dice roll request would eventually overwrite the previous result.

What if within our contract we wanted to keep track of **dice rolls from multiple users at once**? Maybe for a game that picks a winner after everyone has rolled?

MultiDiceRolls lets you do that. It allows any address to roll once. An attempt to roll again will revert.

💻 🤓 Let's try it out! 

> Fund the contract with LINK 

- Testnet LINK is available from https://faucets.chain.link/

Copy the contract address and send it some link. You don't need much, average oracle costs .1 LINK.

![Screenshot 2021-12-09 at 22 17 18](https://user-images.githubusercontent.com/32189942/145469349-294dd534-efa3-4f4b-93e8-d5b0ec8f8ce3.png)

> Let's go to the Example UI. This should be your starting point:

![Screenshot 2021-12-09 at 21 08 58](https://user-images.githubusercontent.com/32189942/145462724-e40a4531-d148-4014-a0dc-ef4b7ab0c800.png)

Click it, get rolling! Once the transaction is mined it will look like this:

![Screenshot 2021-12-09 at 21 10 09](https://user-images.githubusercontent.com/32189942/145462832-c2ce9ad3-c123-43df-b1a6-c10e845e36cf.png)

We've requested a random number, now we're waiting about 1 minute for a response from the chainlink oracle. We've explained this 2-step-process in [PART 1](https://github.com/scaffold-eth/scaffold-eth-examples/tree/chainlink-tutorial-1).

When the oracle responds, our contract performs a dice roll and you should see the UI updated with a result. There's an entry in the Events list and also log entry in the browser console.

![Screenshot 2021-12-09 at 21 41 44](https://user-images.githubusercontent.com/32189942/145464649-75a63447-3d0d-41d9-841f-98f8b77cae9d.png)

![Screenshot 2021-12-09 at 21 31 29](https://user-images.githubusercontent.com/32189942/145464509-617f113f-d26d-4da4-b6b5-f79711949555.png)

Use the Debug UI to verify your roll result: 

![Screenshot 2021-12-09 at 21 35 28](https://user-images.githubusercontent.com/32189942/145463923-0879e611-fcae-4ce0-9cab-ee5a1dcf621e.png)
![Screenshot 2021-12-09 at 21 35 49](https://user-images.githubusercontent.com/32189942/145463938-446fb5c5-096c-4cf8-88f5-79cf41ca40f8.png)

> What happens if you attempt to roll again?
> Sure enough, the transaction reverts because no address is allowed to roll twice.

Now let's do a roll from another address. 

![Screenshot 2021-12-09 at 21 38 30](https://user-images.githubusercontent.com/32189942/145464244-640d5797-ce57-4a32-af8f-94c825d3c265.png)

Wait for the Events to update and check again in your Debug UI.


> 👩‍💻 🧐 Let's dig into the solidity code! 
> How does the contract manage multiple rollers, to each their own guaranteed fair random roll?

This is our storage setup:

![Screenshot 2021-12-09 at 21 52 02](https://user-images.githubusercontent.com/32189942/145466082-ce26104e-88bd-426f-91da-9af7e75114fb.png)

As we said, we have a 2-step-process for each dice roll. 

This is how we handle **1. user requests for rolls**

![Screenshot 2021-12-09 at 21 53 10](https://user-images.githubusercontent.com/32189942/145466241-4f532a2f-f69a-49ac-a29c-d91df6a4a6ee.png)

And here we **2. complete the dice roll** as triggered by the orcale response:

![Screenshot 2021-12-09 at 21 54 33](https://user-images.githubusercontent.com/32189942/145466411-6b9a7079-b1c2-476b-b866-5f82acd5deec.png)

Our code that makes 6 random numbers from one oracle response is not optimal in terms of execution costs. ⛽️ 

🤓 If this bothers you, consider that we have a side quest for that in [PART 1](https://github.com/scaffold-eth/scaffold-eth-examples/tree/chainlink-tutorial-1). 

## What useful things can we do with our contract?

> ** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 1- create a public function that **picks a winner** out of those who rolled **
> 
> A winner would be the one who has the maximum total points. 
> If there are several addresses with the maximum total, the first one to have rolled should be the winner.

Example:
- Roller 1: roll (1,2,1,4,1,5) => total of 1+2+1+4+1+5=14
- Roller 2: roll (6,2,1,4,1,6) => total of 6+2+1+4+1+6=20
- Roller 3: roll (6,1,1,5,1,6) => total of 6+1+1+5+1+6=20

=> Roller 2 wins


**💡 Hint** 
You'll probably need another datastructure in order to be able to go through all the rollers as you determine the winner.

> ** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 2 - Develop the contract to allow for **several rounds** **
> 
> Build in a mechanism to reset the state of the smart contract after it picks a winner.
> It should **remember the winner** and be able to start the process all over again. 

- How would you "clear" the state after each round? Do you even need to clear it? 
- Would you remember only the last winner or (historically) all winners?
- Would you remember winner(s) in the contract state or merely via events emitted when a winner is picked? Or both?

If you think these choices depend on how the contract is used, you're absolutely right! 
So, what use cases can you think of for your MultiDiceRolls?

**💡 Hint** 
Depending on how safe+gas-efficient you want your contract to be, you may need more complex mappings in your contract.

🦹‍♀️ 😡 However simple/complex you make your contract, keep asking yourself how a jerk may attempt to mess with it.


> ** 🧙‍♂️ 🧝‍♀️ 🧞‍♂️ Side Quest 3 implement the withdraw link function and test it.
> 
> You'll need to interact with the LINK token contract on kovan.
> For this you will need the contract address and the contract interface.
> If it's the first time you do this, consider this quest to be a great challenge. Congratz if you succeed!

--- 

> 🔁    You can `yarn deploy --reset ` any time and get fresh new contract in the frontend:


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
