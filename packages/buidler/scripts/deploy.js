/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("@nomiclabs/buidler");
const { utils } = require("ethers");
const R = require("ramda");

const main = async () => {
  // ? Tip: if on VSCode, install "Better Comments" extension
  console.log("\n\n 📡 Deploying...\n");

  // auto deploy to read contract directory and deploy them all (add ".args" files for arguments)
  //await autoDeploy();
  // OR
  // custom deploy (to use deployed addresses dynamically for example:)
  console.log("🛰  deploying MVPCLR")
  const MVPCLR = await deploy("MVPCLR",[ 3600 * 24 * 6 /* 3600*8 == 8 hrs */])// 778111



  let genesisProjects = [
     {
       title: "🔥 xDAI.io",
       desc: "OG burner wallet rebuild as instant wallet fork so people stop having a bad time forking it",
       repo: "https://github.com/austintgriffith/burner-wallet",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🔵 Circles.Maybe",
       desc: "Build some weird experiment on CirclesUBI",
       repo: "https://github.com/austintgriffith/scaffold-eth",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🏰 BuidlGuidl.com - Round 2",
       desc: "Pass funding on to the Round 2 matching pool",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/address-registry-example",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🏰 BuidlGuidl.com - Round 1",
       desc: "Pass funding on to the Round 1 matching pool",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/address-registry-example",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🏴‍☠️  Galleass.io",
       desc: "Rebuild Galleass.io using 🏗 scaffold-eth as a game build demo",
       repo: "https://github.com/austintgriffith/galleass",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🐶 DAOG.io",
       desc: "Rebuild DAOG.io using 🏗 scaffold-eth as a game build demo",
       repo: "https://github.com/austintgriffith/galleass",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🏷 FreeNS.io",
       desc: "Free MVP ENS-like service on L2",
       repo: "https://github.com/austintgriffith/scaffold-eth",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🔏 Signator.io",
       desc: "Simple signer app rebuilt in 🏗 scaffold-eth",
       repo: "https://github.com/austintgriffith/signatorio",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "⚙️ Buidl.sh",
       desc: "The 🏗 scaffold-eth dev stack in a single, delightful CLI (maybe even a docker container we can host at first)",
       repo: "",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🍀 NFTDAO.com",
       desc: "MVP of a DAO that can control an NFT",
       repo: "https://github.com/austintgriffith/scaffold-eth",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🏯 Haiku.Exchange",
       desc: "Mint haikus as ERC721s and exchange them on a curve",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/haiku.exchange",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "‍👩‍🎤 xNFT.io",
       desc: "Super clean Nifty.ink fork that is for image uploads instead of inks",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/nifty-ink-dev",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "👛 Multisig.Holdings",
       desc: "Meta-multi-sig factory and frontend where anyone can spin up an MVP signature based multisig that streams",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/meta-multi-sig",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🔴 Optimistic.Money",
       desc: "InstantWallet.io fork for deposit/send on OVM testnet",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/instantwallet-dev-session",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "💰 Emoji.Support",
       desc: "MVP quadratic funding in a box",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/emoji-support",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🏗 ScaffoldETH.io",
       desc: "Forkable Ethereum dev stack and community",
       repo: "https://github.com/austintgriffith/scaffold-eth",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "⚖️ Backlog.Exchange",
       desc: "Token-weighted github backlog ordering app",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/backlog-market",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🧙‍♂️ InstantWallet.io",
       desc: "Simple and forkable burner wallet made with 🏗 scaffold-eth.",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/instantwallet-dev-session",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"
     },
     {
       title: "🎨 Nifty.ink",
       desc: "Instant onboarding NFT platform powered by meta transactions, xDAI, and bridged to Ethereum.",
       repo: "https://github.com/austintgriffith/scaffold-eth/tree/nifty-ink-dev",
       projectOwner: "0x97843608a00e2bbc75ab0C1911387E002565DEDE"//adamfuller.eth
     },
   ]

   console.log("😺  Recipients...")
   for(let p in genesisProjects){
     console.log(" --> ",genesisProjects[p].title)
     await MVPCLR.addRecipient(genesisProjects[p].projectOwner,ethers.utils.formatBytes32String(genesisProjects[p].title),genesisProjects[p].desc)// 70-90k gas ~>$1 40G
   }




  //await MVPCLR.addRecipient("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",ethers.utils.formatBytes32String("🐰 Cotton Tailor"),"http://localhost:3000")
  //await MVPCLR.addRecipient("0xfdE139e04963094650bAAD2686ca65A0cF04373C",ethers.utils.formatBytes32String("🦊 Foxy Optics"),"http://localhost:3000")
  //await MVPCLR.addRecipient("0x34aA3F359A9D614239015126635CE7732c18fDF3",ethers.utils.formatBytes32String("🐻 Bear Market Liquors"),"http://localhost:3000")
  //await MVPCLR.addRecipient("0x1bc77cea22eC6D9e3Da390B0409bE264f5E84e66",ethers.utils.formatBytes32String("🐹 Gerbilnomics Labs"),"http://localhost:3000")
  //await MVPCLR.addRecipient("0xB2ac59aE04d0f7310dC3519573BF70387b3b6E3a",ethers.utils.formatBytes32String("🐭 Whisker's Widgets"),"http://localhost:3000")

  console.log("⏰  Starting round...")
  await MVPCLR.startRound() // 45k gas  ~<$1 40G

  //EXAMPLE OF HOW TO DONATE HERE:
  //await MVPCLR.donate(0,{ value: ethers.utils.parseEther("0.01") })  // 48212
  //await MVPCLR.donate(1,{ value: ethers.utils.parseEther("0.01") })

  console.log("🔑 Sending ownership...")
  /// TRANSFER THE CLR TO YOU AFTER IT IS DEPLOYED:
  await MVPCLR.transferOwnership("0x34aA3F359A9D614239015126635CE7732c18fDF3")//austingriffith.eth



  /*

    console.log("🏦 Adding 1 ETH 3 times to matching funds:",matchingFunds)

  var matchingFunds = {
    to: MVPCLR.address,
    value: ethers.utils.parseEther("1")
  };

  const wallet = ethers.provider.getSigner()
  await wallet.sendTransaction(matchingFunds)
  await wallet.sendTransaction(matchingFunds)
  await wallet.sendTransaction(matchingFunds)*/


  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/buidler/artifacts/"),
    "\n\n"
  );
};

