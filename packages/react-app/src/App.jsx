import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Menu } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge } from "./components";
import { Transactor } from "./helpers";
import { formatEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph, FishFinder } from "./views"
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    📡 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/
import { INFURA_ID, EXTERNAL_CONTRACTS} from "./constants";

// 😬 Sorry for all the console logging 🤡
const DEBUG = true

// 🔭 block explorer URL
const blockExplorer = "https://blockscout.com/poa/xdai/"

// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
//const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/"+INFURA_ID)
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "https://dai.poa.network"
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);



function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = 1

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = 1000000000
  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice)

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);
  if(DEBUG) console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")

  // just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  if(DEBUG) console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider)
  if(DEBUG) console.log("📝 readContracts",readContracts)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)
  if(DEBUG) console.log("🔐 writeContracts",writeContracts)

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts,"YourContract", "purpose")
  console.log("🤗 purpose:",purpose)



  // Add your external contract addresses and abis to the constants.js file
  const externalContracts = {
    GALLEASS: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.GALLEASS.address, EXTERNAL_CONTRACTS.GALLEASS.abi ),
    LAND: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.LAND.address, EXTERNAL_CONTRACTS.LAND.abi ),
    BAY: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.BAY.address, EXTERNAL_CONTRACTS.BAY.abi ),
    HARBOR: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.HARBOR.address, EXTERNAL_CONTRACTS.HARBOR.abi ),
    DOGGER: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.DOGGER.address, EXTERNAL_CONTRACTS.DOGGER.abi ),
    SNARK: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.SNARK.address, EXTERNAL_CONTRACTS.SNARK.abi ),
    FISHMONGER: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.FISHMONGER.address, EXTERNAL_CONTRACTS.FISHMONGER.abi ),
    COPPER: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.COPPER.address, EXTERNAL_CONTRACTS.COPPER.abi ),
    PINNER: useExternalContractLoader(localProvider, EXTERNAL_CONTRACTS.PINNER.address, EXTERNAL_CONTRACTS.PINNER.abi ),
  }

  // keep track of a variable from the contract in the local React state:
  //const galleass = useContractReader(externalContracts,"BAY", "galleass")
  //console.log("🤗 galleass:",galleass)


  const mainX = useContractReader(externalContracts,"LAND","mainX")
  const mainY = useContractReader(externalContracts,"LAND","mainY")









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
    setRoute(window.location.pathname)
  }, [setRoute]);

  return (
    <div className="App">


      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />



      <div style={{float:"left"}}>
        <div>
          MainX: {mainX}
        </div>
        <div>
          MainY: {mainY}
        </div>
      </div>


      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">Galleass</Link>
          </Menu.Item>
          <Menu.Item key="/copper">
            <Link onClick={()=>{setRoute("/copper")}} to="/copper">copper</Link>
          </Menu.Item>
          <Menu.Item key="/fishmonger">
            <Link onClick={()=>{setRoute("/fishmonger")}} to="/fishmonger">fishmonger</Link>
          </Menu.Item>
          <Menu.Item key="/snark">
            <Link onClick={()=>{setRoute("/snark")}} to="/snark">snark</Link>
          </Menu.Item>
          <Menu.Item key="/dogger">
            <Link onClick={()=>{setRoute("/dogger")}} to="/dogger">dogger</Link>
          </Menu.Item>
          <Menu.Item key="/harbor">
            <Link onClick={()=>{setRoute("/harbor")}} to="/harbor">harbor</Link>
          </Menu.Item>
          <Menu.Item key="/bay">
            <Link onClick={()=>{setRoute("/bay")}} to="/bay">bay</Link>
          </Menu.Item>
          <Menu.Item key="/pinner">
            <Link onClick={()=>{setRoute("/pinner")}} to="/pinner">pinner</Link>
          </Menu.Item>
          <Menu.Item key="/fishfinder">
            <Link onClick={()=>{setRoute("/fishfinder")}} to="/fishfinder">fishfinder</Link>
          </Menu.Item>

        </Menu>

        <Switch>

          <Route path="/fishfinder">
            <FishFinder
              externalContracts={externalContracts}
              localProvider={localProvider}
            />
          </Route>



          <Route path="/bay">
            <Contract
              name="BAY"
              customContract={externalContracts["BAY"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              show={["reelIn","castLine","embark","getShip","setSail", "dropAnchor"]}
            />
          </Route>

          <Route path="/harbor">
            <Contract
              name="HARBOR"
              customContract={externalContracts["HARBOR"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              show={["buyShip","TIMBERTOBUILDDOGGER"]}
            />
          </Route>

          <Route path="/dogger">
            <Contract
              name="DOGGER"
              customContract={externalContracts["DOGGER"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              show={["tokensOfOwner","ownerOf","balanceOf","transfer","getToken"]}
            />
          </Route>

          <Route path="/snark">
            <Contract
              name="SNARK"
              customContract={externalContracts["SNARK"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              show={["balanceOf","transfer"]}
            />
          </Route>

          <Route path="/fishmonger">
            <Contract
              name="FISHMONGER"
              customContract={externalContracts["FISHMONGER"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              show={["sellFish","price","filletPrice"]}
            />
          </Route>
          <Route path="/pinner">
            <Contract
              name="PINNER"
              customContract={externalContracts["PINNER"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              show={["balanceOf","transfer"]}
            />
          </Route>

          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
            {/*
            <Contract
              name="GALLEASS"
              customContract={externalContracts["GALLEASS"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            */}

            <Contract
              name="LAND"
              customContract={externalContracts["LAND"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              show={["mainX","mainY","findTile","getTileLocation"]}
            />


{/*

  <Contract
    name="YourContract"
    signer={userProvider.getSigner()}
    provider={localProvider}
    address={address}
    blockExplorer={blockExplorer}
  />

  */}


            { /* Uncomment to display and interact with an external contract (DAI on mainnet):
            <Contract
              name="DAI"
              customContract={mainnetDAIContract}
              signer={userProvider.getSigner()}
              provider={mainnetProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            */ }
          </Route>


          <Route path="/copper">
            <Contract
              name="COPPER"
              customContract={externalContracts["COPPER"]}
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              show={["balanceOf","transfer"]}
            />
          </Route>
          <Route path="/hints">
            <Hints
              address={address}
              yourLocalBalance={yourLocalBalance}
              mainnetProvider={mainnetProvider}
              price={price}
            />
          </Route>

        </Switch>
      </BrowserRouter>


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
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
       <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
         <Row align="middle" gutter={[4, 4]}>
           <Col span={8}>
             <Ramp price={price} address={address} />
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
               localProvider && localProvider.connection && localProvider.connection.url && localProvider.connection.url.indexOf("localhost")>=0 && !process.env.REACT_APP_PROVIDER && price > 1 ? (
                 <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider}/>
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

export default App;
