# 🏗 scaffold-eth - Streaming Multi Signature Wallet

> an off-chain signature based multi sig wallet

---


#### [ 🏃‍♀️ Quick Start ](https://github.com/austintgriffith/scaffold-eth#%EF%B8%8F-quick-start)

#### [ 🔭 Learning Solidity ](https://github.com/austintgriffith/scaffold-eth#-learning-solidity)

#### [ 📡 Deploy ](https://github.com/austintgriffith/scaffold-eth#-deploy)

#### [ 📺 Frontend](https://github.com/austintgriffith/scaffold-eth#-frontend)
- [ 🛰 Providers ](https://github.com/austintgriffith/scaffold-eth#-providers)
- [ 🖇 Hooks ](https://github.com/austintgriffith/scaffold-eth#-hooks)
- [ 📦 Components ](https://github.com/austintgriffith/scaffold-eth#-components)
- [ 🖲 UI Library ](https://github.com/austintgriffith/scaffold-eth#-ui-library)
- [ ⛑ Helpers ](https://github.com/austintgriffith/scaffold-eth#-helpers)
- [ 🎚 Extras ](https://github.com/austintgriffith/scaffold-eth#-extras)
-  <B> [ 🛳 Ship it! ](https://github.com/austintgriffith/scaffold-eth#-ship-it) </B>

#### [ 🚩 Challenges ](https://github.com/austintgriffith/scaffold-eth#-challenges)
- [ 🥩 Staking App](https://github.com/austintgriffith/scaffold-eth/tree/challenge-1-decentralized-staking)
- [ 🏵 Token Vendor ](https://github.com/austintgriffith/scaffold-eth/tree/challenge-2-token-vendor)

#### [ 👩‍💻 Examples & Tutorials ](https://github.com/austintgriffith/scaffold-eth#-examples-and-tutorials)
- [ 🎟 Simple NFT ](https://github.com/austintgriffith/scaffold-eth/tree/simple-nft-example)

#### [ Built with 🏗 scaffold-eth ](https://github.com/austintgriffith/scaffold-eth#-built-with--scaffold-eth)
- [ 🎨 Nifty.ink ](https://nifty.ink) ([code](https://github.com/austintgriffith/scaffold-eth/tree/nifty-ink-dev))
- [ 🧑‍🎤PunkWallet.io ](https://punkwallet.io/) ([code](https://github.com/austintgriffith/scaffold-eth/tree/punk-wallet))

#### [🌉 Infrastructure ](https://github.com/austintgriffith/scaffold-eth#-infrastructure)

- [ 🛰 The Graph ](https://github.com/austintgriffith/scaffold-eth#-using-the-graph)
- [ 🔬 Tenderly ](https://github.com/austintgriffith/scaffold-eth#-using-tenderly)
- [ 🌐 Etherscan ](https://github.com/austintgriffith/scaffold-eth#-etherscan)
- [ 🔶 Infura ](https://github.com/austintgriffith/scaffold-eth#-using-infura)
-  🟪 [ Blocknative ](https://github.com/austintgriffith/scaffold-eth#-blocknative)

|-   <B> [ 📠 Legacy Content ](https://github.com/austintgriffith/scaffold-eth#-legacy-content) </B> - | - <B> [ 💬 Support Chat ](https://github.com/austintgriffith/scaffold-eth#-support-chat) </B> -|

[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/austintgriffith/scaffold-eth)


---

[![ethdenvervideo](https://user-images.githubusercontent.com/2653167/109873369-e2c58c00-7c2a-11eb-8adf-0ec4b8dcae1e.png)](https://youtu.be/33gnKe7ttCc?t=477)


---
---
---

# 🏃‍♀️ Quick Start

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


```bash
git clone https://github.com/austintgriffith/scaffold-eth.git streaming-meta-multi-sig

cd streaming-meta-multi-sig

git checkout streaming-meta-multi-sig
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

```bash
cd scaffold-eth
yarn chain

```


🔏 Edit your smart contract `StreamingMetaMultiSigWallet.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment script `deploy.js` in `packages/hardhat/scripts`

📱 Open http://localhost:3000 to see the app

> in a third terminal window:

```bash
yarn backend

```

🔧 Configure your deployment in `packages/hardhat/scripts/deploy.js`

> Edit the chainid, your owner addresses, and the number of signatures required:

![image](https://user-images.githubusercontent.com/2653167/99156751-bfc59b00-2680-11eb-8d9d-e33777173209.png)



> in a fourth terminal deploy with your frontend address as one of the owners:

```bash

yarn deploy

```


> Use the faucet wallet to send your multi-sig contract some funds:

![image](https://user-images.githubusercontent.com/2653167/99156785-fd2a2880-2680-11eb-8665-f8415cc77d5d.png)

> To add new owners, use the "Owners" tab:

![image](https://user-images.githubusercontent.com/2653167/99156881-e6380600-2681-11eb-8161-43aeb7618af6.png)

This will take you to a populated transaction create page:

![image](https://user-images.githubusercontent.com/31567169/116584822-cabb7180-a928-11eb-8470-32d80717e704.png)



> Create & sign the new transaction:

![image](https://user-images.githubusercontent.com/31567169/116584952-f2aad500-a928-11eb-82a1-906550008988.png)

You will see the new transaction in the pool (this is all off-chain):

![image](https://user-images.githubusercontent.com/31567169/116585121-1bcb6580-a929-11eb-8e43-b5b0921cca2e.png)

Click on the ellipsses button [...] to read the details of the transaction


![image](https://user-images.githubusercontent.com/31567169/116585196-300f6280-a929-11eb-8ecf-be11b59b44c3.png)


> Give your account some gas at the faucet and execute the transaction

The transction will appear as "executed" on the front page:

![image](https://user-images.githubusercontent.com/31567169/116585477-82e91a00-a929-11eb-9e2c-dbd5af894e4a.png)


> Create a transaction to open a stream to your frontend account:

![image](https://user-images.githubusercontent.com/31567169/116585714-b7f56c80-a929-11eb-8abe-0e06b1629f38.png)



Again, this will take you to a populated transaction form:

![image](https://user-images.githubusercontent.com/31567169/116585998-03a81600-a92a-11eb-9a33-cd49d7eae0b7.png)



This time we will need a second signature:

![image](https://user-images.githubusercontent.com/31567169/116586177-38b46880-a92a-11eb-82c9-396db404773b.png)


> Sign the transacton with enough owners:


(You'll notice you don't need ⛽️gas to sign transactions.)

> Execute the transction to open the stream:

![image](https://user-images.githubusercontent.com/31567169/116586333-66011680-a92a-11eb-8637-ffa70ae5c05a.png)


The stream will live update with each new block mined:

![image](https://user-images.githubusercontent.com/31567169/116586420-7e713100-a92a-11eb-804e-016e627d91e3.png)


(You might need to trigger a new block by sending yourself some faucet funds or something. HartHat blocks only get mined when there is a transaction.)

> Click the button any time and it will withdraw:


![image](https://user-images.githubusercontent.com/31567169/116586516-9ea0f000-a92a-11eb-97a1-dfae6070c634.png)


💼 Edit your deployment script `deploy.js` in `packages/hardhat/scripts`

🔏 Edit your contracts form, `StreamingMetaMultiSigWallet.sol` in `packages/hardhat/contracts`

📝 Edit your frontend in `packages/react-app/src/views`

## ⚔️ Side Quests

#### 🐟 Create custom signer roles for your Wallet
You may not want every signer to create new streams, only allow them to sign existing transactions or a mega-admin role who will be able to veto any transaction.

#### 😎 Integrate this MultiSig wallet into other branches like nifty-ink  
Make a MultiSig wallet to store your precious doodle-NFTs!? 

---

## 📡 Deploy the wallet!

🛰 Ready to deploy to a testnet?

> Change the `defaultNetwork` in `packages/hardhat/hardhat.config.js`

![image](https://user-images.githubusercontent.com/2653167/109538427-4d38c980-7a7d-11eb-878b-b59b6d316014.png)

🔐 Generate a deploy account with `yarn generate`

![image](https://user-images.githubusercontent.com/2653167/109537873-a2c0a680-7a7c-11eb-95de-729dbf3399a3.png)


👛 View your deployer address using `yarn account` (You'll need to fund this account. Hint: use an [instant wallet](https://instantwallet.io) to fund your account via QR code)

![image](https://user-images.githubusercontent.com/2653167/109537339-ff6f9180-7a7b-11eb-85b0-46cd72311d12.png)

👨‍🎤 Deploy your wallet:

```bash
yarn deploy
```
---

> ✏️ Edit your frontend `App.jsx` in `packages/react-app/src` to change the `targetNetwork` to wherever you deployed your contract:

![image](https://user-images.githubusercontent.com/2653167/109539175-3e9ee200-7a7e-11eb-8d26-3b107a276461.png)

You should see the correct network in the frontend:

![image](https://user-images.githubusercontent.com/2653167/109539305-655d1880-7a7e-11eb-9385-c169645dc2b5.png)

> Also change the poolServerUrl constant to your deployed backend (via yarn backend)

![image](https://user-images.githubusercontent.com/31567169/116589184-6f3fb280-a92d-11eb-8fff-d1e32b8359ff.png)

Alternatively you can use the pool server url in the above screenshot


---

#### 🔶 Infura

> You will need to get a key from [infura.io](https://infura.io) and paste it into `constants.js` in `packages/react-app/src`:

![image](https://user-images.githubusercontent.com/2653167/109541146-b5d57580-7a80-11eb-9f9e-04ea33f5f45a.png)

---

## 🛳 Ship the app!

> ⚙️ build and upload your frontend and share the url with your friends...

```bash

# build it:

yarn build

# upload it:

yarn surge

OR

yarn s3

OR

yarn ipfs
```

![image](https://user-images.githubusercontent.com/2653167/109540985-7575f780-7a80-11eb-9ebd-39079cc2eb55.png)

> 👩‍❤️‍👨 Share your public url with friends, add signers and stream some tasty ETH to a few lucky ones 😉!!
