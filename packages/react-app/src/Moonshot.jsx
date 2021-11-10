import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { StaticJsonRpcProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { message, Row, Col, Button, Menu, Alert, Switch as SwitchD, Input } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { formatEther, parseEther } from "@ethersproject/units";
import { useThemeSwitcher } from "react-css-theme-switcher";
import ReactMarkdown from "react-markdown";
import {
  useExchangePrice,
  useGasPrice,
  useUserProvider,
  useContractLoader,
  useContractReader,
  useEventListener,
  useBalance,
  useExternalContractLoader,
  useOnBlock,
} from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, ThemeSwitch, Address } from "./components";
import { Transactor } from "./helpers";
// import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views";
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";

const axios = require("axios");
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

const serverUrl = "https://backend.moonshotcollective.space:49834/";
// const serverUrl = "http://localhost:49834/"

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.mainnet; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;

window.localStorage.setItem("theme", "dark");

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = new StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544");
const mainnetInfura = new StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

function Moonshot(props) {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  // const readContracts = useContractLoader(localProvider)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  // const writeContracts = useContractLoader(userProvider)

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  //  const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI)

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  //  const myMainnetDAIBalance = useContractReader({DAI: mainnetDAIContract},"DAI", "balanceOf",["0x34aA3F359A9D614239015126635CE7732c18fDF3"])

  // keep track of a variable from the contract in the local React state:
  // const purpose = useContractReader(readContracts,"YourContract", "purpose")

  // 📟 Listen for broadcast events
  // const setPurposeEvents = useEventListener(readContracts, "YourContract", "SetPurpose", localProvider, 1);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance /* &&  yourMainnetBalance &&readContracts && writeContracts && mainnetDAIContract */
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? formatEther(yourLocalBalance) : "...");
      /* console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...") */
      /*  console.log("📝 readContracts",readContracts) */
      /* console.log("🌍 DAI contract on mainnet:",mainnetDAIContract) */
      /*  console.log("🔐 writeContracts",writeContracts) */
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance /* yourMainnetBalance, readContracts, writeContracts, mainnetDAIContract */,
  ]);

  let networkDisplay = "";
  if (localChainId && selectedChainId && localChainId != selectedChainId) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: "absolute", right: 0, top: 0, padding: 16 }}>
        <Alert
          message="⚠️ Wrong Network"
          description={
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on{" "}
              <b>{NETWORK(localChainId).name}</b>.
            </div>
          }
          type="error"
          closable={false}
        />
      </div>
    );
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 8, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
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

  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name == "localhost";

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId == 31337 &&
    yourLocalBalance &&
    formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
              value: parseEther("0.01"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }

  const isSigner = injectedProvider && injectedProvider.getSigner && injectedProvider.getSigner()._isSigner;

  const [loading, setLoading] = useState();

  const [result, setResult] = useState();

  const [email, setEmail] = useState();

  let display = "";
  if (result) {
    // maybe you want to check of the backend supplied a transaction id to look up?
    // let possibleTxId = result.substr(-66)
    // console.log("possibleTxId",possibleTxId)
    // let extraLink = ""
    // if(possibleTxId.indexOf("0x")==0){
    //  extraLink = <a href={blockExplorer+"tx/"+possibleTxId} target="_blank">view transaction on etherscan</a>
    // }else{
    //  possibleTxId=""
    // }

    // maybe you want to parse and display a youtube if the link is to a video?
    if (result.indexOf("https://youtu.be/") == 0) {
      display = (
        <div style={{ marginTop: 32 }}>
          <div className="video-responsive">
            <iframe
              width="853"
              height="480"
              src={`https://www.youtube.com/embed/${result.replace("https://youtu.be/", "")}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded youtube"
            />
          </div>
        </div>
      );
    } else {
      display = (
        <div style={{ marginTop: 32 }}>
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      );
    }
  } else if (isSigner) {
    display = (
      <div>
        <div style={{ width: 400, margin: "auto", marginTop: 32 }}>
          <div>Enter your email to receive updates:</div>
          <Input
            placeholder="your@email.com"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <Button
          disabled={!email}
          loading={loading}
          style={{ marginTop: 32 }}
          type="primary"
          onClick={async () => {
            setLoading(true);
            try {
              const msgToSign = await axios.get(serverUrl);
              console.log("msgToSign", msgToSign);
              if (msgToSign.data && msgToSign.data.length > 32) {
                // <--- traffic escape hatch?
                let currentLoader = setTimeout(() => {
                  setLoading(false);
                }, 4000);
                const message = msgToSign.data.replace("**EMAIL**", email);
                const sig = await userProvider.send("personal_sign", [message, address]);
                clearTimeout(currentLoader);
                currentLoader = setTimeout(() => {
                  setLoading(false);
                }, 4000);
                console.log("sig", sig);
                const res = await axios.post(serverUrl, {
                  email,
                  address,
                  message,
                  signature: sig,
                });
                clearTimeout(currentLoader);
                setLoading(false);
                console.log("RESULT:", res);
                if (res.data) {
                  setResult(res.data);
                }
              } else {
                setLoading(false);
                setResult(
                  "😅 Sorry, the server is overloaded. ⏳ Maybe just email austin@ethereum.org and I'll add you to the list manually 😅",
                );
              }
            } catch (e) {
              message.error(" Sorry, the server is overloaded. 🧯🚒🔥");
              console.log("FAILED TO GET...");
            }
          }}
        >
          <span style={{ marginRight: 8 }}>🔏</span> <span style={{ marginRight: 8 }}>sign as </span>
          <Address noLink style={{ zIndex: -1 }} value={address} fontSize={16} ensProvider={mainnetProvider} />
        </Button>
      </div>
    );
  }

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />

      {networkDisplay}

      <div style={{ width: 500, margin: "auto", marginTop: 32 }}>
        <img src="./moonshot.gif" style={{ minWidth: 524 }} />

        <div style={{ marginTop: 16 }}>
          For the first time ever it's possible to program our values into our money. We value coordination, so why not
          use programmable money to create better coordination tools?
        </div>
        <div style={{ marginTop: 16 }}>
          The moonshot collective is a group of builders & web3 community members who are looking to prototype
          experiments in coordination (whether thats public goods, private goods, governance tools).
        </div>
        <div style={{ marginTop: 16 }}>Got dev skills + want to help build the future? Get Involved:</div>
      </div>

      <div style={{ textAlign: "center", padding: 10, marginTop: 32 }}>
        <Account
          connectText={
            <div>
              <img src="./rocket_3.svg" style={{ position: "absolute", left: -54, top: -4, maxHeight: 48 }} />
              Connect Ethereum Wallet
            </div>
          }
          onlyShowButton={!isSigner}
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      {display}

      <div style={{ paddingTop: 64 }}>
        <h1>First Meeting: Monday, July 19!!!</h1>
      </div>
      <div>
        Please support the:
        <a href="https://gitcoin.co/grants/3004/moonshot-collective" target="_blank">
          Gitcoin Grant
        </a>
      </div>
    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

window.ethereum &&
  window.ethereum.on("accountsChanged", accounts => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

export default Moonshot;
