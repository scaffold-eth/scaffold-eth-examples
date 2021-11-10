import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Menu, List, Card } from "antd";
import {  LinkOutlined } from "@ant-design/icons"
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useContractReader, useExchangePrice, useGasPrice, useContractLoader, useEventListener, useBurnerSigner, useAddress } from "./hooks";
import { Header, Faucet, Ramp, Contract, GasGauge, Address, Balance, AddressInput } from "./components";
import { Transactor } from "./helpers";
//import Hints from "./Hints";
import { OptimisticETHBridge } from "./views"
import { INFURA_ID, NETWORK, NETWORKS, L1ETHGATEWAY, L2DEPOSITEDERC20 } from "./constants";
import { ethers, utils } from "ethers";
import StackGrid from "react-stack-grid";
import assets from './assets.js' // <--- you need to run 'yarn upload' to generate this

const { BufferList } = require('bl')
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

let config = {
  local: {
    l1Network: NETWORKS['localL1'],
    l2Network: NETWORKS['localL2'],
    l1ETHGatewayAddress: '0x9934FC453d11334e6bFbE5D3856A2c0E917D26f1'
  },
  kovan: {
    l1Network: NETWORKS['kovan'],
    l2Network: NETWORKS['kovanL2'],
    l1ETHGatewayAddress: '0x6647D5BD9EB9425838Bb89f76a166228b95671a3'
  }
}

const blockExplorer = "" //O explorer??

let selectedNetwork = 'local'

/// 📡 What chain are your contracts deployed to?
const mainnetNetwork = NETWORKS['mainnet'];
const l1Network = config[selectedNetwork].l1Network;
const l2Network = config[selectedNetwork].l2Network;

// 😬 Sorry for all the console logging
const DEBUG = false

const mainnetProvider = new JsonRpcProvider(mainnetNetwork.rpcUrl);
const l1Provider = new JsonRpcProvider(l1Network.rpcUrl);
const l2Provider = new JsonRpcProvider(l2Network.rpcUrl);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)


//helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path)
    if (!file.content) continue;
    const content = new BufferList()
    for await (const chunk of file.content) {
      content.append(chunk)
    }
    console.log(content)
    return content
  }
}

