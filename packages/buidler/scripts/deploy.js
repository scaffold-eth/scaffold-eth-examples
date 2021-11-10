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

  const Supporters = await deploy("Supporters")//~300k gas  (40G $380 -> $4.50)
  const MVPCLR = await deploy("MVPCLR",[Supporters.address, 120])//~1300k gas  (40G $380 -> $20) //<--- we set the round duration here

  await Supporters.supporterUpdate("0x34aA3F359A9D614239015126635CE7732c18fDF3",true)//45k gas ~<$1 40G
  await Supporters.supporterUpdate("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",true)
  await Supporters.supporterUpdate("0xB2ac59aE04d0f7310dC3519573BF70387b3b6E3a",true)

  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐶"))// 70-90k gas ~>$1 40G
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐱"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐭"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐹"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐰"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🦊"))
  await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐻"))

  await MVPCLR.startRound() // 45k gas  ~<$1 40G

  //add deployer as supporter to test
  await Supporters.supporterUpdate(await Supporters.owner(),true)

  //add give support to a project
  await MVPCLR.donate(0,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(2,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(3,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(5,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(6,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(2,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(0,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(3,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(0,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(0,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(2,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(0,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(3,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?
  await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })  // ooof 114k to donate :( ~2 dollars?


  //later, in the ui:
  //calculateMatching() ~280k and scales up with ^donations^ but can be run in multiple txns by anyone
                  // 5 bucks and up ?


  //recipientWithdraw() ~70k per recipient but anyone can run it
                  // 1 dollar per ?



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
