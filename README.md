# 🏗 scaffold-eth

### Re-Entrancy Example

[What is a Re-Entrancy Attack?](https://quantstamp.com/blog/what-is-a-re-entrancy-attack)

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

🔏 Edit your smart contract `Attacker.sol` and `Reenterancy.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app

---

> First try interacting with `Reenterancy.sol` directly. You can deposit, check your balance, and withdraw:

![image](https://user-images.githubusercontent.com/2653167/104358533-d135f280-54cb-11eb-947f-c23244cec8f2.png)


> For the attack to work, you need to deposit some *extra* funds so they can be stolen:

![image](https://user-images.githubusercontent.com/2653167/104358669-017d9100-54cc-11eb-95c2-ef73da4b6b2b.png)


> Make sure the `Reenterancy.sol` contract has extra funds in it:

![image](https://user-images.githubusercontent.com/2653167/104358768-2245e680-54cc-11eb-8f87-c20cca22f54a.png)

> Then, deposit a the same amount through the `Attacker.sol`:

![image](https://user-images.githubusercontent.com/2653167/104358818-31c52f80-54cc-11eb-91f6-99e838a44d3e.png)

> Finally, when you withdraw from the `Attacker.sol` it will withdraw once and then *re-enter* and withdraw *again*:

![image](https://user-images.githubusercontent.com/2653167/104358966-5b7e5680-54cc-11eb-94c3-042ff0e7325d.png)

> The `Reenterancy.sol` contract is now empty but the original account that deposted the extra funds *thinks* they still have a balance:

![image](https://user-images.githubusercontent.com/2653167/104359146-93859980-54cc-11eb-9887-eccfe8cc17ef.png)