const autoDeploy = async () => {
  const allDeployed = [];
  const contractList = fs
    .readdirSync(config.paths.sources)
    .filter((fileName) => isSolidity(fileName));

  // loop through each solidity file from config.path.sources and deploy it
  // abi encode any args, if found
  // ! do not use .forEach in place of this loop
  for (let i=0; i < contractList.length; i++) {
    const file = contractList[i];
    const contractName = file.replace(".sol", "");
    const contractArgs = readArgsFile(contractName);
    const deployed = await deploy(contractName, contractArgs);

    allDeployed.push(deployed);
  }

  return allDeployed;
};

const deploy = async (contractName, _args) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName);
  const deployed = await contractArtifacts.deploy(...contractArgs);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  console.log(
    " 📄",
    chalk.cyan(contractName),
    "deployed to:",
    chalk.magenta(deployed.address),
  );

  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));

  return deployed;
};

// ------ utils -------

// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan
const abiEncodeArgs = (deployed, contractArgs) => {
  // not writing abi encoded args if this does not pass
  if (
    !contractArgs ||
    !deployed ||
    !R.hasPath(["interface", "deploy"], deployed)
  ) {
    return "";
  }
  const encoded = utils.defaultAbiCoder.encode(
    deployed.interface.deploy.inputs,
    contractArgs
  );
  return encoded;
};

// checks if it is a Solidity file
const isSolidity = (fileName) =>
  fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp") < 0;

const readArgsFile = (contractName) => {
  let args = [];
  try {
    const argsFile = `./contracts/${contractName}.args`;
    if (!fs.existsSync(argsFile)) return args;
    args = JSON.parse(fs.readFileSync(argsFile));
  } catch (e) {
    console.log(e);
  }
  return args;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
