// deploy/00_deploy_your_contract.js

// const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const GigaNftContract = await deploy("GigaNFT", {
    from: deployer,
    log: true,
  });

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  if (chainId !== localChainId) {
    await run("verify:verify", {
      address: GigaNftContract.address,
      contract: "contracts/GigaNFT.sol:GigaNFT",
      contractArguments: [],
    });
  }
};
module.exports.tags = ["GigaNFT"];
