# 🏗 scaffold-eth

### IPFS Example

> add and get text from IPFS

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

📝 Edit the IPFS view `IPFSUI.jsx` in `packages/react-app/src/views`

📱 Open http://localhost:3000 to see the app

---

IPFS is a distributed storage layer important for storing content that is too big for Ethereum.

> add some text to the text area box:

![image](https://user-images.githubusercontent.com/2653167/104651821-6d4f2d80-5675-11eb-9765-fb9fca0ea87b.png)

> click to "Save text to IPFS"

Content saved to IPFS is "content addressable" (the address is the hash of the content). If the content changes, the hash to retrieve it will also change.

Once the content is uploaded you will see the hash:

![image](https://user-images.githubusercontent.com/2653167/104652280-1f86f500-5676-11eb-896c-4767f966a93a.png)

> Click "Load from IPFS" to load the content at that hash:

![image](https://user-images.githubusercontent.com/2653167/104652408-4cd3a300-5676-11eb-91cb-cf1d3cb8da6d.png)
