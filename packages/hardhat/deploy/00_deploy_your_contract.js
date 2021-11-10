// deploy/00_deploy_your_contract.js
const axios = require('axios').default;
const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("YourContract", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [ "0x18a808dd312736fc75eb967fc61990af726f04e4", ethers.utils.parseEther("0.01559") ],
    log: true,
  });

  const targetBaseFeeNFT = 69
  const range = 1

  //to attempt in a loop: while yarn deploy; sleep 10; end

  console.log("Attempting to mint with a baseFee of",targetBaseFeeNFT,"(will attempt within "+range+")")

  const YourContract = await ethers.getContract("YourContract", deployer);
  const currentFeeBN = await YourContract.baseFee()
  const currentFee = currentFeeBN.div(1000000000).toNumber()
  const diff = currentFee - targetBaseFeeNFT
  console.log("currentFee",currentFee)
  if(diff > -range && diff <= range){
    console.log(currentFee,"is within range("+range+") of",targetBaseFeeNFT)
    const gasPrice = parseInt((targetBaseFeeNFT*1.1)*1000000000)
    let result = await YourContract.onlyMint(targetBaseFeeNFT,"0x34aA3F359A9D614239015126635CE7732c18fDF3",{value: ethers.utils.parseEther("0.019"), gasLimit: 200000, gasPrice: gasPrice});
    console.log(result)
  }else{
    console.log("(out of range)")
  }

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
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["YourContract"];
