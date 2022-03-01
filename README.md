# 🏗 Scaffold-ETH - 🎲 D16 Dice Game

A simple dice game to demonstrate randomness on the blockchain.

"Roll" the 16-sided die by calling a payable function on the contract. If you roll a 0, you win the current pot. If not, the eth sent to the contract gets added to the prize pool.

> The number rolled is determined using the previous blockhash, but is that good enough!?

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git dice-game
cd dice-game
git checkout dice-game
```

> install and start your 👷‍ Hardhat chain:

```bash
cd scaffold-eth
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app
