/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers, deploy } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require("ipfs-http-client");
const path = require('path');
const s3FolderUpload = require("s3-folder-upload");


const revealFolder = "../react-app/public/revealedassets"


    console.log("Syncing with S3...")
    const TARGETBUCKET = "giganftassetrevealtwo"

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


    const BUCKETNAME = TARGETBUCKET;

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

    // Call S3 to create the bucket
    s3.createBucket(bucketParams, function(err, data) {
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
