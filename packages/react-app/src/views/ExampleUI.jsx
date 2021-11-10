import { CodeSandboxSquareFilled, SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance } from "../components";
import { useContractReader, useNonce } from '../hooks/index';
import { EtherInput, AddressInput } from '../components/index';
import { parseEther, formatEther } from "@ethersproject/units";

export default function ExampleUI({
  purpose,
  userSigner,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState(0);


  // keep track of a variable from the contract in the local React state:
  const yourSmileBalance = useContractReader(readContracts, "Smile", "balanceOf", [address])

  const yourSmileLockedBalance = useContractReader(readContracts, "Smile", "userLockedBalance", [address])

  const smileQuoteRate = useContractReader(readContracts, "Smile", "getPrice")


  // keep track of a variable from the contract in the local React state:
  const yourAngryBalance = useContractReader(readContracts, "Angry", "balanceOf", [address])

  const yourAngryLockedBalance = useContractReader(readContracts, "Angry", "userLockedBalance", [address])

  const angryQuoteRate = useContractReader(readContracts, "Angry", "getPrice")


  // keep track of a variable from the contract in the local React state:
  const yourCoolBalance = useContractReader(readContracts, "Cool", "balanceOf", [address])

  const yourCoolLockedBalance = useContractReader(readContracts, "Cool", "userLockedBalance", [address])

  const coolQuoteRate = useContractReader(readContracts, "Cool", "getPrice")


  // keep track of a variable from the contract in the local React state:
  const yourLaughBalance = useContractReader(readContracts, "Laugh", "balanceOf", [address])

  const yourLaughLockedBalance = useContractReader(readContracts, "Laugh", "userLockedBalance", [address])

  const laughQuoteRate = useContractReader(readContracts, "Laugh", "getPrice")


  // keep track of a variable from the contract in the local React state:
  const yourLoveBalance = useContractReader(readContracts, "Love", "balanceOf", [address])

  const yourLoveLockedBalance = useContractReader(readContracts, "Love", "userLockedBalance", [address])

  const loveQuoteRate = useContractReader(readContracts, "Love", "getPrice")


  // keep track of a variable from the contract in the local React state:
  const yourSadBalance = useContractReader(readContracts, "Sad", "balanceOf", [address])

  const yourSadLockedBalance = useContractReader(readContracts, "Sad", "userLockedBalance", [address])

  const sadQuoteRate = useContractReader(readContracts, "Sad", "getPrice")
  // TODO
  // 1. remove renundant code and use a for loop for rendering divs
  // 2. Add a emoji leaderboard based on cost
  const emojiDetails = ["😃", "😡", "😎", "🤣", "❤️", "😔"]
  const emojiBalance = [{Smile: yourSmileBalance}, {Angry: yourAngryBalance}, {Cool: yourCoolBalance}, {Laugh: yourLaughBalance}, {Love: yourLoveBalance}, {Sad: yourSadBalance}]
  const emojiLockedBalance = [{Smile: yourSmileLockedBalance}, {Angry: yourAngryLockedBalance}, {Cool: yourCoolLockedBalance}, {Laugh: yourLaughLockedBalance}, {Love: yourLoveLockedBalance}, {Sad: yourSadLockedBalance}]
  const emojiQouteRate = [{Smile: smileQuoteRate}, {Angry: angryQuoteRate}, {Cool: coolQuoteRate}, {Laugh: laughQuoteRate}, {Love: loveQuoteRate}, {Sad: sadQuoteRate}]


  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      {emojiDetails.map((emoji, i) => {     
      return (
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2> {emoji} Token on a Bonding Curve </h2>

        <h4>Your {emoji} Balance: {Object.values(emojiBalance[i])[0] ? formatEther(Object.values(emojiBalance[i])[0]) : 0}</h4>

        <h4>Your Locked ETH: {Object.values(emojiLockedBalance[i])[0] ? formatEther(Object.values(emojiLockedBalance[i])[0]) : 0}</h4>


        <h4>Tokens / ETH: {Object.values(emojiQouteRate[i])[0] ? formatEther(Object.values(emojiQouteRate[i])[0]) : 0}</h4>


        <Divider />

        <div style={{ margin: 8 }}>
          <EtherInput
            price={price}
            value={amount}
            onChange={value => {
              setAmount(value);
            }}
          />
          <br />
          <br />

          <Button onClick={() => {
            tx(writeContracts[Object.keys(emojiQouteRate[i])[0]].mint({ value: parseEther(amount) }))
          }}>Mint</Button>
        </div>

        <br />
        <br />
        <div style={{ margin: 8 }}>
          <EtherInput
            price={price}
            value={amount}
            placeholder={`${emoji} Amount to Burn`}
            onChange={value => {
              setAmount(value);
            }}
          />
          <br />
          <br />
          <Button onClick={() => {
            /* look how you call setPurpose on your contract: */
            tx(writeContracts[Object.keys(emojiQouteRate[i])[0]].burn(parseEther(amount)))
          }}>Burn</Button>
        </div>
        <br />
        <br />
        <div style={{ margin: 8 }}>
          <AddressInput
            autoFocus
            ensProvider={mainnetProvider}
            placeholder="to address"
            value={toAddress}
            onChange={setToAddress}
          />
          <br />
          <EtherInput
            price={price}
            value={amount}
            onChange={value => {
              setAmount(value);
            }}
          />
          <br />
          <br />
          <Button onClick={() => {
            console.log(amount)
            console.log(toAddress)
            /* look how you call setPurpose on your contract: */
            tx(writeContracts[Object.keys(emojiQouteRate[i])[0]].transfer(toAddress, parseEther(amount)))
          }}>Transfer </Button>
        </div>
      </div>
      )
      })}
      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
    </div> 
  );
}