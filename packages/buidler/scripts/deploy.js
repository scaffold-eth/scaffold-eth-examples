/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("@nomiclabs/buidler");
const { utils } = require("ethers");
const R = require("ramda");

const main = async () => {
  // ? Tip: if on VSCode, install "Better Comments" extension
  console.log("\n\n 📡 Deploying...\n");

  // auto deploy to read contract directory and deploy them all (add ".args" files for arguments)
  //await autoDeploy();
  // OR
  // custom deploy (to use deployed addresses dynamically for example:)
  console.log("🛰  deploying MVPCLR")
  const MVPCLR = await deploy("MVPCLR",[ 60 /* 3600*8 == 8 hrs */])// 778111

  console.log("😺  Recipients...")
  await MVPCLR.addRecipient("0x60Ca282757BA67f3aDbF21F3ba2eBe4Ab3eb01fc",ethers.utils.formatBytes32String("🐶 Dog On it Dapps"),"http://localhost:3000")// 70-90k gas ~>$1 40G
  await MVPCLR.addRecipient("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",ethers.utils.formatBytes32String("🐰 Cotton Tailor"),"http://localhost:3000")
  await MVPCLR.addRecipient("0xfdE139e04963094650bAAD2686ca65A0cF04373C",ethers.utils.formatBytes32String("🦊 Foxy Optics"),"http://localhost:3000")
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐻 Bear Market Liquors"),"http://localhost:3000")
  await MVPCLR.addRecipient("0x1bc77cea22eC6D9e3Da390B0409bE264f5E84e66",ethers.utils.formatBytes32String("🐹 Gerbilnomics Labs"),"http://localhost:3000")
  await MVPCLR.addRecipient("0xB2ac59aE04d0f7310dC3519573BF70387b3b6E3a",ethers.utils.formatBytes32String("🐭 Whisker's Widgets"),"http://localhost:3000")

  console.log("⏰  Starting round...")
  await MVPCLR.startRound() // 45k gas  ~<$1 40G

  //EXAMPLE OF HOW TO DONATE HERE:
  //await MVPCLR.donate(0,{ value: ethers.utils.parseEther("0.01") })  // 48212
  //await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })

  console.log("🔑 Sending ownership...")
  /// TRANSFER THE CLR TO YOU AFTER IT IS DEPLOYED:
  await MVPCLR.transferOwnership("0x34aA3F359A9D614239015126635CE7732c18fDF3")


  var matchingFunds = {
    to: MVPCLR.address,
    value: ethers.utils.parseEther("1")
  };

  console.log("🏦 Adding 1 ETH 3 times to matching funds:",matchingFunds)
  const wallet = ethers.provider.getSigner()
  await wallet.sendTransaction(matchingFunds)
  await wallet.sendTransaction(matchingFunds)
  await wallet.sendTransaction(matchingFunds)


  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/buidler/artifacts/"),
    "\n\n"
  );
};

const autoDeploy = async () => {
  const allDeployed = [];
  const contractList = fs
    .readdirSync(config.paths.sources)
    .filter((fileName) => isSolidity(fileName));

  // loop through each solidity file from config.path.sources and deploy it
  // abi encode any args, if found
  // ! do not use .forEach in place of this loop
  for (let i=0; i < contractList.length; i++) {
    const file = contractList[i];
    const contractName = file.replace(".sol", "");
    const contractArgs = readArgsFile(contractName);
    const deployed = await deploy(contractName, contractArgs);

    allDeployed.push(deployed);
  }

  return allDeployed;
};

const deploy = async (contractName, _args) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName);
  const deployed = await contractArtifacts.deploy(...contractArgs);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  console.log(
    " 📄",
    chalk.cyan(contractName),
    "deployed to:",
    chalk.magenta(deployed.address),
  );

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
  fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp") < 0;

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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
