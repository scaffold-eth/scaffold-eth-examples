import WalletConnectProvider from "@walletconnect/web3-provider";
//import Torus from "@toruslabs/torus-embed"
import WalletLink from "walletlink";
import { Alert, Button, Col, Menu, Row, Statistic, Card, Space, Divider, Spin, Badge } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation, useHistory } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Contract, GasGauge, Header, ThemeSwitch, AddressInput, Address } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useContractLoader,
  useContractReader,
  useExchangePrice,
  useGasPrice,
  useOnBlock,
  useUserSigner,
} from "./hooks";

const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.mainnet; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I )

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    /*torus: {
      package: Torus,
    },*/
    "custom-walletlink": {
      display: {
        logo:
          "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, options) => {
        await provider.enable();
        return provider;
      },
    },
  },
});

function useSearchParams() {
  let _params = new URLSearchParams(useLocation().search);
  return _params;
}

function App(props) {
  let location = useLocation();
  let history = useHistory();
  let searchParams = useSearchParams();

  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const [vestingContractAddress, setVestingContractAddress] = useState(
    searchParams.get("contractAddress") || "0x0a2d71bb453196c67da25ebd156a727f4d692162",
  );
  const [selectedContract, setSelectedContract] = useState(false);
  const [beneficiary, setBeneficiary] = useState();
  const [releasing, setReleasing] = useState(false);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userSigner = useUserSigner(injectedProvider, localProvider);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, {
    customAddresses: { GRTVESTING: vestingContractAddress },
  });

  const mainnetSigningContracts = useContractLoader(userSigner, {
    customAddresses: { GRTVESTING: vestingContractAddress },
  });

  useEffect(() => {
    if (searchParams.get("contractAddress")) {
      setSelectedContract(true);
    }
  }, []);

  useEffect(() => {
    setBeneficiary();
  }, [vestingContractAddress]);

  const vestedAmount = useContractReader(mainnetContracts, "GRTVESTING", "vestedAmount", [], 5000);
  const releasableAmount = useContractReader(mainnetContracts, "GRTVESTING", "releasableAmount", [], 5000);

  const VESTING_GRAPHQL = `
  {
    tokenLockWallet(id:"${vestingContractAddress}") {
      id
      beneficiary
      managedAmount
      tokensReleased
    }
  }
  `;
  const VESTING_GQL = gql(VESTING_GRAPHQL);
  const { loading, data } = useQuery(VESTING_GQL, { pollInterval: 5000 });
  if (loading) console.log("loading subgraph data");

  useEffect(() => {
    if (data && data.tokenLockWallet) {
      setBeneficiary(data.tokenLockWallet.beneficiary);
    } else if (data && !data.tokenLockWallet) {
      setBeneficiary("No contract found");
    }
  }, [data && data.tokenLockWallet]);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);
                    const tx = await ethereum.request({ method: "wallet_addEthereumChain", params: data }).catch();
                    if (tx) {
                      console.log(tx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
                .
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
        <Menu.Item key="/">
          <Link
            onClick={() => {
              setRoute("/");
            }}
            to="/"
          >
            Overview
          </Link>
        </Menu.Item>
        {selectedContract && beneficiary && (
          <Menu.Item key="/contract">
            <Link
              onClick={() => {
                setRoute("/contract");
              }}
              to="/contract"
            >
              Contract
            </Link>
          </Menu.Item>
        )}
      </Menu>
      <Switch>
        <Route exact path="/">
          <Card style={{ minWidth: 400, maxWidth: "90%", margin: "auto" }}>
            <Row align="middle" justify="center">
              <span style={{ verticalAlign: "middle", paddingRight: 5 }}>{"GRT Vesting Contract: "}</span>
              <AddressInput
                onChange={a => {
                  if (ethers.utils.isAddress(a)) {
                    searchParams.set("contractAddress", a);
                    history.push(`${location.pathname}?${searchParams.toString()}`);
                    setVestingContractAddress(a);
                    setSelectedContract(true);
                  }
                }}
              />
            </Row>
            {selectedContract &&
              (beneficiary && beneficiary !== "No contract found" ? (
                <>
                  <Divider />
                  <Space direction="vertical">
                    <Row align="middle" justify="center">
                      <span style={{ verticalAlign: "middle", paddingRight: 5, fontSize: 24 }}>{"Contract: "}</span>
                      <Address address={vestingContractAddress} ensProvider={mainnetProvider} fontSize={24} />
                    </Row>
                    <Row align="middle" justify="center">
                      <span style={{ verticalAlign: "middle", paddingRight: 5, fontSize: 24 }}>{"Beneficiary: "}</span>
                      <Address address={beneficiary} ensProvider={mainnetProvider} fontSize={24} />
                    </Row>
                    {/*<Statistic.Countdown title="Countdown" value={endTime && endTime * 1000} format={"D [Days] H : m : s"} />*/}
                    <Row align="middle" justify="center">
                      <Space>
                        <Statistic
                          title="Total"
                          value={
                            data &&
                            data.tokenLockWallet &&
                            data.tokenLockWallet.managedAmount &&
                            parseFloat(ethers.utils.formatEther(data.tokenLockWallet.managedAmount)).toFixed(2)
                          }
                        />
                        <Statistic
                          title="Vested"
                          value={vestedAmount && parseFloat(ethers.utils.formatEther(vestedAmount)).toFixed(2)}
                        />
                        <Statistic
                          title="Released"
                          value={
                            data &&
                            data.tokenLockWallet &&
                            data.tokenLockWallet.tokensReleased &&
                            parseFloat(ethers.utils.formatEther(data.tokenLockWallet.tokensReleased)).toFixed(2)
                          }
                        />
                        <Statistic
                          title="Releasable"
                          value={releasableAmount && parseFloat(ethers.utils.formatEther(releasableAmount)).toFixed(2)}
                        />
                      </Space>
                    </Row>
                    <Row align="middle" justify="center">
                      <Col>
                        <Button
                          style={{ marginTop: 8 }}
                          onClick={async () => {
                            setReleasing(true);
                            try {
                              const result = tx(mainnetSigningContracts.GRTVESTING.release());
                              console.log("awaiting metamask/web3 confirm result...", result);
                              setReleasing(false);
                              console.log(await result);
                            } catch (e) {
                              setReleasing(false);
                              console.log(e);
                            }
                          }}
                          disabled={
                            (address && beneficiary && address.toLowerCase() !== beneficiary.toLowerCase()) ||
                            (selectedChainId && selectedChainId !== 1)
                          }
                          loading={releasing}
                        >
                          Release!
                        </Button>
                        <br />
                        {address && beneficiary && address.toLowerCase() !== beneficiary.toLowerCase() && (
                          <>
                            <Badge status="error" text="Account is not the beneficiary" />
                            <br />
                          </>
                        )}
                        {selectedChainId && selectedChainId !== 1 && (
                          <>
                            <Badge status="error" text="Please connect to mainnet" />
                            <br />
                          </>
                        )}
                        {releasableAmount && parseFloat(ethers.utils.formatEther(releasableAmount)) == 0 && (
                          <Badge status="error" text="No funds to release" />
                        )}
                      </Col>
                    </Row>
                  </Space>
                </>
              ) : beneficiary === "No contract found" ? (
                <Badge status="error" text="No contract found" />
              ) : (
                <>
                  <Divider />
                  <Spin />
                </>
              ))}
          </Card>
        </Route>
        <Route path="/contract">
          {selectedContract && beneficiary && (
            <Contract
              name="GRTVESTING"
              customContract={mainnetContracts && mainnetContracts.contracts && mainnetContracts.contracts.GRTVESTING}
              customAddresses={{ GRTVESTING: vestingContractAddress }}
              signer={userSigner}
              provider={mainnetProvider}
              address={address}
              blockExplorer="https://etherscan.io/"
            />
          )}
        </Route>
      </Switch>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://github.com/austintgriffith/scaffold-eth/tree/grt-releaser");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Information
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
