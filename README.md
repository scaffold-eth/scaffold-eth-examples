# 🏗 Scaffold-ETH

> everything you need to build on Ethereum! 🚀

🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)


# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd scaffold-eth
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

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

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

Check out all the [active branches](https://github.com/scaffold-eth/scaffold-eth/branches/active), [open issues](https://github.com/scaffold-eth/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!

  
 - 🚤  [Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)


 - 🎟  [Create your first NFT](https://github.com/scaffold-eth/scaffold-eth/tree/simple-nft-example)
 - 🥩  [Build a staking smart contract](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-1-decentralized-staking)
 - 🏵  [Deploy a token and vendor](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-2-token-vendor)
 - 🎫  [Extend the NFT example to make a "buyer mints" marketplace](https://github.com/scaffold-eth/scaffold-eth/tree/buyer-mints-nft)
 - 🎲  [Learn about commit/reveal](https://github.com/scaffold-eth/scaffold-eth/tree/commit-reveal-with-frontend)
 - ✍️  [Learn how ecrecover works](https://github.com/scaffold-eth/scaffold-eth/tree/signature-recover)
 - 👩‍👩‍👧‍👧  [Build a multi-sig that uses off-chain signatures](https://github.com/scaffold-eth/scaffold-eth/tree/meta-multi-sig)
 - ⏳  [Extend the multi-sig to stream ETH](https://github.com/scaffold-eth/scaffold-eth/tree/streaming-meta-multi-sig)
 - ⚖️  [Learn how a simple DEX works](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90)
 - 🦍  [Ape into learning!](https://github.com/scaffold-eth/scaffold-eth/tree/aave-ape)

## Onboarding Users to your DApp using Blocknative's web3-onboard 
📕 Official `web3-onboard` docs: https://docs.blocknative.com/onboard

Web3-Onboard is the long awaited full re-write of Onboard that takes everything that we have learned in designing/managing Onboard V1 and implements a new architecture and API. This initial release has feature parity with version 1 along with a bunch of new features. This first release will also serve as a flexible foundation/architecture for the many upcoming features that we have planned.
Features

    * __Re-designed UI__ : New modern UI that is fully customizable via CSS vars.
    * __Multiple Chain Support__ : Your users can now switch between chains/networks with ease. You configure which EVM compatible chains you want to support.
    * __Multiple Wallets and Accounts Connection__ : Your users can now connect multiple wallets and/or multiple accounts within each wallet at the same time.
    * __React Hooks__ : A React Hooks package for slick integration in to React apps.
    * __Minimal Dependencies__ : All wallet dependencies are included in separate packages, so you only include the ones you want to use.
    * __Dynamic Imports__ : Supporting multiple wallets in your app requires a lot of dependencies. Onboard dynamically imports a wallet and dependencies only when the user selects it, so that minimal bandwidth is used.
    * __Wallet Provider Standardization__ : All wallet modules expose a provider that is patched to be compliant with the EIP-1193, EIP-1102, EIP-3085 and EIP-3326 specifications.


 The implementation found within this project leverages the `web3-onboard/react` npm package that wraps and delivers convenient hooks for implementation.
 [React Hooks Package](https://www.npmjs.com/package/@web3-onboard/react)
 `web3-onboard` is framework agnostic and is simple to integrate into any front end framework. You can find the core component package [here](https://www.npmjs.com/package/@web3-onboard/core) as well as further documentation on features, customizing and handling build environments

 With either instance the onboard package was created to be as light and fast as possible so you will have pass the wallet types you are interested in connecting to your DApp
 @web3-onboard/injected-wallets 
 @web3-onboard/ledger 
 @web3-onboard/trezor 
 @web3-onboard/keepkey 
 @web3-onboard/walletconnect 
 @web3-onboard/walletlink 
 @web3-onboard/torus 
 @web3-onboard/portis 
 @web3-onboard/mew  (does not currently build on M1 Macs)
 @web3-onboard/gnosis 
 @web3-onboard/fortmatic

 Add the wallets you like and instantiate as found in `blocknativeOnboardService.js`

 After wallet connection is successful you will be able to expose the wallet's provider along with the methods that will allow you to interact with the connected blockchain.

 Check out all the awesome products from Blocknative at https://www.Blocknative.com

# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum
Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)
