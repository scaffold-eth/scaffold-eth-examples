# 🏗 scaffold-eth

> is everything you need to get started building decentralized applications powered by smart contracts

---

## quickstart

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git

cd scaffold-eth
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

> in a third terminal window:

```bash
cd scaffold-eth
yarn deploy

```

![](https://i.imgur.com/cS0KHTa.png)
<br/>

> You can interact with the initial version of the DeFi Facet which demonstrates 2x leverage through v1 Aave Uniswap Market.
<br/>

![](https://i.imgur.com/2dFo0z3.png)
<br/>

> A sample defi facet zap transaction on ropsten.


### What is Diamond Standard ?
Basically it enables people to write contracts with virtually no size limit in a modular and gas-efficient way.

Diamonds can be upgraded on the fly without having to redeploy existing functionality.

Now in a real scenario a diamond has many faces known as facets so just like that facets here are contracts that you interact with, upgrade etc through the diamond contract.

Diamond Cut is a style guide used to shape diamonds just like that to add, remove, modify any facet. We have a Diamond Cut Facet used to do the same so you can upgrade facets without any hassle.

Before diving into the UI and contracts, I will recommend to go through the [EIP](https://eips.ethereum.org/EIPS/eip-2535) to have a complete understanding of the same.

#### Facets
For demonstration purposes, the current Facet linked with the UI is a DeFi which uses [Aave Uniswap Market](https://docs.aave.com/developers/v/1.0/deployed-contracts/uniswap-market) to leverage 2x by just depositing ETH, and it can be upgraded by redeploying it again(go through deploy.js in detail) after changes and choosing the right upgrade action in UI.

The upgrades are done currently by directly calling the Diamond Cut Facet.

The leverage logic is as follows:
1. swap half of eth to stable coin
2. add liquidity to uniswap
3. deposit a-uni tokens to aave
4. safe borrow stable coin
5. swap half of stable coin to eth
6. add liquidity again to uniswap in same pool
7. deposit a-uni token again to aave

