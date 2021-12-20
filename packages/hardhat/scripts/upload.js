/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers, deploy } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require("ipfs-http-client");
const path = require('path');
const s3FolderUpload = require("s3-folder-upload");

const TARGETNETWORK = "rinkeby"

const TARGETBUCKET = "giganftassetrevealtwo"

const EXTERNAL_URL = "https://giga-nft-external-second.surge.sh"

const UPLOAD_ASSETS_TO_IPFS = true; //make sure all the metadata is right!!! (like external urls etc!!!!)

const USE_INFURA = false;

const delayMS = 60;

const TOKEN_LIMIT = 15;

const HARD_REVEAL_LIMIT = 15;

const main = async () => {

  let ipfs
  if(USE_INFURA){
    ipfs = ipfsAPI({
      host: "ipfs.infura.io",
      port: "5001",
      protocol: "https",
    });
  }else{
    ipfs = ipfsAPI({
      host: "localhost",
      port: "5001",
      protocol: "http",
    });
  }

  console.log("Uploading contract level metadata...")
  const titleImageHashResult = await ipfs.add(fs.readFileSync("./title.png"))

  const contractURI = {
    "name": "Patchwork Kingdoms",
    "description": "Using data about the digital connectivity of schools, collected by the UNICEF Giga project, each Patchwork Kingdom brings together hundreds of unique schools, each transformed into a square. Brought together they form a kingdom ‘above’ representing connected schools and a kingdom ‘below’ representing unconnected schools, showing how many children are still in need of like-changing connectivity.",
    "image": "https://ipfs.io/ipfs/"+titleImageHashResult.path,
    "external_link": "https://www.patchwork-kingdoms.com/",
    "seller_fee_basis_points": 100, // 100 Indicates a 1% seller fee.
    "fee_recipient": "0x34aA3F359A9D614239015126635CE7732c18fDF3" // Where seller fees will be paid to.
  }

  const contractURIHashResult = await ipfs.add(JSON.stringify(contractURI))
  console.log("Put this in the contract for the contractURI ---->",contractURIHashResult.path)

  await sleep(30);

  const GigaNFT = await ethers.getContractFactory("GigaNFT");
  const GigaAddress = JSON.parse(fs.readFileSync("./deployments/"+TARGETNETWORK+"/GigaNFT.json")).address
  console.log("connecting to gigaNFT at",GigaAddress)
  const gigaContract = await GigaNFT.attach(
    GigaAddress
  );
  const currentSupply = (await gigaContract.totalSupply()).toNumber()

  console.log("gigaNFT currentSupply",currentSupply)

  await sleep(3000);

  // // // // // // // // // // // // // // // // // //
  const assetDirectory = "./assets";

  console.log("READING ASSETS",assetDirectory)
  const files = await fs.readdirSync( assetDirectory+"/Visuals" )

  let count = 0;

  let imageArray = []
  let jsonArray = []

  for (let id=1;id<=TOKEN_LIMIT;id++) {
    //console.log("#",id)

    const imageLocation = assetDirectory+"/Visuals/Patchwork Kingdoms #"+id+".png"
    //console.log("READING",imageLocation)

    const imageContent = await fs.readFileSync(imageLocation)
    imageArray[id-1] = {
      path: id+'.png',
      content: imageContent
    };



    // learning how to add to IPFS without actually adding... just getting the hash...
    //const imageHashResult = await ipfs.add(imageContent,{onlyHash: true})

    //read the metadata...
    const osMetaDataFile = assetDirectory+"/Metadata/Patchwork Kingdoms #"+id+" - metadata.json"
    //console.log("osMetaDataFile",osMetaDataFile)
    const metadataContent = await fs.readFileSync(osMetaDataFile)
    let metadataObject = JSON.parse(metadataContent.toString())

    //console.log("METADATA LOADED",metadataObject)
    //metadataObject.image = "https://ipfs.io/ipfs/"+imageHashResult.path
    //metadataObject.image = "http://localhost:3000/revealedassets/"+id+".png"
    metadataObject.image = "https://"+TARGETBUCKET+".s3.amazonaws.com/"+id+".png"

    metadataObject.external_url = EXTERNAL_URL+"/"+id

    //console.log("metadataObject",metadataObject)
    //const manifestHashResult = await ipfs.add(JSON.stringify(metadataObject),{onlyHash: true})

    //console.log("\""+manifestHashResult.path+"\",")
    if(id<=HARD_REVEAL_LIMIT && id<=currentSupply){
      const revealFolder = "../react-app/public/revealedassets"

      try{ await fs.mkdirSync( revealFolder ) }catch(e){}

      console.log("revealing ",id)

      try{ fs.writeFileSync(revealFolder+"/"+id+".json",JSON.stringify(metadataObject))}catch(e){console.log(e)}

      try{ fs.writeFileSync(revealFolder+"/"+id+".png",imageContent)}catch(e){console.log(e)}
    }



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

    await sleep(delayMS);
  }


  if(UPLOAD_ASSETS_TO_IPFS){
    console.log("uploading images into an ipfs folder..."/*,imageArray*/)
    let added = await ipfs.add(imageArray, { wrapWithDirectory: true, onlyHash: !UPLOAD_ASSETS_TO_IPFS })
    console.log("Here is the final IPFS folder for IMAGES:",added)

    const imageIPFSfolder = added.cid.toString()

    for (let id=1;id<=TOKEN_LIMIT;id++) {
      const osMetaDataFile = assetDirectory+"/Metadata/Patchwork Kingdoms #"+id+" - metadata.json"
      const metadataContent = await fs.readFileSync(osMetaDataFile)
      let metadataObject = JSON.parse(metadataContent.toString())
      metadataObject.image = "https://ipfs.io/ipfs/"+imageIPFSfolder+"/"+id+".png"
      metadataObject.external_url = EXTERNAL_URL+"/"+id
      //console.log("metadataObject",metadataObject)

      jsonArray[id-1] = {
        path: id+'.json',
        content: JSON.stringify(metadataObject)
      };
    }

    console.log("uploading metadata into an ipfs folder..."/*,imageArray*/)
    let metadataAdded = await ipfs.add(jsonArray, { wrapWithDirectory: true, onlyHash: !UPLOAD_ASSETS_TO_IPFS })
    console.log("Here is the final IPFS folder for METADATA:",metadataAdded)

    console.log("You want to call setBaseUri to https://ipfs.io/ipfs/"+metadataAdded.cid.toString()+"/")
  }

  console.log("Syncing with S3...")
  const BUCKETNAME = TARGETBUCKET;

  let credentials = {};
  try {
    credentials = JSON.parse(fs.readFileSync("aws.json"));
  } catch (e) {
    console.log(e);
    console.log(
      '☢️   Create an aws.json credentials file in packages/react-app/ like { "accessKeyId": "xxx", "secretAccessKey": "xxx", "region": "xxx" } ',
    );
    process.exit(1);
  }

  credentials.bucket = BUCKETNAME;

  const options = {
    useFoldersForFileTypes: false,
    useIAMRoleCredentials: false,
  };


  var AWS = require('aws-sdk');
  // Load credentials and set Region from JSON file
  AWS.config.loadFromPath('./aws.json');

  // Create S3 service object
  s3 = new AWS.S3({apiVersion: '2006-03-01'});

  // Create params JSON for S3.createBucket
  var bucketParams = {
    Bucket : BUCKETNAME,
    ACL : 'public-read'
  };

  // Create params JSON for S3.setBucketWebsite
  var staticHostParams = {
    Bucket: BUCKETNAME,
    WebsiteConfiguration: {
    ErrorDocument: {
      Key: 'index.html'
    },
    IndexDocument: {
      Suffix: 'index.html'
    },
    }
  };

  console.log("bucketParams",bucketParams)
  // Call S3 to create the bucket
  s3.createBucket(bucketParams, function(err, data) {
    console.log("RESULT",err,data)
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Bucket URL is ", data.Location);
      // Set the new policy on the newly created bucket
      s3.putBucketWebsite(staticHostParams, function(err, data) {
        if (err) {
          // Display error message
          console.log("Error", err);
        } else {
          // Update the displayed policy for the selected bucket
          console.log("Success... UPLOADING!", data);

          ///
          /// After the bucket is created, we upload to it:
          ///
          s3FolderUpload(revealFolder, credentials, options /* , invalidation */);
        }
      });
    }
  });


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