function App(props) {

  const [injectedProvider, setInjectedProvider] = useState();

  const price = useExchangePrice(l1Network,mainnetProvider);
  const gasPrice = useGasPrice(l1Network,"fast");

  const l2Burner = useBurnerSigner(l2Provider)
  const l1Burner = useBurnerSigner(l1Provider)

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const l1User = injectedProvider ? injectedProvider.getSigner() : l1Burner
  const l2User = injectedProvider ? injectedProvider.getSigner() : l2Burner

  const address = useAddress(l1User);
  if(DEBUG) console.log("👩‍💼 selected address:",address)

  // You can warn the user if you would like them to be on a specific network
  let l1ChainId = l1Provider && l1Provider._network && l1Provider._network.chainId
  let l2ChainId = l2Provider && l2Provider._network && l2Provider._network.chainId
  let injectedChainId = injectedProvider && injectedProvider._network && injectedProvider._network.chainId

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const l1Tx = Transactor(l1User, gasPrice, '', true)
  const l2Tx = Transactor(l2User, gasPrice, '', true)

  const l1Contracts = useContractLoader(l1Provider)
  const l2Contracts = useContractLoader(l2Provider)

  const l2WriteContracts = useContractLoader(l2User)

  let L1ETHGatewayContract = new ethers.Contract(config[selectedNetwork].l1ETHGatewayAddress, L1ETHGATEWAY, l1User) // local 0x9934FC453d11334e6bFbE5D3856A2c0E917D26f1
  let L2ETHGatewayContract = new ethers.Contract("0x4200000000000000000000000000000000000006", L2DEPOSITEDERC20, l2User)

  //📟 Listen for broadcast events
  //const setPurposeEvents = useEventListener(l2Contracts, "YourContract", "SetPurpose", l2Provider, 1);
  //console.log("📟 SetPurpose events:",setPurposeEvents)

  const checkCode = async (_address) => {
    let code = await l2Provider.getCode(_address)
    console.log(code)
  }

  const collectibleAddress = l2Contracts && l2Contracts.YourCollectible.address
  console.log("collectibleAddress",collectibleAddress)


  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(l2Contracts,"YourCollectible", "balanceOf", [ address ])
  console.log("🤗 balance:",balance)

  //📟 Listen for broadcast events
  const transferEvents = useEventListener(l2Contracts, "YourCollectible", "Transfer", l2Provider, 1);
  console.log("📟 Transfer events:",transferEvents)


  const yourBalance = balance && balance.toNumber && balance.toNumber()
  const [ yourCollectibles, setYourCollectibles ] = useState()

  useEffect(()=>{
    const updateYourCollectibles = async () => {
      let collectibleUpdate = []
      for(let tokenIndex=0;tokenIndex<balance;tokenIndex++){
        try{
          console.log("GEtting token index",tokenIndex)
          const tokenId = await l2Contracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex)
          console.log("tokenId",tokenId)
          const tokenURI = await l2Contracts.YourCollectible.tokenURI(tokenId)
          console.log("tokenURI",tokenURI)

          const ipfsHash =  tokenURI.replace("https://ipfs.io/ipfs/","")
          console.log("ipfsHash",ipfsHash)

          const jsonManifestBuffer = await getFromIPFS(ipfsHash)

          try{
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString())
            console.log("jsonManifest",jsonManifest)
            collectibleUpdate.push({ id:tokenId, uri:tokenURI, owner: address, ...jsonManifest })
          }catch(e){console.log(e)}

        }catch(e){console.log(e)}
      }
      setYourCollectibles(collectibleUpdate)
    }
    updateYourCollectibles()
  },[ address, yourBalance ])



  let networkDisplay

  if(injectedChainId){
    let injectedNetworkInfo = Object.values(NETWORKS).find(e => e.chainId === injectedChainId)
    networkDisplay = (
      <div style={{zIndex:-1, position:'absolute', right:18,top:40,padding:16,color:injectedNetworkInfo.color}}>
        {injectedNetworkInfo.name}
      </div>
    )
  }


  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));

    provider.on("chainChanged", (chainId) => {
      console.log(`chain changed to ${chainId}! updating providers`)
      setInjectedProvider(new Web3Provider(provider));
    });

    provider.on("accountsChanged", (accounts) => {
      console.log(`account changed!`)
      setInjectedProvider(new Web3Provider(provider));
    });

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

  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <Button
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={logoutOfWeb3Modal}
        >
          logout
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
          shape="round"
          size="large"
          onClick={loadWeb3Modal}
        >
          connect
        </Button>,
      );
    }
  }


  const [ transferToAddresses, setTransferToAddresses ] = useState({})
  const [ loadedAssets, setLoadedAssets ] = useState()
  useEffect(()=>{
    const updateYourCollectibles = async () => {
      let assetUpdate = []
      for(let a in assets){
        try{
          const forSale = await l2Contracts.YourCollectible.forSale(utils.id(a))
          let owner
          if(!forSale){
            const tokenId = await l2Contracts.YourCollectible.uriToTokenId(utils.id(a))
            owner = await l2Contracts.YourCollectible.ownerOf(tokenId)
          }
          assetUpdate.push({id:a,...assets[a],forSale:forSale,owner:owner})
        }catch(e){console.log(e)}
      }
      setLoadedAssets(assetUpdate)
    }
    if(l2Contracts && l2Contracts.YourCollectible) updateYourCollectibles()
  }, [ assets, l2Contracts, transferEvents ]);

  let galleryList = []
  for(let a in loadedAssets){
    //console.log("loadedAssets",a,loadedAssets[a])

    let cardActions = []
    if(loadedAssets[a].forSale){
      cardActions.push(
        <div>
          <Button onClick={()=>{
            l2Tx( l2WriteContracts.YourCollectible.mintItem(loadedAssets[a].id) )
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

    galleryList.push(
      <Card style={{width:200}} key={loadedAssets[a].name}
        actions={cardActions}
        title={(
          <div>
            {loadedAssets[a].name} <a style={{cursor:"pointer",opacity:0.33}} href={loadedAssets[a].external_url} target="_blank"><LinkOutlined /></a>
          </div>
        )}
      >
        <img style={{maxWidth:130}} src={loadedAssets[a].image}/>
        <div style={{opacity:0.77}}>
          {loadedAssets[a].description}
        </div>
      </Card>
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
          <Link onClick={()=>{setRoute("/")}} to="/">Gallery</Link>
          </Menu.Item>
          <Menu.Item key="/yourcollectibles">
            <Link onClick={()=>{setRoute("/yourcollectibles")}} to="/yourcollectibles">YourCollectibles</Link>
          </Menu.Item>
          <Menu.Item key="/transfers">
            <Link onClick={()=>{setRoute("/transfers")}} to="/transfers">Transfers</Link>
          </Menu.Item>
          <Menu.Item key="/bridge">
            <Link onClick={()=>{setRoute("/bridge")}} to="/bridge">Bridge</Link>
          </Menu.Item>
          <Menu.Item key="/debug">
            <Link onClick={()=>{setRoute("/debug")}} to="/debug">Debug Contracts</Link>
          </Menu.Item>
          { /*}<Menu.Item key="/erc20-gateway">
            <Link onClick={()=>{setRoute("/erc20-gateway")}} to="/erc20-gateway">erc20 Gateway</Link>
          </Menu.Item>*/ }
        </Menu>

        <Switch>
          <Route exact path="/">
            <div style={{ maxWidth:820, margin: "auto", marginTop:32, paddingBottom:256 }}>
              <StackGrid
                columnWidth={200}
                gutterWidth={16}
                gutterHeight={16}
              >
                {galleryList}
              </StackGrid>
            </div>
          </Route>

          <Route path="/yourcollectibles">
            <div style={{ width:640, margin: "auto", marginTop:32, paddingBottom:32 }}>
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={(item) => {
                  const id = item.id.toNumber()
                  return (
                    <List.Item key={id+"_"+item.uri+"_"+item.owner}>
                      <Card title={(
                        <div>
                          <span style={{fontSize:16, marginRight:8}}>#{id}</span> {item.name}
                        </div>
                      )}>
                        <div><img src={item.image} style={{maxWidth:150}} /></div>
                        <div>{item.description}</div>
                      </Card>

                      <div>
                        owner: <Address
                            address={item.owner}
                            ensProvider={mainnetProvider}
                            blockExplorer={blockExplorer}
                            fontSize={16}
                        />
                        <AddressInput
                          ensProvider={mainnetProvider}
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={(newValue)=>{
                            let update = {}
                            update[id] = newValue
                            setTransferToAddresses({ ...transferToAddresses, ...update})
                          }}
                        />
                        <Button onClick={()=>{
                          console.log("l2WriteContracts",l2WriteContracts)
                          l2Tx( l2WriteContracts.YourCollectible.transferFrom(address, transferToAddresses[id], id) )
                        }}>
                          Transfer
                        </Button>
                      </div>
                    </List.Item>
                  )
                }}
              />
            </div>
          </Route>


          <Route path="/transfers">
            <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
              <List
                bordered
                dataSource={transferEvents}
                renderItem={(item) => {
                  return (
                    <List.Item key={item[0]+"_"+item[1]+"_"+item.blockNumber+"_"+item[2].toNumber()}>
                      <span style={{fontSize:16, marginRight:8}}>#{item[2].toNumber()}</span>
                      <Address
                          address={item[0]}
                          ensProvider={mainnetProvider}
                          fontSize={16}
                      /> =>
                      <Address
                          address={item[1]}
                          ensProvider={mainnetProvider}
                          fontSize={16}
                      />
                    </List.Item>
                  )
                }}
              />
            </div>
          </Route>

          <Route exact path="/bridge">
            <OptimisticETHBridge
              address={address}
              l1Provider={l1Provider}
              l2Provider={l2Provider}
              l1Network={l1Network}
              l2Network={l2Network}
              L1ETHGatewayContract={L1ETHGatewayContract}
              L2ETHGatewayContract={L2ETHGatewayContract}
              l1Tx={l1Tx}
              l2Tx={l2Tx}
              chainIds={{ l1ChainId, l2ChainId, injectedChainId }}
            />
          </Route>
         <Route exact path="/debug">
           <Button style={{marginTop:16}} onClick={async ()=>{
               console.log("///collectibleAddress",collectibleAddress)
               const collectibleCode = await checkCode(collectibleAddress)
               console.log("--->collectibleCode",collectibleCode)
           }}>
             check bytecode
           </Button>
            <Contract
              name="YourCollectible"
              signer={l2User}
              provider={l2Provider}
            />
          </Route>
          <Route path="/erc20-gateway">
            <Contract
              name="ERC20"
              signer={l1User}
              provider={l1Provider}
            />
            <Contract
              name="L1ERC20Gateway"
              signer={l1User}
              provider={l1Provider}
            />
            <Contract
              name="L2DepositedERC20"
              signer={l2User}
              provider={l2Provider}
            />
          </Route>
        </Switch>
      </BrowserRouter>


      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Address address={address} ensProvider={mainnetProvider} />
        <Balance address={address} provider={l1Provider} price={price} color={l1Network.color}/>
        <Balance address={address} provider={l2Provider} price={price} prefix={"L2"} color={l2Network.color}/>
         {modalButtons}

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
                 <Faucet localProvider={l1Provider} price={price} ensProvider={mainnetProvider}/>
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
  window.localStorage.removeItem('walletconnect');
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

export default App;
