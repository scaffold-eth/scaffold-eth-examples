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

  await deploy("MultiDiceRolls", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  const MultiDiceRolls = await ethers.getContract("MultiDiceRolls", deployer);

  /*
  // If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
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
  verifyContract("MultiDiceRolls");
};
module.exports.tags = ["MultiDiceRolls"];
