import { useBurnerSigner } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useEffect } from 'react';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { NETWORKS } from '~~/models/constants/networks';

export const useBurnerFallback = (appProviders: IScaffoldAppProviders, enable: boolean): void => {
  const ethersContext = useEthersContext();
  const burnerFallback = useBurnerSigner(appProviders.localAdaptor?.provider);
  const localAddress = appProviders.localAdaptor?.signer;

  useEffect(() => {
    /**
     * if the current provider is local provider then use the burner fallback
     */
    if (
      burnerFallback?.signer &&
      burnerFallback?.account !== ethersContext.account &&
      ethersContext.chainId === NETWORKS.localhost.chainId &&
      ethersContext.provider?.connection?.url === NETWORKS.localhost.rpcUrl &&
      ethersContext.changeSigner &&
      localAddress != null &&
      enable
    ) {
      void ethersContext.changeSigner?.(burnerFallback.signer);
    }
  }, [
    ethersContext.account,
    localAddress,
    ethersContext.changeSigner,
    burnerFallback.signer,
    burnerFallback?.account,
    ethersContext,
    enable,
  ]);
};
