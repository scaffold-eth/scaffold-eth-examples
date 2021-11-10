import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, List } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useBalance, useEventListener } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge } from "./components";
import Hints from "./Hints";
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

// 🛰 providers
console.log("📡 Connecting to Mainnet Ethereum");
const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
// const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/5ce0898319eb4f5c9d4c982c8f78392a")
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)

// 🏠 Your local provider is usually pointed at your local blockchain
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrl = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : "http://localhost:8545"//"https://dai.poa.network";
console.log("🏠 Connecting to provider:", localProviderUrl);
const localProvider = new JsonRpcProvider(localProviderUrl);

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

function App() {
  const [injectedProvider, setInjectedProvider] = useState();
  /* 💵 this hook will get the price of ETH from 🦄 Uniswap: */
  const price = 1

  /* 🔥 this hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = 1

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);
  console.log("💵 yourLocalBalance",yourLocalBalance)

  // just plug in different 🛰 providers to get your balance on different chains:
  //const yourMainnetBalance = useBalance(mainnetProvider, address);
  //console.log("💵 yourMainnetBalance",yourMainnetBalance)

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider)
  console.log("📝 readContracts",readContracts)

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts,"YourContract", "purpose")
  console.log("🤗 purpose:",purpose)

  // If you want to make 🔐 write transactions to your contracts, use the userProvider:
  const writeContracts = useContractLoader(userProvider)
  console.log("🔐 writeContracts",writeContracts)

  //📡 Listen for broadcast events
  const deposits = useEventListener(readContracts, "Guild", "Deposit", localProvider, 1);
  console.log("deposits",deposits)

  const withdrawals = useEventListener(readContracts, "Guild", "Withdraw", localProvider, 1);
  console.log("withdrawals",withdrawals)

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />

      {/*
        ⚙️ Here is an example button that sets the purpose in your smart contract:

        <Button onClick={()=>{
        writeContracts.YourContract.setPurpose("🐖 Don't hog the block!")
      }}>Set Purpose</Button>
      */}

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
        />
      </div>

      {/*
          🎛 this scaffolding is full of commonly used components
          this <Contract/> component will automatically parse your ABI
          and give you a form to interact with it locally
      */}

      <div style={{ width:600, margin: "auto" }}>
        <List
          bordered
          dataSource={deposits}
          renderItem={item => (
            <List.Item>
              {item[0]} ==> 
              {item[2]}
            </List.Item>
          )}
        />
      </div>

      <div style={{ width:600, margin: "auto" }}>
        <List
          bordered
          dataSource={withdrawals}
          renderItem={item => (
            <List.Item>
              {item[0]}
            </List.Item>
          )}
        />
      </div>


      <Contract name="Guild" signer={userProvider.getSigner()} provider={localProvider} address={address} />

      <Contract name="Spellbook" signer={userProvider.getSigner()} provider={localProvider} address={address} />

    </div>
  );
}

export default App;
