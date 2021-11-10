// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const LOOT = await deployments.get("Loot");

  const LOOTCOMPONENTS = await deployments.get("LootComponents");

  const lootItems = await deploy("LootItems", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [LOOT.address, LOOTCOMPONENTS.address],
    log: true,
  });

  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");
*/
  /*
  const myAccount = "0xe09750abe36bea8b2236e48c84bb9da7ef5aa07c";
  const lootAddress = "0xff9c1b15b16263c61d017ee9f65c50e4ae0113d7";

  const deployerWallet = ethers.provider.getSigner();
  await deployerWallet.sendTransaction({
    to: myAccount,
    value: ethers.utils.parseEther("1"),
  });

  for (const x of [1, 2, 3, 4, 5, 6]) {
    console.log(`doing ${x}`);

    let lootContract = await ethers.getContractAt("IERC721", lootAddress);

    let ownerOf = await lootContract.ownerOf(x);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [ownerOf],
    });

    console.log(`owned by ${ownerOf}`);

    let signer = await ethers.getSigner(ownerOf);

    lootContract = await ethers.getContractAt("IERC721", lootAddress, signer);

    let result = await lootContract.transferFrom(ownerOf, myAccount, x);

    console.log("got it!");

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [myAccount],
    });

    signer = await ethers.getSigner(myAccount);

    lootContract = await ethers.getContractAt("IERC721", lootAddress, signer);

    await lootContract.approve(lootItems.address, x);
    console.log("approved it!");
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
