const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("@nomiclabs/buidler");
const { utils } = require("ethers");

async function main() {
  console.log("📡 Deploy \n");

  // auto deploy to read contract directory and deploy them all (add ".args" files for arguments)
  //await autoDeploy();
  // OR
  // custom deploy (to use deployed addresses dynamically for example:)
   console.log("📄  Deploying Registry \n");
   const registry = await deploy("Registry")
   console.log("👮‍♀️ Deploying Governor \n");
   const governor = await deploy("Governor",[
    registry.address,
    [
      "0x89C479761E39f05374Ec7bB6EC36b255C853A4fd",
      "0x04B4De0Dc898B1B1c18782f4C02848feCe242BCc",
      "0x7e35Eaf7e8FBd7887ad538D4A38Df5BbD073814a"
    ]
  ])
   console.log("🗳  Electing Governor\n");
   await registry.transferOwnership(governor.address)
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
