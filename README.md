# 🏗 scaffold-eth

> erc20 edition: this fork gets you started with your very own tokens.

---

## quickstart

```bash
git clone -b erc20-demo https://github.com/austintgriffith/scaffold-eth.git scaffold-eth-erc20s

cd scaffold-eth-erc20s
```

```bash

yarn install

```

```bash

yarn chain

```

> in a second terminal window:

```bash

yarn deploy

```

> in a third terminal window:

```bash

yarn start

```

🔏 This includes four starter erc20 contracts in `packages/hardhat/contracts`
- Fixed has a fixed supply, via its constructor statement
- Unlimited lets anyone mint new tokens
- Burnable allows burning as well as minting
- Inflating makes new tokens available for minting with every new block

These are built on top of [OpenZeppelin's tried and tested reference contracts](https://docs.openzeppelin.com/contracts/3.x/erc20).

📝 Edit your frontend `App.jsx` and `/views` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app

There are three pages:
- `Hints` to show you around
- `Example UI` pulls together some information about the different tokens, as well as allowing you to interact with the key erc20 functionality (mint, transfer, approve)

> Can you `approve` a metamask address, then use `transferFrom` with that address to take tokens from another wallet?

- `Contract` has the vanilla scaffold-eth Contract component if you want to dig around some more

Take a look around!
