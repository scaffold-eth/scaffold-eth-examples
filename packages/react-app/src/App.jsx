import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { PictureOutlined, ExportOutlined, CloseCircleOutlined, WalletOutlined, SendOutlined, CaretUpOutlined, HistoryOutlined, ScanOutlined } from "@ant-design/icons";
import "./App.css";
import { notification, Image, List, Card, Drawer, Tooltip, Select, Row, Col, Button, Menu, Alert, Spin, Switch as SwitchD } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress, useBlockNumber } from "eth-hooks";
import { usePoller, useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import { Wallet, AddressInput, EtherInput, Header, Account, Faucet, Ramp, Contract, GasGauge, ThemeSwitch, QRPunkBlockie, Address, Balance } from "./components";
import { Transactor } from "./helpers";
import { formatEther, parseEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { Hints, ExampleUI, Subgraph } from "./views"
import { useThemeSwitcher } from "react-css-theme-switcher";
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";
import StackGrid from "react-stack-grid"
import Blockies from "react-blockies";

//import Avatars from '@dicebear/avatars';
//import sprites from '@dicebear/avatars-bottts-sprites';

//let options = { dataUri: true };
//let avatars = new Avatars(sprites, options);
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

const voiceGems = [{
    id: "2",
    name: "Opal Earth"
  },{
    id: "4",
    name: "Anti-Ivory"
  },{
    id: "5",
    name: "Earth Core"
  },{
    id: "1",
    name: "Amazonian"
  },{
    id: "3",
    name: "Digital One"
  },{
    id: "6",
    name: "Sky Stone"
  },{
    id: "7",
    name: "Green Earth Stone"
  },{
    id: "8",
    name: "Life Stone"
  },{
    id: "9",
    name: "Digital Forest"
  },{
    id: "10",
    name: "Jungle Stone"
  }
]


/// 📡 What chain are your contracts deployed to?
//const cachedNetwork = window.localStorage.getItem("network")
//let targetNetwork =  NETWORKS[cachedNetwork?cachedNetwork:'ethereum']; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
//if(!targetNetwork){
let targetNetwork =  NETWORKS['xdai'];
//}
// 😬 Sorry for all the console logging
const DEBUG = false

const LOOK_BACK_TO_BLOCK_FOR_EVENTS = 1000

const DISPLAY_WEB3_CONNECT = false

const USE_DELAY = 6500

const IMAGE_SIZE = "larger" // "previews"

let web3AvailableFor = [
  "0xd2a9F3CE1Ace8a88ecDA533d99599b164597761A",
  "0x83f1845F786608F87605Fe29EBA115531f0bB819",
  "0xD75b0609ed51307E13bae0F9394b5f63A7f8b6A1",
  "0x34aA3F359A9D614239015126635CE7732c18fDF3"
]




// 🛰 providers
if(DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
const scaffoldEthProvider = new JsonRpcProvider("https://rpc.scaffoldeth.io:48544")
//const mainnetInfura = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if(DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
let localProvider = new JsonRpcProvider(localProviderUrlFromEnv);


// 🔭 block explorer URL
let blockExplorer = targetNetwork.blockExplorer;

// a function to check your balance on every network and switch networks if found...
const checkBalances = async (address)=>{
  for(let n in NETWORKS){
    let tempProvider = new JsonRpcProvider(NETWORKS[n].rpcUrl);
    let tempBalance = await tempProvider.getBalance(address);
    let result = tempBalance && formatEther(tempBalance)
    if(result!=0){
      console.log("Found a balance in ",n)
      window.localStorage.setItem("network",n);
      setTimeout(() => {
        window.location.reload();
      }, 1);
    }
  }
}

let scanner;

function App(props) {

  const [ thinking, setThinking ] = useState()

  const mainnetProvider = scaffoldEthProvider
  if(DEBUG) console.log("🌎 mainnetProvider",mainnetProvider)

  const [injectedProvider, setInjectedProvider] = useState();

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork,mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork,"fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  if(DEBUG) console.log("👩‍💼 selected address:",address)

  // You can warn the user if you would like them to be on a specific network
  let localChainId = localProvider && localProvider._network && localProvider._network.chainId
  if(DEBUG) console.log("🏠 localChainId",localChainId)

  let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId
  if(DEBUG) console.log("🕵🏻‍♂️ selectedChainId:",selectedChainId)

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice)

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice)

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);
  if(DEBUG) console.log("💵 yourLocalBalance",yourLocalBalance?formatEther(yourLocalBalance):"...")

  let blockNumber = useBlockNumber(localProvider, 35000)
  //const balance = yourLocalBalance && formatEther(yourLocalBalance)


  //if you don't have any money, scan the other networks for money
  /*usePoller(()=>{
    if(!cachedNetwork){
      if(balance==0){
        checkBalances(address)
      }
    }
  },7777)
  setTimeout(()=>{
    if(!cachedNetwork){
      if(balance==0){
        checkBalances(address)
      }
    }
  },1777)
  setTimeout(()=>{
    if(!cachedNetwork){
      if(balance==0){
        checkBalances(address)
      }
    }
  },3777)*/


  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);
  if(DEBUG) console.log("💵 yourMainnetBalance",yourMainnetBalance?formatEther(yourMainnetBalance):"...")

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider)
  if(DEBUG) console.log("📝 readContracts",readContracts)


  const gtgsCoinBalance = useContractReader(readContracts,"GTGSCoin", "balanceOf", [ address ] )
  if(DEBUG) console.log("gtgs token Balance",gtgsCoinBalance)



  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)
  if(DEBUG) console.log("🔐 writeContracts",writeContracts)



  const prices = useContractReader(readContracts,"GTGSCollectible", "prices")
  if(DEBUG) console.log("🤏 prices",prices)

  const counts = useContractReader(readContracts,"GTGSCollectible", "counts")
  if(DEBUG) console.log("🏛 counts",counts)

  const balances = useContractReader(readContracts,"GTGSCollectible", "balances",[ address ])
  if(DEBUG) console.log("🏦 balances",balances)

  const burns = useContractReader(readContracts,"GTGSCollectible", "burns")
  if(DEBUG) console.log("🔥 burns",burns)

  const royaltiesSent = useContractReader(readContracts,"GTGSCollectible", "royaltiesSent")
  if(DEBUG) console.log("🧑‍🎤 royaltiesSent",royaltiesSent)

  const artist = useContractReader(readContracts,"GTGSCollectible", "artist")
  if(DEBUG) console.log("🧑‍🎤 artist",artist)


  let totalBalance = 0
  for(let b in balances){
    totalBalance += balances[b] && balances[b].toNumber()
  }
  //console.log("totalBalance",totalBalance)

 const [ yourCollectibles, setYourCollectibles ] = useState()


 useEffect(()=>{
   const updateYourCollectibles = async () => {
     let collectibleUpdate = []
     for(let tokenIndex=totalBalance-1;tokenIndex>=0;tokenIndex--){
       try{
         //console.log("GEtting token index",tokenIndex)
         const tokenId = await readContracts.GTGSCollectible.tokenOfOwnerByIndex(address, tokenIndex)
         //console.log("tokenId",tokenId)
         const entropy = await readContracts.GTGSCollectible.tokenEntropy(tokenId)
         const artwork = await readContracts.GTGSCollectible.artworkOfToken(tokenId)
         collectibleUpdate.push({ id:tokenId && tokenId.toNumber() , entropy:entropy, artwork: artwork && artwork.toNumber() })
       }catch(e){console.log(e)}
       setYourCollectibles(collectibleUpdate)
     }



   }
   updateYourCollectibles()
 },[ readContracts, address, totalBalance ])

 //console.log("yourCollectibles",yourCollectibles)

 let yourCollectiblesRender = []

 for( let c in yourCollectibles ){

   let topImageSize = 170
   let bottomImageSize = 1600
   let part1 = yourCollectibles[c].entropy.substr(2,32)
   let part2 = yourCollectibles[c].entropy.substr(34)
   let edgeBuffer = bottomImageSize*0.2
   let offset1 = (parseInt(part1,16)%(bottomImageSize-topImageSize-edgeBuffer/2))+edgeBuffer/2
   let offset2 = (parseInt(part2,16)%(bottomImageSize-topImageSize-edgeBuffer/2))+edgeBuffer/2

   let cardActions = []
   cardActions.push(
     <div>
       <Button disabled={thinking} onClick={()=>{
         console.log("yourCollectibles[c]",yourCollectibles[c])
         if(USE_DELAY) {
           setThinking(true)
           setTimeout(()=>{
             setThinking(false)
           },USE_DELAY)
         }
         tx( writeContracts.GTGSCollectible.burn(yourCollectibles[c].artwork,yourCollectibles[c].id,{gasPrice:gasPrice}) )
       }}>
         🔥 burn
       </Button>
     </div>
   )

/*
   setSendToAddress
   cardActions.push(
     <div>
     <AddressInput
       placeholder="send to address"
       address={sendToAddress[yourCollectibles[c].id]}
       onChange={setSendToAddress}
       hoistScanner={(toggle)=>{
         scanner=toggle
       }}
     />
     </div>
   )*/

   let foundName = ""
   for(let g=0;g<voiceGems.length;g++){
     if(voiceGems[g]&&voiceGems[g].id==yourCollectibles[c].artwork){
       foundName=voiceGems[g].name;
     }
   }
   yourCollectiblesRender.push(
     <Card actions={cardActions} style={{width:topImageSize+40,backgroundColor:"#eeeeee",border:"1px solid #444444"}} key={"your"+yourCollectibles[c].entropy+yourCollectibles[c].id} title={(
       <span style={{color:"#666666"}}>
          {"#"+yourCollectibles[c].id+" "+foundName}
       </span>
     )}>
       <div style={{position:"relative",width:topImageSize,height:topImageSize, overflow:"hidden"}}>
         <img style={{filter:"brightness(107%)",position:"absolute",width:bottomImageSize,height:bottomImageSize,top:-offset1,left:-offset2}} src={"/"+IMAGE_SIZE+"/"+yourCollectibles[c].artwork+".jpg"}/>
       </div>
     </Card>
   )
 }


  //📟 Listen for broadcast events
  const streamEvents = useEventListener(readContracts, "GTGSCollectible", "Stream", localProvider, blockNumber-LOOK_BACK_TO_BLOCK_FOR_EVENTS);
  //console.log("📟 streamEvents:",streamEvents)






  let networkDisplay = ""
  if(localChainId && selectedChainId && localChainId != selectedChainId ){
    networkDisplay = (
      <div style={{zIndex:2, position:'absolute', right:0,top:100,padding:8}}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={(
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <Button onClick={async ()=>{
                 let ethereum = window.ethereum;
                 const data = [{
                     chainId: "0x"+targetNetwork.chainId.toString(16),
                     chainName: targetNetwork.name,
                     nativeCurrency:targetNetwork.nativeCurrency,
                     rpcUrls: [targetNetwork.rpcUrl],
                     blockExplorerUrls: [targetNetwork.blockExplorer],
                 }]
                 console.log("data",data)
                 const tx = await ethereum.request({method: 'wallet_addEthereumChain', params:data}).catch()
                 if (tx) {
                     console.log(tx)

                 }
              }}>{NETWORK(localChainId).name}</Button>.
            </div>
          )}
          type="error"
          closable={false}
        />
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
  const faucetAvailable = localProvider && localProvider.connection && localProvider.connection.url && localProvider.connection.url.indexOf("localhost")>=0 && !process.env.REACT_APP_PROVIDER && price > 1;

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

  let startingAddress = ""
  if(window.location.pathname){
    let incoming = window.location.pathname.replace("/","")
    if(incoming && ethers.utils.isAddress(incoming)){
      startingAddress = incoming
      window.history.pushState({},"", "/");
    }

  }
  //console.log("startingAddress",startingAddress)
  const [amount, setAmount] = useState();
  const [toAddress, setToAddress] = useState(startingAddress);

  const [loading, setLoading] = useState(false);

  const [walletUp, setWalletUp] = useState(false);

  const [ transferToAddresses, setTransferToAddresses ] = useState({})

  const walletDisplay = web3Modal && web3Modal.cachedProvider ? "":<Wallet invert={true} gtgsCoinBalance={gtgsCoinBalance} yourLocalBalance={yourLocalBalance} address={address} provider={userProvider} ensProvider={mainnetProvider} price={price} />

  let closeWalletButton = ""
  let scanButton = ""

  if(walletUp){
    closeWalletButton=(
      <div style={{ zIndex:10000,transform:"scale(2.7)",transformOrigin:"70% 80%", position: "absolute", textAlign: "right", right:-2, top: "9%", padding: 10 }}>

         <Button type={"secondary"} shape="circle" size={"large"} onClick={()=>{
           setWalletUp(false)
         }}>
           <CloseCircleOutlined style={{color:"#666666"}}/>
         </Button>
      </div>
    )
  }


  let galleryList = []
  for(let a in voiceGems){
    //console.log("yourCollectibles",yourCollectibles[a])

    let thisCollectible = voiceGems[a]

    let cardActions = []
    /*
    if(loadedAssets[a].forSale){
      cardActions.push(
        <div>
          <Button onClick={()=>{
            console.log("gasPrice,",gasPrice)
            tx( writeContracts.YourCollectible.mintItem(loadedAssets[a].id,{gasPrice:gasPrice}) )
          }}>
            Mint
          </Button>
        </div>
      )
    }else{
      cardActions.push(
        <div>
          owned by: <Address
            address={loadedAssets[a].owner}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            minimized={true}
          />
        </div>
      )
    }
    */

    //console.log("RENDER WITH ID",thisCollectible.id,"balances[thisCollectible.id]",balances && balances[thisCollectible.id])

    const thisBalance = balances && balances[thisCollectible.id-1] ? balances[thisCollectible.id-1].toNumber() : ""

    let streams = {}

    for(let e in streamEvents){
      const artwork = streamEvents[e].artwork.toNumber()
      if(!streams[artwork]){
        streams[artwork] = []
      }
      streams[artwork].push(streamEvents[e])
    }


    let currentCount
    try{
     currentCount = counts && counts[thisCollectible.id-1] ? counts[thisCollectible.id-1].toNumber() : ""
    }catch(e){
      console.log(e)
    }

    let stream = streams[thisCollectible.id]

    stream = stream && stream.slice(0, 4)

    let streamDisplay = []
    for(let i in stream){
      const thisEvent = stream[i]

      const isMint = thisEvent.royalties&&thisEvent.royalties.eq(0)

      //console.log("thisEvent",thisEvent)

      let topImageSize = 170
      let bottomImageSize = 1600
      let part1 = thisEvent.entropy.substr(2,32)
      //console.log("part1",part1)
      let part2 = thisEvent.entropy.substr(34)
      //console.log("part2",part1)
      let edgeBuffer = bottomImageSize*0.2
      let offset1 = (parseInt(part1,16)%(bottomImageSize-topImageSize-edgeBuffer/2))+edgeBuffer/2
      let offset2 = (parseInt(part2,16)%(bottomImageSize-topImageSize-edgeBuffer/2))+edgeBuffer/2

      streamDisplay.push(
        <div key={"stream_"+thisCollectible.id+"_"+i} style={{marginTop:16,marginLeft:"22%",textAlign:"left",fontSize:11}}>
          <Row>
            <Col span={7} style={{width:40,height:40}}>
            <div style={{filter:"brightness(117%)",transform:"scale(0.25)",transformOrigin:"0 0",position:"relative",width:topImageSize,height:topImageSize, overflow:"hidden"}}>
              <img style={{position:"absolute",width:bottomImageSize,height:bottomImageSize,top:-offset1,left:-offset2}} src={"/"+IMAGE_SIZE+"/"+thisEvent.artwork+".jpg"}/>
            </div>
          </Col>
          <Col span={17}>
            <div><Address value={thisEvent.owner} fontSize={12} /></div> {isMint?"minted for":"burned for"} {thisEvent.amount && formatEther(thisEvent.amount).substr(0,7)} {isMint?"":thisEvent&&thisEvent.royalties&&"(-"+formatEther(thisEvent.royalties).substr(0,8)+")"}
          </Col>
          </Row>
        </div>
      )
    }

    const SHOWGOLD = false;

    galleryList.push(
      <Card style={{width:"100%",marginTop:64,marginBottom:64}} key={"gallery"+thisCollectible.id}
        actions={cardActions}
      >
        <Row>
          <Col span={12}  style={{backgroundColor:"#222222"}}>
            <Image src={"./"+IMAGE_SIZE+"/"+thisCollectible.id+".jpg"} style={{maxWidth:550}} />
            <div style={{position:"absolute",bottom:0,left:40,color:"#bbbbbb",verticalAlign:"bottom"}}>
              { SHOWGOLD? (
                <div>
                  <Image src={"./previews/"+thisCollectible.id+"gold.jpg"} style={{maxWidth:50,fontSize:10}}/> Golden NFT on Ethereum
                </div>
              ):"" }
            </div>
          </Col>
          <Col span={12}>
            <h2>
              {thisCollectible.name} <span style={{opacity:0.1}}>/ shards</span>
            </h2>
            <div style={{marginTop:-12,fontSize:12,opacity:0.7,letterSpacing:1}}>
              Voice generated precious digital gemstone.
            </div>
            <div style={{fontSize:64}}>
              { thisBalance } <span style={{opacity:0.05}}>/</span> <span style={{opacity:0.15}}>{ currentCount }</span>
            </div>


            <Button disabled={thinking}  onClick={async()=>{



              if(USE_DELAY) {
                setThinking(true)
                setTimeout(()=>{
                  setThinking(false)
                },USE_DELAY)
              }
              let price = await readContracts.GTGSCollectible.price(thisCollectible.id)
              console.log("price",price)

              if( price.gt(gtgsCoinBalance) ){
                notification.open({
                  message: '⚠️ Not Enough Tokens',
                  description: 'You do not have enough tokens in your wallet to mint. Try burning some shards to get some tokens back?',
                  placement: "bottomLeft"
                });
              }else{
                tx( writeContracts.GTGSCollectible.mint(thisCollectible.id,price,{gasPrice:gasPrice}) )
              }


            }}>
              <span style={{color:"#ae5d5d",marginRight:8}}>{prices&&prices[thisCollectible.id-1]?formatEther(prices[thisCollectible.id-1]).substr(0,7):""}</span> Mint
            </Button>

            <span style={{padding:8}}>

            </span>

            <Button disabled={!thisBalance || thinking || !yourCollectibles || yourCollectibles.length<=0} onClick={async()=>{
              if(USE_DELAY) {
                setThinking(true)
                setTimeout(()=>{
                  setThinking(false)
                },USE_DELAY)
              }
              try{

                let foundId
                for(let c in yourCollectibles){
                  if(yourCollectibles[c].artwork == thisCollectible.id){
                    foundId=yourCollectibles[c].id
                    break;
                  }
                }

                if(foundId){
                  console.log("foundId",foundId)
                  tx( writeContracts.GTGSCollectible.burn(thisCollectible.id,foundId,{gasPrice:gasPrice}) )
                }else{
                  console.log("CANT FIND ONE TO BURN?!")
                }

              }catch(e){
                  console.log(e)
              }

            }}>
              Burn <span style={{color:"#6dae5d",marginLeft:8}}>{burns&&burns[thisCollectible.id-1]?formatEther(burns[thisCollectible.id-1]).substr(0,7):""}</span>
            </Button>
            <div style={{padding:32}}>
              {streamDisplay}
            </div>

          </Col>
        </Row>

      </Card>
    )
  }



  let tokenHolderView = ""
  if(gtgsCoinBalance && gtgsCoinBalance.gt(0) && yourLocalBalance && yourLocalBalance.gt(0)){
    tokenHolderView = (
        <div>

              <div style={{ width:720, margin: "auto", marginTop:32, paddingBottom:32 }}>
                {galleryList}
              </div>

              <div style={{ width:720, margin: "auto", marginBottom:32, paddingBottom:32 , fontSize: 18}}>
                📧 <a href="mailto:toplinksupport@weforum.org" stlye={{marginLeft:8}}>contact support</a>
              </div>

                  <Drawer
                      title={(
                        <div style={{ opacity:yourLocalBalance?1:0.2, padding:16, width:"100%"}}>
                          <Row style={{width:"100%"}}>
                            <Col style={{width:"50%",textAlign:"right"}}>
                              <Balance value={gtgsCoinBalance} size={52} /><span style={{verticalAlign:"middle"}}></span>
                            </Col>
                            <Col style={{opacity:0.5,width:"50%",textAlign:"left"}}>
                              (⛽️<Balance value={yourLocalBalance} size={24} />)
                            </Col>
                          </Row>
                        </div>
                      )}
                      placement={"bottom"}
                      closable={true}
                      onClose={()=>{
                        setWalletUp(false)
                      }}
                      visible={walletUp}
                      key={"walletDrawer"}
                      height={"90%"}
                    >
                      <div style={{position: "relative",paddingTop:32}}>
                          <div style={{padding:16,cursor:"pointer",backgroundColor:"#FFFFFF",width:420,margin:"auto"}}>
                            <QRPunkBlockie withQr={true} address={address} />
                          </div>

                          <div style={{position:"relative", width:320, margin:"auto",textAlign:"center",marginTop:32}}>
                            <div style={{padding: 10}}>
                              <AddressInput
                                ensProvider={mainnetProvider}
                                placeholder="to address"
                                address={toAddress}
                                onChange={setToAddress}
                                hoistScanner={(toggle)=>{
                                  scanner=toggle
                                }}
                              />
                            </div>
                            <div style={{padding: 10}}>
                              <EtherInput
                                /*price={price?price:targetNetwork.price}*/
                                value={amount}
                                onChange={value => {
                                  setAmount(value);
                                }}
                              />
                            </div>
                            <div style={{padding: 10,paddingBottom:32}}>
                              <Button
                                key="sendFunds"
                                type="primary"
                                disabled={loading || !amount || !toAddress }
                                loading={loading}
                                onClick={async () => {
                                  setLoading(true)

                                  let value;
                                  try {
                                    value = parseEther("" + amount);
                                  } catch (e) {
                                    let floatVal = parseFloat(amount).toFixed(8)
                                    // failed to parseEther, try something else
                                    value = parseEther("" + floatVal);
                                  }
                                  /*
                                  let result = tx({
                                    to: toAddress,
                                    value,
                                    gasPrice: gasPrice,
                                    gasLimit: 21000
                                  });
                                  */

                                  //setToAddress("")

                                  let result = await tx( writeContracts.GTGSCoin.transfer(toAddress,value,{gasPrice: gasPrice}) )
                                  setAmount("")
                                  console.log(result)
                                  setLoading(false)
                                }}
                              >
                                {loading || !amount || !toAddress ? <CaretUpOutlined /> : <SendOutlined style={{color:"#FFFFFF"}} /> } Send
                              </Button>
                            </div>




                            <div style={{ zIndex: walletUp?1:-1,opacity: walletUp?1:0, transform:"scale(2.7)",transformOrigin:"70% 80%", position: "fixed", textAlign: "right", right: 0, bottom: 160, padding: 10 }}>

                               <Button key={"theScanner"} disabled={!walletUp} type={"primary"} shape="circle" size={"large"} onClick={()=>{
                                 scanner(true)
                               }}>
                                 <ScanOutlined style={{color:"#FFFFFF"}}/>
                               </Button>
                            </div>
                          </div>

                          <div style={{fontSize:64,letterSpacing:-3,fontWeight:'bolder',color:"#222222",width:650,margin:"auto"}}>
                            {totalBalance} <span style={{opacity:0.24}}> <i>shards collected</i>:</span>
                          </div>

                          <div style={{padding:32}} >

                            <div style={{ maxWidth:820, margin: "auto", marginTop:64, paddingBottom:256 }}>
                               <StackGrid
                                 columnWidth={220}
                                 gutterWidth={16}
                                 gutterHeight={16}
                               >
                                 {yourCollectiblesRender}
                               </StackGrid>
                             </div>
                          </div>


                        </div>
                  </Drawer>

                  <div style={{position:"relative",color:"#ffffff"}}>



                  {/*    {
                      address&&royaltiesSent?
                      <div style={{color:"#ffffff",padding:32,fontSize:14,opacity:0.85}}>🤖 {royaltiesSent && formatEther(royaltiesSent).substr(0,7)} automatic royalties collected by <span style={{ padding:12, backgroundColor:"#777777", borderRadius:8 }}><Address customColor={"#fffff"} fontSize={18} value={artist}/></span>  view the <a style={{color:"#999999",cursor:"pointer"}} href="https://github.com/austintgriffith/scaffold-eth/blob/gtgs-voice-gems/packages/hardhat/contracts/GTGSCollectible.sol">smart contract</a>. </div>
                      :""
                    }<div style={{color:"#ffffff",padding:32,fontSize:18,opacity:0.85}}>On April 7th, <a style={{color:"#1890ff",fontSize:24,opacity:0.85}} href="https://twitter.com/Reeps1" target="_blank">@Reeps1</a> and <a style={{color:"#1890ff",fontSize:24,opacity:0.85}} href="https://twitter.com/austingriffith" target="_blank">@austingriffith</a> will begin dropping <span style={{color:"#e5bd1f",cursor:"pointer"}}>Golden NFTs</span> on Ethereum.</div>
                  */}

                  <Row>
                   <Col span={14} style={{padding:54,color:"#ffffff",background:'url("topgrad.jpg")',backgroundRepeat:"repeat-x",backgroundSize:"100% 100%"}}>

                     <div style={{fontSize:16}}>R100 VOICE GEMS x VOICE GENERATED DIGITAL GEMSTONES</div>
                     <div style={{fontSize:22}}>DIGITAL AUGMENTED LUXURY </div>
                     <div style={{paddingTop:"2%",letterSpacing:1.5,fontSize:10}}>Award Winning Voice-Tech artist and director Harry Yeff ( Reeps100 ) has created a collaborative series of voice generated digital gemstones. The project titled 'Voice Gems' celebrates new opportunities in technology and value. Proposing that the digital may eventually replace the diamond and other potentially wasteful luxury or physical industries. </div>

                     <div style={{color:"#ffffff",fontSize:12, opacity:0.9,padding:64, width:"500", margin: "auto"}}>
                       <div><a style={{color:"#1890ff",fontSize:24,opacity:0.85}} href={"https://reeps100.com/project/voicegems"} target="_blank">voicegems</a> Credits:</div>
                       <div>Harry Yeff ( Reeps100 ) - Creative Director of 'Voice Gems'</div>
                       <div>Trung Bao - Art direction, Creative Director at Fustic Studio</div>
                       <div>---</div>
                       <div>
                         "shard" <a style={{color:"#1890ff",fontSize:16,opacity:0.85}} href="https://github.com/austintgriffith/scaffold-eth/blob/gtgs-voice-gems/packages/hardhat/contracts/GTGSCollectible.sol">smart contracts</a> by <a style={{color:"#1890ff",fontSize:14,opacity:0.85}} href="https://twitter.com/austingriffith">@austingriffith</a>
                       </div>
                     </div>


                   </Col>
                   <Col span={10} style={{color:"#ffffff",background:'url("topgrad.jpg")',backgroundRepeat:"repeat-x",backgroundSize:"100% 100%"}}>
                     <Image src={"./loverstone.png"} width={"100%"} height={"100%"}/>
                   </Col>
                   </Row>


                 <div style={{padding:32,position:"absolute",left:0,bottom:0,width:"100%",backgroundColor:"#eeeeee",opacity:.7}}>
                 .
                 </div>
                 <div style={{fontSize:14, position:"absolute",left:0,bottom:20,paddingRight:"30%",paddingLeft:"20%",width:"100%",opacity:1, color:"#000000"}}>
                   <div>
                   <b style={{marginRight:8}}>Disclaimer</b>
                   This experience is for educational purposes only. The art pieces may not be replicated on any other platform and all participants agree to participate in accordance with the World Economic Forum Terms of Use.
                   </div>
                 </div>

                 {
                   web3AvailableFor.indexOf(address)>=0?<div><Contract
                     name="GTGSCollectible"
                     signer={userProvider.getSigner()}
                     provider={localProvider}
                     address={address}
                     blockExplorer={blockExplorer}
                   />
                   <Contract
                     name="GTGSCoin"
                     signer={userProvider.getSigner()}
                     provider={localProvider}
                     address={address}
                     blockExplorer={blockExplorer}
                   /></div>:""
                 }

                  </div>

                  {/*



                    */}




                  <div style={{ zIndex:2,transform:"scale(2)",transformOrigin:"70% 80%", position: "fixed", textAlign: "right", right: 0, bottom: 16, padding: 10 }}>


                 <Button type={"primary"} shape="oval" size={"large"} onClick={()=>{
                   //scanner(true)
                   setWalletUp(true)
                 }}>
                   <Balance value={gtgsCoinBalance} size={14} /*price={price}*/ /><span style={{verticalAlign:"middle"}}></span>
                   <WalletOutlined style={{color:"#FFFFFF"}}/>
                 </Button>

                 <div style={{position:"absolute",right:58,top:10,color:"#FFFFFF",fontSize:14,textAlign:"right"}}>
                   {totalBalance}
                 </div>
                 <div style={{position:"absolute",right:27,top:9,fontSize:14}}>
                   <PictureOutlined style={{color:"#FFFFFF"}}/>
                 </div>


              </div>

        </div>


    )
  }else{
    if(!gtgsCoinBalance){
        tokenHolderView = (
        <div style={{marginTop:64,fontSize: 18}}>

          <Spin /> Connecting to smart contract...


          <div style={{marginTop:64,color:"#5d5dFF",pointer:"cursor"}} onClick={()=>{window.location.reload(true)}}>try again</div>
        </div>
      )

    }else if(gtgsCoinBalance && gtgsCoinBalance.gt(0)){
      tokenHolderView = (
        <div style={{marginTop:64,fontSize: 18}}>

          <div>
            <Balance value={gtgsCoinBalance} size={24} /> Tokens
          </div>

          <div>
            ⛽️<Balance value={yourLocalBalance} size={24} />
          </div>

          <Spin /> Waiting for xDAI for gas... <span style={{color:"#5d5dFF",pointer:"cursor"}} onClick={()=>{window.location.reload(true)}}>check again</span>.

          <div style={{padding:16,cursor:"pointer",backgroundColor:"#FFFFFF",width:420,margin:"auto"}}>
            <QRPunkBlockie withQr={true} address={address} />
          </div>


        </div>
      )
    }else{
      tokenHolderView = (
        <div style={{marginTop:64,fontSize: 18}}>

          <Spin /> Waiting for tokens... <span style={{color:"#5d5dFF",pointer:"cursor"}} onClick={()=>{window.location.reload(true)}}>check again</span>.

          <div style={{padding:16,cursor:"pointer",backgroundColor:"#FFFFFF",width:420,margin:"auto"}}>
            <QRPunkBlockie withQr={true} address={address} />
          </div>

            ⛽️<Balance value={yourLocalBalance} size={24} />
        </div>
      )
    }
  }



  return (
      <div className="App" style={{fontFamily:'"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: 24, /* GTGS21_Hero_image_March21.jpg backgroundSize:"cover", background:'url("/bg.jpg") no-repeat'*/}}>
          {closeWalletButton}
        <div style={{background:"url('./GTGS21_Hero_image_March21.jpg')",backgroundSize: "cover"}}>

        {networkDisplay}
        <div className="site-page-header-ghost-wrapper">
          <Header extra={
            [
              <span style={{color:"#222222", fontSize:14}}>[ <a target="_blank" style={{color:"#eeeeee"}} href="https://weforum.ent.box.com/s/bkqbph0gzyetk29tf6biigy4v2cdeke2">User Guide & FAQs</a> ] </span>,
              <Address
                fontSize={32}
                address={address}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                invert={true}
              />,
              <Tooltip title="Private Key">{walletDisplay}</Tooltip>,

              DISPLAY_WEB3_CONNECT||web3AvailableFor.indexOf(address)>=0?<Account
                address={address}
                localProvider={localProvider}
                userProvider={userProvider}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
              />:"",
              <span style={{ padding:8 }}>
                <Tooltip title="View On BlockScout">
                  <ExportOutlined style={{ color:"#ffffff" }} onClick={()=>{
                    window.open("https://blockscout.com/xdai/mainnet/address/"+address)
                  }}/>
                </Tooltip>
              </span>
            ]
          }/>
        </div>
      </div>


      <div style={{fontSize:20, width:720, margin:"auto",paddingTop:32}}>
       <div>Welcome to the GTGS NFT Experience</div>
       <div style={{letterSpacing:1,fontSize:11}}><b>Harry Yeff</b> exhibits voice generated digital <b>gems</b> that may replace precious stones.</div>
      </div>

      <div style={{marginTop:64,backgroundColor:"#0000000"}} >
        <div style={{fontSize:13, width:720, border:"1px solid #e8e8e8",margin:"auto",padding:32,marginTop:32, textAlign:'left'}}>
        <div>In this experience, you will be interacting with non-fungible tokens (NFTs), representing <i>shards</i> of <b>Voice Gems</b>.</div>
        <div>To collect an art piece, you <b>mint</b> an NFT <i>shard</i> for the list price.</div>
        <div>To sell the piece back to the market, you will <b>burn</b> it.</div>
        <div>The transactions take place on xDAI, a sidechain of Ethereum, and prices automatically adjust based on the supply and demand at a given time. </div>
        </div>
      </div>

      {tokenHolderView}

    </div>
  );
}
{/*<div>For more detailed information, read the User Guide & FAQs.</div>
          <div>In this experience, you will be interacting with non-fungible tokens (NFTs).</div>
          <div>Using xDAI, a sidechain of Ethereum, you can <b>Mint</b> NFTs that represent shards of Gems.</div>
          <div>Each Voice Gem has a unique price curve where the cost to <b>Mint</b> gets increasingly more expensive.</div>
          <div>At any time, you can <b>Burn</b> a Gem to receive the price in tokens minus an arbitrary fee.</div>
          <hr style={{opacity:0.1}}/>
          <div>NFT owners are eligible to discover a “Golden NFT” on Ethereum representing each Voice Gem.</div>
        */}

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
  setTimeout(() => {
    window.location.reload();
  }, 1);
})

export default App;
