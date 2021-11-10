import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { MailOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, List, Tabs, Menu } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener, usePoller } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address, Balance, Blockie } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
//import Hints from "./Hints";
import QR from "qrcode.react";
import { Transactions, CreateTransaction, Owners } from "./views"
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)
*/
import { INFURA_ID, ETHERSCAN_KEY } from "./constants";
const { TabPane } = Tabs;
const axios = require('axios');


// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
//const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/5ce0898319eb4f5c9d4c982c8f78392a")
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "http://localhost:8545"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = mainnetProvider//new JsonRpcProvider(localProviderUrlFromEnv);



function App() {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); //1000000000 for xdai

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice)

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);
  console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")

  // just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider)
  console.log("📝 readContracts",readContracts)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)
  console.log("🔐 writeContracts",writeContracts)


 //📟 Listen for broadcast events
  const executeTransactionEvents = useEventListener(readContracts, "MetaMultiSigWallet", "ExecuteTransaction", localProvider, 1);
  console.log("📟 executeTransactionEvents:",executeTransactionEvents)

    // keep track of a variable from the contract in the local React state:
    const isOwner = useContractReader(readContracts,"MetaMultiSigWallet", "isOwner", [address])
    console.log("🤗 isOwner:",isOwner)

  // keep track of a variable from the contract in the local React state:
  const nonce = useContractReader(readContracts,"MetaMultiSigWallet", "nonce")
  console.log("🤗 nonce:",nonce)


   //📟 Listen for broadcast events
   const ownerEvents = useEventListener(readContracts, "MetaMultiSigWallet", "Owner", localProvider, 1);
   console.log("📟 ownerEvents:",ownerEvents)

   const signaturesRequired = useContractReader(readContracts, "MetaMultiSigWallet", "signaturesRequired")


  const [ transactions, setTransactions ] = useState();
  usePoller(()=>{
    const getTransactions = async ()=>{
      console.log("🛰 Requesting Transaction List")
      const res = await axios.get('http://localhost:8001/'+readContracts.MetaMultiSigWallet.address)
      let newTransactions = []
      for(let i in res.data){
        //console.log("look through signatures of ",res.data[i])
        let thisNonce = ethers.BigNumber.from(res.data[i].nonce)
        if(thisNonce && nonce&& thisNonce.gte(nonce)){
          let validSignatures = []
          for(let s in res.data[i].signatures){
            //console.log("RECOVER:",res.data[i].signatures[s],res.data[i].hash)
            let signer = await readContracts.MetaMultiSigWallet.recover(res.data[i].hash,res.data[i].signatures[s])
            let isOwner = await readContracts.MetaMultiSigWallet.isOwner(signer)
            if(signer&&isOwner){
              validSignatures.push({signer,signature:res.data[i].signatures[s]})
            }
          }
          let update = { ...res.data[i],validSignatures }
          //console.log("update",update)
          newTransactions.push(update)
        }
      }
      setTransactions(newTransactions)
      //console.log("Loaded",newTransactions.length)
    }
    if(readContracts) getTransactions()
  },3777)


  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  console.log("Location:",window.location.pathname)

  const [route, setRoute] = useState();
  useEffect(() => {
    console.log("SETTING ROUTE",window.location.pathname)
    setRoute(window.location.pathname)
  }, [ window.location.pathname ]);

  return (
    <div className="App">

      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />

      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">Transactions</Link>
          </Menu.Item>
          <Menu.Item key="/owners">
            <Link onClick={()=>{setRoute("/owners")}} to="/owners">Owners</Link>
          </Menu.Item>
          <Menu.Item key="/pool">
            <Link onClick={()=>{setRoute("/pool")}} to="/pool">Pool</Link>
          </Menu.Item>
          <Menu.Item key="/create">
            <Link onClick={()=>{setRoute("/create")}} to="/create">Create</Link>
          </Menu.Item>
          <Menu.Item key="/debug">
            <Link onClick={()=>{setRoute("/debug")}} to="/debug">Debug</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
            <div style={{padding:32,maxWidth:750,margin:"auto"}}>

              <div style={{paddingBottom:32}}>

                <div>
                  <Balance
                    address={readContracts?readContracts.MetaMultiSigWallet.address:readContracts}
                    provider={localProvider}
                    dollarMultiplier={price}
                    size={64}
                  />
                </div>
                <div>
                  <QR value={readContracts?readContracts.MetaMultiSigWallet.address:""} size={"180"} level={"H"} includeMargin={true} renderAs={"svg"} imageSettings={{excavate:false}}/>
                </div>
                <div>
                  <Address
                    value={readContracts?readContracts.MetaMultiSigWallet.address:readContracts}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={32}
                  />
                </div>
              </div>

              <List
                bordered
                dataSource={executeTransactionEvents}
                renderItem={(item) => {
                  //console.log("executeTransactionEvents ITEM",item)
                  return (
                    <List.Item style={{position:"relative"}}>
                    <div style={{position:"absolute",top:55,fontSize:12,opacity:0.5}}>
                      {item.data}
                    </div>
                    <b style={{padding:16}}>#{item.nonce.toNumber()}</b>
                    <span>
                      <Blockie size={4} scale={8} address={item.hash} /> {item.hash.substr(0,6)}
                    </span>
                    <Address
                      value={item.to}
                      ensProvider={mainnetProvider}
                      blockExplorer={blockExplorer}
                      fontSize={16}
                    />
                    <Balance
                      balance={item.value}
                      dollarMultiplier={price}
                    />
                    </List.Item>
                  )
                }}
              />

            </div>
          </Route>
          <Route exact path="/owners">
            <Owners
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              blockExplorer={blockExplorer}
              transactions={transactions}
              nonce={nonce}
              ownerEvents={ownerEvents}
              signaturesRequired={signaturesRequired}
            />

          </Route>
          <Route exact path="/debug">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
            <Contract
              name="MetaMultiSigWallet"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route path="/pool">
            <Transactions
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              blockExplorer={blockExplorer}
              transactions={transactions}
              nonce={nonce}
              signaturesRequired={signaturesRequired}
            />
          </Route>
          <Route path="/create">
            <CreateTransaction
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              setRoute={setRoute}
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
