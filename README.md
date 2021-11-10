# 🏗 scaffold-eth - meta multi sig wallet example
> example dapp that gathers and displays off-chain signatures for a lightweight multi-sig wallet 
---

## quickstart

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git meta-multi-sig

cd meta-multi-sig

git checkout meta-multi-sig
```

```bash

yarn install

```

> you might get node-gyp errors, ignore them and run:

```bash

yarn start

```

> in a second terminal window:

```bash

yarn chain

```

> in a third terminal window:

```bash

yarn deploy

```

🔏 Edit your smart contract `MetaMultiSigWallet.sol` in `packages/buidler/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app

> in a fourth terminal window:

```bash

yarn backend

```

🔧 Configure your multi-sig with `MetaMultiSigWallet.args` in `packages/buidler/contracts`

> Edit the chainid, your owner addresses, and the number of signatures required:

![image](https://user-images.githubusercontent.com/2653167/99006303-7bf75800-24ff-11eb-99a8-da29d1b0ab4f.png)


> Deploy with new owners:


```bash

yarn deploy

```

The "Owners" tab should show your new owners:

![image](https://user-images.githubusercontent.com/2653167/99006671-0e97f700-2500-11eb-920b-1faf2334bb03.png)

Use the faucet to fund the multi-sig smart contract:

![image](https://user-images.githubusercontent.com/2653167/99006995-94b43d80-2500-11eb-9939-e2f42174677e.png)


In the "Create" tab, craft a new transaction:

![image](https://user-images.githubusercontent.com/2653167/99006811-53bc2900-2500-11eb-95a2-9c8b8cd8e728.png)

As a different owner, head to the "Pool" tab and sign the transaction:

![image](https://user-images.githubusercontent.com/2653167/99007093-be6d6480-2500-11eb-98f4-edae016bebec.png)


Once you have enough signatures you can "Exec" the transaction:

![image](https://user-images.githubusercontent.com/2653167/99007119-cf1dda80-2500-11eb-858e-f151a9d452d1.png)

Executed transactions show up on the front page:

![image](https://user-images.githubusercontent.com/2653167/99007219-012f3c80-2501-11eb-817e-47def24678a2.png)
