import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { SendOutlined, SmileOutlined } from "@ant-design/icons";
import { Row, Col, List, Typography, Spin, InputNumber, Input, Card, notification, Popover, Tooltip, Modal, Divider } from "antd";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { TokenBalance } from "."
import { useTokenBalance, useBalance, usePoller } from "eth-hooks";
import { Transactor } from "../helpers"
import { JsonRpcProvider } from "@ethersproject/providers";
import { INFURA_ID } from "../constants";
const { Text } = Typography;

const mainnetProvider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`)
const xDaiProvider = new JsonRpcProvider(`https://dai.poa.network`)

const daiTokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const xDaiBridgeAddress = '0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6'
const mainnetBridgeAddress = '0x4aa42145aa6ebf72e164c9bbc74fbd3788045016'

const decimals = 18

const xDaiChainId = 100
const mainnetChainId = 1

const minAmountToTransfer = "10"

function BridgeXdai({address, selectedProvider, network, networks, userProvider, mainnetUserProvider, gasPrice, injectedProvider, handleChange}) {

  const [enteredAmount, setEnteredAmount] = useState('')
  const [fromXdaiTx, setFromXdaiTx] = useState()//'0x5a8606651cd4439a9dc48581cbf962f4ce2c91bc82c618186e02ebd85f508546')
  const [fromXdaiAmount, setFromXdaiAmount] = useState()//'10000000000000000000')
  const [fromXdaiAddress, setFromXdaiAddress] = useState()//'0x60Ca282757BA67f3aDbF21F3ba2eBe4Ab3eb01fc')
  const [fromXdaiMessageHash, setFromXdaiMessageHash] = useState()
  const [fromXdaiMessage, setFromXdaiMessage] = useState()
  const [fromXdaiSignatures, setFromXdaiSignatures] = useState()
  const [fromXdaiMainTx, setFromXdaiMainTx] = useState()
  const [fromMainTx, setFromMainTx] = useState()
  const [selectedNetwork, setSelectedNetwork] = useState()

  const tx = Transactor(userProvider, gasPrice)
  let userSigner = userProvider.getSigner()

  const erc20Abi = [
      // Read-Only Functions
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",

      // Authenticated Functions
      "function transfer(address to, uint amount) returns (boolean)",

      // Events
      "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  const mainnetBridgeAbi = [
    "function executeSignatures(bytes message, bytes signatures)"
  ]

  const xDaiHelperAbi = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_homeBridge","internalType":"address"},{"type":"address","name":"_foreignBridge","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IHomeErc20ToNativeBridge"}],"name":"bridge","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"clean","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"bytes","name":"result","internalType":"bytes"}],"name":"getMessage","inputs":[{"type":"bytes32","name":"_msgHash","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bytes32","name":"","internalType":"bytes32"}],"name":"getMessageHash","inputs":[{"type":"address","name":"_recipient","internalType":"address"},{"type":"uint256","name":"_value","internalType":"uint256"},{"type":"bytes32","name":"_origTxHash","internalType":"bytes32"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"bytes","name":"","internalType":"bytes"}],"name":"getSignatures","inputs":[{"type":"bytes32","name":"_msgHash","internalType":"bytes32"}]}]

//"0x6B175474E89094C44Da98b954EedeAC495271d0F" <- dai contract
  let daiContract = new ethers.Contract(daiTokenAddress, erc20Abi, mainnetProvider);
  let xDaiHelperContract = new ethers.Contract("0x6A92e97A568f5F58590E8b1f56484e6268CdDC51", xDaiHelperAbi, xDaiProvider);

  let mainnetBridgeContract = new ethers.Contract(mainnetBridgeAddress, mainnetBridgeAbi, userSigner)

  let daiBalance = useTokenBalance(daiContract, address, 3000)
  let xDaiBalance = useBalance(xDaiProvider, address, 3000)

  const formatBalance = (balance, decimals, places) => {
    let formattedBalance = balance?formatUnits(balance, decimals):null
    return formattedBalance?Number.parseFloat(formattedBalance).toFixed(places?places:3):"loading..."
  }

  useEffect(() => {

  const updateNetwork = async () => {
    if(selectedProvider) {
    let newNetwork = await selectedProvider.getNetwork()
    setSelectedNetwork(newNetwork.chainId)
    }
  }

  updateNetwork()

  }, [selectedProvider])

  useEffect(() => {
           window.onbeforeunload = confirmExit;
           function confirmExit()
           {if(fromXdaiTx||fromXdaiAmount||fromXdaiAddress) {
               return "show warning";
             }
           }
   }, [])

  const checkForSignatures = async () => {
    if(fromXdaiTx && fromXdaiAmount && fromXdaiAddress) {
      try {
        let messageHash = await xDaiHelperContract.getMessageHash(fromXdaiAddress, fromXdaiAmount, fromXdaiTx)
        setFromXdaiMessageHash(messageHash)
        let message = await xDaiHelperContract.getMessage(messageHash)
        setFromXdaiMessage(message)
        let signatures = await xDaiHelperContract.getSignatures(messageHash)
        setFromXdaiSignatures(signatures)
      } catch (e) {
        console.log(e)
      }
    }
  }

  usePoller(checkForSignatures, 4000)

  const getParsedValue = (v) => {
    let value;
    try {
      value = parseEther("" + v);
    } catch (e) {
      value = parseEther("" + parseFloat(v).toFixed(8));
    }
    return value
  }

  const checkAgainstMinimumTransfer = (v, minTransfer) => {
    if(parseFloat(v) < parseFloat(minTransfer)) {
      notification.open({
        message: 'Amount is less than the minimum allowed transfer',
        description:
        `The minimum transfer is ${minTransfer}`,
      });
        return false
    } else {
        return true
      }
  }

  const sendXdaiToBridge = async () => {
    if(checkAgainstMinimumTransfer(enteredAmount, minAmountToTransfer) == false) return

    let parsedValue = getParsedValue(enteredAmount)
    let transaction = await tx({
      to: xDaiBridgeAddress,
      value: parsedValue,
    });
    console.log(transaction)
    setEnteredAmount('')
    setFromXdaiAmount(parsedValue.toLocaleString('fullwide', {useGrouping:false}))
    setFromXdaiAddress(address)
    setFromXdaiTx(transaction.hash)
    notification.open({
      message: 'Sent xDai to the Bridge contract!',
      description:
      (<a href={"https://blockscout.com/poa/xdai/tx/"+transaction.hash} target="_blank">{`👀 Sent ${enteredAmount} xDai, view transaction`}</a>),
    });
  }

  const sendSignaturesToMainnet = async () => {
    if(fromXdaiMessage && fromXdaiSignatures && network == mainnetChainId) {
      let mainnetTx = await mainnetBridgeContract.executeSignatures(fromXdaiMessage, fromXdaiSignatures)
      console.log(mainnetTx)
      setFromXdaiMainTx(mainnetTx.hash)
      notification.open({
        message: 'Sent signatures to mainnet!',
        description:
        (<a href={"https://etherscan.io/tx/"+mainnetTx.hash} target="_blank">{`👀 view transaction`}</a>),
      });
    }
  }

  const resetFromXdaiBridge = () => {
    setFromXdaiAmount()
    setFromXdaiAddress()
    setFromXdaiTx()
    setFromXdaiMessage()
    setFromXdaiMessageHash()
    setFromXdaiSignatures()
    setFromXdaiMainTx()
  }

  const resetFromMainBridge = () => {
    setFromMainTx()
  }

  const sendDaiToBridge = async () => {

    if(checkAgainstMinimumTransfer(enteredAmount, minAmountToTransfer) == false) return

    let parsedValue = getParsedValue(enteredAmount)
    let valueString = parsedValue.toLocaleString('fullwide', {useGrouping:false})

    let daiSenderContract = new ethers.Contract(daiTokenAddress, erc20Abi, userSigner);
    try {
      let erc20tx = await daiSenderContract.transfer(
        mainnetBridgeAddress,
        valueString
      );
      console.log(erc20tx)
      setFromMainTx(erc20tx.hash)
      notification.open({
        message: 'Sent Dai to the Bridge contract!',
        description:
        (<a href={"https://etherscan.io/tx/"+erc20tx.hash} target="_blank">{`👀 Sent ${enteredAmount} Dai, click to view transaction`}</a>),
      });
      setEnteredAmount('')
    } catch(e){
      console.log(e)
    }

  }

  let bridgeOption

  const updateEnteredAmount = (entered, maxAmount, minAmount) => {
    if(parseFloat(maxAmount) < parseFloat(minAmount)) {
      notification.open({
        message: 'Balance is less than the minimum allowed transfer',
        description:
        `The minimum transfer is ${minAmount}`,
      });
      return
    }
    if(parseFloat(entered) > parseFloat(maxAmount)) {
      setEnteredAmount(maxAmount)
      notification.open({
        message: `You can't transfer more than your balance!`,
        description:
        `Your balance is ${maxAmount}`,
      });
    } else {
      setEnteredAmount(entered)
    }
  }

  if(selectedNetwork == xDaiChainId || parseInt(selectedNetwork) == xDaiChainId) {

    const fromXdaiPopover = (
      <div>
        <p>1. Transfer xDai to the Bridge contract</p>
        <p>2. Wait for signatures from the Bridge oracles</p>
        <p>3. Execute Bridge signatures on mainnet (requires mainnet gas fee!)</p>
        <button type="button" class={"nes-btn is-primary"}
          onClick={sendXdaiToBridge}
        >Let's do this!</button>
      </div>
      );

      bridgeOption = (
      <>
      <div class="nes-field">
        {xDaiBalance>0?<input id="xdai_to_dai" class="nes-input" placeholder="xdai to dai"
          onChange={async e => {
            let maxBalance = formatBalance(xDaiBalance, decimals)
            updateEnteredAmount(e.target.value, maxBalance, minAmountToTransfer)
          }}
          value={enteredAmount}
        />:<input type="text" id="warning_field" class="nes-input" disabled placeholder="No dai to transfer"/>}
      </div>
      <Popover content={fromXdaiPopover} title="Transferring xDai to Dai has three steps" trigger="click">
      <button type="button" class={"nes-btn is-primary"} disabled={enteredAmount==""}
      >↑</button>
      </Popover>
      <Tooltip title="Switch your network to mainnet to turn Dai into xDai">
      <button type="button" class={"nes-btn"} disabled
      >↓</button>
      </Tooltip>
      </>
    )
    } else if(selectedNetwork == mainnetChainId || parseInt(selectedNetwork) == mainnetChainId) {
      bridgeOption = (
      <>
      <div class="nes-field">
        {daiBalance>0?<input id="dai_to_xdai" class="nes-input" placeholder="dai to xdai"
        onChange={async e => {
          let maxBalance = formatBalance(daiBalance, decimals)
          updateEnteredAmount(e.target.value, maxBalance, minAmountToTransfer)
        }}
        value={enteredAmount}
        />:<input type="text" id="warning_field" class="nes-input" disabled placeholder="No dai to transfer"/>}
      </div>
      <button type="button" class="nes-btn is-primary" disabled={enteredAmount==""}
      onClick={sendDaiToBridge}
      >↓</button>
      <Tooltip title="Switch your network to xDai to turn xDai into Dai">
      <button type="button" class={"nes-btn"} disabled
      >↑</button>
      </Tooltip>
      </>
      )
    } else {
      bridgeOption = <span>Select mainnet or xDai to use the bridge</span>
    }

  return (
    <>
              <Row align="middle" justify="center">
                <Col>
                <Row justify="center" align="middle" style={{width:"100%"}}>
                <Text style={{
                  verticalAlign: "middle",
                  fontSize: 32,
                  padding: 8,
                }}>
                  {'dai ' + formatBalance(daiBalance, decimals)}
                </Text>
                </Row>
                  <Row align="middle" justify="center">
                  {bridgeOption}
                  </Row>
                  <Row align="middle" justify="center">
                  <Text style={{
                    verticalAlign: "middle",
                    fontSize: 32,
                    padding: 8,
                  }}>
                    {'xDai ' + formatBalance(xDaiBalance, decimals)}
                  </Text>
                  </Row>
                </Col>
              </Row>
              <Row align="middle" justify="center">
              {<Modal visible={fromXdaiTx} footer={null} closable={false}>
                <p class="nes-text is-success">1. Send xDai to the bridge </p>
                <div class="nes-field is-inline">
                    <label>tx</label>
                    <Input type="text" id="tx" readOnly value={fromXdaiTx}/>
                </div>
                <div class="nes-field is-inline">
                    <label>value</label>
                    <Input type="text" id="value" readOnly value={fromXdaiAmount?formatEther(fromXdaiAmount):null}/>
                </div>
                <div class="nes-field is-inline">
                    <label>address</label>
                    <Input type="text" id="address" readOnly value={fromXdaiAddress}/>
                </div>
                <Divider/>
                <p class={fromXdaiSignatures?"nes-text is-success":null}>2. Wait for the required signatures</p>
                {fromXdaiMessage?
                                  <div class="nes-field is-inline">
                                      <label>message</label>
                                      <Input type="text" id="message" readOnly value={fromXdaiMessage}/>
                                  </div>:null}
                {fromXdaiSignatures?<div class="nes-field is-inline">
                                      <label>signatures</label>
                                      <Input type="text" id="signatures" readOnly value={fromXdaiSignatures}/>
                                    </div>:<p class="nes-text is-warning">Checking for signatures</p>}
                <Divider/>
                <p class={fromXdaiMainTx?"nes-text is-success":null}>3. Execute the signatures on mainnet</p>
                <Row  align="middle" justify="center">
                {(fromXdaiSignatures&&fromXdaiMessage&&!fromXdaiMainTx&&network==mainnetChainId)?<button type="button" class="nes-btn is-primary" onClick={sendSignaturesToMainnet}>Let's go!</button>
                : (fromXdaiSignatures&&fromXdaiMessage&&!fromXdaiMainTx)?(injectedProvider?
                  <p class="nes-text is-warning">Switch your wallet network to mainnet</p>
                  :<button type="button" class="nes-btn"  onClick={()=> {
                    console.log(handleChange)
                    handleChange(1)
                  }}>Switch to mainnet</button>)
                :null }
                {fromXdaiMainTx?
                  <>
                  <a href={`https://etherscan.io/tx/${fromXdaiMainTx}`} target="_blank"><p class="nes-text is-primary">View transaction</p></a>
                  <p>Once this transaction is confirmed, xDai to Dai bridging is complete</p>
                  <button type="button" class="nes-btn"  onClick={resetFromXdaiBridge}>Reset bridge</button>
                  </>
                  :null}
                </Row>
              </Modal>}
              {fromMainTx?<Card>
                <p class={"nes-text is-success"}>Send DAI to the deposit contract</p>
                <div class="nes-field is-inline">
                    <label>txHash</label>
                    <Input type="text" id="message" readOnly value={fromMainTx}/>
                </div>
                <p class={"nes-text"}>It may take several minutes to bridge to xDai</p>
                <button type="button" class="nes-btn"  onClick={resetFromMainBridge}>Reset bridge</button>
              </Card>:null}
              </Row>
              </>

  );
}

export default BridgeXdai;
