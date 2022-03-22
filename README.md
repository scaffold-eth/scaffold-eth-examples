# 🏗 Scaffold-ETH & Optimism SDK

This demonstrates how to use the [@eth-optimism/sdk](https://www.npmjs.com/package/@eth-optimism/sdk) to deposit ETH from L1 to Optimism, and how to withdraw it out of Optimism back to L1.

We'll use Kovan for our L1 testnet, and Optimism Kovan for our L2 testnet, so make sure you have some Kovan ETH in your wallet.

> install and start the app:

```bash
yarn install
yarn start
```

There's no contracts to deploy, the SDK will handle all of the contract interaction for us.

When the app starts, make sure you log in with Metamask, and select Kovan as the network. On the Deposit tab, you should see your L1 and L2 balance, and any previous Deposits/Withdraws that have been made. Enter in an amount of ETH to transfer to Optimism and hit "Deposit". After you confirm the transaction, you should see a new Deposit event listed, and your L2 balance should reflect the new deposited amount.

Switch to the Withdraw tab. Make sure to switch your provider to the Optimistic Kovan network. Your L1 and L2 balances should be shown. Now you can withdraw some ETH back to L1. On mainnet, the withdraw time period is 7 days, but on testnet it's fast. The withdraw time period allows verifiers to review transactions for any fraud.

Once the withdraw period has passed, you'll still need to claim the ETH that you withdrew. To do this, go back to the Deposit tab (make sure you switch your provder network back to Kovan). You should see your Withdraw even show up in the list, along with the status. If the withdraw period has passed, you should be able to claim the ETH (status will be "READY_FOR_RELAY"). Click the finalize button, and the ETH should now bin your wallet on L1.
