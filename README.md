# Minimum Viable NFT

## 📀 A simple and stripped back minimal 1/1 NFT contract

Designed to be as simple and straightforward as possible, especially for the average joe viewing the token on etherscan!

This example of the NFT stores a simple string at the top of the contract and contains a single tokenId (the example lists it as one but it could be whatever). 

## 🤔 But why is this cool?

It reduces the amount of functions for the NFT to only provide what is neccessary for it to comply with the standard, leading to an easier to read contract and a better understanding of what is going on behind the scenes.

# 🏄‍♂️ Quick Start

Prerequisites: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 this scaffold-eth repo:

```bash
git clone https://github.com/austintgriffith/scaffold-eth MvpNft
```

> be sure to checkout the right branch of 🏗 scaffold-eth:

```bash
cd MvpNft 
git checkout mvp-nft-1of1
```

> install and start your 👷‍ Hardhat chain:

```bash
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd MvpNft 
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd MvpNft 
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

Change what string is stored on the contract!

Check out how easy it is to see whats going on behind the scenes in the etherscan contract!

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app



# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!
