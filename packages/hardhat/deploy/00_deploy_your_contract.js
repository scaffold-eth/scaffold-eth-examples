// deploy/00_deploy_your_contract.js

// const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const GigaNftContractDeployResult = await deploy("GigaNFT", {
    from: deployer,
    log: true,
  });

  console.log("waiting...")
  await sleep(3000)


  const gigaNftContract = await ethers.getContract("GigaNFT", deployer);
  console.log("transferOwnership...")
  gigaNftContract.transferOwnership("0x34aA3F359A9D614239015126635CE7732c18fDF3")


  console.log("checking owner...")
  await sleep(3000)

  console.log("owner or "+gigaNftContract.address+" is:", await gigaNftContract.owner())

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  /*if (chainId !== localChainId) {
    await run("verify:verify", {
      address: GigaNftContract.address,
      contract: "contracts/GigaNFT.sol:GigaNFT",
      contractArguments: [],
    });
  }*/
};
module.exports.tags = ["GigaNFT"];


const sleep = (ms) =>
  new Promise((r) =>
    setTimeout(() => {
      // console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
      r();
    }, ms)
  );
