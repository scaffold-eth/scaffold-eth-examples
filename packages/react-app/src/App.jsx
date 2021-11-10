import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import Loader from "react-loader-spinner";
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
import { ReactSVG } from "react-svg";
import SVG from "react-inlinesvg";
import classnames from "classnames";
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
import Moonshot from "./Moonshot";
import { Transactor } from "./helpers";
// import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views";
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";
import { LogoMoon } from "./icons";

import LogoMoonSvg from "./icons/logo-moon.svg";

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

const formatAddress = s => {
  return s.substr(0, 7) + "..." + s.substr(s.length - 4, 4);
};

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

function App(props) {
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
  const mainnetBalance = useBalance(injectedProvider, address);

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

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  const disconnectWallet = useCallback(() => {
    console.log("logging out..");
    logoutOfWeb3Modal();
  }, [injectedProvider]);

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

  const [email, setEmail] = useState("");

  const display = "";
  // if (result) {
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
  //   if (result.indexOf("https://youtu.be/") == 0) {
  //     display = (
  //       <div style={{ marginTop: 32 }}>
  //         <div className="video-responsive">
  //           <iframe
  //             width="853"
  //             height="480"
  //             src={`https://www.youtube.com/embed/${result.replace("https://youtu.be/", "")}`}
  //             frameBorder="0"
  //             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  //             allowFullScreen
  //             title="Embedded youtube"
  //           />
  //         </div>
  //       </div>
  //     );
  //   } else {
  //     display = (
  //       <div style={{ marginTop: 32 }}>
  //         <ReactMarkdown>{result}</ReactMarkdown>
  //       </div>
  //     );
  //   }
  // } else if (isSigner) {
  //   display = (
  //     <div>
  //       <div style={{ width: 400, margin: "auto", marginTop: 32 }}>
  //         <div>Enter your email to receive updates:</div>
  //         <Input
  //           placeholder="your@email.com"
  //           value={email}
  //           onChange={e => {
  //             setEmail(e.target.value);
  //           }}
  //         />
  //       </div>
  //       <Button
  //         disabled={!email}
  //         loading={loading}
  //         style={{ marginTop: 32 }}
  //         type="primary"
  //         onClick={async () => {
  //           setLoading(true);
  //           try {
  //             const msgToSign = await axios.get(serverUrl);
  //             console.log("msgToSign", msgToSign);
  //             if (msgToSign.data && msgToSign.data.length > 32) {
  //               // <--- traffic escape hatch?
  //               let currentLoader = setTimeout(() => {
  //                 setLoading(false);
  //               }, 4000);
  //               const message = msgToSign.data.replace("**EMAIL**", email);
  //               const sig = await userProvider.send("personal_sign", [message, address]);
  //               clearTimeout(currentLoader);
  //               currentLoader = setTimeout(() => {
  //                 setLoading(false);
  //               }, 4000);
  //               console.log("sig", sig);
  //               const res = await axios.post(serverUrl, {
  //                 email,
  //                 address,
  //                 message,
  //                 signature: sig,
  //               });
  //               clearTimeout(currentLoader);
  //               setLoading(false);
  //               console.log("RESULT:", res);
  //               if (res.data) {
  //                 setResult(res.data);
  //               }
  //             } else {
  //               setLoading(false);
  //               setResult(
  //                 "😅 Sorry, the server is overloaded. ⏳ Maybe just email austin@ethereum.org and I'll add you to the list manually 😅",
  //               );
  //             }
  //           } catch (e) {
  //             message.error(" Sorry, the server is overloaded. 🧯🚒🔥");
  //             console.log("FAILED TO GET...");
  //           }
  //         }}
  //       >
  //         <span style={{ marginRight: 8 }}>🔏</span> <span style={{ marginRight: 8 }}>sign as </span>
  //         <Address noLink style={{ zIndex: -1 }} value={address} fontSize={16} ensProvider={mainnetProvider} />
  //       </Button>
  //     </div>
  //   );
  // }

  const signAndSubscribe = async () => {
    setLoading(true);
    try {
      const msgToSign = await axios.get(serverUrl);
      console.log("msgToSign", msgToSign);
      if (msgToSign.data && msgToSign.data.length > 32) {
        // <--- traffic escape hatch?
        // let currentLoader = setTimeout(() => {
        //   setLoading(false);
        // }, 4000);
        const message = msgToSign.data.replace("**EMAIL**", email);
        const sig = await userProvider.send("personal_sign", [message, address]);
        // clearTimeout(currentLoader);
        // currentLoader = setTimeout(() => {
        //   setLoading(false);
        // }, 4000);
        console.log("sig", sig);
        const res = await axios.post(serverUrl, {
          email,
          address,
          message,
          signature: sig,
        });
        // clearTimeout(currentLoader);
        setLoading(false);
        setEmail("");
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
      setLoading(false);
      message.error(" Sorry, the server is overloaded. 🧯🚒🔥");
      console.log("FAILED TO GET...");
    }
  };

  const [walletMenu, setWalletMenu] = useState(false);
  const [pageMenu, setPageMenu] = useState(false);

  return (
    <div>
      {/* HEADER */}
      <header>
        {/* left logo */}
        <div className="header-logo">
          <a data-kinetics-attraction href="/">
            {/* pls load as regular svg inline with react */}
            {/* <object type="image/svg+xml" data="assets/images/logo-moon.svg" /> */}
            {/* <LogoMoon /> */}
            {/* <img src={LogoMoonSvg} /> */}
            {/* <ReactSVG src="assets/images/logo-moon.svg" /> */}
            <SVG src="assets/images/logo-moon.svg" height="auto" />
          </a>
        </div>
        {/* right nav */}
        <div className="header-navigation">
          {/* page navigation */}
          <nav id="pageMenu" className={pageMenu && "visible"}>
            <ul>
              <a href>
                <li aria-current="page">Home</li>
              </a>
              <a href>
                <li>Announcement</li>
              </a>
              <a href>
                <li>Projects</li>
              </a>
              <a href>
                <li>Discussion</li>
              </a>
            </ul>
          </nav>
          {/* mobile buger ui */}
          <div data-kinetics-attraction className="burger">
            <div id="openMenu" className={classnames("icon", pageMenu && "hide")} onClick={() => setPageMenu(true)}>
              {/* pls load "assets/images/menu.svg" inline instead */}
              <SVG src="assets/images/menu.svg" />
              {/* <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} viewBox="0 0 64 64">
                <line x1={16} y1={32} x2={48} y2={32} />
                <line x1={16} y1={20} x2={48} y2={20} />
                <line x1={16} y1={44} x2={48} y2={44} />
              </svg> */}
            </div>
            <div id="closeMenu" className={classnames("icon", !pageMenu && "hide")} onClick={() => setPageMenu(false)}>
              {/* pls load "assets/images/close.svg" inline instead */}
              <SVG src="assets/images/close.svg" />
              {/* <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} viewBox="0 0 64 64">
                <line x1={16} y1={16} x2={48} y2={48} />
                <line x1={48} y1={16} x2={16} y2={48} />
              </svg> */}
            </div>
          </div>
          {isSigner && (
            <div
              id="openWalletMenu"
              className="wallet-status"
              data-kinetics-attraction
              onClick={() => setWalletMenu(true)}
            >
              {/* example ( will probably come from walletconnect i assume ) */}
              <SVG src="assets/images/metamask.svg" width="48px" height="48px" />
              {/* <img
                id="openWalletMenu"
                src="assets/images/metamask.svg"
                alt=""
                style={{ width: "48px", height: "48px", marginLeft: "0em" }}
              /> */}
            </div>
          )}
          {/* wallet */}
          {/* <div id="openWalletMenu" className="wallet-status" data-kinetics-attraction> */}
          <div className="provider" onClick={loadWeb3Modal}>
            {/* hide if connected to a provider */}
            {!isSigner && (
              <div className="icon">
                {/* pls load "assets/images/wallet.svg" inline instead */}
                <SVG src="assets/images/wallet.svg" />
                {/* <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} viewBox="0 0 64 64" fill="none">
                  <path d="M52 26V16a4 4 0 0 0-4-4H12a4 4 0 0 0-4 4v32a4 4 0 0 0 4 4h36a4 4 0 0 0 4-4V38" />
                  <rect x={48} y={26} width={8} height={12} />
                </svg> */}
              </div>
            )}
            {/* hide if not connected to a provider */}
          </div>
        </div>
      </header>
      {/* WALLET-MENU */}
      <div id="walletMenu" className={classnames("wallet-menu", walletMenu && "visible")}>
        <div id="closeWalletMenu" className="action" onClick={() => setWalletMenu(false)}>
          <span>Wallet</span>
          <div className="icon">
            {/* pls load "assets/images/close.svg" inline instead */}
            <SVG src="assets/images/close.svg" width="64px" height="64px" />
            {/* <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} viewBox="0 0 64 64">
              <line x1={16} y1={16} x2={48} y2={48} />
              <line x1={48} y1={16} x2={16} y2={48} />
            </svg> */}
          </div>
        </div>
        <div className="wallet-detail" style={selectedChainId !== 1 ? { background: "none" } : null}>
          {selectedChainId === 1 ? (
            <>
              <div className="network">mainnet</div>
              <div className="address">{formatAddress(address)}</div>
              <div className="balance">
                {mainnetBalance ? parseFloat(formatEther(mainnetBalance).toString()).toFixed(2) : "..."} ETH
              </div>
            </>
          ) : (
            <div>Wrong chain. Please connect to mainnet.</div>
          )}
          {/* <div className="token">1337 MATIC</div> */}
        </div>
        {/* <div className="action">
          <span>Change Provider</span>
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} viewBox="0 0 64 64">
              <polygon points="8 20 8 44 32 56 56 44 56 20 32 8 8 20" />
              <line x1={32} y1={32} x2={56} y2={20} />
              <line x1={32} y1={56} x2={32} y2={32} />
              <line x1={56} y1={44} x2={32} y2={32} />
              <line x1={8} y1={44} x2={32} y2={32} />
              <line x1={8} y1={20} x2={32} y2={32} />
              <line x1={32} y1={8} x2={32} y2={32} />
            </svg>
          </div>
        </div> */}
        {/* <div className="action">
          <span>Connect</span>
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} viewBox="0 0 64 64">
              <path d="M49,15A24,24,0,1,1,15,15" />
              <line x1={32} y1={8} x2={32} y2={32} />
            </svg>
          </div>
        </div> */}
        <div className="action" onClick={disconnectWallet}>
          <span>Disconnect</span>
          <div className="icon">
            {/* pls load "assets/images/disconnect.svg" inline instead */}
            <SVG src="assets/images/disconnect.svg" />
            {/* <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} viewBox="0 0 64 64">
              <path d="M49,15A24,24,0,1,1,15,15" />
              <line x1={32} y1={8} x2={32} y2={32} />
            </svg> */}
          </div>
        </div>
      </div>
      {/* INTRO */}
      <article id="intro">
        <section className="content-intro">
          <div>
            <h1>What</h1>
            <p>
              For the first time ever, it is possible to program our values into our
              money. We value coordination, so why not use programmable money to create better coordination tools? The
              moonshot collective is a collection of builders &amp; web3 community members who are looking to prototype
              experiments in coordination (whether thats public goods, private goods, governance tools).
            </p>
            <div style={{fontSize:22, marginTop:32}}>Got dev skills
            + want to help build the future?</div>
            <div style={{fontSize:32, marginTop:32}}>
            <a href="#subscribe">Get Involved.</a>
            </div>
          </div>
          <figure>
            {/* not needed to be inline */}
            <img src="assets/images/collab-animation.svg" />
          </figure>
        </section>
      </article>
      {/* moonify filter ( transform images yellow ) */}
      <svg>
        <filter id="moonify">
          <feColorMatrix
            colorInterpolationFilters="sRGB"
            type="matrix"
            values="1 0 0 0 0 0 0.8 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
        </filter>
      </svg>
      {/* MEMBERS */}
      {/* the images will be probably be replaced by a lot regular images i assume */}
      <article id="members">
        <section className="column">
          <h1>Who</h1>
        </section>
        <section className="content-members">
          <figure data-kinetics-attraction>
            <a href="#">
              <img className="moonify" src="assets/images/members/test.jpg" />
              <figcaption>Austin</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-40.svg" />
              <figcaption>Kevin</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-60.svg" />
              <figcaption>Castall</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-80.svg" />
              <figcaption>Auryn</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-100.svg" />
              <figcaption>You</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-20.svg" />
              <figcaption>Austin</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-40.svg" />
              <figcaption>Kevin</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-60.svg" />
              <figcaption>Castall</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-80.svg" />
              <figcaption>Auryn</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              <img src="assets/images/moon-100.svg" />
              <figcaption>You</figcaption>
            </a>
          </figure>
        </section>
      </article>
      {/* EXPLAIN */}
      <article id="explain">
        <section className="column">
          <h1>How it works</h1>
          <p>
            Moonshot collective provides ideas, devs, funding as builders grow their public goods funding experiments.
          </p>
        </section>
        <section className="content-explain">
          <figure data-kinetics-attraction>
            <SVG src="assets/images/prototype.svg" />
            <figcaption>
              <span>1.</span>Prototype
            </figcaption>
          </figure>
          <figure data-kinetics-attraction>
            <SVG src="assets/images/marketvalidation.svg" />
            {/* <object type="image/svg+xml" data="assets/images/marketvalidation.svg" /> */}
            <figcaption>
              <span>2.</span>Market Validation
            </figcaption>
          </figure>
          <figure data-kinetics-attraction>
            <SVG src="assets/images/growth.svg" />
            <figcaption>
              <span>3.</span>Growth
            </figcaption>
          </figure>
          <figure data-kinetics-attraction>
            <SVG src="assets/images/decentralize.svg" />
            <figcaption>
              <span>4.</span>Decentralize
            </figcaption>
          </figure>
        </section>
      </article>
      {/* PROECTS */}
      <article id="projects">
        <section className="column">
          <h1>Who</h1>
        </section>
        <section className="content-projects">
          <figure data-kinetics-attraction>
            <a href="https://buidlguidl.com">
              {/* pls load svg line with react */}
              {/* <object type="image/svg+xml" data="assets/images/project-3.svg" /> */}
              <SVG src="assets/images/project-3.svg" />
              <figcaption>Buidl Guidl</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="https://gitcoin.co">
              {/* pls load as regular svg line with react */}
              <SVG src="assets/images/project-4.svg" />
              {/* <object type="image/svg+xml" data="assets/images/project-4.svg" /> */}
              <figcaption>Gitcoin</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="http://scaffoldeth.io">
              {/* pls load as regular svg line with react */}
              <SVG src="assets/images/project-5.svg" />
              {/* <object type="image/svg+xml" data="assets/images/project-5.svg" /> */}
              <figcaption>Scaffold.eth</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              {/* pls load as regular svg line with react */}
              <SVG src="assets/images/project-6.svg" />
              {/* <object type="image/svg+xml" data="assets/images/project-6.svg" /> */}
              <figcaption>Alumni X</figcaption>
            </a>
          </figure>
          <figure data-kinetics-attraction>
            <a href="#">
              {/* pls load as regular svg line with react */}
              <SVG src="assets/images/project-7.svg" />
              {/* <object type="image/svg+xml" data="assets/images/project-7.svg" /> */}
              <figcaption>Yours</figcaption>
            </a>
          </figure>
        </section>
      </article>
      {/* SUBSCRIBE */}
      <article id="subscribe">
        <section className="column">
          <h1>Get Involved</h1>
          <p>Are you a builder who wants to work on public goods? Click below to join the workstream email group.</p>
        </section>
        <section className="content-subscribe">
          {isSigner ? (
            <>
              <div className="wrapper">
                <input
                  type="text"
                  name
                  placeholder="moon@shot"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button
                data-kinetics-attraction
                className="btn"
                disabled={email.indexOf("@") === -1 || loading}
                type="button"
                onClick={signAndSubscribe}
              >
                {!loading ? "Sign and subscribe" : "Loading.."}
              </button>
              <p style={{ marginTop: "20px" }}>{result}</p>
              {/* <span style={{ marginRight: 8 }}>🔏</span> <span style={{ marginRight: 8 }}>sign as </span>
              <Address noLink style={{ zIndex: -1 }} value={address} fontSize={16} ensProvider={mainnetProvider} /> */}
            </>
          ) : (
            <button data-kinetics-attraction className="btn" onClick={loadWeb3Modal}>
              Connect wallet
            </button>
          )}
        </section>
      </article>
      <footer>
        <div className="wrapper" style={{ marginBottom: "40px" }}>
          {/* pls load as regular svg inline with react */}
          <figure data-kinetics-attraction>
            <SVG src="assets/images/colorado.svg" />
          </figure>
          <div>
            Built with &lt;3 in Colorado
            <br />
            <a href="https://gitcoin.co">Gitcoin</a> | <a href="https://buidlguidl.com">Buidl Guidl</a>
          </div>
        </div>
      </footer>
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

export default App;
