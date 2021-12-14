// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

// const localChainId = "31337";

const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
      r();
    }, ms)
  );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("PriceConsumerV3", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });
  // await deploy("APIConsumer", {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   // args: [ "Hello", ethers.utils.parseEther("1.5") ],
  //   log: true,
  // });
  // await deploy("CoinGeckoConsumer", {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   // args: [ "Hello", ethers.utils.parseEther("1.5") ],
  //   log: true,
  // });

  // Getting a previously deployed contract
  const PriceConsumerV3 = await ethers.getContract("PriceConsumerV3", deployer);
  // const APIConsumer = await ethers.getContract("APIConsumer", deployer);
  // const CoinGeckoConsumer = await ethers.getContract(
  //   "CoinGeckoConsumer",
  //   deployer
  // );

  /*
  // If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const priceConsumerV3 = await deploy("PriceConsumerV3", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const priceConsumerV3 = await deploy("PriceConsumerV3", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  // Verify your contracts with Etherscan
  const verifyContract = async (contractName) => {
    try {
      const address = (await ethers.getContract(contractName, deployer))
        .address;
      await run("verify:verify", {
        address,
        contract: `contracts/${contractName}.sol:${contractName}`,
        contractArguments: [],
      });
    } catch (e) {
      console.log(e);
    }
  };

  // wait a bit for etherscan to be ready to verify the contracts
  await sleep(15000);
  // verifyContract("PriceConsumerV3");
  // verifyContract("APIConsumer");
  // verifyContract("CoinGeckoConsumer");
};
module.exports.tags = [
  "PriceConsumerV3",
  // "APIConsumer",
  // "CoinGeckoConsumer"
];
