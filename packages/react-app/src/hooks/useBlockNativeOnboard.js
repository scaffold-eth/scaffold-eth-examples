import { useState, useMemo } from "react";
import { INFURA_ID } from "../constants";
import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import trezorModule from "@web3-onboard/trezor";
import ledgerModule from "@web3-onboard/ledger";
import walletConnectModule from "@web3-onboard/walletconnect";
import walletLinkModule from "@web3-onboard/walletlink";
import portisModule from "@web3-onboard/portis";
import fortmaticModule from "@web3-onboard/fortmatic";
import torusModule from "@web3-onboard/torus";
import keepkeyModule from "@web3-onboard/keepkey";
import keystoneModule from "@web3-onboard/keystone";
import blocknativeLogo from "../blocknative-logo";

export default function UseBlockNativeOnboard() {

  // Checkout Blocknative packages for web3-onboard here - https://www.npmjs.com/package/@web3-onboard/core
  // Each wallet type is a separate node package allowing devs to keep their
  // onboarding experience, fast light and fully customizable

  const injected = injectedModule({
    custom: [
      // include custom injected wallet modules here
    ],
    filter: {
      // mapping of wallet label to filter here
    },
  });
  
  const onboardWalletLink = walletLinkModule();
  
  const walletConnect = walletConnectModule();
  const portis = portisModule({
    apiKey: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
  });
  
  const fortmatic = fortmaticModule({
    apiKey: "pk_live_5A7C91B2FC585A17",
  });
  
  const torus = torusModule();
  const ledger = ledgerModule();
  const keepkey = keepkeyModule();
  const keystone = keystoneModule();
  
  const trezorOptions = {
    email: "test@test.com",
    appUrl: "https://www.scaffold-eth.com",
  };
  const trezor = trezorModule(trezorOptions);

  const onboard = useMemo(() => {

    return Onboard({
      wallets: [ledger, trezor, walletConnect, keepkey, keystone, onboardWalletLink, injected, fortmatic, portis, torus],
      chains: [
        {
          id: "0x1",
          token: "ETH",
          label: "Ethereum Mainnet",
          rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
        },
        {
          id: "0x3",
          token: "tROP",
          label: "Ethereum Ropsten Testnet",
          rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`,
        },
        {
          id: "0x4",
          token: "rETH",
          label: "Ethereum Rinkeby Testnet",
          rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
        },
        {
          id: "0x89",
          token: "MATIC",
          label: "Matic Mainnet",
          rpcUrl: "https://matic-mainnet.chainstacklabs.com",
        },
      ],
      appMetadata: {
        name: "Scaffold-Eth",
        icon: "🏗",
        logo: blocknativeLogo,
        description: "Scaffold Eth Example of web3-onboard from Blocknative",
        recommendedInjectedWallets: [
          { name: "MetaMask", url: "https://metamask.io" },
          { name: "Coinbase", url: "https://wallet.coinbase.com/" },
        ],
        agreement: {
          version: "1.0.0",
          termsUrl: "https://www.blocknative.com/terms-conditions",
          privacyUrl: "https://www.blocknative.com/privacy-policy",
        },
      },
      // example customising copy
      // i18n: {
      //   en: {
      //     connect: {
      //       selectingWallet: {
      //         header: 'custom text header'
      //       }
      //     }
      //   }
      // }
    });

  }, []);

  return onboard;
}
