import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Menu } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address } from "./components";
import { Transactor } from "./helpers";
import { formatEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views"
// nes-react reference: https://github.com/bschulte/nes-react/blob/master/example/src/App.js
import { Container, Button, Avatar } from "nes-react";
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { synthwave84 } from 'react-syntax-highlighter/dist/esm/styles/prism'
import gfm from 'remark-gfm'
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
import { INFURA_ID, DAI_ADDRESS, DAI_ABI } from "./constants";




// 😬 Sorry for all the console logging 🤡
const DEBUG = true

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
//const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/"+INFURA_ID)
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "http://localhost:8545"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = mainnetProvider//new JsonRpcProvider(localProviderUrlFromEnv);

// SyntaxHighlighter (renderer for ReactMarkdown)
const renderers = {
  code: ({language, value}) => {
    return <SyntaxHighlighter style={ synthwave84 } language={language} children={value} />
  }
}


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

  // If you want to bring in the mainnet DAI contract it would look like:
  //const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI)
  //console.log("🥇DAI contract on mainnet:",mainnetDAIContract)


  // keep track of a variable from the contract in the local React state:
  //const purpose = useContractReader(readContracts,"YourContract", "purpose")
  //console.log("🤗 purpose:",purpose)

  //📟 Listen for broadcast events
  //const setPurposeEvents = useEventListener(readContracts, "YourContract", "SetPurpose", localProvider, 1);
  //console.log("📟 SetPurpose events:",setPurposeEvents)

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

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


  const [dialog, setDialog] = useState([
    { text: "Welcome to [eth.dev](/)!\n\n"+
            "A game for developers learning **Ethereum**.\n\n"
    }
  ]);
  const addDialog = (newDialog)=>{setDialog([...dialog,newDialog])}

  useEffect(()=>{
    if(dialog.length==1){
      console.log("LEN 11111")
    setTimeout(()=>{
      console.log("ADDING!!!!!!!!!")
      addDialog(
        { text: "You'll need to be a *decent* coder to learn how to build decentralized applications...\n\n"+
                "...you in?"
        }
      )
    },250)
  }
},[dialog, addDialog])

  useEffect(()=>{
    if(dialog.length==2){
      setTimeout(()=>{
        addDialog(
          {
            buttons: [
              { text: "No, I'm not a developer", click:()=>{
                addDialog(
                  {
                    response: "I'm not a developer."
                  }
                )
                window.location="https://eth.build"
              }},
              { text: "Yes, I can code!", props:{ primary: true }, click:()=>{
                addDialog(
                  {
                    response: "I'm in."
                  }
                )
              }}
            ]
          }
        )
      },500)
    }

  },[dialog])
/*response: "Hell yeah, let's go!", color: "#efefef"*/
  const display = []
  for(let d in dialog){
    console.log("ADD dialog",dialog[d])
    if(dialog[d].response){
      //buttons
      display.push(
        <div style={{width:"100%",maxWidth:1024,margin:"auto",paddingRight:16,opacity:9,marginTop:32,marginBottom:32,textAlign:"right"}}>

          <div class="nes-balloon from-right" style={{width:"calc(100% - 160px)"}}>
            <p>{dialog[d].response}</p>
          </div>

          <img src="/anonpunk.png" style={{minWidth:"120px",imageRendering:"pixelated",transform:"scaleX(-1)"}} />
        </div>
      )
    }else if(dialog[d].buttons){

      let buttonDisplay = []
      for(let b in dialog[d].buttons){
        console.log("BUTTON",dialog[d].buttons[b])
        buttonDisplay.push(
          <span style={{margin:4}}>
            <Button {...dialog[d].buttons[b].props} onClick={dialog[d].buttons[b].click} >
              {dialog[d].buttons[b].text}
            </Button>
          </span>
        )
      }

      display.push(
        <div style={{position:"relative",width:"100%",maxWidth:1024,margin:"auto",paddingRight:16,opacity:9,marginTop:32,marginBottom:32,textAlign:"right"}}>

          <div class="nes-balloon from-right" style={{opacity:0.5,marginLeft:"10vw",width:"80vw",left:0,top:0,position:"absolute",height:90}}>

          </div>

          <div style={{marginTop:28, marginLeft:"10vw",width:"80vw",left:0,top:0,position:"absolute",height:90}}>
            {buttonDisplay}
          </div>

        </div>
      )
    }else{
      display.push(
        <div style={{width:"100%",maxWidth:1024,margin:"auto",paddingRight:16,opacity:9,marginTop:32,marginBottom:32,textAlign:"left"}}>
          <img src="/punk5950.png" style={{minWidth:"120px",imageRendering:"pixelated"}} />
          <div class="nes-balloon from-left" style={{width:"calc(100% - 160px)"}}>
            <ReactMarkdown plugins={[gfm]}  renderers={renderers} children={dialog[d].text} />
          </div>
        </div>
      )
    }

  }



  return (
    <div className="App">

      {/* ✏️ Edit the header and change the title to your project name
      <Header />
      */}

      <div style={{paddingBottom:"20vmin", cursor:"pointer",paddingTop:"20vmin",}}>
        {display}
        <Button style={{display:"none"}} onClick={()=>{
          console.log("ADD")
          if(Date.now()%2==0){
             setDialog([...dialog,
  {
    text: `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

~~~javascript
<Button onClick={()=>{
  /* you can also just craft a transaction and send it to the tx() transactor */
  tx({
    to: writeContracts.YourContract.address,
    value: parseEther("0.001"),
    data: writeContracts.YourContract.interface.encodeFunctionData("setPurpose(string)",["🤓 Whoa so 1337!"])
  });
  /* this should throw an error about "no fallback nor receive function" until you add it */
}}>Another Example</Button>
~~~

~~~bash
ls -la
~~~

~~~solidity
contract YourContract {
  string public purpose = "🛠 Programming Unstoppable Money";
}
~~~
`,
  }
])
          }else{
            setDialog([...dialog,
              {
                text: "Lorem Ipsum totally whipped 'em. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
              }
            ])
          }

          setTimeout(()=>{
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
          },1)
        }}>
         moreasdf
        </Button>
      </div>


      <BrowserRouter >
        {/*
        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">YourContract</Link>
          </Menu.Item>
          <Menu.Item key="/hints">
            <Link onClick={()=>{setRoute("/hints")}} to="/hints">Hints</Link>
          </Menu.Item>
          <Menu.Item key="/exampleui">
            <Link onClick={()=>{setRoute("/exampleui")}} to="/exampleui">ExampleUI</Link>
          </Menu.Item>
          <Menu.Item key="/subgraph">
            <Link onClick={()=>{setRoute("/subgraph")}} to="/subgraph">Subgraph</Link>
          </Menu.Item>
        </Menu>
        */}
        <Switch>
          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally

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
          <Route path="/hints">
            <Hints
              address={address}
              yourLocalBalance={yourLocalBalance}
              mainnetProvider={mainnetProvider}
              price={price}
            />
          </Route>
          <Route path="/exampleui">
            <ExampleUI
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
            /*  purpose={purpose}
              setPurposeEvents={setPurposeEvents} */
            />
          </Route>
          <Route path="/subgraph">
            <Subgraph
            subgraphUri={props.subgraphUri}
            tx={tx}
            writeContracts={writeContracts}
            mainnetProvider={mainnetProvider}
            />
          </Route>
        </Switch>
      </BrowserRouter>


      {/* 👨‍💼 Your account is in the top right with a wallet at connect options
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
      </div>*/}

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support:
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
               localProvider && localProvider.connection && localProvider.connection.url && localProvider.connection.url.indexOf("localhost")>=0 && !process.env.REACT_APP_PROVIDER && price > 1 ? (
                 <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider}/>
               ) : (
                 ""
               )
             }
           </Col>
         </Row>
       </div>*/}

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
