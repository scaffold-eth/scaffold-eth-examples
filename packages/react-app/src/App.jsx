import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { formatEther, parseEther } from "@ethersproject/units";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Col, Menu, Row, List } from "antd";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch, Balance, Address, EtherInput } from "./components";
import { DAI_ABI, DAI_ADDRESS, INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useExternalContractLoader,
  useGasPrice,
  useOnBlock,
  useUserProvider,
} from "./hooks";
// import Hints from "./Hints";
import { ExampleUI, Hints, Subgraph } from "./views";
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


const AKITA_ADDRESS = "0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6";

const AKITA_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sender","type":"address"},{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"value","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"name","type":"string"},{"name":"symbol","type":"string"},{"name":"decimals","type":"uint8"},{"name":"totalSupply","type":"uint256"},{"name":"feeReceiver","type":"address"},{"name":"tokenOwnerAddress","type":"address"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]

const GITCOIN_MULTISIG_ADDRESS = "0xde21F729137C5Af1b01d73aF1dC21eFfa2B8a0d6"

const TEMP_GITCOIN_LOCAL_ADDRESS = "0xde21F729137C5Af1b01d73aF1dC21eFfa2B8a0d6"

const UNISWAP_AKITA_WETH_PAIR = "0xda3a20aad0c34fa742bd9813d45bbf67c787ae0b"

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"


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

  const akitaContract = useExternalContractLoader(userProvider, AKITA_ADDRESS, AKITA_ABI);

  const wethContract = useExternalContractLoader(mainnetProvider, WETH_ADDRESS, AKITA_ABI);

  const gitcoinAkitaBalance = useContractReader({ AKITA: akitaContract }, "AKITA", "balanceOf", [
    GITCOIN_MULTISIG_ADDRESS,
  ]);

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  //const myMainnetDAIBalance = useContractReader({ DAI: mainnetDAIContract }, "DAI", "balanceOf", [
  //  "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  //]);

  const burnVendorAddress = readContracts && readContracts.BurnVendor.address

  const burnVendorBalance = useBalance(localProvider, burnVendorAddress);

  // keep track of a variable from the contract in the local React state:
  const yourAkitaBalance = useContractReader(readContracts, "AKITAERC20Token", "balanceOf", [ address ] );
  //const vendorAkitaBalance = useContractReader(readContracts, "AKITAERC20Token", "balanceOf", [ burnVendorAddress ] );

  const vendorAkitaAllowance = useContractReader({"AKITAERC20Token":akitaContract}, "AKITAERC20Token", "allowance", [ TEMP_GITCOIN_LOCAL_ADDRESS, burnVendorAddress ] );

  console.log("vendorAkitaAllowance",vendorAkitaAllowance,TEMP_GITCOIN_LOCAL_ADDRESS, burnVendorAddress)

  const akitaPerEthPriceInVendor = useContractReader(readContracts, "BurnVendor", "tokensPerEth");
  const burnMultiplier = useContractReader(readContracts, "BurnVendor", "burnMultiplier");

  // 📟 Listen for broadcast events
  const buyEvents = useEventListener(readContracts, "BurnVendor", "Buy", localProvider, 1);

  const shouldSellAkita = burnMultiplier && vendorAkitaAllowance && vendorAkitaAllowance.div(burnMultiplier.add(1))

  const shouldEarnEth = akitaPerEthPriceInVendor && shouldSellAkita && shouldSellAkita.div(akitaPerEthPriceInVendor)


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
      yourLocalBalance &&
      yourMainnetBalance &&
      readContracts &&
      writeContracts &&
      mainnetDAIContract
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? formatEther(yourMainnetBalance) : "...");
      console.log("📝 readContracts", readContracts);
      //console.log("🌍 DAI contract on mainnet:", mainnetDAIContract);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    readContracts,
    writeContracts,
    mainnetDAIContract,
  ]);

  let networkDisplay = "";
  if (localChainId && selectedChainId && localChainId !== selectedChainId) {
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
                <b>{networkLocal && networkLocal.name}</b>.
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
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name === "localhost";

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId === 31337 &&
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

  const [ etherIn, setEtherIn ] = useState();

  let amountOut
  let amountToBurn
  try{
    amountOut= akitaPerEthPriceInVendor && etherIn && akitaPerEthPriceInVendor.mul(parseEther(""+etherIn))

    amountToBurn = amountOut && amountOut.mul(burnMultiplier)
  }catch(e){}

  console.log("etherIn",etherIn)

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header burnMultiplier={burnMultiplier}/>
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Introduction
            </Link>
          </Menu.Item>

          <Menu.Item key="/options">
            <Link
              onClick={() => {
                setRoute("/options");
              }}
              to="/options"
            >
              Options
            </Link>
          </Menu.Item>
          <Menu.Item key="/buy">
            <Link
              onClick={() => {
                setRoute("/buy");
              }}
              to="/buy"
            >
              Buy
            </Link>
          </Menu.Item>
          <Menu.Item key="/stats">
            <Link
              onClick={() => {
                setRoute("/stats");
              }}
              to="/stats"
            >
              Stats
            </Link>
          </Menu.Item>
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

        </Menu>

        <Switch>
          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}

            <div style={{padding:32, width:620, margin:"auto"}}>
              <div style={{marginTop:16,fontSize:18, fontWeight:"bold"}}>
                Many hours have gone into the Akita/Gitcoin debate, but I think it’s important that we get as much value as we can…
              </div>
              <div style={{marginTop:16,fontSize:18, fontStyle:"italic"}}>
                I know how hard it is to get funding for public goods in Ethereum.
              </div>
              <div style={{marginTop:16,fontSize:18}}>
                So when I first heard about the Akita tokens in the Gitcoin multi-sig, my gut reaction was, “They should start selling that immediately and use the proceeds to fund public goods on Ethereum!”
              </div>
              <div style={{marginTop:16,fontSize:18}}>
                BUT you can’t just sell these... You would crush the liquidity and end up with hardly anything in terms of value.
              </div>
              <div style={{marginTop:16,fontSize:18}}>
                On top of that, If someone owns HALF of the entire supply there is an existential threat of that supply getting dumped on the open market and crashes the token value.
              </div>
              <div style={{marginTop:16,fontSize:18}}>
                I have prepared this (unaudited) smart contract app that lets Gitcoin approve some amount of Akita to be sold at the current market price.
              </div>
              <div style={{marginTop:16,fontSize:18}}>
                BUT for every 1 Akita purchased, 10 Akita will be burned.
              </div>
              <div style={{marginTop:16,fontSize:18}}>
                The ETH from the sale lands back in the Gitcoin multi-sig and will be used for the ETH side of an ETH/AKITA LBP.
              </div>
              <div style={{marginTop:16,fontSize:18}}>
                👨🏻‍🚒 Let's rescue some puppers!
              </div>
              <div style={{marginTop:16,fontSize:18,paddingBottom:256}}>
              - <a href="https://twitter.com/austingriffith" target="_blank">@AustinGriffith</a>
              </div>
            </div>


          </Route>
          <Route path="/options">

            <div style={{padding:32, width:550, margin:"auto", border:"1px solid #666666", marginTop:32}}>
              <h2>PUSH THIS BUTTON KEVIN:</h2>
              <Button
                type="primary"
                onClick={() => {
                  tx( akitaContract.approve(writeContracts.BurnVendor.address,parseEther("49340000069")) )
                }}
              >
                Gitcoin approves (0.1%) 49340000069 Akita at 10x burn
              </Button>
            </div>


            <div style={{padding:32, width:550, margin:"auto", border:"1px solid #666666"}}>
              <Button
                type="primary"
                onClick={() => {
                  tx( akitaContract.approve(writeContracts.BurnVendor.address,parseEther("1480200002082")))
                }}
              >
                Gitcoin approves (3%) 1480200002082 Akita at 10x burn ~80 ETH?
              </Button>
            </div>


            <div style={{padding:32, width:550, margin:"auto", border:"1px solid #666666"}}>
              <Button
                type="primary"
                onClick={() => {
                  tx( akitaContract.approve(writeContracts.BurnVendor.address,parseEther("2467000003471")))
                }}
              >
                Gitcoin approves (5%) 2467000003471 Akita at 10x burn ~120 ETH?
              </Button>
            </div>

            <div style={{padding:32, width:550, margin:"auto", border:"1px solid #666666"}}>
              <Button
                type="primary"
                onClick={() => {
                  tx( akitaContract.approve(writeContracts.BurnVendor.address,parseEther("4934000006942")))
                }}
              >
                Gitcoin approves (10%) 4934000006942 Akita at 10x burn ~240 ETH?
              </Button>
            </div>

          </Route>


          <Route path="/buy">
            <div style={{padding:32, width:640, margin:"auto", fontSize:18}}>

              Send in <EtherInput value={etherIn} onChange={setEtherIn} style={{width:150,fontSize:18}}/> ETH

            </div>
            <div style={{width:640, margin:"auto"}}>
              <div>To Rescue</div>
            </div>

            <div style={{padding:32, width:640, margin:"auto"}}>

              🐕 <Balance value={amountOut && amountOut.div(1000000)} fontSize={18}/>MM Akita

            </div>
            <div>And Burn</div>

            <div style={{padding:32, width:640, margin:"auto"}}>

              🔥 <Balance value={amountToBurn && amountToBurn.div(1000000)} fontSize={18}/>MM Akita

            </div>

            <div style={{padding:32, width:640, margin:"auto"}}>
              <Button
                onClick={() => {
                  const value = parseEther(etherIn)
                  //console.log("value:",value)
                  const override = {value: value}
                  console.log("override",override)
                  // WTF IS THIS ERROR ETHERS ?!?
                  console.log("contract address:",writeContracts.BurnVendor.address,)
                  tx( writeContracts.BurnVendor.buy(override),(update)=>{
                    console.log("TX UPDATE:",update)
                  })

                  /*const buyTx = {
                    to: writeContracts.BurnVendor.address,
                    value: value,
                    gasLimit: 75000
                  }
                  console.log("buyTx",buyTx)
                  tx(
                    buyTx
                  )*/

                }}
                size="large"
                shape="round"
                type={"primary"}
                disabled={!etherIn}
              >
                <span style={{ marginRight: 8 }} role="img" >
                  🚑
                </span>
                Send it!
              </Button>
            </div>


            <div style={{padding:32, width:820, margin:"auto"}}>
              <List
                bordered
                dataSource={buyEvents}
                renderItem={item => {
                  console.log("EVENT",item)
                  return (
                    <List.Item key={item.blockNumber+formatEther(item.amount)+item.who+formatEther(item.burn)}>
                      <Address value={item.who} fontSize={16}/>
                      <div>
                        Ξ<Balance value={item.value} fontSize={16}/>
                      </div>
                      <div>
                        🐕 <Balance value={item.amount.div(1000000)} fontSize={16}/>MM
                      </div>
                      <div>
                        🔥 <Balance value={item.burn.div(1000000)} fontSize={16}/>MM
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>
          <Route path="/stats">
            <div style={{padding:32, width:400, margin:"auto"}}>

              <div>Gitcoin Akita Balance:</div>
              <Balance value={gitcoinAkitaBalance && gitcoinAkitaBalance.div(1000000)} />MM

              <div>Vendor Akita Allowance from Gitcoin:</div>
              <Balance value={vendorAkitaAllowance && vendorAkitaAllowance.div(1000000)} />MM

              <div>Akita per ETH price:</div>
              { akitaPerEthPriceInVendor && akitaPerEthPriceInVendor.toNumber()/1000000 }MM

              <div>Burn Multiplier:</div>
              { burnMultiplier && burnMultiplier.toNumber() }

              <div>Akita For Sale:</div>
              <Balance value={ shouldSellAkita && shouldSellAkita.div(1000000) } />MM

              <div>Should earn ETH:</div>
              <Balance value={ shouldEarnEth } />(<Balance value={ shouldEarnEth && shouldEarnEth.div(1000000) } price={price}/>MM)

            </div>
          </Route>
          <Route path="/contract">

            <div style={{padding:32, width:820, margin:"auto"}}>
              The smart contract is deployed to {targetNetwork.name} at <Address value={readContracts && readContracts.BurnVendor.address} />
            </div>


            <Contract
              name="BurnVendor"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            <Contract
              name="AkitaERC20Token"
              customContract={akitaContract}
              signer={userProvider.getSigner()}
              provider={mainnetProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>

        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
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

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

/* eslint-disable */
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
/* eslint-enable */

export default App;
