// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("OptimisticShades", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: ["0xbF7877303B90297E7489AA1C067106331DfF7288"],
    log: true,
    waitConfirmations: 5,
  });

  // Getting a previously deployed contract
  const OptimisticShades = await ethers.getContract(
    "OptimisticShades",
    deployer
  );

  // await OptimisticShades.transferOwnership(YOUR_ADDRESS_HERE);

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  try {
    if (chainId !== localChainId) {
      await run("verify:verify", {
        address: OptimisticShades.address,
        contract: "contracts/OptimisticShades.sol:OptimisticShades",
        contractArguments: ["0xbF7877303B90297E7489AA1C067106331DfF7288"],
      });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports.tags = ["OptimisticShades"];
