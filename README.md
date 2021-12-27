# 🏗 scaffold-eth - Retroactive Funding for ERC20's

> Fund different ERC20 based public goods with help of Uniswap V3 by providing liquidity to the token-weth pool

## 🏃‍♀️ Quick Start

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


1. Clone the repo first
```sh
git clone -b erc20-retroactive-funding https://github.com/scaffold-eth/scaffold-eth-examples.git erc20-retroactive-funding
cd erc20-retroactive-funding
```

2. Install dependencies
```bash
yarn install
```


3. Deploy Contracts
```sh
yarn deploy (default deployment network is rinkeby)
```

4. Start React frontend
```bash
yarn start
```

## Introduction

There are two types of entities involved to start with the **Whales/Funders** for public goods and the **Holders** of the public goods which are **ERC20's.**

- Since the build works with Uniswap V3 Integration so each project holder will have to deploy their own contract.

- When the project holder deploys the contract they are minted some project tokens along and the pool is created on uniswap in the [constructor](https://github.com/scaffold-eth/scaffold-eth-examples/blob/erc20-retroactive-funding/packages/hardhat/contracts/RetroactiveFunding.sol#L783).

- Once the pool is created any Whale/Non-Whale can send a specific ETH amount to the contract and the same amount of project tokens are minted and based on whether the [pool position has been minted or not](https://github.com/scaffold-eth/scaffold-eth-examples/blob/erc20-retroactive-funding/packages/hardhat/contracts/RetroactiveFunding.sol#L854), liquidity is increased or a new liquidity position is minted.

- As liquidity keeps getting added the project holder can monitor the price on the UI and if they feel it beneficial to swap their tokens they can easily do so and get weth in exchange.

So that's the overall architecture currently for this build and this process keeps continuing.

**NOTE**
<br>
There was being research done in parallel to get the **pool rebalancing** right i.e add pool liquidity in such a way that price increases and on swap it should decrease slightly, but currently since liquidity is added in equal proportions, the price increases slightly or does not increase at all but on swaps it decreases sharply, the same behaviour was observed when the project token amount added in the pool was double than eth amount.

## UI

The first screen allows the whales to fund the project with any amount of ETH they choose to

<img width="1159" alt="Screenshot 2021-12-24 at 10 16 20 AM" src="https://user-images.githubusercontent.com/26670962/147322282-063337f6-699e-4b66-a03b-26b298f135ce.png">

The second screen is intended for the project token holders to sell their tokens for WETH.

<img width="1208" alt="Screenshot 2021-12-24 at 10 16 15 AM" src="https://user-images.githubusercontent.com/26670962/147322554-82377a3c-0429-492c-8078-4d35ec3cbb7e.png">

## Contact

Join the [telegram support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!


