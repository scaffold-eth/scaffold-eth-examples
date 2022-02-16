import { ICoreOptions } from 'web3modal';

import { LOCAL_PROVIDER } from '~~/config/appConfig';
import { NETWORKS } from '~~/models/constants/networks';

const INFURA_ID = import.meta.env.VITE_KEY_INFURA;

export const web3ModalConfigKeys = {
  coinbaseKey: 'custom-walletlink',
  localhostKey: 'custom-localhost',
} as const;

export const getWeb3ModalConfig = async (): Promise<Partial<ICoreOptions>> => {
  const providerOptions: Record<string, any> = {};

  // === PORTIS
  try {
    const Portis = (await import('@portis/web3')).default;
    providerOptions.portis = {
      display: {
        logo: 'https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png',
        name: 'Portis',
        description: 'Connect to Portis App',
      },
      package: Portis,
      options: {
        id: '6255fb2b-58c8-433b-a2c9-62098c05ddc9',
      },
    };
  } catch (e) {
    console.log('Failed to load config for web3 connector Portis: ', e);
  }

  // === FORTMATIC
  try {
    const Fortmatic = (await import('fortmatic')).default;
    providerOptions.fortmatic = {
      package: Fortmatic,
      options: {
        key: 'pk_live_5A7C91B2FC585A17',
      },
    };
  } catch (e) {
    console.log('Failed to load config for web3 connector Fortmatic: ', e);
  }

  // === COINBASE WALLETLINK
  try {
    const { WalletLink } = await import('walletlink');
    // note: ⚠️ meta mask and coinbase wallets may clash.
    // you might need to check this: https://github.com/Web3Modal/web3modal/issues/316

    // Coinbase walletLink init
    const walletLink = new WalletLink({
      appName: 'coinbase',
    });
    // WalletLink provider
    const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

    const coinbaseWalletLink = {
      display: {
        logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
        name: 'Coinbase',
        description: 'Connect to your Coinbase Wallet (not coinbase.com)',
      },
      package: walletLinkProvider,
      connector: async (provider: any, _options: any): Promise<any> => {
        await provider.enable();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return provider;
      },
    };
    providerOptions[web3ModalConfigKeys.coinbaseKey] = coinbaseWalletLink;
  } catch (e) {
    console.log('Failed to load config for web3 connector Coinbase WalletLink: ', e);
  }

  // === WALLETCONNECT
  try {
    const WalletConnectProvider = (await import('@walletconnect/ethereum-provider')).default;
    const walletConnectEthereum = {
      package: WalletConnectProvider,
      options: {
        bridge: 'https://polygon.bridge.walletconnect.org',
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`,
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: 'https://dai.poa.network',
        },
      },
    };
    providerOptions.walletconnect = walletConnectEthereum;
  } catch (e) {
    console.log('Failed to load config for web3 connector WalletConnect: ', e);
  }

  // === AUTHEREUM
  try {
    const Authereum = (await import('authereum')).default;
    providerOptions.authereum = {
      package: Authereum,
    };
  } catch (e) {
    console.log('Failed to load config for web3 connector Authereum: ', e);
  }

  // === LOCALHOST STATIC
  try {
    if (LOCAL_PROVIDER) {
      const { ConnectToStaticJsonRpcProvider } = await import('eth-hooks/context');
      const { StaticJsonRpcProvider } = await import('@ethersproject/providers');
      const localhostStaticConnector = {
        display: {
          logo: 'https://avatars.githubusercontent.com/u/56928858?s=200&v=4',
          name: 'BurnerWallet',
          description: '🔥 Connect to localhost with a burner wallet 🔥',
        },
        package: StaticJsonRpcProvider,
        connector: ConnectToStaticJsonRpcProvider,
        options: {
          chainId: NETWORKS.localhost.chainId,
          rpc: {
            [NETWORKS.localhost.chainId]: NETWORKS.localhost.rpcUrl,
          },
        },
      };
      providerOptions[web3ModalConfigKeys.localhostKey] = localhostStaticConnector;
    }
  } catch (e) {
    console.log('Failed to load config for Localhost Static Connector: ', e);
  }

  // network: 'mainnet', // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.

  // const torus = {
  //   package: Torus,
  //   options: {
  //     networkParams: {
  //       host: 'https://localhost:8545',
  //       chainId: 1337,
  //       networkId: 1337, // optional
  //     },
  //     config: {
  //       buildEnv: 'development',
  //     },
  //   },
  // };

  return {
    cacheProvider: true,
    theme: 'light',
    providerOptions,
  };
};
