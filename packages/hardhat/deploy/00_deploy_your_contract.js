// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");
const { poseidonContract } = require("circomlibjs");

const localChainId = "31337";

// const sleep = (ms) =>
//   new Promise((r) =>
//     setTimeout(() => {
//       console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
//       r();
//     }, ms)
//   );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const poseidon3bytecode = poseidonContract.createCode(3);
  const poseidon3abi = poseidonContract.generateABI(3);
  const poseidon3factory = new ethers.ContractFactory(
    poseidon3abi,
    poseidon3bytecode,
    await ethers.getSigner(deployer)
  );
  const poseidon3contract = await poseidon3factory.deploy();
  console.log(poseidon3contract.address);

  const poseidon2bytecode = poseidonContract.createCode(2);
  const poseidon2abi = poseidonContract.generateABI(2);
  const poseidon2factory = new ethers.ContractFactory(
    poseidon2abi,
    poseidon2bytecode,
    await ethers.getSigner(deployer)
  );
  const poseidon2contract = await poseidon2factory.deploy();
  console.log(poseidon2contract.address);

  await deploy("YourContract", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [ poseidon3contract.address, poseidon2contract.address ],
    log: true,
    waitConfirmations: 5,
  });

  // Getting a previously deployed contract
  const YourContract = await ethers.getContract("YourContract", deployer);
  /*  await YourContract.setPurpose("Hello");

    To take ownership of yourContract using the ownable library uncomment next line and add the
    address you want to be the owner.
    // await yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

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

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  // try {
  //   if (chainId !== localChainId) {
  //     await run("verify:verify", {
  //       address: YourContract.address,
  //       contract: "contracts/YourContract.sol:YourContract",
  //       contractArguments: [],
  //     });
  //   }
  // } catch (error) {
  //   console.error(error);
  // }
};
module.exports.tags = ["YourContract"];
