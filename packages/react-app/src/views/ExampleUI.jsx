/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect } from "react";
import {
  message,
  Row,
  Col,
  Button,
  List,
  Divider,
  Input,
  Card,
  DatePicker,
  Slider,
  Switch,
  Progress,
  Spin,
} from "antd";
import { ConsoleSqlOutlined, SyncOutlined } from "@ant-design/icons";
import { parseEther, formatEther } from "@ethersproject/units";
import axios from "axios";
import pretty from "pretty-time";
import { Contract } from "ethers";
import { QRPunkBlockie, QRBlockie, EtherInput, Address, Balance, GtcBalance } from "../components";
import { DAI_ABI } from "../constants";
import { useExternalContractLoader, useContractReader } from "../hooks";

export default function ExampleUI({
  streamToAddress,
  streamfrequency,
  totalStreamBalance,
  streamCap,
  depositEvents,
  withdrawEvents,
  streamBalance,
  address,
  mainnetProvider,
  userProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  gtcAddress,
}) {
  const [amount, setAmount] = useState();
  const [reason, setReason] = useState();

  const [depositAmount, setDepositAmount] = useState();
  const [depositReason, setDepositReason] = useState();
  const gtcContract = new Contract(gtcAddress, DAI_ABI, userProvider.getSigner());

  console.log("streamCap", streamCap);
  console.log("streamBalance", streamBalance);
  const percent = streamCap && streamBalance && streamBalance.mul(100).div(streamCap).toNumber();

  const mainnetGTCContract = useExternalContractLoader(mainnetProvider, gtcAddress, DAI_ABI);
  const myMainnetGTCBalance = useContractReader(
    { GTC: mainnetGTCContract },
    "GTC",
    "balanceOf",
    [readContracts && readContracts.SimpleStream.address],
    1000,
  );
  const gtcAllowance = useContractReader({ GTC: mainnetGTCContract }, "GTC", "allowance", [
    address,
    readContracts && readContracts.SimpleStream.address,
  ]);

  if (gtcAllowance) console.log("gtcAllowance", gtcAllowance, formatEther(gtcAllowance));

  if (myMainnetGTCBalance) console.log("my mainnet gtc balance", formatEther(myMainnetGTCBalance));

  const streamNetPercentSeconds = myMainnetGTCBalance && streamCap && myMainnetGTCBalance.mul(100).div(streamCap);

  console.log(
    "streamNetPercentSeconds",
    streamNetPercentSeconds,
    streamNetPercentSeconds && streamNetPercentSeconds.toNumber(),
  );

  const totalSeconds = streamNetPercentSeconds && streamfrequency && streamNetPercentSeconds.mul(streamfrequency);
  console.log("totalSeconds", totalSeconds);

  console.log("numberOfTimesFull", streamNetPercentSeconds);
  const numberOfTimesFull = streamNetPercentSeconds && Math.floor(streamNetPercentSeconds.div(100));

  const streamNetPercent = streamNetPercentSeconds && streamNetPercentSeconds.mod(100);
  console.log("streamNetPercent", streamNetPercent, streamNetPercent && streamNetPercent.toNumber());

  const remainder = streamNetPercent && streamNetPercent.mod(1);
  console.log("remainder", remainder, remainder && remainder.toNumber());

  const [quoteRate, setQuoteRate] = useState(0);

  useEffect(() => {
    axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=gitcoin").then(response => {
      if (response && response.data[0] && response.data[0].current_price) {
        setQuoteRate(response.data[0].current_price);
        console.log("quoteRate price", response.data[0].current_price, price);
      }
    });
  }, []);

  // console.log("WWUOTE", formatEther(streamBalance).toString())

  // const quote = quoteRate * formatEther(streamBalance)

  // const unclaimedPercent = totalStreamBalance && totalUnclaimable && totalUnclaimable.mul(100).div(totalStreamBalance)
  // console.log("unclaimedPercent",unclaimedPercent,unclaimedPercent&&unclaimedPercent.toNumber())

  const WIDTH = "calc(min(77vw,620px))";

  const totalProgress = [];

  const widthOfStacks = numberOfTimesFull > 6 ? 32 : 64;

  for (let c = 0; c < numberOfTimesFull; c++) {
    totalProgress.push(<Progress percent={100} showInfo={false} style={{ width: widthOfStacks, padding: 4 }} />);
  }
  if (streamNetPercent && streamNetPercent.toNumber() > 0) {
    totalProgress.push(
      <Progress
        percent={streamNetPercent && streamNetPercent.toNumber()}
        showInfo={false}
        status="active"
        style={{ width: widthOfStacks, padding: 4 }}
      />,
    );
  }

  const isAllowanceRequired = gtcAllowance && depositAmount && gtcAllowance.lt(parseEther(depositAmount.toString()));

  const handleSubmitButton = () => {
    if (isAllowanceRequired) {
      console.log(Object.keys(mainnetGTCContract));
      tx(gtcContract.approve(readContracts.SimpleStream.address, parseEther(depositAmount.toString())));
    } else {
      console.log("allowed?", depositAmount, gtcAllowance.lt(parseEther(depositAmount.toString())), address);
      // tx(gtcContract.streamDeposit(depositReason, parseEther(depositAmount.toString())));
      tx(writeContracts.SimpleStream.streamDeposit(depositReason, parseEther(depositAmount.toString())));
      setDepositAmount();
      setDepositReason();
    }
  };

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:


          //<QRBlockie scale={0.6} withQr={true} address={readContracts && readContracts.SimpleStream.address} />


      */}

      <div style={{ padding: 16, width: WIDTH, margin: "auto" }}>
        <div style={{ padding: 32 }}>
          <div style={{ padding: 32 }}>
            <Balance value={myMainnetGTCBalance} price={quoteRate} ticker="GTC" />
            <span style={{ opacity: 0.5 }}>
              {" "}
              @ <Balance value={streamCap} price={quoteRate} ticker="GTC" /> /{" "}
              {streamfrequency && pretty(streamfrequency.toNumber() * 1000000000)}
            </span>
          </div>
          {totalProgress.length > 0 ? (
            <div>
              {totalProgress} ({totalSeconds && pretty(totalSeconds.toNumber() * 10000000)})
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: -32 }}>
        <Address value={readContracts && readContracts.SimpleStream.address} />
      </div>

      <div style={{ width: 400, margin: "auto", marginTop: 32, position: "relative" }}>
        <div style={{ padding: 16, marginBottom: 64 }}>
          <span style={{ opacity: 0.5 }}>streaming to:</span>
        </div>
        <div style={{ position: "absolute", top: -50 }}>
          <QRPunkBlockie withQr={false} address={streamToAddress} scale={0.7} />
        </div>
        <Address value={streamToAddress} ensProvider={mainnetProvider} />
      </div>

      <div style={{ border: "1px solid #cccccc", padding: 16, width: WIDTH, margin: "auto", marginTop: 64 }}>
        {/* <h4>stream balance: {streamBalance && formatEther(streamBalance)}</h4> */}

        <Progress
          strokeLinecap="square"
          type="dashboard"
          percent={percent}
          format={() => {
            return <Balance price={quoteRate} value={streamBalance} size={18} ticker="GTC" />;
          }}
        />

        <Divider />

        <div style={{ margin: 8 }}>
          <Input
            style={{ marginBottom: 8 }}
            value={reason}
            placeholder="reason / work / link"
            onChange={e => {
              setReason(e.target.value);
            }}
          />
          <EtherInput
            mode="USD"
            autofocus
            price={quoteRate}
            value={amount}
            placeholder="Withdraw amount"
            onChange={value => {
              setAmount(value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={() => {
              if (!reason || reason.length < 6) {
                message.error("Please provide a longer reason / work / length");
              } else {
                tx(writeContracts.SimpleStream.streamWithdraw(parseEther("" + amount), reason));
                setReason();
                setAmount();
              }
            }}
          >
            Withdraw
          </Button>
        </div>
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <div style={{ width: WIDTH, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <h2>Work log:</h2>
        <List
          bordered
          dataSource={withdrawEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + item.to}>
                <Balance value={item.amount} price={quoteRate} ticker="GTC" />
                <span style={{ fontSize: 14 }}>
                  <span style={{ padding: 4 }}>{item.reason}</span>
                  <Address minimized address={item.to} />
                </span>
              </List.Item>
            );
          }}
        />
      </div>

      <div style={{ width: WIDTH, margin: "auto", marginTop: 32 }}>
        <h2>Deposits:</h2>
        <List
          bordered
          dataSource={depositEvents}
          renderItem={item => {
            return (
              <List.Item key={item.blockNumber + "_" + item.from}>
                <Balance value={item.amount} price={quoteRate} ticker="GTC" />
                <span style={{ fontSize: 14 }}>
                  <span style={{ padding: 4 }}>{item.reason}</span>
                  <Address minimized address={item.from} />
                </span>
              </List.Item>
            );
          }}
        />
        <hr style={{ opacity: 0.3333 }} />
        <Input
          style={{ marginBottom: 8 }}
          value={depositReason}
          placeholder="reason / guidance / north star"
          onChange={e => {
            setDepositReason(e.target.value);
          }}
        />
        <EtherInput
          mode="GTC"
          autofocus
          price={quoteRate}
          value={depositAmount}
          placeholder="Deposit amount"
          onChange={value => {
            console.log("deposit amount", value);
            setDepositAmount(value);
          }}
        />
        <Button disabled={!depositAmount} style={{ marginTop: 8 }} onClick={handleSubmitButton}>
          {isAllowanceRequired ? "Allow to spend" : "Deposit"}
        </Button>
      </div>

      <div style={{ paddingBottom: 256 }} />
    </div>
  );
}
