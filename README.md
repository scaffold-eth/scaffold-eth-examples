# 🏗 scaffold-eth

### Solidity v8 Underflow Example

> v0.8.0 throws on underflow, no more safemath?

---

## quickstart

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git your-next-dapp

cd your-next-dapp
```

```bash

yarn install

```

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

👀 [HartHat Config](https://github.com/austintgriffith/scaffold-eth/blob/v8-underflow-example/packages/hardhat/hardhat.config.js) updated to `0.8.0` in `hardhat.config.js` in `packages/hardhat`


🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

![image](https://user-images.githubusercontent.com/2653167/104815866-99cd8b80-57d4-11eb-8a88-a7cd71590a8e.png)


📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app

---

Solidity version 8 throws an error when we underflow:

![image](https://user-images.githubusercontent.com/2653167/104815764-caf98c00-57d3-11eb-9bf9-e0d1909c9422.png)
