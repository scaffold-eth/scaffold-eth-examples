/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers, tenderly, run } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");

const main = async () => {

  console.log("\n\n 📡 Deploying...\n");

  const gtgsCollectible = await deploy("GTGSCollectible") // <-- add in constructor args like line 19 vvvv

  console.log("sleeping...")
  await sleep(7000)

  const gtgsCoin = await deploy("GTGSCoin", [ gtgsCollectible.address ])

  console.log("sleeping...")
  await sleep(7000)

  await gtgsCollectible.setGTGSCoinAddress(gtgsCoin.address)

  console.log("sleeping...")
  await sleep(7000)

  await gtgsCoin.transfer("0x34aA3F359A9D614239015126635CE7732c18fDF3",utils.parseEther("100000"))

/*
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x542b3B7326BC6dCf297d6906221290e7A54AF3CD",
    value: ethers.utils.parseEther("1")
  })
*/


/*
  await gtgsCollectible.mint("11gold.jpg")
  await gtgsCollectible.mint("10gold.jpg")
  await gtgsCollectible.mint("9gold.jpg")
  await gtgsCollectible.mint("8gold.jpg")
  await gtgsCollectible.mint("7gold.jpg")
  await gtgsCollectible.mint("6gold.jpg")
  await gtgsCollectible.mint("5gold.jpg")
  await gtgsCollectible.mint("4gold.jpg")
  await gtgsCollectible.mint("3gold.jpg")
  await gtgsCollectible.mint("2gold.jpg")
  await gtgsCollectible.mint("1gold.jpg")

  await gtgsCollectible.mint("10.jpg")
  await gtgsCollectible.mint("9.jpg")
  await gtgsCollectible.mint("8.jpg")
  await gtgsCollectible.mint("7.jpg")
  await gtgsCollectible.mint("6.jpg")
  await gtgsCollectible.mint("5.jpg")
  await gtgsCollectible.mint("4.jpg")
  await gtgsCollectible.mint("3.jpg")
  await gtgsCollectible.mint("2.jpg")
  await gtgsCollectible.mint("1.jpg")
*/


  /*
  console.log("\n\n 🎫 minting...\n");
  await gtgsCollectible.mint()
  console.log("\n\n 🎫 minting...\n");
  await gtgsCollectible.mint()
  console.log("\n\n 🎫 minting...\n");
  await gtgsCollectible.mint()
  //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  //const secondContract = await deploy("SecondContract")

  // const exampleToken = await deploy("ExampleToken")
  // const examplePriceOracle = await deploy("ExamplePriceOracle")
  // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])

  console.log("\n\n 💸 send a dollar to the frontend...\n");
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",
    value: ethers.utils.parseEther("1")
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


  //If you want to verify your contract on tenderly.co (see setup details in the scaffold-eth README!)
  /*
  await tenderlyVerify(
    {contractName: "YourContract",
     contractAddress: yourContract.address
  })
  */

  // If you want to verify your contract on etherscan
  /*
  console.log(chalk.blue('verifying on etherscan'))
  await run("verify:verify", {
    address: yourContract.address,
    // constructorArguments: args // If your contract has constructor arguments, you can pass them as an array
  })
  */

  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n"
  );
};

const deploy = async (contractName, _args = [], overrides = {}, libraries = {}) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName,{libraries: libraries});
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  let extraGasInfo = ""
  if(deployed&&deployed.deployTransaction){
    const gasUsed = deployed.deployTransaction.gasLimit.mul(deployed.deployTransaction.gasPrice)
    extraGasInfo = `${utils.formatEther(gasUsed)} ETH, tx hash ${deployed.deployTransaction.hash}`
  }

  console.log(
    " 📄",
    chalk.cyan(contractName),
    "deployed to:",
    chalk.magenta(deployed.address)
  );
  console.log(
    " ⛽",
    chalk.grey(extraGasInfo)
  );

  await tenderly.persistArtifacts({
    name: contractName,
    address: deployed.address
  });

  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

  return deployed;
};


// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
  // not writing abi encoded args if this does not pass
  if (
    !contractArgs ||
    !deployed ||
    !R.hasPath(["interface", "deploy"], deployed)
  ) {
    return "";
  }
  const encoded = utils.defaultAbiCoder.encode(
    deployed.interface.deploy.inputs,
    contractArgs
  );
  return encoded;
};

// checks if it is a Solidity file
const isSolidity = (fileName) =>
  fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp") < 0 && fileName.indexOf(".swap") < 0;

const readArgsFile = (contractName) => {
  let args = [];
  try {
    const argsFile = `./contracts/${contractName}.args`;
    if (!fs.existsSync(argsFile)) return args;
    args = JSON.parse(fs.readFileSync(argsFile));
  } catch (e) {
    console.log(e);
  }
  return args;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// If you want to verify on https://tenderly.co/
const tenderlyVerify = async ({contractName, contractAddress}) => {

  let tenderlyNetworks = ["kovan","goerli","mainnet","rinkeby","ropsten","matic","mumbai","xDai","POA"]
  let targetNetwork = process.env.HARDHAT_NETWORK || config.defaultNetwork

  if(tenderlyNetworks.includes(targetNetwork)) {
    console.log(chalk.blue(` 📁 Attempting tenderly verification of ${contractName} on ${targetNetwork}`))

    await tenderly.persistArtifacts({
      name: contractName,
      address: contractAddress
    });

    let verification = await tenderly.verify({
        name: contractName,
        address: contractAddress,
        network: targetNetwork
      })

    return verification
  } else {
      console.log(chalk.grey(` 🧐 Contract verification not supported on ${targetNetwork}`))
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
