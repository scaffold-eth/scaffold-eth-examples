# Patchwork Kingdoms - Giga-NFT

![image](https://user-images.githubusercontent.com/2653167/145732157-f95d3808-e2f0-422b-9484-52ef412513b3.png)

#### 1/1000 randomly revealed NFTs

#### 2.307% price curve [designed here](https://docs.google.com/spreadsheets/d/1Hrvp2hUb_jkAXNDD3VBbK6eNOJQqoFeQBVhpuWN9I-g/edit#gid=0)

#### Starting price 0.1 ETH - Ending price 1 ETH

#### built with 🏗 scaffold-eth ([learn more](https://github.com/scaffold-eth/scaffold-eth))

## 🏃‍♀️ Quick Start

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
