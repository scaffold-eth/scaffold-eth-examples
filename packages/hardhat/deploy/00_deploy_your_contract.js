// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const admin = "0xbF7877303B90297E7489AA1C067106331DfF7288";

  await deploy("Multidrop", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 5,
  });

  if (chainId === localChainId) {
    await deploy("SampleERC20", {
      from: deployer,
      log: true,
      waitConfirmations: 5,
    });
  }

  // Getting a previously deployed contract
  const Multidrop = await ethers.getContract("Multidrop", deployer);

  // const feesUpdate = await Multidrop.updateFee(ethers.utils.parseEther("0.05"));

  // await feesUpdate.wait(4);

  // const transferOwnership = await Multidrop.transferOwnership(admin);

  // await transferOwnership.wait(4);

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const Multidrop = await deploy("Multidrop", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  try {
    if (chainId !== localChainId) {
      await run("verify:verify", {
        address: Multidrop.address,
        contract: "contracts/Multidrop.sol:Multidrop",
        contractArguments: [],
      });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports.tags = ["Multidrop"];
