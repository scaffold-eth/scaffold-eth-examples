/* eslint no-use-before-define: "warn" */
const { deploy } = require('./utils')
const {  JsonRpcProvider } = require("@ethersproject/providers");
const { config, l2ethers, network } = require("hardhat");
const fs = require("fs");

const main = async () => {

  console.log(`\n\n 📡 Deploying on local L2\n`);

  let rpcUrl = "http://localhost:8545"
  //const yourContractL2 = await deploy({contractName: "YourContract", rpcUrl: rpcUrl, ovm: true})
  const provider = new JsonRpcProvider(rpcUrl)
  const mnemonic = fs.readFileSync("./mnemonic.txt").toString().trim()
  const newWallet = new ethers.Wallet.fromMnemonic(mnemonic)
  const signerProvider = newWallet.connect(provider)

  let contractArtifacts = await l2ethers.getContractFactory("YourContract", signerProvider);

  const deployed = await contractArtifacts.deploy();
  await deployed.deployTransaction.wait()

  const checkCode = async (_address) => {
    let code = await provider.getCode(_address)
    console.log(code)
  }

  await checkCode(deployed.address)

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

exports.deploy = deploy;
