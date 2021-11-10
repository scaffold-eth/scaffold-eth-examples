# 🏗 scaffold-eth - 🦉 Gnosis Safe Results Oracle

> 🧫 Prototype frontend experiences for a results oracle implemented using a [Gnosis Safe](https://gnosis-safe.io/)

### Installation

```sh
git clone -b gnosis-results-oracle https://github.com/sogasg/scaffold-eth.git gnosis-results-oracle

cd gnosis-results-oracle

yarn install

yarn start
```

> 👉 Visit your frontend at http://localhost:3000

## Deployment

> 📡 deploy a gnosis results oracle via the frontend:

> ( ⛽️ Grab **Rinkeby** from the [faucet](https://faucet.rinkeby.io/) )

![image](https://user-images.githubusercontent.com/2156509/131915026-312ae5c3-0dc4-4e2d-aa51-a2edfd938cdb.png)

Deploying a results oracle will 
1) Deploy a gnosis safe.
2) Transfer ETH from the deployed to the safe. 
3) Two transactions will be created. One for the case when the work is completed, transferring the eth to the beneficiary. One for when the work is not completed, transferring the ETH back to the deployer. The worktext will be in the data field of the transaction for work completed.
4) The deployer will be redirected to the result oracle's evaluator's view..

---

Once its deployed it will redirect to the evaluators view (url format http://localhost:3000/evaluator/{safe-address}). This is the URL that should be shared with evaluators.

![image](https://user-images.githubusercontent.com/2156509/131915078-f0c9a49d-01ca-465d-acc1-a1bbbac9308c.png)

---

The evaluator should click the "Yes" or "No" button based on if the work has been completed or not. This will sign a transaction in the underlying Gnosis Safe. Once one of the transactions has enough signatures (dependent on the deployer's specified threshold), then execute button will appear.

---

## Support

Join the [telegram support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!
