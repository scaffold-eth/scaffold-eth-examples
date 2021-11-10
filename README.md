# 🏗 scaffold-eth

## Token Allocator Example

> Smart contract application to distribute tokens/ETH at a predefined ratio to a number of addresses.

> Allows the community to send funds to a credibly neutral token distributor.

---

## quickstart

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git token-allocator

cd token-allocator

git checkout token-allocator
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

#### App:

📱 Open http://localhost:3000 to see the app

#### Contracts:

🔏 Edit the Allocator contract `Allocator.sol` in `packages/hardhat/contracts`

🔏 Edit the ExampleToken contract `ExampleToken.sol` in `packages/hardhat/contracts`

#### Frontend:

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📝 Edit your frontend `Allocations.jsx` in `packages/react-app/src/views`

📝 Edit your frontend `Distributions.jsx` in `packages/react-app/src/views`

#### How To:

Edit your token allocations in the deploy script `deploy.js` in `packages/hardhat/scripts`

![image](https://user-images.githubusercontent.com/2653167/102407903-112bb780-3faa-11eb-9843-4fa70a8cb153.png)


Then redeploy your contracts:

```bash
yarn deploy
```

Your Allocations should be displayed in the frontend:
![image](https://user-images.githubusercontent.com/2653167/102407974-2dc7ef80-3faa-11eb-86d0-2b2393a2f8c4.png)

Use the **Debug** tab to check the ExampleToken balance of the Allocator address:
![image](https://user-images.githubusercontent.com/2653167/102408139-69fb5000-3faa-11eb-8828-1d9b64bd23b0.png)

Use the from in the **Distributions** tab to distribute the token:
![image](https://user-images.githubusercontent.com/2653167/102408265-957e3a80-3faa-11eb-91f7-a88b61644130.png)

Distrobutions can be called by anyone and they will happen at the defined ratio:
![image](https://user-images.githubusercontent.com/2653167/102408368-b2b30900-3faa-11eb-81f4-b13bae578caa.png)

Use address(0) to distribute ETH:
![image](https://user-images.githubusercontent.com/2653167/102408471-db3b0300-3faa-11eb-914e-25ecc5d1ad58.png)
