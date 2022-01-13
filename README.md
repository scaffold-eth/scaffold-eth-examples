# 🏗 Uniforker

> a quickstart forking kit to UniswapV2

<--- Under experimentation and work in progress --->

This repository contains a ready-to-go fork of UniswapV2 deployed on Kovan.


# 🏄‍♂️ Quick Start

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-examples uniforker
```

> install and boot up your 👷‍ frontend:

```bash
cd uniforker
yarn start
```
> change up your token pairs in src --> state --> lists --> default-tokenlist.json. 

A custom token (wBCLT) is already there as an example

> src --> constants --> index.ts contains Uniswap token-pair factory addresses!

> src --> components --> Header --> index.ts to customize the menu and login features

> If you have your own liquidity reward token that you want to add, go to src --> components --> TransactionConfirmationModal --> index.tsx

> src --> state --> user --> hooks.tsx contains information about liquidity reward provisions, should you wish to change / customize that.


# Customization

Feel free to go to src > assets to customize logos and images used!