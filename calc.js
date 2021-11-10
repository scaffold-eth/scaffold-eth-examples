const fs = require("fs");
const chalk = require("chalk");
const { ethers, utils } = require("ethers");

console.log("🧮 CalcExample? I think you should do this in the frontend?")
const run = async () => {

  try {

    const localProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545")


    const address = `./packages/buidler/artifacts/MVPCLR.address`;
    const abi = `./packages/buidler/artifacts/MVPCLR.json`;

    const addressData = fs.readFileSync(address)
    const abiData = fs.readFileSync(abi)

    let parsedABI = JSON.parse(abiData.toString())

    const addressString = addressData.toString()

    const mvpclrContract = new ethers.Contract( addressString , parsedABI.abi , localProvider )

    localProvider.resetEventsBlock(1);

    let recipients = await mvpclrContract.queryFilter(mvpclrContract.filters.RecipientAdded())

    let recipientByIndex = {}
    for(let r in recipients){
      const prettyName = ethers.utils.parseBytes32String(recipients[r].args.data)
      console.log(recipients[r].args.addr+" "+prettyName+" "+recipients[r].args.index)//value index
      recipientByIndex[recipients[r].args.index] = prettyName
    }

    let donations = await mvpclrContract.queryFilter(mvpclrContract.filters.Donate())

    console.log("There are a total of "+chalk.cyan(donations.length)+" donations")

    for(let d in donations){
      console.log(donations[d].args.sender+" -> "+donations[d].args.value+" "+recipientByIndex[donations[d].args.index])//value index
    }

  } catch (e) {
    console.log(e);
  }

}
run()
