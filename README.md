# 💎 Bytes.Land

> sandbox for procedurally generating land with ETH block hashes


> also playing with how you can only get the last 256 block hashes


---

## quickstart

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git bytes-land

cd bytes-land

git checkout bytes-land

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

🔏 Edit your smart contract `YourContract.sol` in `packages/buidler/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app

> Blocks show up on the left, "Discovered" events trigger on the right, debug contracts at the bottom


![image](https://user-images.githubusercontent.com/2653167/98697041-b1e6e180-2331-11eb-9a70-1d487f107c6c.png)
