# 🏗 BuidlGuidl Roundtable

> Web3 Ideas Board

![Screen Shot 2022-05-06 at 11 12 24 PM](https://user-images.githubusercontent.com/14002941/167258506-e703a583-8777-4108-8b4c-267c1e09bd4b.png)


# 🏄‍♂️ Quick Start

Prerequisites:

- [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)
- [Firebase CLI](https://www.npmjs.com/package/firebase-tools)
- [Firebase account](https://firebase.google.com/) along with a firebase project with cloud functions and firestore enabled.

> clone/fork 🏗 scaffold-eth:

```bash
git clone -b round-table https://github.com/scaffold-eth/scaffold-eth-examples.git
```

> Deploy cloud functions to firebase:

```bash
cd scaffold-eth/packages/firebase
firebase use # select your firebase project
firebase deploy --only functions # deploy your functions
```

> Rename `sample.env.js` to `env.js` in `packages/react-app/src/` and copy firebase config variables to the firebase key

> Start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```


📝 Edit your frontend `App.jsx` in `packages/react-app/src`

📱 Open http://localhost:3000 to see the app

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!
