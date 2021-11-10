# 🏗 Scaffold-ETH - ⌚️ Keeper Demo (Chainlink)

> example contract on kovan to allow keepers to "check in" peridically to a contract

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git chainlink-keeper-demo
```

> make sure you check out the `chainlink-keeper-demo` branch:

```bash
cd chainlink-keeper-demo
git checkout chainlink-keeper-demo
```

> install and start your 👷‍ Hardhat chain:

```bash
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd chainlink-keeper-demo
yarn start
```

> in a third terminal window, gnerate a deployer account, fund it with Kovan, and 🛰 deploy your contract:

```bash
cd chainlink-keeper-demo
yarn generate
yarn account
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

---

View example keeper contract at: https://docs.chain.link/docs/chainlink-keepers/compatible-contracts/#example-contract

make sure the chainlink contracts are installed: 
```bash
cd packages/hardhat && yarn add @chainlink/contracts 
```

> register your keepers at:  https://keepers.chain.link/
