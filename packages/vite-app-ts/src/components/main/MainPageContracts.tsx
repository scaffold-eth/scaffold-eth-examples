import { GenericContract } from 'eth-components/ant/generic-contract';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC } from 'react';
import { Route } from 'react-router-dom';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useAppContracts } from '~~/config/contractContext';
import { NETWORKS } from '~~/models/constants/networks';
export interface IMainPageContractsProps {
  scaffoldAppProviders: IScaffoldAppProviders;
}

/**
 * 🎛 this scaffolding is full of commonly used components
    this <GenericContract/> component will automatically parse your ABI
    and give you a form to interact with it locally
 * @param props
 * @returns
 */
export const MainPageContracts: FC<IMainPageContractsProps> = (props) => {
  const ethersContext = useEthersContext();
  const mainnetDai = useAppContracts('DAI', NETWORKS.mainnet.chainId);
  // const yourContract = useAppContracts('YourContract', ethersContext.chainId);
  const priceContract = useAppContracts('PriceOracleNFT', ethersContext.chainId);
  const deNft = useAppContracts('DeNFT', ethersContext.chainId);
  const mockToken = useAppContracts('MockERC20', ethersContext.chainId);

  if (ethersContext.account == null) {
    return <></>;
  }

  return (
    <>
      <Route path="/denft">
        <GenericContract
          contractName="DeNFT"
          contract={deNft}
          mainnetAdaptor={props.scaffoldAppProviders.mainnetAdaptor}
          blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
        />
      </Route>
      <Route path="/price-oracle-nft">
        <GenericContract
          contractName="PriceOracleNFT"
          contract={priceContract}
          mainnetAdaptor={props.scaffoldAppProviders.mainnetAdaptor}
          blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
        />
      </Route>
      <Route path="/mock-token">
        <GenericContract
          contractName="MockERC20"
          contract={mockToken}
          mainnetAdaptor={props.scaffoldAppProviders.mainnetAdaptor}
          blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
        />
      </Route>
    </>
  );
};
