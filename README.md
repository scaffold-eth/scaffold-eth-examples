# 🏗 scaffold-eth EIP-1167 Proxy Factory 

This template show a simple example of how to create a Factory contract that uses EIP-1167 for reduced gas usage, using OpenZeppelin's implementation.

## 🏃‍♀️ Quick Start

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


```bash
git clone https://github.com/austintgriffith/scaffold-eth.git
cd scaffold-eth
yarn install
yarn chain
```

> in a second terminal window:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window:

```bash
cd scaffold-eth
yarn deploy
```

Once you have deployed the `YourContractFactory.sol` contract, you can use it to create instances of `YourContract.sol`.

## How it works

In `YourContractFactory.sol` when executing `createYourContract()` it will create a clone of the implementation of `YourContract.sol` using OpenZeppelin's Proxy Contract implementation. 

`YourContractFactory` also keeps tracks of all the instances/clones it has created in an array so the UI can show them to the user allowing them to easily interact with the deployed contracts.

## DEMO
https://user-images.githubusercontent.com/526558/122483345-bd297c00-cfa8-11eb-8468-b742c6ad691c.mov

## 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA)  to ask questions and find others building with 🏗 scaffold-eth!

---

===================================================== [⏫ back to the top ⏫](https://github.com/austintgriffith/scaffold-eth#-scaffold-eth)

---
