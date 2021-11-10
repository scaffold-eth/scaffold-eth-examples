// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("AnyERC20", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: ["Hello"],
    log: true,
  });
  
  await deploy("AnyNFT", {
    from: deployer,
    log: true
  })
  
  await deploy('Moloch', {
    from: deployer,
    log: true
  })
  
  const molochTemplate = await ethers.getContract('Moloch', deployer);
  
  await deploy('MolochSummoner', {
    from: deployer,
    args: [molochTemplate.address],
    log: true
  })
  
  await deploy('VanillaMinion', {
    from: deployer,
    log: true
  })
  
  const minionTemplate = await ethers.getContract('VanillaMinion', deployer)
  
  await deploy('VanillaMinionFactory', {
    from: deployer,
    args: [minionTemplate.address],
    log: true
  })
  
  await deploy('EscrowMinion', {
    from: deployer,
    log: true
  })

  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");
    
    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */
};
module.exports.tags = ["AnyERC20", "AnyNFT", "Moloch", "MolochSummoner", "VanillaMinion", "VanillaMinionFactory", "EsrowMinion"];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
