# 🏗 Scaffold-ETH - ⌚️ Keeper NFT speed run build for Chainlink's Smartcon

> Build, mint, and send around your own ERC721 that stays in sync with a count using a Keeper!

# 🏃‍♀️ Quick Start
Required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) and [Git](https://git-scm.com/downloads)

```
git clone https://github.com/austintgriffith/scaffold-eth.git keeper-nft
```
```
cd keeper-nft
git checkout keeper-nft
yarn install
yarn start
```

> in a second terminal window:

```
cd keeper-nft
yarn chain
```

> in a third terminal window:

```
cd keeper-nft
yarn deploy
```

📱 Open http://localhost:3000 to see the app

You will need to use https://keepers.chain.link/ to register your contract and send in some kovan Link. Then your contract *should* stay synced with the count :) and folks can mint NFTs wooooo!
