// import { EthersAdapter, SafeFactory } from
import Safe, { EthersAdapter, SafeFactory, SafeTransaction, TransactionOptions } from "@gnosis.pm/safe-core-sdk";
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import { ethers } from "ethers";

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const deploy = async ({
  tx,
  threshold,
  evaluators,
  deployerAddress,
  userSigner,
  workString,
  ethAmount,
  beneficiary,
  onSafeCreated,
  onEthSent,
  onTransactionsCreated,
}) => {
  const serviceClient = new SafeServiceClient("https://safe-transaction.rinkeby.gnosis.io");
  const ethAdapter = new EthersAdapter({
    ethers,
    signer: userSigner,
  });
  console.log(`Deployer is: ${deployerAddress}`);
  console.log(workString);

  const safeFactory = await SafeFactory.create({ ethAdapter });

  const owners = evaluators;
  if (!owners.map(_ => _.toLowerCase()).includes(deployerAddress.toLowerCase())) {
    throw Error(
      `The deployer needs to be one of the signers. Add the deployer (${deployerAddress}) address to the evaluators array in the config (and increase the threshold by one to keep things the same).`,
    );
  }
  const safeAccountConfig = { owners, threshold };
  const safeSdk = await safeFactory.deploySafe(safeAccountConfig);

  onSafeCreated();

  const proposeTransactions = async transaction => {
    try {
      const safeTransaction = await safeSdk.createTransaction(transaction);
      await safeSdk.signTransaction(safeTransaction);
      const txHash = await safeSdk.getTransactionHash(safeTransaction);

      console.log(
        JSON.stringify({
          safeAddress,
          "safeTransaction.data": safeTransaction.data,
          txHash,
          signature: safeTransaction.signatures.get(deployerAddress.toLowerCase()),
        }),
      );

      const result = await serviceClient.proposeTransaction(
        safeAddress,
        safeTransaction.data,
        txHash,
        safeTransaction.signatures.get(deployerAddress.toLowerCase()),
      );
      console.log("transactions sent");
    } catch (e) {
      console.log("Failed to propose transaction:");
      console.log(e);
    }
  };

  const safeAddress = safeSdk.getAddress();
  console.log(`Safe deployed to: ${safeAddress}`);
  console.log(`Signers: ${owners}`);

  try {
    const newTx = await tx({
      to: safeAddress,
      value: ethers.utils.parseEther(ethAmount),
    });

    await newTx.wait();

    console.log(`Safe funded with ${ethAmount} ETH`);
    onEthSent();
  } catch (e) {
    console.log(`Ether transfer failed!`);
    console.log(e);
  }

  await proposeTransactions({
    to: ethers.utils.getAddress(beneficiary),
    value: ethers.utils.parseEther(ethAmount).toString(),
    data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(workString)),
    nonce: 0,
  });
  await proposeTransactions({
    to: deployerAddress,
    value: ethers.utils.parseEther(ethAmount).toString(),
    data: "0x",
    nonce: 0,
  });

  await sleep(2000); // give the gnosis service some time to process the transactions
  onTransactionsCreated();
  console.log("Transactions for both yes and no case created and proposed via the safe-service-client");
  return safeAddress;
};
