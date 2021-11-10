/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");

const main = async () => {

  console.log("\n\n 📡 Deploying...\n");

  //const WETH = await deploy("WETH9")
  //deployer is 0x02f6e9f21a4aac2eae9865a90ea8f5ee741d9b58 <-- hit with faucet funds

  const allocator = await deploy(
    "Allocator",
    [
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH9 address on main
      "0x4F2b9D0e9FCA80e967CEDBB95a7356D388605ED1", //gnosis safe with auryn, austin, and owocki as owners
      [
        "0xFcC41c4614bD464bA28ad96f93aAdaA7bA6c8680",//clr fund
        "0xde21F729137C5Af1b01d73aF1dC21eFfa2B8a0d6",// gitcoin
        "0x97843608a00e2bbc75ab0C1911387E002565DEDE"// buidl guidl safe
      ],
      [
        33,
        33,
        33
      ]
    ])

  console.log("ADDRESS IS",allocator.address)
  console.log("GAS LIMIT",allocator.deployTransaction.gasLimit.toNumber())
  console.log("GAS PRICE",allocator.deployTransaction.gasPrice.toNumber())

  //await allocator.setWETHAddress("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")//WETH ADDRESS https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2#writeContract

/*
  await allocator.setAllocation(
    [
      "0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",
      "0x34aA3F359A9D614239015126635CE7732c18fDF3",
      "0xfc837221b69ebe426Cc2C520290bD4d4f8Be0DE8"
    ],
    [
      20,
      80,
      20
    ])
*/
  //const exampleToken = await deploy("ExampleToken",[allocator.address])

  //const deployerWallet = ethers.provider.getSigner()

  /*
  await deployerWallet.sendTransaction({
    to: allocator.address,
    value: ethers.utils.parseEther("10")
  })*/

/*
  await allocator.setAllocation(
    [
      "0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",
      "0x34aA3F359A9D614239015126635CE7732c18fDF3",
      "0xfc837221b69ebe426Cc2C520290bD4d4f8Be0DE8"
    ],
    [
      1,
      1,
      1
    ])
*/
  // const exampleToken = await deploy("ExampleToken")
  // const examplePriceOracle = await deploy("ExamplePriceOracle")
  // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])

  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n"
  );
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
