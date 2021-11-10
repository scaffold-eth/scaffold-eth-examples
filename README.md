# 🏗 scaffold-eth - 🔥 Burn Vendor 🐕

---

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git burn-vendor
cd burn-vendor
git checkout burn-vendor
yarn install
yarn chain
```

> in a second terminal window:

```bash
cd burn-vendor
yarn start
```

> in a third terminal window:

```bash
cd burn-vendor
yarn deploy
```



🔏 Edit your smart contract `BurnVendor.sol` in `packages/hardhat/contracts`

🧑‍🚀 You will want to fine-tune the `tokensPerEth`, `burnMultiplier`

> 👨‍🔧 Update the `withdrawAddress` in `BurnVendor.sol` to your frontend Ethereum address (at http://localhost:3000)

![image](https://user-images.githubusercontent.com/2653167/122311197-e1b12580-cece-11eb-82a4-a295293f3109.png)

> 🔧 Use an incognito account and navigate to the `Contract` tab in the frontend to `buy()` some tokens:

![image](https://user-images.githubusercontent.com/2653167/122311413-5e440400-cecf-11eb-8f44-e27a89a9e659.png)

🤡 For now the `Buy` tab just shows the buy events, we should add some frontend there to buy tokens

![image](https://user-images.githubusercontent.com/2653167/122311618-d4486b00-cecf-11eb-864a-05681774d91f.png)

👀 You should see events for each buy and how much was 🔥 burned.

🧝‍♀️ Tokens sent to the contract are locked forever and only the `withdrawAddress` can withdraw ETH.

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment script `deploy.js` in `packages/hardhat/scripts`

📱 Open http://localhost:3000 to see the app


## 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA)  to ask questions and find others building with 🏗 scaffold-eth!

---
