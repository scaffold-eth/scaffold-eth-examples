import '@typechain/hardhat';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import '@tenderly/hardhat-tenderly';
import 'hardhat-deploy';

import { ethers } from 'ethers';
import { HardhatEthersHelpers } from 'hardhat-deploy-ethers/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import 'hardhat-deploy/src/type-extensions';

// export type ContractJson = {
//   _format: string;
//   contractName: string;
//   abi: Record<string, object>[];
//   bytecode: string;
//   deployedBytecode: string;
//   linkReferences: Record<string, object>;
//   deployedLinkReferences: Record<string, object>;
//   address: string;
// };

export type { HardhatRuntimeEnvironment as HardhatRuntimeEnvironmentExtended };

export type THardhatDeployEthers = typeof ethers & HardhatEthersHelpers;
