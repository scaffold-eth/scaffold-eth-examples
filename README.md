# 🏗 scaffold-eth

> link listed example for a "grab bag" of items that are removed as your grab them

---


```bash
git clone https://github.com/austintgriffith/scaffold-eth.git

cd scaffold-eth
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

```bash
cd scaffold-eth
yarn chain

```

> in a third terminal window:

```bash
cd scaffold-eth
yarn deploy

```

🔏 Edit your smart contract `GrabBag.sol` in `packages/hardhat/contracts`

💼 Edit your deployment script `deploy.js` in `packages/hardhat/scripts`

> edit the `transferOwnership()` address to be your frontend address in `deploy.js`

![image](https://user-images.githubusercontent.com/2653167/117068231-40885a00-ace8-11eb-8a76-46706183442f.png)

📱 Open http://localhost:3000 to see the app

---

The grab bag starts pre-populated with 100 random bytes32.

![image](https://user-images.githubusercontent.com/2653167/117068327-6281dc80-ace8-11eb-9539-ac998e9d77c3.png)

---

Grab a random item by supplying seed:

![image](https://user-images.githubusercontent.com/2653167/117068396-76c5d980-ace8-11eb-92f6-9abcfd833e63.png)

---

As items are grabbed, they are no longer available to be grabbed!

BUT this is probably waaaay to expensive to really use.

Maybe adjust to uint8s instead of bytes32?

I know I could make the "prev" mechanic more efficient too.


---

## 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA)  to ask questions and find others building with 🏗 scaffold-eth!

---

===================================================== [⏫ back to the top ⏫](https://github.com/austintgriffith/scaffold-eth#-scaffold-eth)

---
