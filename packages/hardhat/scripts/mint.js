/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

const delayMS = 1000 //sometimes xDAI needs a 6000ms break lol 😅

const main = async () => {


    ///     CALL MINT TO UPLOAD THE TORCHY TO IPFS


  // ADDRESS TO MINT TO:
  //const toAddress = "0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1"

  console.log("\n\n 🎫 Uploading to IPFS...\n");

  //const yourCollectible = await ethers.getContractAt('YourCollectible', fs.readFileSync("./artifacts/YourCollectible.address").toString())


  const torchy = {
    "description": "Pass it around!",
    "external_url": "https://ipfs.io/ipfs/QmNidV7AauppqK3NhnwGAUN3Q71j5bFD712Zq7drb4UUzc",// <-- this can link to a page for the specific file too
    "image": "https://ipfs.io/ipfs/QmNidV7AauppqK3NhnwGAUN3Q71j5bFD712Zq7drb4UUzc",
    "name": "Torchy",
    "attributes": [
       {
         "trait_type": "Torchy",
         "value": "lit"
       }
    ]
  }
  console.log("Uploading torchy...")
  const uploaded = await ipfs.add(JSON.stringify(torchy))
  console.log(uploaded)



  //const secondContract = await deploy("SecondContract")

  // const exampleToken = await deploy("ExampleToken")
  // const examplePriceOracle = await deploy("ExamplePriceOracle")
  // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])



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

};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
