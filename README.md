# 🏗 Scaffold-ETH VDF Verifier Example

A simple example of a VDF smart contract verifier, and a simple front end to generate a VDF proof.

VDF implementation is shamlessly ripped from [kilic](https://github.com/kilic)'s [evmvdf](https://github.com/kilic/evmvdf) repo. It is strictly intended as a proof of concept and should not be used as anything but an educational resource.

### Known Issues

- If `t` is set greater than 7 the VDF proof will not be verified.

# 🏄‍♂️ Quick Start

### Manual setup

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth-examples.git
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

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)


# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!
