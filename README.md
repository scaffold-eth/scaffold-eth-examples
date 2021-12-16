# Patchwork Kingdoms - Giga-NFT

![title](https://user-images.githubusercontent.com/2653167/145846485-e052b92a-5253-4cd1-8b8f-1d07c42effea.png)

#### 1/1000 randomly revealed NFTs from artist [Nadieh Bremer](https://linktr.ee/nadiehbremer).

#### 0.175 ether flat price -- (scrapped price curve [designed here](https://docs.google.com/spreadsheets/d/1Hrvp2hUb_jkAXNDD3VBbK6eNOJQqoFeQBVhpuWN9I-g/edit#gid=0))

#### built with 🏗 scaffold-eth ([learn more](https://github.com/scaffold-eth/scaffold-eth))

---

## Live on [Rinkeby]

A 1/15 (instead of 1/1000) test contract is deployed to `Rinkeby` so we can test the reveal mechanics.

The prototype contract on `Rinkeby` is https://rinkeby.etherscan.io/address/0xe7c808d38cE0B920EbdEf56ec9787075Fd179696#code

This will also allow us to dial in the last bits of metadata.

Here is token #1 on Rinkeby OpenSea: https://testnets.opensea.io/assets/0xe7c808d38cE0B920EbdEf56ec9787075Fd179696/1

Use the frontend to mint 1 of the 15 testnet NFTs: https://giga-nft-external.surge.sh

---

## 🏃‍♀️ Dev Quick Start

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


Clone the repo first
```sh
git clone -b Giga-NFT-project https://github.com/scaffold-eth/scaffold-eth-examples.git Giga-NFT-project
cd Giga-NFT-project
```

Install dependencies
```bash
yarn install
```

Start React frontend
```bash
yarn start
```

✏️ To edit the frontend, open: `MainUI.jsx` in `packages/react-app/src/views/`

> You'll notice the `BOOSTPERCENT` in `MainUI.jsx`. This adds a percentage to the mint price in the frontend. This helps avoid "collisions" as multiple users are minting at the same time and the price moves on a curve. There is a refund at the very end of the transaction to send back whatever value wasn't needed in minting the NFT.  

---

# 🛰 Deploying

> Edit `hardhat.config.js` to select your default network

Generate deploy account:
```
yarn generate
```

Fund deploy account:
```
yarn account
```

Deploy contracts:
```
yarn deploy
```

> Edit `targetNetwork` to point the frontend at the network you deployed to.

Build frontend:
```
yarn build
```

> Deploy the static site from the '/build' directory

Using Surge:
```
yarn surge --domain giga-nft-external.surge.sh
```

---

# 🎲 Random Reveal

> Randomly revealing the image and metadata for NFTs as they are minted is tricky and nuanced.

The assets are randomly shuffled privately by the artist and the order is kept secret.

Eventually, all of the assets will be **pinned** in IPFS.

IPFS is awesome because it is immutable (content addressable).

BUT, for 1000 assets, we need to use a folder on IPFS.

The folder's address changes with each new asset added.

So we have to have **all** the assets revealed *before* we can set the `BaseURI` to IPFS.

To *reveal* the assets as they are minted, we will have a helper script running.

✏️ Edit `upload.js` in `packages/hardhat/scripts`.

This script checks the `currentSupply` in the NFT contract.

Then, the script will *reveal* assets from `./assets` based on the supply to `revealFolder`.

> Upload and Reveal assets:

```
yarn upload
```

The `upload.js` script also uploads the contractURI() json file to IPFS.

(Edit the smart contract to reflect this `contractURIHashResult` after upload.)

The `revealFolder` is just for the static site, this requires a 'yarn surge'.

Instead of publishing the site each time, we'll use S3 to reveal without having to deploy...

(This also provides a double-check that we aren't revealing something too soon.)

> To sync the `revealFolder` up to S3, run:

```
yarn sync
```

> This will make the assets available at https://giganftassetreveal.s3.amazonaws.com/

To automate the reveal:

```
yarn watch
```

This will check the tokenSupply every 15 seconds and run the reveal if needed.

---

# 🌳 Merkle Tree Allowlist

Steps from Isaac for implementation:

We'll assemble a json file full of addresses for the allowlist...

That file comes in like this to generate a merkle root: https://github.com/scaffold-eth/scaffold-eth/blob/bufficorn-buidl-brigade/packages/hardhat/test/bufficorn-test.ts#L6
(Here is where the root is outputted: https://github.com/scaffold-eth/scaffold-eth/blob/bufficorn-buidl-brigade/packages/hardhat/test/bufficorn-test.ts#L66)

The smart contract will take a proof from the frontend and verify it: https://github.com/scaffold-eth/scaffold-eth/blob/bufficorn-buidl-brigade/packages/hardhat/contracts/Bufficorn.sol#L246

The smart contract will contain an extra mapping to only allow each allowlisted address to mint once.

In his implementation he even had the root upgradeable: https://github.com/scaffold-eth/scaffold-eth/blob/bufficorn-buidl-brigade/packages/hardhat/contracts/Bufficorn.sol#L125

The allowlist will be included in the frontend like [this example](https://github.com/scaffold-eth/scaffold-eth/blob/bufficorn-buidl-brigade/packages/react-app/src/mint/util.js#L5).

In the frontend there is a getProof that is called before minting https://github.com/scaffold-eth/scaffold-eth/blob/bufficorn-buidl-brigade/packages/react-app/src/App.jsx#L268

Here is how to get the proof in the frontend: https://github.com/scaffold-eth/scaffold-eth/blob/bufficorn-buidl-brigade/packages/react-app/src/mint/util.js#L18
