/* eslint no-use-before-define: "warn" */
const { deploy } = require('./utils')
const {  JsonRpcProvider } = require("@ethersproject/providers");
const fs = require("fs");

const main = async () => {

  console.log(`\n\n 📡 Deploying on local L2\n`);

  let rpcUrl = "http://localhost:8545"

  const yourContractL2 = await deploy({contractName: "YourContract", rpcUrl: rpcUrl, ovm: true})

  const provider = new JsonRpcProvider(rpcUrl)

  const checkCode = async (_address) => {
    let code = await provider.getCode(_address)
    console.log(code)
  }

  await checkCode(yourContractL2.address)

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

exports.deploy = deploy;
