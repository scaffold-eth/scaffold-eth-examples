# 🏗 Scaffold-ETH & Optimism SDK

This demonstrates how to use the [@eth-optimism/sdk](https://www.npmjs.com/package/@eth-optimism/sdk) to deposit ETH from L1 to Optimism, and how to withdraw it out of Optimism back to L1.

We'll use Kovan for our L1 testnet, and Optimism Kovan for our L2 testnet, so make sure you have some Kovan ETH in your wallet.

> install and start the app:

```bash
yarn install
yarn start
```

## ETH Deposit/Withdraw

When the app starts, make sure you log in with Metamask, and select Kovan as the network. On the Deposit tab, you should see your L1 and L2 balance, and any previous Deposits/Withdraws that have been made.
![image](https://user-images.githubusercontent.com/23554636/159403856-7145350d-c5f9-44c7-a549-620679fe6b0d.png)

Enter in an amount of ETH to transfer to Optimism and hit "Deposit". After you confirm the transaction, you should see a new Deposit event listed, and your L2 balance should reflect the new deposited amount.

Switch to the Withdraw tab. Make sure to switch your provider to the Optimistic Kovan network. Your L1 and L2 balances should be shown. Now you can withdraw some ETH back to L1. On mainnet, the withdraw time period is 7 days, but on testnet it's fast. The withdraw time period allows verifiers to review transactions for any fraud.
![image](https://user-images.githubusercontent.com/23554636/159404194-36a54871-134b-4726-ad6b-9a21a9156f74.png)

Once the withdraw period has passed, you'll still need to claim the ETH that you withdrew. To do this, go back to the Deposit tab (make sure you switch your provder network back to Kovan). You should see your Withdraw event show up in the list, along with the status. You should see the status change from STATE_ROOT_NOT_PUBLISHED -> IN_CHALLENGE_PERIOD -> READY_FOR_RELAY. It might take a few minutes to get to the READY_FOR_RELAY state. Once it's READY_FOR_RELAY, Click the finalize button and the ETH should now be in your wallet on L1.
![image](https://user-images.githubusercontent.com/23554636/159404329-a42f85b1-7d85-48e7-9957-f7498af2e075.png)

## ERC20 Deposit/Withdraw

First, you'll need to deploy an ERC20 token on Kovan. If you don't have a deployer account, run `yarn generate` first and then fund the account.

```bash
yarn deploy
```

There's a public mint funtion on the token that allows anyone to mint any amount. On the contract Debug tab, mint some tokens so we have some to bridge to Optimism.

To deposit ERC20 tokens, you'll first need to deploy an instance of your token on Optimism. You can do this on the ERC20 Deploy tab, all you need is the address of your token on L1. Once you paste that in and hit Deploy, a corresponding ERC20 contract will be deployed on Optimism (make sure your Metamask network is set to Optimistic Kovan). The address will be displayed once it's complete.

Once your token is deployed, you'll need to update the external_contracts.json file with the address of your token on Optimism. All you need to add is the contract address, you can use the existing ERC20ABI. Also, update the l2TokenAddress in App.jsx. After those updages, you'll need to restart the app.

Now on the ERC20 Deposit tab, you should see your token balance, and you can now deposit some tokens to Optimism. Enter an ammount and hit Approve and Deposit. The first transactions will authorize the Optimism contract to spend your tokens for the entered amount. The second transaction will deposit the tokens to Optimism.

On the ERC20 Withdraw tab, you should see your token balance be reflected to what you deposited. You can now withdraw some tokens back to L1. The same workflow applies as withdrawing ETH.
