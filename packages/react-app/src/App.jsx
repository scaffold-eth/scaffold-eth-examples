import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  StaticJsonRpcProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Spin, Image, Card, Row, Col, Button, Menu, Alert, Switch as SwitchD } from "antd";
import { LogoutOutlined, SendOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useOnBlock, useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import { Address, AddressInput, Header, Account, Faucet, Ramp, Contract, GasGauge, ThemeSwitch } from "./components";
import { Transactor } from "./helpers";
import { ethers } from "ethers"
import { formatEther, parseEther } from "@ethersproject/units";
import axios from "axios";
import { Hints, ExampleUI, Subgraph } from "./views"
import { useThemeSwitcher } from "react-css-theme-switcher";
import { INFURA_ID, NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, NETWORK, NETWORKS } from "./constants";
import StackGrid from "react-stack-grid"
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

const { BufferList } = require('bl')
//
//  we will connect to infura, but you can connect to _any_ IPFS node:
//    (and you should run your own!)
//
const ipfsAPI = require('ipfs-http-client');// https://www.npmjs.com/package/ipfs-http-client
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })



/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS['mainnet']; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true


// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = new StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
const mainnetInfura = new StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new StaticJsonRpcProvider(localProviderUrlFromEnv);


// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;


function App(props) {

  const mainnetProvider = (scaffoldEthProvider && scaffoldEthProvider._network) ? scaffoldEthProvider : mainnetInfura

  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork,mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork,"fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  // You can warn the user if you would like them to be on a specific network
  let localChainId = localProvider && localProvider._network && localProvider._network.chainId
  let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice)

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice)

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const nftContractRead = useExternalContractLoader( localProvider, NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI)

  // If you want to bring in the mainnet DAI contract it would look like:
  const nftContractWrite = useExternalContractLoader( userProvider, NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI)


  const contractName = useContractReader({nftContractRead},"nftContractRead", "name")

  // keep track of a variable from the contract in the local React state:
  const yourNFTBalance = useContractReader({nftContractRead},"nftContractRead", "balanceOf", [ address ])
  if(DEBUG&&yourNFTBalance) console.log("🧮 yourNFTBalance",yourNFTBalance)

  const [ yourCollectibles, setYourCollectibles ] = useState()

  const yourNFTBalancetoNumber = yourNFTBalance && yourNFTBalance.toNumber && yourNFTBalance.toNumber()
  useEffect(()=>{
   const updateYourCollectibles = async () => {
     let collectibleUpdate = []
     if(nftContractRead && nftContractRead.tokensOfOwner){
       //console.log("Getting token index",tokenIndex)
       const allTokens =  await nftContractRead.tokensOfOwner(address)

       if(DEBUG&&allTokens) console.log("🆔 allTokens",allTokens)

       for(let t in allTokens){
         try{
           console.log("THIS TOKJEN",allTokens[t])
           const theToken =  await nftContractRead.getToken(allTokens[t])
           console.log("theToken",theToken)
           collectibleUpdate.push({ id:allTokens[t], image: "https://cryptogs.io/cryptogs/"+ethers.utils.parseBytes32String(theToken.image)})
           setYourCollectibles(collectibleUpdate)
         }catch(e){console.log(e)}
       }
     }
   }
   updateYourCollectibles()
  },[ readContracts, address, yourNFTBalancetoNumber ])

  console.log("👛 yourCollectibles",yourCollectibles)
  let yourCollectiblesRender = []

  const [ showSend, setShowSend ] = useState({})
  const [ toAddress, setToAddress ] = useState({})

  for( let c in yourCollectibles ){
     let cardActions = []

     const id = yourCollectibles[c].id

     if(showSend[id]){
       cardActions.push(
         <div style={{marginTop:-32}}>
           <div style={{paddingTop:8,padding:4,marginBottom:8,backgroundColor:"#ffffff"}}>
             <AddressInput
               autoFocus
               ensProvider={mainnetProvider}
               placeholder="to address"
               value={toAddress[id]}
               onChange={(value)=>{
                 let update = {}
                 update[id] = value
                 setToAddress({...toAddress, ...update})
               }}
             />
           </div>
           <div>
            <Row>
              <Col span={12}>
                <Button onClick={()=>{
                  let update = {}
                  update[id] = false
                  setShowSend({...showSend, ...update})
                }}>
                  <CloseCircleOutlined />
                </Button>
              </Col>
              <Col span={12}>
                <Button onClick={async ()=>{
                  console.log("💸 Transfer...")
                  const result = await tx( nftContractWrite.transferFrom(address,toAddress[id], id) )
                  console.log("📡 result...",result)
                  let update = {}
                  update[id] = false
                  setShowSend({...showSend, ...update})
                }}>
                  <SendOutlined />
                </Button>
              </Col>
            </Row>

           </div>
         </div>
       )
     }

     if(!showSend[yourCollectibles[c].id]){
       cardActions.push(
         <div>
           <Button onClick={(id)=>{
             let update = {}
             update[yourCollectibles[c].id] = true
             setShowSend({...showSend, ...update})
           }}>
             <SendOutlined />
           </Button>
         </div>
       )
       cardActions.push(
          <div>
            <Button onClick={()=>{
              window.open(yourCollectibles[c].external_url.replace("{id}",yourCollectibles[c].id))
            }}>
              <LogoutOutlined />
            </Button>
          </div>
       )
     }



     yourCollectiblesRender.push(
       <Card actions={cardActions} style={{backgroundColor:"#eeeeee",border:"1px solid #444444"}} key={"your"+yourCollectibles[c].entropy+yourCollectibles[c].id} title={(
         <span style={{color:"#666666"}}>
            {yourCollectibles[c].name}
         </span>
       )}>
         <Image style={{maxWidth:220}} src={yourCollectibles[c].image}/>
       </Card>
     )
  }

  const stackedNFTDisplay = yourNFTBalance && yourNFTBalance.toNumber() ? (
    <div style={{ maxWidth:1020, margin: "auto", marginTop:64, paddingBottom:256 }}>

      <div style={{fontSize:32,marginBottom:32,marginTop:32}}>
        {yourNFTBalance && yourNFTBalance.toNumber()} {contractName}
      </div>

       <StackGrid
         columnWidth={220}
         gutterWidth={16}
         gutterHeight={32}
       >
         {yourCollectiblesRender}
       </StackGrid>

       <div style={{fontSize:16,marginTop:64, opacity:0.9}}>
         {contractName} smart contract: <Address fontSize={16} minimized={false} address={nftContractRead&&nftContractRead.address} ensProvider={props.ensProvider} />
       </div>

    </div>
  ):<div style={{marginTop:64}}><Spin/></div>




  //📟 Listen for broadcast events
  //const setPurposeEvents = useEventListener(readContracts, "YourContract", "SetPurpose", localProvider, 1);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(()=>{
    if(DEBUG && mainnetProvider && address && selectedChainId && yourLocalBalance && yourMainnetBalance && readContracts && writeContracts){
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________")
      console.log("🌎 mainnetProvider",mainnetProvider)
      console.log("🏠 localChainId",localChainId)
      console.log("👩‍💼 selected address:",address)
      console.log("🕵🏻‍♂️ selectedChainId:",selectedChainId)
      console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")
      console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")
      console.log("📝 readContracts",readContracts)
      console.log("🔐 writeContracts",writeContracts)
    }
  }, [mainnetProvider, address, selectedChainId, yourLocalBalance, yourMainnetBalance, readContracts, writeContracts])



  let networkDisplay = ""
  if(localChainId && selectedChainId && localChainId != selectedChainId ){
    networkDisplay = (
      <div style={{zIndex:2, position:'absolute', right:0,top:60,padding:16}}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={(
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
            </div>
          )}
          type="error"
          closable={false}
        />
      </div>
    )
  }else{
    networkDisplay = (
      <div style={{zIndex:-1, position:'absolute', right:154,top:28,padding:16,color:targetNetwork.color}}>
        {targetNetwork.name}
      </div>
    )
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
    setRoute(window.location.pathname)
  }, [setRoute]);

  let faucetHint = ""
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name == "localhost"

  const [ faucetClicked, setFaucetClicked ] = useState( false );
  if(!faucetClicked&&localProvider&&localProvider._network&&localProvider._network.chainId==31337&&yourLocalBalance&&formatEther(yourLocalBalance)<=0){
    faucetHint = (
      <div style={{padding:16}}>
        <Button type={"primary"} onClick={()=>{
          faucetTx({
            to: address,
            value: parseEther("0.01"),
          });
          setFaucetClicked(true)
        }}>
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    )
  }

  return (
    <div className="App">

      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">holdings</Link>
          </Menu.Item>
          <Menu.Item key="/contract">
            <Link onClick={()=>{setRoute("/contract")}} to="/contract">contract</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}

            { stackedNFTDisplay }

            { /* uncomment for a second contract:
            <Contract
              name="SecondContract"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            */ }

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
          <Route path="/contract">
            <Contract
              name="NFT"
              customContract={nftContractWrite}
              signer={userProvider.getSigner()}
              provider={userProvider}
              address={address}
              blockExplorer={"https://etherscan.io/"}
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
             <Ramp price={price} address={address} networks={NETWORKS}/>
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

 window.ethereum && window.ethereum.on('chainChanged', chainId => {
  web3Modal.cachedProvider &&
  setTimeout(() => {
    window.location.reload();
  }, 1);
})

 window.ethereum && window.ethereum.on('accountsChanged', accounts => {
  web3Modal.cachedProvider &&
  setTimeout(() => {
    window.location.reload();
  }, 1);
})

//helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    //console.log(file.path)
    if (!file.content) continue;
    const content = new BufferList()
    for await (const chunk of file.content) {
      content.append(chunk)
    }
    //console.log(content)
    return content
  }
}

export default App;
