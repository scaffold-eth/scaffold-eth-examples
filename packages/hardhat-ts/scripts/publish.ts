import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import * as fs from 'fs';
import path from 'path';

import * as chalk from 'chalk';
import * as hre from 'hardhat';

const publishGenerated = '../vite-app-ts/src/generated/contracts';
const publishDir = `${publishGenerated}/contracts`;
const deploymentsDir = './generated/deployments';
const typechainDir = './generated/typechain';
const graphDir = '../subgraph';

const publishContract = (contractName: string, networkName: string): boolean => {
  try {
    const contract = fs.readFileSync(`${deploymentsDir}/${networkName}/${contractName}.json`).toString();
    const contractJson: { address: string; abi: [] } = JSON.parse(contract);
    const graphConfigPath = `${graphDir}/config/config.json`;
    let graphConfigStr = '{}';
    try {
      if (fs.existsSync(graphConfigPath)) {
        graphConfigStr = fs.readFileSync(graphConfigPath).toString() as any;
      }
    } catch (e) {
      console.log(e);
    }

    const graphConfig = JSON.parse(graphConfigStr);
    graphConfig[`${networkName}_${contractName}Address`] = contractJson.address;

    const folderPath = graphConfigPath.replace('/config.json', '');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    fs.writeFileSync(graphConfigPath, JSON.stringify(graphConfig, null, 2));
    if (!fs.existsSync(`${graphDir}/abis`)) fs.mkdirSync(`${graphDir}/abis`);
    fs.writeFileSync(`${graphDir}/abis/${networkName}_${contractName}.json`, JSON.stringify(contractJson.abi, null, 2));

    console.log(' 📠 Published ' + chalk.green(contractName) + ' to the frontend.');
    // Hardhat Deploy writes a file with all ABIs in react-app/src/contracts/contracts.json
    // If you need the bytecodes and/or you want one file per ABIs, un-comment the following block.
    // Write the contracts ABI, address and bytecodes in case the front-end needs them
    // fs.writeFileSync(
    //   `${publishDir}/${contractName}.address.js`,
    //   `export default "${contract.address}";`
    // );
    // fs.writeFileSync(
    //   `${publishDir}/${contractName}.abi.js`,
    //   `exports default ${JSON.stringify(contract.abi, null, 2)};`
    // );
    // fs.writeFileSync(
    //   `${publishDir}/${contractName}.bytecode.js`,
    //   `export default "${contract.bytecode}";`
    // );

    return true;
  } catch (e) {
    console.log('Failed to publish ' + chalk.red(contractName) + ' to the subgraph.');
    console.log(e);
    return false;
  }
};

// eslint-disable-next-line @typescript-eslint/require-await
async function main(): Promise<void> {
  const deploymentSubdirs = fs.readdirSync(deploymentsDir);
  deploymentSubdirs.forEach(function (directory) {
    const files = fs.readdirSync(`${deploymentsDir}/${directory}`);
    files.forEach(function (file) {
      if (file.includes('.json')) {
        const contractName = file.replace('.json', '');
        publishContract(contractName, directory);
      }
    });
  });
  console.log('?  Published contracts to the subgraph package.');
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
