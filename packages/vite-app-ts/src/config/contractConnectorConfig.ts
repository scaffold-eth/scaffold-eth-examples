/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createConnectorForExternalContract, createConnectorForHardhatContract } from 'eth-hooks/context';

import hardhatContractsJson from '../generated/hardhat_contracts.json';

import { externalContractsAddressMap } from './externalContractsConfig';

import * as hardhatContracts from '~~/generated/contract-types';
import * as externalContracts from '~~/generated/external-contracts/esm/types';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * ### Instructions
 * 1. edit externalContractsConfig.ts to add your external contract addresses.
 * 2. edit `contractConnectorConfig` function below and add them to the list
 * 3. run `yarn contracts:build` to generate types for contracts
 * 4. run `yarn deploy` to generate hardhat_contracts.json
 *
 * ### Summary
 * - called  by useAppContracts
 * @returns
 */
export const contractConnectorConfig = () => {
  try {
    const result = {
      // 🙋🏽‍♂️ Add your hadrdhat contracts here
      DeNFT: createConnectorForHardhatContract('DeNFT', hardhatContracts.DeNFT__factory, hardhatContractsJson),
      MockNFTContract: createConnectorForHardhatContract(
        'MockNFTContract',
        hardhatContracts.MockNFTContract__factory,
        hardhatContractsJson
      ),
      MockERC20: createConnectorForHardhatContract(
        'MockERC20',
        hardhatContracts.MockERC20__factory,
        hardhatContractsJson
      ),
      PriceOracleNFT: createConnectorForHardhatContract(
        'PriceOracleNFT',
        hardhatContracts.PriceOracleNFT__factory,
        hardhatContractsJson
      ),

      // 🙋🏽‍♂️ Add your external contracts here, make sure to define the address in `externalContractsConfig.ts`
      DAI: createConnectorForExternalContract('DAI', externalContracts.DAI__factory, externalContractsAddressMap),
    } as const;

    return result;
  } catch (e) {
    console.error(
      '❌ contractConnectorConfig: ERROR with loading contracts please run `yarn contracts:build or yarn contracts:rebuild`.  Then run `yarn deploy`!',
      e
    );
  }

  return undefined;
};

/**
 * ### Summary
 * This type describes all your contracts, it is the return of {@link contractConnectorConfig}
 */
export type TAppConnectorList = NonNullable<ReturnType<typeof contractConnectorConfig>>;
