# 🏗 scaffold-eth - 👮 Token Gated Content

> Private content is only exposed if a user signs a message to prove they own a token

---

⚠️ This branch extends the [sign in with web3 branch](https://github.com/austintgriffith/scaffold-eth/tree/sign-in-with-web3) (You should start there!)

---

```bash
git clone https://github.com/austintgriffith/scaffold-eth.git token-gated-content

cd token-gated-content

git checkout token-gated-content
```

```bash

yarn install

```

```bash

yarn start

```

---

☢️ WARNING you need to create `hiddenContent.txt` in `packages/backend` first!

---
> start the backend service that listens for and verifies signatures:

```bash

yarn backend

```

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app

---

 📝 Edit the `index.js` in `packages/backend` to control when to release the hidden content.

---

Users connect their web3 wallet:

![image](https://user-images.githubusercontent.com/2653167/122679127-e6176000-d1a6-11eb-9d77-05b1797bef48.png)

---

Users sign a message:

![image](https://user-images.githubusercontent.com/2653167/122679161-0ba46980-d1a7-11eb-8768-6d6926a56104.png)

---

The backend makes sure the signature is correct and serves the hidden content only if the user has eth, or some token, or something...

![image](https://user-images.githubusercontent.com/2653167/122679251-5e7e2100-d1a7-11eb-9ed0-c997bdfaeaba.png)


---

If they have ETH, it displays a special video:

![image](https://user-images.githubusercontent.com/2653167/122679199-2f67af80-d1a7-11eb-9689-9a79b48b35f5.png)


---

## 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA)  to ask questions and find others building with 🏗 scaffold-eth!

---

===================================================== [⏫ back to the top ⏫](https://github.com/austintgriffith/scaffold-eth#-scaffold-eth)

---
