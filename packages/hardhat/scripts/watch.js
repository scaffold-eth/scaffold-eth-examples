
const { exec } = require("child_process");
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers, deploy } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require("ipfs-http-client");
const path = require('path');
const s3FolderUpload = require("s3-folder-upload");

const TARGETNETWORK = "rinkeby"

const run = () => {
  console.log(" 🚛 upload and sync...");
  exec("yarn upload && yarn sync", function (error, stdout, stderr) {
    console.log(stdout);
    if (error) console.log(error);
    if (stderr) console.log(stderr);
  });
};

let lastCheck = -1

const check = async ()=>{
  console.log("")
  console.log("")
  console.log(" 👮‍♀️ Watching for new token mints and revealing...")
  const GigaNFT = await ethers.getContractFactory("GigaNFT");
  const GigaAddress = JSON.parse(fs.readFileSync("./deployments/"+TARGETNETWORK+"/GigaNFT.json")).address
  console.log("connecting to gigaNFT at",GigaAddress)
  const gigaContract = await GigaNFT.attach(
    GigaAddress
  );
  const currentSupply = (await gigaContract.totalSupply()).toNumber()

  console.log("gigaNFT currentSupply",currentSupply)
  if(currentSupply!=lastCheck){
    lastCheck=currentSupply
    run()
  }
}

setInterval(()=>{
  check()
  console.log("")
},15000)

check()
