import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import {  JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Menu, Alert, Space, Card, Radio, Input, List, Form, InputNumber} from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader, useBurnerSigner, useAddress, useDebounce } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address, Balance } from "./components";
import { Transactor } from "./helpers";
import { formatEther, parseEther } from "@ethersproject/units";
//import Hints from "./Hints";
import { OptimisticETHBridge } from "./views"
import { INFURA_ID, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS, L1ETHGATEWAY, L2DEPOSITEDERC20 } from "./constants";
import { ethers } from "ethers";

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


function App(props) {

  const [injectedProvider, setInjectedProvider] = useState();

  const price = useExchangePrice(l1Network,mainnetProvider);
  const gasPrice = useGasPrice(l1Network,"fast");

  const l2Burner = useBurnerSigner(l2Provider)
  const l1Burner = useBurnerSigner(l1Provider)
  const mainnetBurner = useBurnerSigner(mainnetProvider)

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

  let L1ETHGatewayContract = new ethers.Contract(config[selectedNetwork].l1ETHGatewayAddress, L1ETHGATEWAY, l1User) // local 0x9934FC453d11334e6bFbE5D3856A2c0E917D26f1
  let L2ETHGatewayContract = new ethers.Contract("0x4200000000000000000000000000000000000006", L2DEPOSITEDERC20, l2User)

  //📟 Listen for broadcast events
  const setPurposeEvents = useEventListener(l2Contracts, "YourContract", "SetPurpose", l2Provider, 1);
  console.log("📟 SetPurpose events:",setPurposeEvents)

  const checkCode = async (_address) => {
    let code = await l2Provider.getCode(_address)
    console.log(code)
  }

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


  return (
    <div className="App">

      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}
      <BrowserRouter>

        <Menu style={{ textAlign:"center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={()=>{setRoute("/")}} to="/">Bridge</Link>
          </Menu.Item>
          <Menu.Item key="/your-contract">
            <Link onClick={()=>{setRoute("/your-contract")}} to="/your-contract">YourContract</Link>
          </Menu.Item>
          <Menu.Item key="/multi-sig">
            <Link onClick={()=>{setRoute("/multi-sig")}} to="/multi-sig">MultiSig</Link>
          </Menu.Item>
          <Menu.Item key="/erc20-gateway">
            <Link onClick={()=>{setRoute("/erc20-gateway")}} to="/erc20-gateway">erc20 Gateway</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
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
          <Route exact path="/your-contract">
            <Contract
              name="YourContract"
              signer={l2User}
              provider={l2Provider}
            />
            <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
            <h2>Events:</h2>
            <List
              bordered
              dataSource={setPurposeEvents}
              renderItem={(item) => {

                return (
                  <List.Item key={item.blockNumber+"_"+item.sender+"_"+item.purpose}>
                    <Address
                        address={item[0]}
                        ensProvider={mainnetProvider}
                        fontSize={16}
                      /> =>
                    {item[1]}
                  </List.Item>
                )
              }}
            />
          </div>
          <Contract
            name="OptimiStickers"
            signer={l2User}
            provider={l2Provider}
          />
          </Route>
          <Route path="/multi-sig">
          <Contract
            name="CallMe"
            signer={l2User}
            provider={l2Provider}
          />
          <Contract
            name="MultiSigWallet"
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
