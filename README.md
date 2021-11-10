# 🏗 scaffold-eth - ⏳ Simple Stream GTC

> a simple GTC stream where the beneficiary reports work via links when they withdraw

> anyone can deposit funds into the stream and provide guidance too

> currently the branch has been tested on ropsten so a Mock GTC Contract needs to be deployed but for mainnet we will use the external Contract hook to execute gtc related transactions

---

required: [Node](https://nodejs.org/dist/latest-v12.x/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


```bash
git clone -b simple-stream-gtc https://github.com/austintgriffith/scaffold-eth.git simple-stream-gtc

cd simple-stream-gtc 

```

```bash

yarn install

```

```bash

yarn deploy

```

> in a second terminal window:

```bash
cd scaffold-eth
yarn start

```

---

💼 Edit your **toAddress**, **cap**, **frequency**, and other stream parameters in `deploy.js` in `packages/hardhat/scripts`

---

🔏 Edit your smart contract `SimpleStream.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

😯 The UI is mostly in `ExampleUI.jsx` in `packages/react-app/src/views`

📱 Open http://localhost:3000 to see the app

---

<img width="719" alt="stream_new_1" src="https://user-images.githubusercontent.com/26670962/133470726-9e9dfb32-567d-4709-8cb0-a06b27b38cf5.png">

---

> Set the stream **toAddress** in `deploy.js` to your address in the frontend:

```
  const mockGtc = await deploy("MockGtc")

  const simpleStream = await deploy("SimpleStream",[
    /* to address */ "0x1e2Ce012b27d0c0d3e717e943EF6e62717CEc4ea",
    /* cap */ utils.parseEther("50"),//gtc
    /* frequency */120, //1296000,//seconds //1296000,//15 days
    /* starts full: */ false,
    mockGtc.address
  ]/*,{nonce: 0}*/)
```

Normally you will want to configure your **frequency** to be much longer, but it starts at *two minutes* for local testing and as mentioned above for mainnet we will just hardcode the gtc address in the contract rather than passing it in the constructor.

---

That means it has enough to pay out **about 471 USD worth of GTC** 4 times over an **8 minute period**:

<img width="367" alt="stream-crop" src="https://user-images.githubusercontent.com/26670962/133470787-22ea65bd-5cd1-4f03-87f7-6a0b4036a0fe.png">

---

The stream will start *empty* and flow at a rate of **471 USD worth of GTC** every **two minutes**:

<img width="719" alt="stream_new_1" src="https://user-images.githubusercontent.com/26670962/133470726-9e9dfb32-567d-4709-8cb0-a06b27b38cf5.png">

> ⚠️ Since your local node only mines a block when you send a transaction, you might want to send yourself funds from the faucet to see the stream fill up:

---

> Withdraw from your stream by posting a github link and an amount:

<img width="719" alt="stream_new_1" src="https://user-images.githubusercontent.com/26670962/133470726-9e9dfb32-567d-4709-8cb0-a06b27b38cf5.png">

---

A work log will form, tracking your progress:

<img width="681" alt="event-1" src="https://user-images.githubusercontent.com/26670962/133470885-c337074d-96e0-4721-a608-68565f6f2ab3.png">

---

An initial deposit occurs in the `deploy.js` but you can also depoit using the frontend:

<img width="722" alt="event-2" src="https://user-images.githubusercontent.com/26670962/133470938-411874df-8f0d-4f05-bf27-dd5cc330366a.png">


---
---
---
---

## 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA)  to ask questions and find others building with 🏗 scaffold-eth!

---

===================================================== [⏫ back to the top ⏫](https://github.com/austintgriffith/scaffold-eth#-scaffold-eth)

---
