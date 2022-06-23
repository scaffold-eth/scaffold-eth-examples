import { useContractReader, useContractLoader, useUserAddress } from "eth-hooks";
import { ethers } from "ethers";
import { Input, Button, Spin, List} from "antd";
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AddressInput, EtherInput, Address, Balance } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({
  yourLocalBalance,
  readContracts,
  mainnetProvider,
  price, DepositEvents,
  ExecuteTransactionEvents,
  OwnerEvents,
  blockExplorer,
  localProvider,
  contractConfig,
  chainId,
  userProviderAndSigner
}) {



  //State variables
  const [customNonce, setCustomNonce] = useState();

  //Hash calculator
  const [toAddress, setToAddress] = useState();
  const [value, setValue] = useState();
  const [data, setData] = useState("0x");
  const [txHash, setTxHash] = useState("0x");


  //Calldata calculator
  const [callDataFunctionString, setCallDataFunctionString] = useState("");
  const [encodedCalldataOutput, setEncodedCalldataOutput] = useState("0x");

  //Hash signer
  const [txHashSignerInput, setTxHashSignerInput] = useState("");
  const [outputSignature, setOutputSignature] = useState("0x");


  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'nonce' variable from our contract
  const nonce = useContractReader(readContracts, "MetaMultiSigWallet", "nonce");
  const signaturesRequired = useContractReader(readContracts, "MetaMultiSigWallet", "signaturesRequired");
  const contracts = useContractLoader(localProvider, contractConfig, chainId);
  const multiSigAddress = contracts.MetaMultiSigWallet ? contracts.MetaMultiSigWallet.address : "";
  const userAddress = useUserAddress(userProviderAndSigner);

  //TX Executer
  const [executerToAddress, setExecuterToAddress] = useState();
  const [executerValue, setExecuterValue] = useState();
  const [executerData, setExecuterData] = useState("0x");
  const [executerSignaturesArray, setExecuterSignaturesArray] = useState([]);
 
  



  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64 }}>
        <h1>Chest info</h1>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <h2 style={{ marginTop: 9 }}> Contract Address: &nbsp;</h2>
          <Address
            address={multiSigAddress}
            ensProvider={localProvider}
            blockExplorer={blockExplorer}
            fontSize={25}
          />
        </div>
        <div style={{ marginTop: 32, dislpay: "flex", justifyContent: "center" }}>
          <h2 style={{ marginTop: 32 }}>Signatures Required: {signaturesRequired ? signaturesRequired.toNumber() : <Spin></Spin>}</h2>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
            <h2 style={{ marginTop: 9 }}> Balance:</h2>
            {contracts.MetaMultiSigWallet ? <Balance
              address={multiSigAddress}
              provider={localProvider}
              price={price}
            /> : <Spin style={{ marginTop: 9 }}></Spin>}
          </div>
          <h2 style={{ marginTop: 32 }}> Owners List</h2>
          <List
            style={{ maxWidth: 600, margin: "auto", marginTop: 32 }}
            bordered
            dataSource={OwnerEvents}
            renderItem={(item) => {
              return (
                <List.Item key={"owner_" + item.args.owner}>
                  <Address 
                    address={item.args.owner}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={32}
                  />
                  <div style={{ padding: 16 }}>
                    {item.args.added ? "👍" : "👎"}
                  </div>
                </List.Item>
              )
            }}
          />
          <h2 style={{ marginTop: 32 }}> Funding events</h2>
          <List
            style={{ maxWidth: 600, margin: "auto", marginTop: 32 }}
            bordered
            dataSource={DepositEvents}
            renderItem={(item) => {
              return (
                <List.Item key={"sender_" + item.args.sender}>
                  <h3>From:</h3>
                  <Address
                    address={item.args.sender}
                    ensProvider={localProvider}
                    blockExplorer={blockExplorer}
                    fontSize={32}
                  />
                  <div style={{ padding: 16 }}>
                    amount: <Balance
                      balance={item.args.amount}
                      price={price}
                    />
                  </div>
                </List.Item>
              )
            }}
          />
          <h2 style={{ marginTop: 32 }}> Successful executed transactions log </h2>
          <List
            style={{ maxWidth: 600, margin: "auto", marginTop: 32, marginBottom: 32 }}
            bordered
            dataSource={ExecuteTransactionEvents}
            renderItem={(item) => {
              return (
                <List.Item key={"sender_" + item.args.sender}>
                  <h3>To:</h3>
                  <Address
                    address={item.args.to}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={32}
                  />
                  <div style={{ padding: 16 }}>
                    amount: <Balance
                      balance={item.args.value}
                      price={price}
                    />
                  </div>
                </List.Item>
              )
            }}
          />
        </div>
      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64 }}>
        <h1>TX Hash calculator</h1>
        <div style={{ marginTop: 32 }}>
          <h2 style={{ display: "inline-block" }}>Actual nonce: &nbsp;</h2>
          <div style={{ width: "3rem", display: "inline-block" }}>
            <Input
              prefix="#"
              disabled
              value={customNonce}
              placeholder={"" + (nonce ? nonce.toNumber() : "loading...")}
              onChange={setCustomNonce}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <div>
            <h3 style={{ textAlign: "left" }}>Destination address: &nbsp;</h3>
            <h3 style={{ textAlign: "left" }}>Value: &nbsp;</h3>
            <h3 style={{ textAlign: "left" }}>Calldata: &nbsp;</h3>
          </div>
          <div>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="Enter address"
              value={toAddress}
              onChange={setToAddress}
            />
            <EtherInput
              price={price}
              value={value}
              onChange={_value => {
                setValue(_value);
              }}
            />
            <Input
              placeholder="calldata 0x..."
              value={data}
              onChange={e => {
                setData(e.target.value);
              }}
            />
          </div>
        </div>
        <Button
          style={{ marginTop: 32 }}
          onClick={async () => {
            let newHash = await readContracts.MetaMultiSigWallet.getTransactionHash(nonce, toAddress, parseEther("" + parseFloat(value).toFixed(12)), data);
            setTxHash(newHash);
          }}
        >
          Calculate Hash
        </Button>
        <h2 style={{ marginTop: 32 }}>{txHash}</h2>
      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64 }}>
        <h1>Calldata calculator</h1>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <h3 style={{ margin: "auto" }}>Function signature: &nbsp; &nbsp;</h3>
          <Input style={{ height: 30, width: 800 }}
            placeholder="i.e addSigner(address 0x50Fc27c707c0f83447939532A8d9218417a21321, uint256 2)"
            value={callDataFunctionString}
            onChange={e => {
              setCallDataFunctionString(e.target.value);
            }}
          />



        </div>
        <Button
          style={{ marginTop: 32 }}
          onClick={() => {
            //create interface object from input
            callDataFunctionString.trim();
            let temp = "function ".concat(callDataFunctionString);
            let ABI = [temp];
            let iface = new ethers.utils.Interface(ABI);

            //extract funcnamestring and parameters value
            let funcname = callDataFunctionString.slice(0, callDataFunctionString.indexOf("("));
            let parametersObjectsIterator = iface.getFunction(funcname).inputs.values();
            let parameters = [];
            for (const elem of parametersObjectsIterator) {
              parameters.push(elem.name.toString());
            }

            setEncodedCalldataOutput(iface.encodeFunctionData(funcname, parameters));

          }}
        >
          Calculate Calldata
        </Button>
        <h1 style={{ marginTop: 32, fontSize: "0.7rem" }}>{encodedCalldataOutput}</h1>


      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64 }}>
        <h1>Tx Hash signer</h1>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <div>
            <h3 style={{ marginTop: 4, textAlign: "left" }}>Hash to sign: &nbsp;</h3>
          </div>
          <div>
            <Input style={{ width: 800 }}
              placeholder="TX hash 0x..."
              value={txHashSignerInput}
              onChange={e => {
                setTxHashSignerInput(e.target.value);
              }}

            />
          </div>
        </div>
        <Button
          style={{ marginTop: 32 }}
          onClick={async () => {
            let signature = await userProviderAndSigner.signer.signMessage(ethers.utils.arrayify(txHashSignerInput));
            setOutputSignature(signature);
          }}
        >
          Sign
        </Button>
        <h2 style={{ marginTop: 32, fontSize: "0.7rem" }}>{outputSignature}</h2>

      </div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 1000, margin: "auto", marginTop: 64, marginBottom: 100 }}>
        <h1>Execute Transaction</h1>
        <div style={{ marginTop: 32 }}>
          <h2 style={{ display: "inline-block" }}>Actual nonce: &nbsp;</h2>
          <div style={{ width: "3rem", display: "inline-block" }}>
            <Input
              prefix="#"
              disabled
              value={customNonce}
              placeholder={"" + (nonce ? nonce.toNumber() : "loading...")}
              onChange={(_value) =>{
                setCustomNonce(_value)
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32, marginBottom: 64 }}>
          <div>
            <h3 style={{ textAlign: "left" }}>Destination address: &nbsp;</h3>
            <h3 style={{ textAlign: "left" }}>Value: &nbsp;</h3>
            <h3 style={{ textAlign: "left" }}>Calldata: &nbsp;</h3>
          </div>
          <div>
            <AddressInput
              autoFocus
              ensProvider={mainnetProvider}
              placeholder="Enter address"
              value={executerToAddress}
              onChange={_address =>{ 
                setExecuterToAddress(_address);
                }   
              }
            />
            <EtherInput
              price={price}
              value={executerValue}
              onChange={_value => {
                setExecuterValue(_value);
              }}
            />
            <Input
              placeholder="calldata"
              value={executerData}
              onChange={e => {
                setExecuterData(e.target.value);
              }}
            />
          </div>
        </div>
        <h2>Signatures</h2>
        <div>
        <Button
          style={{ marginTop: 32 }}
          onClick={async () => {await setExecuterSignaturesArray(new Array(signaturesRequired))}}
        >Render signatures input</Button>
        </div>
        <div style={{ marginTop: 32 }}>
        {
        executerSignaturesArray.map((signature, signatureIndex) => (
          <Input
          placeholder={"signature n" + signatureIndex}
          value = {signature}
          onChange={e => {
            setExecuterSignaturesArray([
              ...executerSignaturesArray.slice(0,signatureIndex),
              e.target.value,
              ...executerSignaturesArray.slice(signatureIndex + 1,executerSignaturesArray.lenght)
            ]);
          }}
        />
        ))}
        </div>
        <Button
          style={{ marginTop: 32 }}
          onClick={async () => {
            //get contract instance connected to wallet provider
            const connectedContract = readContracts.MetaMultiSigWallet.connect(userProviderAndSigner.signer);
            //execute transaction            
            await connectedContract.executeTransaction(executerToAddress, parseEther("" + parseFloat(executerValue).toFixed(12)), executerData, executerSignaturesArray);
          }}
        >
          Execute TX
        </Button>
      </div>


    </div >
  );
}

export default Home;
