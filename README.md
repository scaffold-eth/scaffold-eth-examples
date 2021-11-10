# 🏗 scaffold-eth: Uniswapper

> a component for swapping erc20s on Uniswap (plus tokenlists + local forks of mainnet!)

---

## quickstart

```bash
git clone -b uniswapper https://github.com/austintgriffith/scaffold-eth.git uniswapper-scaffold

cd uniswapper-scaffold
```

```bash

yarn install

```

```bash

yarn start

```

- In a second terminal window run:

```bash

yarn fork

```
This branch uses a local fork of mainnet, which is easy to do with Hardhat ([see here to learn more](https://hardhat.org/guides/mainnet-forking.html)). The template configuration uses an Infura node, however this is not a full archive node, so it will only work for an hour or so. To get a long-lasting fork...
- Go to alchemyapi.io and get an API key for mainnet
- Replace the Infura URL with an Alchemy URL with your API key (i.e. https://eth-mainnet.alchemyapi.io/v2/<API_KEY_HERE>) into the `fork` script on line 28 of /packages/hardhat/package.json

📱 Open http://localhost:3000 to see the app

Notes:
- This widget uses [tokenlists](https://tokenlists.org/) to import the erc20s of your choice


[![youtubeyarnstart](https://user-images.githubusercontent.com/2653167/104074637-dba37400-51cd-11eb-83f1-89303332440a.jpg)](https://youtu.be/xcBT4Jmi5TM)
