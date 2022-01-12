// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("RetFundERC721Deployer", {
    from: deployer,
    log: true,
  });

  // Getting a previously deployed contract
  const RetFundERC721Deployer = await ethers.getContract(
    "RetFundERC721Deployer",
    deployer
  );

  // RetFundERC721Deployer.transferOwnership(YOUR_ADDRESS_HERE);

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  // Verify your contracts with Etherscan
  // You don't want to verify on localhost
  if (chainId !== localChainId) {
    await run("verify:verify", {
      address: RetFundERC721Deployer.address,
      contract: "contracts/RetFundERC721Deployer.sol:RetFundERC721Deployer",
      contractArguments: [],
    });
  }
};
module.exports.tags = ["PGDeployer"];
