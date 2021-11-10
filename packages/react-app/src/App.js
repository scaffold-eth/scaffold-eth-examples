import React, { useState, useEffect } from 'react'
import 'antd/dist/antd.css';
import { ethers } from "ethers";
import "./App.css";
import { Row, Col, Input, Button, Spin } from 'antd';
import { Transactor } from "./helpers"
import { useExchangePrice, useGasPrice, useContractLoader, useContractReader } from "./hooks"
import { Header, Account, Provider, Faucet, Ramp, Address, Contract } from "./components"
const { TextArea } = Input;
const { BufferList } = require('bl')

const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

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

const addToIPFS = async fileToUpload => {
  for await (const result of ipfs.add(fileToUpload)) {
    return result
  }
}

const mainnetProvider = new ethers.providers.InfuraProvider("mainnet","2717afb6bf164045b5d5468031b93f87")
const localProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER?process.env.REACT_APP_PROVIDER:"http://localhost:8545")

function App() {

  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const price = useExchangePrice(mainnetProvider)
  const gasPrice = useGasPrice("fast")

  const tx = Transactor(injectedProvider,gasPrice)

  const readContracts = useContractLoader(localProvider);
  const writeContracts = useContractLoader(injectedProvider);

  const myAttestation = useContractReader(readContracts,"Attestor","attestations",[address],1777);

  const [ data, setData ] = useState()
  const [ sending, setSending ] = useState()
  const [ loading, setLoading ] = useState()
  const [ ipfsHash, setIpfsHash ] = useState()
  const [ ipfsContents, setIpfsContents ] = useState()
  const [ attestationContents, setAttestationContents ] = useState()

  const asyncGetFile = async ()=>{
    let result = await getFromIPFS(ipfsHash)
    setIpfsContents(result.toString())
  }

  useEffect(()=>{
    if(ipfsHash) asyncGetFile()
  },[ipfsHash])

  let ipfsDisplay = ""
  if(ipfsHash){
    if(!ipfsContents){
      ipfsDisplay = (
        <Spin />
      )
    }else{
      ipfsDisplay = (
        <pre style={{margin:8,padding:8,border:"1px solid #dddddd",backgroundColor:"#ededed"}}>
          {ipfsContents}
        </pre>
      )
    }
  }

  const asyncGetAttestation = async ()=>{
    let result = await getFromIPFS(myAttestation)
    setAttestationContents(result.toString())
  }

  useEffect(()=>{
    if(myAttestation) asyncGetAttestation()
  },[myAttestation])


  let attestationDisplay = ""
  if(myAttestation){
    if(!attestationContents){
      attestationDisplay = (
        <Spin />
      )
    }else{
      attestationDisplay = (
        <div>
          <Address value={address} /> attests to:
          <pre style={{margin:8,padding:8,border:"1px solid #dddddd",backgroundColor:"#ededed"}}>
            {attestationContents}
          </pre>
        </div>

      )
    }
  }

  return (
    <div className="App">
      <Header />
      <div style={{position:'fixed',textAlign:'right',right:0,top:0,padding:10}}>
        <Account
          address={address}
          setAddress={setAddress}
          localProvider={localProvider}
          injectedProvider={injectedProvider}
          setInjectedProvider={setInjectedProvider}
          mainnetProvider={mainnetProvider}
          price={price}
        />
      </div>

      <div style={{padding:32,textAlign: "left"}}>
        Enter a bunch of data:
        <TextArea rows={10} value={data} onChange={(e)=>{
          setData(e.target.value)
        }} />
        <Button style={{margin:8}} loading={sending} size="large" shape="round" type="primary" onClick={async()=>{
          console.log("UPLOADING...")
          setSending(true)
          setIpfsHash()
          setIpfsContents()
          const result = await addToIPFS(data)
          if(result && result.path) {
            setIpfsHash(result.path)
          }
          setSending(false)
          console.log("RESULT:",result)
        }}>Upload to IPFS</Button>
      </div>

      <div style={{padding:32,textAlign: "left"}}>
        IPFS Hash: <Input value={ipfsHash} onChange={(e)=>{
          setIpfsHash(e.target.value)
        }} />
        {ipfsDisplay}

        <Button disabled={!ipfsHash} style={{margin:8}} size="large" shape="round" type="primary" onClick={async()=>{
          tx( writeContracts["Attestor"].attest(ipfsHash) )
        }}>Attest to this hash on Ethereum</Button>
      </div>

      <div style={{padding:32,textAlign: "left"}}>
        {attestationDisplay}
      </div>

      {/*<div style={{padding:64,textAlign: "left"}}>
        <Contract
          name={"Attestor"}
          provider={injectedProvider}
          address={address}
        />
      </div>*/}

      <div style={{position:'fixed',textAlign:'right',right:0,bottom:20,padding:10}}>
        <Row align="middle" gutter={4}>
          <Col span={10}>
            <Provider name={"mainnet"} provider={mainnetProvider} />
          </Col>
          <Col span={6}>
            <Provider name={"local"} provider={localProvider} />
          </Col>
          <Col span={8}>
            <Provider name={"injected"} provider={injectedProvider} />
          </Col>
        </Row>
      </div>
      <div style={{position:'fixed',textAlign:'left',left:0,bottom:20,padding:10}}>
        <Row align="middle" gutter={4}>
          <Col span={9}>
            <Ramp
              price={price}
              address={address}
            />
          </Col>
          <Col span={15}>
            <Faucet
              localProvider={localProvider}
              price={price}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
