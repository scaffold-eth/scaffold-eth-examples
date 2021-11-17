# 🏗 Scaffold-ETH - Optimism Starter Kit

> 🧫 Prototype frontend experiences to build on Optimistic Ethereum
> (https://www.optimism.io)

Learn more [here](https://gateway.optimism.io/welcome)

Grafana public [dashboard](https://public-grafana.optimism.io/d/9hkhMxn7z/public-dashboard?orgId=1&refresh=5m)

# 🏄‍♂️ Quick Start

### Manual setup

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


### Installation 

```sh
git clone -b optimism-starter-kit https://github.com/austintgriffith/scaffold-eth.git optimism-starter-kit

cd optimism-starter-kit

yarn install

yarn start
```

> 👉 Visit your frontend at http://localhost:3000



__The following requires [Docker](https://www.docker.com) & [Docker Compose](https://docs.docker.com/compose/install/)__

### Creating a node

#### Download the docker images.

Clone the [Optimism monorepo](https://github.com/ethereum-optimism/optimism).

> in a second terminal window:

```sh
git clone https://github.com/ethereum-optimism/optimism.git
```

### Starting the node

This process downloads the images from the Docker hub, and depending on the hardware it can take up to ten minutes.

```sh
cd optimism/ops
docker-compose -f docker-compose-nobuild.yml up -t 3600

```
You might get a timeout at first. If that is the case, just run the docker-compose command again.

Make changes to `hardhat.config.js` in `packages/hardhat/test` to deploy on the network you want.

Here, it was set to `"localOptimism"`by default.

<img width="452" alt="Screen Shot 2021-11-17 at 05 09 05" src="https://user-images.githubusercontent.com/94156214/142128280-d398c56b-97a7-43bd-806d-6ad856380bbf.png">

All of the default hardhat accounts are funded with ETH on both L1 and L2. Therefore, you have to add the mnemonic:

```sh
'test test test test test test test test test test test junk'

```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd optimism-starter-kit
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

### Deploy to a real network

Once you're app is ready, you can deploy it to a testnet such as Optimistic Kovan. 
Edit `hardhat.config.js` to add your account mnemonic to `kovanOptimism`.

<img width="485" alt="Screen Shot 2021-11-17 at 12 38 31" src="https://user-images.githubusercontent.com/94156214/142186139-2243672c-080a-4aba-81d8-b145958127c0.png">

Same procedure for deploying on Optimism mainnet.

<img width="510" alt="Screen Shot 2021-11-17 at 12 49 10" src="https://user-images.githubusercontent.com/94156214/142186880-30785947-57a5-4932-bedd-925a6046cab9.png">


## Need some ETH accross multiple testnets?

<img width="237" alt="Screen Shot 2021-11-17 at 12 54 17" src="https://user-images.githubusercontent.com/94156214/142187632-d557351d-0cda-4c58-bab2-d93a89160f53.png">


### Use [Paradigm](https://faucet.paradigm.xyz) faucet to get you set up.

<img width="617" alt="Screen Shot 2021-11-17 at 12 53 31" src="https://user-images.githubusercontent.com/94156214/142187537-779db3a6-c167-4796-8c23-26aac97df127.png">


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
