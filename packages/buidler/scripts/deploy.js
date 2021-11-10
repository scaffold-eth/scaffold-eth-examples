const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("@nomiclabs/buidler");
const { utils } = require("ethers");

async function main() {
  console.log("📡 Deploy \n");

  // auto deploy to read contract directory and deploy them all (add ".args" files for arguments)
  //await autoDeploy();
  // OR
  const donorManager = await deploy("DonorManager");
  const clr = await deploy("CLR", [ donorManager.address, 120 * 1 /* minutes */ ]);

  await clr.addRecipient(
    "0x0001000000000000000000000000000000000000",
    utils.hexlify(utils.toUtf8Bytes("🧙‍♂️  Instant Wallet")),
    utils.hexlify(utils.toUtf8Bytes("An easily forkable burner wallet for fast transfers of tokens.")),
  )

  await clr.addRecipient(
    "0x0002000000000000000000000000000000000000",
    utils.hexlify(utils.toUtf8Bytes("🏰  Buidl Guidl")),
    utils.hexlify(utils.toUtf8Bytes("Pseudo-anon guild of builders focused on product prototyping with 🏗 scaffold-eth.")),
  )

  await clr.addRecipient(
    "0x0003000000000000000000000000000000000000",
    utils.hexlify(utils.toUtf8Bytes("🎨  Nifty Ink")),
    utils.hexlify(utils.toUtf8Bytes("An easily forkable, instant artist onboarding art platform that upgrades to mainnet.")),
  )

  await clr.addRecipient(
    "0x0004000000000000000000000000000000000000",
    utils.hexlify(utils.toUtf8Bytes("🏗  Scaffold-ETH")),
    utils.hexlify(utils.toUtf8Bytes("Everything you need to build decentralized applications powered by smart contracts.")),
  )

  await clr.addRecipient(
    "0x0005000000000000000000000000000000000000",
    utils.hexlify(utils.toUtf8Bytes("🛠  Eth.Build")),
    utils.hexlify(utils.toUtf8Bytes("Hands-on web3 education tool and raw prototyping sandbox for Ethereum.")),
  )

  await clr.addRecipient(
    "0x0006000000000000000000000000000000000000",
    utils.hexlify(utils.toUtf8Bytes("🌒  xMOON.exchange")),
    utils.hexlify(utils.toUtf8Bytes("All of your wildest dreams will come true on the xMoon exchange.")),
  )



  await donorManager.allowDonor("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1")
  await donorManager.allowDonor("0x407976857609eCa79b0AA319212835B284D819c7")
  await donorManager.allowDonor("0x0B6eF14E664A1eab24E216A2Ca3a5B5678e243d9")

  await clr.transferOwnership("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1");
  await donorManager.transferOwnership("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1")

}





async function deploy(name, _args) {
  const args = _args || [];

  console.log(` 🛰  Deploying ${name}`);
  const contractArtifacts = await ethers.getContractFactory(name);
  const contract = await contractArtifacts.deploy(...args);
  console.log(" 📄",
    chalk.cyan(name),
    "deployed to:",
    chalk.magenta(contract.address),
    "\n"
  );
  fs.writeFileSync(`artifacts/${name}.address`, contract.address);
  console.log("💾  Artifacts (address, abi, and args) saved to: ",chalk.blue("packages/buidler/artifacts/"),"\n")
  return contract;
}

const isSolidity = (fileName) =>
  fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp.") < 0;

function readArgumentsFile(contractName) {
  let args = [];
  try {
    const argsFile = `./contracts/${contractName}.args`;
    if (fs.existsSync(argsFile)) {
      args = JSON.parse(fs.readFileSync(argsFile));
    }
  } catch (e) {
    console.log(e);
  }

  return args;
}

async function autoDeploy() {
  const contractList = fs.readdirSync(config.paths.sources);
  return contractList
    .filter((fileName) => isSolidity(fileName))
    .reduce((lastDeployment, fileName) => {
      const contractName = fileName.replace(".sol", "");
      const args = readArgumentsFile(contractName);

      // Wait for last deployment to complete before starting the next
      return lastDeployment.then((resultArrSoFar) =>
        deploy(contractName, args).then((result,b,c) => {

          if(args&&result&&result.interface&&result.interface.deploy){
            let encoded = utils.defaultAbiCoder.encode(result.interface.deploy.inputs,args)
            fs.writeFileSync(`artifacts/${contractName}.args`, encoded);
          }

          return [...resultArrSoFar, result]
        })
      );
    }, Promise.resolve([]));
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
