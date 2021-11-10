import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { MailOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, List, Tabs, Menu } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress, useTimestamp } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address, EtherInput } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
//import Hints from "./Hints";
import { Activity, ExampleUI, Subgraph, Results } from "./views"
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
import humanizeDuration from "humanize-duration";
const { TabPane } = Tabs;

const DEBUG = false

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
//const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/"+INFURA_ID)
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
//const localProviderUrl = "https://mainnet.infura.io/v3/5b3aa68d82264f59bb6a1874cb3c23ea"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
//const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
//if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider("http://localhost:8545");//mainnetProvider//



function App(props) {


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

  const roundStart = useContractReader(readContracts, "MVPCLR", "roundStart")
  if(DEBUG) console.log("⏰ roundStart",roundStart)

  const roundDuration = useContractReader(readContracts, "MVPCLR", "roundDuration")
  if(DEBUG) console.log("⏰ roundDuration",roundDuration)

  const currentTime = useTimestamp(localProvider)
  if(DEBUG) console.log("⏰ currentTime",currentTime)

  const clrBalance = useBalance(localProvider, readContracts?readContracts.MVPCLR.address:readContracts);
  if(DEBUG) console.log("🏦 clrBalance",clrBalance)

  const roundFinish = roundStart&&roundDuration?roundStart.add(roundDuration):0
  const roundFinishedIn = roundFinish && (roundFinish.toNumber() - currentTime)
  if(DEBUG) console.log("roundFinishedIn",roundFinishedIn)//
  const roundFinished = roundFinish && ( roundFinishedIn <= 0 )

  //RecipientAdded(address addr, bytes32 data, uint256 index);
  const recipientAddedEvents = useEventListener(readContracts, "MVPCLR", "RecipientAdded", localProvider, 1);
  if(DEBUG) console.log("📟 recipientAddedEvents:",recipientAddedEvents)

  const [randomProjectList, setRandomProjectList] = useState([])
  useEffect(()=>{
    let newList = []
    let added = {}
    for(let r in recipientAddedEvents){
      if(DEBUG) console.log("recipientAddedEvents ==>",recipientAddedEvents[r])
      const index = recipientAddedEvents[r].index.toNumber()
      if(!added[index]){
        added[index] = true
        newList.push(recipientAddedEvents[r])
      }
    }
    setRandomProjectList(shuffle(newList))
  },[recipientAddedEvents])


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
  }, [ window.location.pathname ]);

  const [ supportAmounts, setSupportAmount ] = useState({})


  let status = "loading..."
  if(roundFinished){
    status = (
      <div style={{marginTop:32,marginLeft:64,marginRight:64,marginBottom:16,border:"1px solid #f8f8f8",backgroundColor:"#fbfbfb",padding:16,fontSize:16, fontWeight:"bold"}}>
        Finished <span style={{color:"#999999"}}>{humanizeDuration(roundFinishedIn*1000)} ago</span>
      </div>
    )
  }else if(roundStart && roundFinish && roundStart.gt(0)){
    status = (
      <div style={{marginTop:32,marginLeft:64,marginRight:64,marginBottom:16,border:"1px solid #f8f8f8",backgroundColor:"#fbfbfb",padding:16,fontSize:16, fontWeight:"bold"}}>
        Funding round is <span style={{color:"#95de64"}}>open</span>,
        ends in <span style={{color:"#adc6ff"}}>{humanizeDuration(roundFinishedIn*1000)}</span>.
      </div>
    )
  }else{
    status = (
      <div style={{marginTop:32,marginLeft:64,marginRight:64,marginBottom:16,border:"1px solid #f8f8f8",backgroundColor:"#fbfbfb",padding:16,fontSize:16, fontWeight:"bold"}}>
        Waiting to start...
      </div>
    )
  }

  return (
    <div className="App">

      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />

      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">Support</Link>
          </Menu.Item>
          <Menu.Item key="/activity">
            <Link onClick={()=>{setRoute("/activity")}} to="/activity">Activity</Link>
          </Menu.Item>

          <Menu.Item key="/results">
            <Link onClick={()=>{setRoute("/results")}} to="/results">Results</Link>
          </Menu.Item>
          <Menu.Item key="/debug">
            <Link onClick={()=>{setRoute("/debug")}} to="/debug">🔧</Link>
          </Menu.Item>
          <Menu.Item key="/code">
            <a target="_blank" href="https://github.com/austintgriffith/scaffold-eth/tree/emoji-support">🍴</a>
          </Menu.Item>
          <Menu.Item key="/chat">
            <a target="_blank" href="https://twitter.com/austingriffith">💬</a>
          </Menu.Item>

        </Menu>

        <Switch>
          <Route exact path="/">
            <div style={{width:700,margin:"auto",paddingBottom:128}}>

              {status}

              <List
                size="large"
                dataSource={randomProjectList}
                renderItem={(item)=>{
                  //console.log("item",item)
                  const index = item.index.toNumber()
                  return (
                    <List.Item key={index}>
                      <div>
                        <div style={{textAlign:"left",padding:8,fontWeight:'bolder',letterSpacing:"1.5px"}}>
                          {ethers.utils.parseBytes32String(item.data)}<a style={{fontSize:8}} href={item.link}>{"🔗"}</a>
                        </div>
                        <div style={{textAlign:"left",padding:8}}>
                          <Address
                            value={item.addr}
                            ensProvider={mainnetProvider}
                            blockExplorer={blockExplorer}
                            fontSize={16}
                          />
                        </div>
                      </div>
                      <div style={{float:"right",opacity:roundFinished?0.1:1}}>
                        <Row>
                          <Col span={16}>
                            <EtherInput
                              price={price}
                              value={supportAmounts[index]}
                              onChange={value => {
                                let current = supportAmounts
                                current[index] = value
                                setSupportAmount(current)
                              }}
                            />
                          </Col>
                          <Col span={8}>
                            <Button onClick={()=>{
                              if(supportAmounts && supportAmounts[index]){
                                tx( writeContracts.MVPCLR.donate(index,{value:parseEther(""+supportAmounts[index].toFixed(8))}) )
                                let current = supportAmounts
                                current[index] = ""
                                setSupportAmount(current)
                              }
                            }}>
                              Support
                            </Button>
                          </Col>
                        </Row>
                      </div>

                    </List.Item>
                  )
                }}
              />
            </div>
          </Route>
          <Route exact path="/debug">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
            <Contract
              name="MVPCLR"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>

          <Route exact path="/activity">
            <Activity
              address={address}
              recipientAddedEvents={recipientAddedEvents}
              readContracts={readContracts}
              localProvider={localProvider}
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              price={price}
            />
          </Route>
          <Route exact path="/results">
            <Results
              tx={tx}
              roundFinish={roundFinish}
              clrBalance={clrBalance}
              address={address}
              writeContracts={writeContracts}
              recipientAddedEvents={recipientAddedEvents}
              readContracts={readContracts}
              localProvider={localProvider}
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
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

const shuffle = (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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
