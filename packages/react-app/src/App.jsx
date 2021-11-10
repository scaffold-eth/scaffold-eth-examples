import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Typography, Select, Form, Card, Layout, Affix, Modal, List, Button, Space } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress, usePoller } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useBalance, useLocalStorage, useContractLoader } from "./hooks";
import { Contract, Balance } from "./components";
import { ethers } from "ethers";
import { Receive, TokenSender, Sender, WalletFooter, WalletHeader, Wallet, Settings, TokenManager, BridgeXdai, NetworkInformation, Erc20Demo, Swap } from "./views"
import { INFURA_ID, ETHERSCAN_KEY, ALCHEMY_KEY } from "./constants";
const { Header, Content, Footer } = Layout;

const DEBUG = true

const mainnetProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)//getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, alchemy: ALCHEMY_KEY, quorum: 1 });
const xDaiProvider = new JsonRpcProvider(`https://dai.poa.network`)

function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(mainnetProvider); //1 for xdai

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice("fast"); //1000000000 for xdai

  const [network, setNetwork] = useLocalStorage("networkName")
  const [selectedProvider, setSelectedProvider] = useState()

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, selectedProvider?selectedProvider:mainnetProvider);
  const mainnetUserProvider = useUserProvider(injectedProvider, mainnetProvider);
  const address = useUserAddress(userProvider);

  const [avatarType, setAvatarType] = useLocalStorage('avatarType','human')

  const [erc20s, setErc20s] = useState({})
  const [myErc20s, setMyErc20s] = useLocalStorage("myErc20s")

  const [showNetworkWarning, setShowNetworkWarning] = useState(false)

  const localContracts = useContractLoader(userProvider)
  let localErc20s = []

  if(localContracts) {
      for (const [key, value] of Object.entries(localContracts)) {
      localErc20s.push({name: key, address: value.address, decimals: 18})
    }
  }

  const networks = {
  100: {
    name: "xDAI",
    id: "xdai",
    chainId: 100,
    price: 1,
    gasPrice: 1000000000,
    color1: "#47a8a5",
    color2: "#45a6a3",
    decimals: 3,
    url: "https://dai.poa.network",
    faucet: "https://xdai-faucet.top/",
    blockExplorer: "https://blockscout.com/poa/xdai/",
    erc20s: [
      {name: "USDC", address: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83", decimals: 6}
    ]
  },
  1: {
    name: "ETH",
    id: "mainnet",
    chainId: 1,
    price: price,
    gasPrice: gasPrice,
    color1: "#626890",
    color2: "#5d658d",
    decimals: 3,
    url: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://etherscan.io/",
    erc20s: [
      {name: "DAI", address: "0x6b175474e89094c44da98b954eedeac495271d0f", decimals: 18},
      {name: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", decimals: 6},
      {name: "LINK", address: "0x514910771af9ca656af840dff83e8264ecf986ca", decimals: 18},
      {name: "AAVE", address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", decimals: 18},
      {name: "UNI", address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", decimals: 18},
      {name: "YFI", address: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", decimals: 18}
    ]
  },
  4: {
    name: "Rinkeby",
    id: "rinkeby",
    chainId: 4,
    color1: "#f6c343",
    color2: "#f4c141",
    gasPrice: 4000000000,
    decimals: 3,
    url: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    faucet: "https://faucet.rinkeby.io/",
    blockExplorer: "https://rinkeby.etherscan.io/",
    erc20s: [
      {name: "test", address: "0xc3994c5cbddf7ce38b8a2ec2830335fa8f3eea6a", decimals: 0}
    ]
  },
  3: {
    name: "Ropsten",
    id: "ropsten",
    chainId: 3,
    color1: "#ff4a8d",
    color2: "#fd4889",
    gasPrice: 4100000000,
    decimals: 3,
    faucet: "https://faucet.dimensions.network/",
    blockExplorer: "https://ropsten.etherscan.io/",
    url: `https://ropsten.infura.io/v3/${INFURA_ID}`
  },
  42: {
    name: "Kovan",
    id: "kovan",
    chainId: 42,
    color1: "#7057ff",
    color2: "#6d53fc",
    gasPrice: 1000000000,
    decimals: 3,
    url: `https://kovan.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://kovan.etherscan.io/",
    faucet: "https://faucet.kovan.network/",
    erc20s: [
      {name: 'kspoa', address: "0xff94183659f549D6273349696d73686Ee1d2AC83", decimals: 18}
    ]
  },
  5: {
    name: "Goerli",
    id: "goerli",
    chainId: 5,
    color1: "#3099f2",
    color2: "#2d95ee",
    gasPrice: 4000000000,
    decimals: 3,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
    url: `https://goerli.infura.io/v3/${INFURA_ID}`
  },
  77: {
    name: "Sokol",
    id: "sokol",
    chainId: 77,
    color1: "#6A0DAD",
    color2: "#6A0DAD",
    gasPrice: 4000000000,
    decimals: 3,
    faucet: "https://faucet.poa.network/",
    blockExplorer: "https://blockscout.com/poa/sokol/",
    url: `https://sokol.poa.network`
  },
  31337: {
    name: "local",
    id: "localhost",
    chainId: 31337,
    color1: "#bbbbbb",
    color2: "#b9b9b9",
    gasPrice: 1000000000,
    decimals: 3,
    url: "http://localhost:8545",
    erc20s: localErc20s
  },
  }


  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourBalance = useBalance(selectedProvider, address);

  function handleChange(value) {
  console.log(`selected ${value}`);
  let newNetwork = value
  setNetwork(newNetwork)
}

useEffect(() => {
  let newProvider
  if(networks[network]) {
  newProvider = new JsonRpcProvider(networks[network].url);
} else {
  newProvider = new JsonRpcProvider(networks[1]['url']);
  setNetwork(1)
}
setSelectedProvider(newProvider)
getErc20s()
},[network, address, myErc20s])


const getErc20s = async () => {
  console.log("getting erc20s")
  if(myErc20s && myErc20s[network] && address) {
    // A Human-Readable ABI; any supported ABI format could be used
    const abi = [
        // Read-Only Functions
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",

        // Authenticated Functions
        "function transfer(address to, uint amount) returns (boolean)",

        // Events
        "event Transfer(address indexed from, address indexed to, uint amount)"
    ];
    let newErc20s = Object.assign({}, erc20s);
    myErc20s[network].forEach(async element => {
      console.log(element)
      let userSigner = userProvider.getSigner()
      const erc20 = new ethers.Contract(element.address, abi, userSigner);
      newErc20s[element.name] = {name: element.name, contract: erc20, decimals: element.decimals, network: networks[network].name}
    });
    setErc20s(newErc20s)
  }
}

  const loadWeb3Modal = useCallback(async () => {

    const provider = await web3Modal.connect();

    const newInjectedNetwork = (chainId) => {
      if(networks[chainId] || networks[parseInt(chainId)]) {
        setShowNetworkWarning(false)
        setNetwork(networks[chainId]?chainId:parseInt(chainId))
        return true
      } else{
        setShowNetworkWarning(true)
        return false
      }
    }

    provider.on("chainChanged", (chainId) => {
      let knownNetwork = newInjectedNetwork(chainId)
      if(knownNetwork) newWeb3Provider()
    });

    const newWeb3Provider = async () => {
      let newWeb3Provider = new Web3Provider(provider)
      let newNetwork = await newWeb3Provider.getNetwork()
      newInjectedNetwork(newNetwork.chainId)
      setInjectedProvider(newWeb3Provider);
    }

    newWeb3Provider()
    if(window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false
    }

    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
      newWeb3Provider()
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
    console.log(route)
  }, [ window.location.pathname ]);

  return (
    <div className="App" style={{height:"100%", minHeight:"100%" }}>
      <BrowserRouter>
      <Layout style={{minHeight:"100%", display:"flex", flexDirection: "column"}}>
        <Affix offsetTop={0}>
        <Header style={{backgroundColor: (network&&networks[network])?networks[network].color1:"#626890", height: "fit-content", verticalAlign: "middle"}}>
          <WalletHeader
            address={address}
            network={network}
            networks={networks}
            handleChange={handleChange}
            loadWeb3Modal={loadWeb3Modal}
            injectedProvider={injectedProvider}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            avatarType={avatarType}
            />
          <Modal visible={showNetworkWarning} title={"Unknown network"} footer={null} closable={false}>
            <span>Sorry we don't support this network! Please set one of the following in your connected wallet:</span>
            {
              <List
                size="small"
                bordered={false}
                dataSource={Object.values(networks)}
                renderItem={item => <List.Item>{item.name + " (chainId " + item.chainId + ")"}</List.Item>}
              />
            }
            <Space><span>Alternatively you can disconnect your wallet.</span><Button onClick={logoutOfWeb3Modal}>Logout</Button></Space>
          </Modal>
        </Header>
        </Affix>
        <Content style={{ padding: '0 50px', margin: 0, flex: 1, justifyContent: "center", height: "fit-content", display:"flex", flexDirection: "column"}}>

          <Switch>
            <Route exact path="/"render={() => (
                <Redirect to="/wallet"/>
            )}/>
            <Route path="/send">
            <Card style={{ maxWidth: 600, width: "100%", margin: 'auto'}}>
              <Balance address={address} provider={selectedProvider} size={64} />
              <Sender
                userProvider={userProvider}
                mainnetProvider={mainnetProvider}
                network={network}
                networks={networks}
                price={price}
                gasPrice={gasPrice}
                />
            </Card>
            </Route>
            <Route path="/send-token">
              <Card style={{ maxWidth: 600, width: "100%", margin: 'auto'}}>
                <TokenSender
                  network={network}
                  networks={networks}
                  erc20s={erc20s}
                  mainnetProvider={mainnetProvider}
                  selectedProvider={selectedProvider}
                  address={address}
                  />
              </Card>
            </Route>
            <Route path="/receive">
              <Receive address={address} mainnetProvider={mainnetProvider}/>
            </Route>
            <Route path="/settings">
              <Settings
                address={address}
                network={network}
                networks={networks}
                gasPrice={gasPrice}
                price={price}
                setMyErc20s={setMyErc20s}
                avatarType={avatarType}
                setAvatarType={setAvatarType}
                />
            </Route>
            <Route path="/wallet">
              <Wallet
                address={address}
                selectedProvider={selectedProvider}
                yourBalance={yourBalance}
                network={network}
                networks={networks}
                price={price}
                mainnetProvider={mainnetProvider}
                erc20s={erc20s}
                myErc20s={myErc20s}
                />
            </Route>
              <Route path="/contract">
                <Row>
                {network==31337?<Contract
                  name="Unlimited"
                  signer={userProvider.getSigner()}
                  provider={selectedProvider}
                  address={address}
                />:<Card style={{ maxWidth: 600, width: "100%", margin: 'auto'}}>
                  <Typography>This is for local development, switch to localhost</Typography>
                </Card>}
              </Row>
              </Route>
              <Route path="/erc20-demo">
                {network==31337?
                  <Erc20Demo
                    address={address}
                    selectedProvider={selectedProvider}
                    localContracts={localContracts}
                    networks={networks}
                    network={network}
                    mainnetProvider={mainnetProvider}
                  />:<Card style={{ maxWidth: 600, width: "100%", margin: 'auto'}}>
                  <Typography>This is for local development, switch to localhost</Typography>
                </Card>}
              </Route>
              <Route path="/manage-tokens">
                  <TokenManager
                    network={network}
                    networks={networks}
                    erc20s={erc20s}
                    myErc20s={myErc20s}
                    setMyErc20s={setMyErc20s}
                    userProvider={userProvider}
                    />
              </Route>
              <Route path="/bridge-xdai">
                <BridgeXdai
                  address={address}
                  selectedProvider={selectedProvider}
                  network={network}
                  networks={networks}
                  userProvider={userProvider}
                  mainnetUserProvider={mainnetUserProvider}
                  gasPrice={gasPrice}
                  injectedProvider={injectedProvider}
                  handleChange={handleChange}
                  />
              </Route>
              <Route path="/swap">
                <Swap
                  selectedProvider={userProvider}
                  />
              </Route>
              <Route path="/network-information">
                <NetworkInformation
                  network={network}
                  networks={networks}
                  />
              </Route>
          </Switch>
        </Content>
        <Footer style={{padding: 0, zIndex: 100}}>
          <Affix offsetBottom={0}>
          <WalletFooter
          network={network}
          networks={networks}
          route={route}
          />
          </Affix>
        </Footer>
      </Layout>
      </BrowserRouter>

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
  console.log('logging out')
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

export default App;
