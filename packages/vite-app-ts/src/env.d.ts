interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: 'development' | 'production';

  readonly VITE_APP_TARGET_NETWORK: string;
  readonly VITE_RPC_MAINNET: string;
  readonly VITE_KEY_INFURA: string;
  readonly VITE_KEY_ETHERSCAN: string;
  readonly VITE_KEY_BLOCKNATIVE_DAPPID: string;
  readonly VITE_FAUCET_ALLOWED: boolean;
  readonly VITE_BUERNER_FALLBACK_ALLOWED: boolean;
  readonly CONNECT_TO_BURNER_AUTOMATICALLY: boolean;
  readonly MORALIS_SERVER: string;
  readonly MORALIS_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
