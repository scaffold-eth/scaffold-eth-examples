import { networkIDtoSymbol } from '@dethcrypto/eth-sdk/dist/abi-management/networks';

import { externalContractsAddressMap } from '../config/externalContractsConfig';

/**
 * used by eth-sdk and `yarn contracts:build`
 */
export const contractsByNetworkName: Record<string, any> = {};
Object.keys(externalContractsAddressMap)
  .map(Number)
  .forEach((chainId) => {
    const networkName = networkIDtoSymbol[chainId as keyof typeof networkIDtoSymbol];
    contractsByNetworkName[networkName] = externalContractsAddressMap[chainId];
  });
