# 🏗 scaffold-eth - 🔴 Optimistic NFTs 🎟

> A "buyer mints" NFT gallery running on a local Optimism stack

---

## 📦 Install

```bash
git clone -b optimistic-nfts https://github.com/austintgriffith/scaffold-eth.git optimistic-nfts

cd optimistic-nfts
```

```bash
yarn install
```

```bash
yarn start
```

> in a second terminal window:

*(this requires [Docker](https://www.docker.com/products/docker-desktop))*

Initiate the Optimism submodules...
```bash
cd optimistic-nfts
cd docker/optimism-integration
git submodule init
git submodule update
```
Kick off the local chain, l2 & relay infrastructure (it kind of feels like a space-ship taking off)
```bash
cd optimistic-nfts
cd docker/optimism-integration
make up
```


---


## ⚠️ WARNING

> You need to comment out line [54](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/utils/Address.sol#L54) and [115](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/utils/Address.sol#L115) of `packages/hardhat/node_modules/@openzeppelin/contracts/utils/Address.sol`

> Then try compiling your contracts: 

```bash
cd optimistic-nfts
yarn compile
```

---



## 🖼 Artwork

> ✏️ edit the `artwork.json` file to customize your artwork (or build a script to generate the artwork.json file 😉)


## 🗃 Upload

> Upload your artwork to IPFS and generate the list of "fingerprints" for each of your NFTs:

```bash
cd optimistic-nfts
yarn upload
```

## 🛰 Deploy

When you are ready to deploy `YourCollectible.sol`...

> Create a deployment mnemonic:

```bash
cd optimistic-nfts
yarn generate
```

> You can view/fund your deployer with `yarn account`

*(use the faucet in the bottom left of [`http://localhost:3000`](http://localhost:3000) to fund your deployer)*

> Deploy the stack:


```bash
cd optimistic-nfts
yarn deploy-oe
```

## 📱 Frontend

> Open [`http://localhost:3000`](http://localhost:3000) and try minting and sending around NFTs on your local Optimism stack:


*(hint: use an incognito window for a second account.)*

![onftdemo mov](https://user-images.githubusercontent.com/2653167/110854598-6d813900-8272-11eb-984c-b9e3eff69b0c.gif)
