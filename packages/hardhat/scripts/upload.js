/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require("ipfs-http-client");
const path = require('path');

/*
const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});
*/
const ipfs = ipfsAPI({
  host: "localhost",
  port: "5001",
  protocol: "http",
});

//const delayMS = 1000; // sometimes xDAI needs a 6000ms break lol 😅

const main = async () => {

  // // // // // // // // // // // // // // // // // //
  const assetDirectory = "./assets";

  console.log("READING ASSETS",assetDirectory)
  const files = await fs.readdirSync( assetDirectory+"/Visuals" )

  let count = 0;
  for (let id=1;id<=10;id++) {
    //console.log("#",id)


    const imageLocation = assetDirectory+"/Visuals/Patchwork Kingdoms #"+id+".png"
    //console.log("READING",imageLocation)

    const imageContent = await fs.readFileSync(imageLocation)

    //EVENTUALLY WE ADD A CHECK HERE FOR MAIN NET SUPPLY AND REVEAL AS THEY ARE MINTED://////////////////////////////////
    const imageHashResult = await ipfs.add(imageContent,{onlyHash: true})


    const osMetaDataFile = assetDirectory+"/Metadata/Patchwork Kingdoms #"+id+" - metadata.json"
    //console.log("osMetaDataFile",osMetaDataFile)



    const metadataContent = await fs.readFileSync(osMetaDataFile)
    let metadataObject = JSON.parse(metadataContent.toString())

    //console.log("METADATA LOADED",metadataObject)
    //metadataObject.image = "https://ipfs.io/ipfs/"+imageHashResult.path
    metadataObject.image = "http://localhost:3000/revealedassets/"+id+".png"

    metadataObject.external_url = "http://giga-nft-external.surge.sh/"+id

    //console.log("metadataObject",metadataObject)
    //const manifestHashResult = await ipfs.add(JSON.stringify(metadataObject),{onlyHash: true})

    //console.log("\""+manifestHashResult.path+"\",")

    const revealFolder = "../react-app/public/revealedassets"

    try{ await fs.mkdirSync( revealFolder ) }catch(e){}

    console.log("revealing ",id)

    try{ fs.writeFileSync(revealFolder+"/"+id+".json",JSON.stringify(metadataObject))}catch(e){console.log(e)}

    try{ fs.writeFileSync(revealFolder+"/"+id+".png",imageContent)}catch(e){console.log(e)}


    /*
    const osMetaDataFile = assetDirectory+"/"+files[f].replace(".png"," - OS metadata.json")
    //console.log("osMetaDataFile",osMetaDataFile)
    const osMetaData = await fs.readFileSync(osMetaDataFile)

    const fileNameCleaned = files[f].substr(files[f].indexOf("#")+1)
    //console.log("filename: ",files[f])
    //console.log("fileNameCleaned: ",fileNameCleaned)
    const uploaded = await ipfs.add(await fs.readFileSync(assetDirectory+"/"+files[f]))
    //console.log(uploaded.path)

    let metadata = JSON.parse(osMetaData.toString())

    metadata.image = "https://ipfs.io/ipfs/"+uploaded.path;

    //console.log("osMetaData",metadata)

    const metaDataUploaded = await ipfs.add(JSON.stringify(metadata))

    console.log("\""+metaDataUploaded.path+"\",")
    */

  }


  //const { deployer } = await getNamedAccounts();
  //const yourCollectible = await ethers.getContract("YourCollectible", deployer);
  //console.log("minting to ",toAddress)
  //await yourCollectible.mintItem(toAddress, {
  //  gasLimit: 400000,
  //});
  /*

  const buffalo = {
    description: "It's actually a bison?",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://austingriffith.com/images/paintings/buffalo.jpg",
    name: "Buffalo",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "green",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
      {
        trait_type: "Stamina",
        value: 42,
      },
    ],
  };
  console.log("Uploading buffalo...");
  const uploaded = await ipfs.add(JSON.stringify(buffalo));

  console.log("Minting buffalo with IPFS hash (" + uploaded.path + ")");
  await yourCollectible.mintItem(toAddress, uploaded.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const zebra = {
    description: "What is it so worried about?",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://austingriffith.com/images/paintings/zebra.jpg",
    name: "Zebra",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "blue",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
      {
        trait_type: "Stamina",
        value: 38,
      },
    ],
  };
  console.log("Uploading zebra...");
  const uploadedzebra = await ipfs.add(JSON.stringify(zebra));

  console.log("Minting zebra with IPFS hash (" + uploadedzebra.path + ")");
  await yourCollectible.mintItem(toAddress, uploadedzebra.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const rhino = {
    description: "What a horn!",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://austingriffith.com/images/paintings/rhino.jpg",
    name: "Rhino",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "pink",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
      {
        trait_type: "Stamina",
        value: 22,
      },
    ],
  };
  console.log("Uploading rhino...");
  const uploadedrhino = await ipfs.add(JSON.stringify(rhino));

  console.log("Minting rhino with IPFS hash (" + uploadedrhino.path + ")");
  await yourCollectible.mintItem(toAddress, uploadedrhino.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const fish = {
    description: "Is that an underbyte?",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://austingriffith.com/images/paintings/fish.jpg",
    name: "Fish",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "blue",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
      {
        trait_type: "Stamina",
        value: 15,
      },
    ],
  };
  console.log("Uploading fish...");
  const uploadedfish = await ipfs.add(JSON.stringify(fish));

  console.log("Minting fish with IPFS hash (" + uploadedfish.path + ")");
  await yourCollectible.mintItem(toAddress, uploadedfish.path, {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  console.log(
    "Transferring Ownership of YourCollectible to " + toAddress + "..."
  );

  await yourCollectible.transferOwnership(toAddress, { gasLimit: 400000 });

  await sleep(delayMS);
  */

  /*


  console.log("Minting zebra...")
  await yourCollectible.mintItem("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1","zebra.jpg")

  */

  // const secondContract = await deploy("SecondContract")

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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
