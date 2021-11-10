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

    console.log("💵  Deploying Supporters\n");
    const supporters = await deploy("Supporters")
    await supporters.supporterUpdate("0x34aA3F359A9D614239015126635CE7732c18fDF3",true);
    await supporters.supporterUpdate("0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",true);

    console.log("🧮  Deploying Support Round\n");
    const supportRound = await deploy("SupportRound", [ supporters.address, 120 * 1 ]);/// <-- ROUND DURATION

    console.log("📲  Deploying Bank\n");
    const guildBank = await deploy("Bank",[
      [
        "0x34aA3F359A9D614239015126635CE7732c18fDF3",
        "0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1"
      ],
      1
    ])

   console.log("📲  Deploying Projects\n");
   const projects = await deploy("Projects")


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
        projectOwner: "0x60Ca282757BA67f3aDbF21F3ba2eBe4Ab3eb01fc"//adamfuller.eth
      },
    ]

   for(let g in genesisProjects){
     console.log("     "+genesisProjects[g].title+" ("+chalk.gray(utils.formatBytes32String(genesisProjects[g].title))+")")
     const id = await projects.projectId(genesisProjects[g].title)

     console.log("          🏦 Deploying Project Bank\n");
     const projectBank = await deploy("Bank",[
       [
         genesisProjects[g].projectOwner,
         "0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1"
       ],
       1
     ])


     console.log("     id:"+chalk.gray(id))
     await projects.updateProject(
       genesisProjects[g].title,
       genesisProjects[g].desc,
       genesisProjects[g].repo,
       projectBank.address
     )

     console.log("     ---> Adding Project to Support Round ")
     await supportRound.addRecipient(projectBank.address,id)
   }
   console.log(" ");

   console.log("🛠  Deploying Builders\n");
   const builders = await deploy("Builders")

   await builders.builderUpdate("0x025645A569b3e60F803bFFC88f0E2e38b7526B3d",true);
   await builders.builderUpdate("0x6361cbe71857ace00996e5fa9b0ad77337ffe619",true);
   await builders.builderUpdate("0xe353d9aeab38f476517a3f6cfdee28b366a985a2",true);
   await builders.builderUpdate("0x1c340771b688ab36af177566f187aea25deea546",true);
   await builders.builderUpdate("0xa0bed8a4e39c3881f71c223588227bb85ed86ff2",true);
   await builders.builderUpdate("0xb858b4ee278bf53ed51bc1fe9b17f1217dc3e197",true);
   await builders.builderUpdate("0xE09750abE36beA8B2236E48C84BB9da7Ef5aA07c",true);
   await builders.builderUpdate("0x6361cbe71857ace00996e5fa9b0ad77337ffe619",false);
   await builders.builderUpdate("0xe353d9aeab38f476517a3f6cfdee28b366a985a2",false);

   console.log("🛠  Deploying Quests\n");
   const quests = await deploy("Quests",[ projects.address, builders.address ])
   console.log(quests.address)

   console.log("🚩 Adding Quests")
   let genesisQuests = [
     {
       project: "🏗 ScaffoldETH.io",
       title: "📄 The Graph Tutorial",
       desc: "create a tutorial the explains how to build a subgraph",
       link: "",
     },
     {
       project: "🏗 ScaffoldETH.io",
       title: "📚 Possible Refactor",
       desc: "originally 🏗 scaffold-eth used create-eth-app but it doesn't leverage it now",
       link: "",
     },
     {
       project: "🏗 ScaffoldETH.io",
       title: "📦 Event Parser for Owner Lists",
       desc: "list only the active owners in an owner list component by parsing many bool events",
       link: "",
     },
     {
       project: "🏗 ScaffoldETH.io",
       title: "📦 Convert Floats to BigNumbers",
       desc: "Stop tracking things like price and etherInput using floats, use BigNumbers instead",
       link: "",
     },
     {
       project: "🎨 Nifty.ink",
       title: "📦 Use The Graph for the frontend",
       desc: "upgrade to using 🛰 The Graph instead of events for a faster frontend",
       link: "",
     },
     {
       project: "🎨 Nifty.ink",
       title: "📦 Collabland Telegram Bot access per Ink ownership",
       desc: "work with Collabland for a system to allow specific inks to control access to a chat",
       link: "",
     },
     {
       project: "🧙‍♂️ InstantWallet.io",
       title: "🐛 First click to send button fails",
       desc: "when the wallet is first loading the send button should look disabled or transparent",
       link: "",
     },
     {
       project: "🧙‍♂️ InstantWallet.io",
       title: "📦 add zksync",
       desc: "another popular L2 is zksync, add it as an option to send",
       link: "https://zksync.io/dev/tutorial.html",
     },
     {
       project: "🔴 Optimistic.Money",
       title: "📚 Initial Exploration",
       desc: "get a private repo set up using the secret OVM RPC to explore how it might work",
       link: "",
     },
     {
       project: "🏗 ScaffoldETH.io",
       title: "📄 The Graph Tutorial",
       desc: "create a tutorial the explains how to build and use a subgraph for 🏗 scaffold-eth",
       link: "",
     },

   ]

   for(let g in genesisQuests){
     console.log("        "+genesisQuests[g].project+" : "+genesisQuests[g].title)
     const id = await quests.questId(utils.formatBytes32String(genesisQuests[g].project), genesisQuests[g].title)//questId( bytes32 project, string memory title )
     console.log("        "+chalk.gray(id))
     const projectId = await projects.projectId(genesisQuests[g].project)
     console.log("         project:"+chalk.gray(projectId))
     const owner = await projects.projectOwner(projectId)
     console.log("         owner:",chalk.gray(owner))
     if(owner=="0x0000000000000000000000000000000000000000"){
       console.log("ERROR QUEST WITH UNKNOWN PROJECT")
     }else{
       await quests.updateQuest(//updateQuest(bytes32 project, string memory title, string memory desc)
         projectId,
         genesisQuests[g].title,
         genesisQuests[g].desc,
         genesisQuests[g].link
       )
     }

   }
   console.log(" ");
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
