import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { MailOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, List, Tabs, Menu, Select } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Address } from "./components";
import { Transactor } from "./helpers";
import { parseEther, formatEther } from "@ethersproject/units";
import { utils } from "ethers";
import { Info, Recipients, Donate, Donations, Donors, PoolDonations, Withdrawals } from "./views"
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
const { Option } = Select;

// 🔭 block explorer URL
const blockExplorer = "https://etherscan.io/" // for xdai: "https://blockscout.com/poa/xdai/"

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
// const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/5ce0898319eb4f5c9d4c982c8f78392a")
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = "http://localhost:8545"; // for xdai: https://dai.poa.network
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);



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

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts,"YourContract", "purpose")
  console.log("🤗 purpose:",purpose)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)
  console.log("🔐 writeContracts",writeContracts)


  const recipientAddedEvents = useEventListener(readContracts, "CLR", "RecipientAdded", localProvider, 1);
  console.log("📟 recipientAddedEvents:",recipientAddedEvents)

  const donationEvents = useEventListener(readContracts, "CLR", "Donate", localProvider, 1);
  console.log("📟 donationEvents:", donationEvents)

  const totalMatchingWeight = useContractReader(readContracts,"CLR", "totalMatchingWeight")
  console.log("👜 totalMatchingWeight:",totalMatchingWeight)

  const matchingPool = useContractReader(readContracts,"CLR", "matchingPool")
  console.log("💰 matchingPool:",matchingPool)

  const matchingPoolDonationEvents = useEventListener(readContracts, "CLR", "MatchingPoolDonation", localProvider, 1);
  console.log("📟 matchingPoolDonationEvents:",matchingPoolDonationEvents)

  const withdrawEvents = useEventListener(readContracts, "CLR", "Withdraw", localProvider, 1);
  console.log("📟 withdrawEvents:",withdrawEvents)

  const [ recipients, setRecipients ] = useState([])
  const [ recipientOptions, setRecipientOptions ] = useState([])
  const [ currentTotalWeight, setCurrentTotalWeight ] = useState([])



  const donorAllowedEvents = useEventListener(readContracts, "DonorManager", "DonorAllowed", localProvider, 1);
  //console.log("📟 donorAllowedEvents:",donorAllowedEvents)


  const owner = useContractReader(readContracts,"CLR", "owner")
  console.log("🗝 owner:",owner)

  const roundStart = useContractReader(readContracts,"CLR", "roundStart")
  console.log("⏱ roundStart:",roundStart)

  const roundDuration = useContractReader(readContracts,"CLR", "roundDuration")
  console.log("⏱ roundDuration:",roundDuration)

  const getBlockTimestamp = useContractReader(readContracts,"CLR", "getBlockTimestamp")
  console.log("⏱ getBlockTimestamp:",getBlockTimestamp)

  let mode = "loading..."
  if(roundStart && roundStart.toNumber()<=0){
    mode = "Waiting to begin..."
  }else if(roundStart && roundStart.toNumber()>0 && getBlockTimestamp && roundDuration){

    let timeLeft = roundStart.toNumber() + roundDuration.toNumber() - getBlockTimestamp.toNumber()

    if(timeLeft>=0){
      mode = "Round open! ("+timeLeft+"s left...)"
    }else{
      mode = "Round is over..."
    }

  }


  useEffect(()=>{
    const getRecipients = async ()=>{
      console.log("Loading up recipient list...")
      let newRecipients = []
      let newRecipientOptions = []

      let totalWeight
      for(let i=0;i<recipientAddedEvents.length;i++){
        const thisIndex = recipientAddedEvents[i].index.toNumber()
        const recipientObject = await readContracts.CLR.recipients(thisIndex)
        let recipient = {}
        Object.assign(recipient,recipientObject)
        recipient.index = thisIndex
        newRecipients.push( recipient );
        newRecipientOptions.push(
          <Option key={"ro_"+i} value={i}>{utils.toUtf8String(recipientAddedEvents[i].title)}</Option>
        )

        newRecipients[i].totalDonations = await readContracts.CLR.totalDonations(thisIndex)
        newRecipients[i].sumOfSqrtDonation = await readContracts.CLR.sumOfSqrtDonation(thisIndex)
        newRecipients[i].currentWeight = newRecipients[i].sumOfSqrtDonation.mul(newRecipients[i].sumOfSqrtDonation)

        if(!totalWeight){
          totalWeight = newRecipients[i].currentWeight
        } else{
          totalWeight = totalWeight.add(newRecipients[i].currentWeight)
        }
      }

      setRecipients(newRecipients)
      setRecipientOptions(newRecipientOptions)
      setCurrentTotalWeight(totalWeight)
    }
    getRecipients()
  },[ recipientAddedEvents, setRecipients, donationEvents ])



  const [ donationsByAddress, setDonationsByAddress ] = useState({})

  useEffect(()=>{
    let newDonationsByAddress = {}
    for(let d in donationEvents){
      if(!newDonationsByAddress[donationEvents[d].sender]){
        newDonationsByAddress[donationEvents[d].sender] = donationEvents[d].value
      }else{
        newDonationsByAddress[donationEvents[d].sender] = newDonationsByAddress[donationEvents[d].sender].add(donationEvents[d].value)
      }
    }
    setDonationsByAddress(newDonationsByAddress)
  },[donationEvents])

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
            <Link onClick={()=>{setRoute("/")}} to="/">Campaign</Link>
          </Menu.Item>
          <Menu.Item key="/recipients">
            <Link onClick={()=>{setRoute("/recipients")}} to="/recipients">Recipients</Link>
          </Menu.Item>
          <Menu.Item key="/donate">
            <Link onClick={()=>{setRoute("/donate")}} to="/donate">Donate</Link>
          </Menu.Item>
          <Menu.Item key="/donations">
            <Link onClick={()=>{setRoute("/donations")}} to="/donations">Donations</Link>
          </Menu.Item>
          <Menu.Item key="/donors">
            <Link onClick={()=>{setRoute("/donors")}} to="/donors">Donors</Link>
          </Menu.Item>
          <Menu.Item key="/pooldonations">
            <Link onClick={()=>{setRoute("/pooldonations")}} to="/pooldonations">Pool Donations</Link>
          </Menu.Item>
          <Menu.Item key="/withdrawals">
            <Link onClick={()=>{setRoute("/withdrawals")}} to="/withdrawals">Withdrawals</Link>
          </Menu.Item>
          <Menu.Item key="/clr">
            <Link onClick={()=>{setRoute("/clr")}} to="/clr">CLR Contract</Link>
          </Menu.Item>
          <Menu.Item key="/donormanager">
            <Link onClick={()=>{setRoute("/donormanager")}} to="/donormanager">DonorManager Contract</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
            <Info
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              readContracts={readContracts}
              writeContracts={writeContracts}
              price={price}
              blockExplorer={blockExplorer}
              tx={tx}
              owner={owner}
              roundDuration={roundDuration}
              mode={mode}
            />
          </Route>
          <Route path="/recipients">
            <Recipients
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              readContracts={readContracts}
              price={price}
              blockExplorer={blockExplorer}
              recipients={recipients}
              totalMatchingWeight={totalMatchingWeight}
              matchingPool={matchingPool}
              currentTotalWeight={currentTotalWeight}
            />
          </Route>
          <Route path="/donate">
            <Donate
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              recipientOptions={recipientOptions}
            />
          </Route>
          <Route path="/donations">
            <Donations
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              price={price}
              donationEvents={donationEvents}
            />
          </Route>
          <Route path="/donors">
            <Donors
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              blockExplorer={blockExplorer}
              price={price}
              donorAllowedEvents={donorAllowedEvents}
              donationsByAddress={donationsByAddress}
            />
          </Route>
          <Route path="/pooldonations">
            <PoolDonations
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              price={price}
              matchingPoolDonationEvents={matchingPoolDonationEvents}
            />
          </Route>
          <Route path="/withdrawals">
            <Withdrawals
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              price={price}
              withdrawEvents={withdrawEvents}
            />
          </Route>
          <Route path="/clr">
            <Contract
              name="CLR"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>
          <Route path="/donormanager">
            <Contract
              name="DonorManager"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
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
