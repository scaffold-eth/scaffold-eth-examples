import { utils } from "ethers";
import React, { useState } from "react";
import { Button, Card, List, Divider, Input, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from "@ant-design/icons";

import { Address, Balance, Events } from "../components";
import { useContractReader } from "eth-hooks";
import { tryToDisplay } from "../components/Contract/utils";

export default function ExampleUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [pendingRandomNumber, setPendingRandomNumber] = useState(false);
  const [pendingNewPurpose, setPendingNewPurpose] = useState(false);

  // you can use hooks locally in your component of choice
  const purpose = useContractReader(readContracts, "RandomNumberConsumer", "purpose");
  const requestId = useContractReader(readContracts, "RandomNumberConsumer", "lastRequestId");
  const randomNumber = useContractReader(readContracts, "RandomNumberConsumer", "randomResult");

  const eventQueryStartBlock = 28677000; // Better than to query from block 1, but still not optimal.

  // Improvement 1: use subgraph

  // Improvement 2:
  // Side quest! (nerdy/advanced) see if you can inject the latest DiceRolls deployment block number into your frontend
  // whenever a new hardhat deployment happens.
  // It can be done in a similar way to how the contract abis are injected.
  // You need to look in the hardhat/deployments/DiceRolls.sol file for the transactionReceipt.

  const [pendingDiceRoll, setPendingDiceRoll] = useState(false);
  const diceRollResult = useContractReader(readContracts, "DiceRolls", "rollResult");

  let randomNumberDisplay;
  if (!requestId || !randomNumber) {
    randomNumberDisplay = (
      <>
        Loading ... <Spin></Spin>
      </>
    );
  } else if (requestId === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    randomNumberDisplay = <span style={{ color: "grey" }}>"None requested"</span>;
  } else {
    randomNumberDisplay =
      randomNumber.toString() === "0" ? (
        <>
          <span style={{ color: "#096dd9" }}>Oracle request pending </span>...{" "}
          <Spin style={{ marginLeft: "0.5rem" }}></Spin>
        </>
      ) : (
        tryToDisplay(randomNumber)
      );
  }

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Randomness Consumer</h2>
        {/*
          ⚙️ Here is an example UI that displays and sets the purpose in your RandomNumberConsumer:
        */}
        <h4>Purpose: {purpose}</h4>
        <div style={{ margin: 8 }}>
          <Input onChange={e => setNewPurpose(e.target.value)} />
          <Button
            style={{ marginTop: 8 }}
            loading={pendingNewPurpose}
            onClick={async () => {
              setPendingNewPurpose(true);
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(writeContracts.RandomNumberConsumer.setPurpose(newPurpose), update => {
                console.log("📡 Transaction Update:", update);
                if (update && update.data === "Reverted") {
                  setPendingNewPurpose(false);
                }
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  setPendingNewPurpose(false);
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Set Purpose!
          </Button>
        </div>
        <Divider />
        <h4>
          RandomNumber: <br />
          {randomNumberDisplay}
        </h4>
        <div style={{ margin: 8 }}>
          <Button
            loading={pendingRandomNumber}
            onClick={async () => {
              setPendingRandomNumber(true);
              /* look how you call requestRandomNumber on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(writeContracts.RandomNumberConsumer.requestRandomNumber(), update => {
                console.log("📡 Transaction Update:", update);
                if (update && update.data === "Reverted") {
                  setPendingRandomNumber(false);
                }
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  setPendingRandomNumber(false);
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Request Random Number!
          </Button>
        </div>
        <Divider />
        <h2>Dice Rolls</h2>
        <h4>
          Last Roll Result: <br />
          {diceRollResult}
        </h4>
        <div style={{ margin: 8 }}>
          <Button
            loading={pendingDiceRoll}
            onClick={async () => {
              setPendingDiceRoll(true);
              const result = tx(writeContracts.DiceRolls.requestRandomRoll(), update => {
                console.log("📡 Transaction Update:", update);
                if (update && update.data === "Reverted") {
                  setPendingDiceRoll(false);
                }
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  setPendingDiceRoll(false);
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Roll Dice!
          </Button>
        </div>
        <Divider />
        <Events
          contracts={readContracts}
          contractName="DiceRolls"
          eventName="Rolled"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={eventQueryStartBlock}
        />
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        ENS Address Example:
        <Address
          address="0x34aA3F359A9D614239015126635CE7732c18fDF3" /* this will show as austingriffith.eth */
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <div>OR</div>
        <Balance address={address} provider={localProvider} price={price} />
        <Divider />
        <div>🐳 Example Whale Balance:</div>
        <Balance balance={utils.parseEther("1000")} provider={localProvider} price={price} />
        <Divider />
        Your Contract Address:
        <Address
          address={
            readContracts && readContracts.RandomNumberConsumer ? readContracts.RandomNumberConsumer.address : null
          }
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />
        <div style={{ margin: 8 }}>
          <Button
            onClick={() => {
              /* look how you call setPurpose on your contract: */
              tx(writeContracts.RandomNumberConsumer.setPurpose("🍻 Cheers"));
            }}
          >
            Set Purpose to &quot;🍻 Cheers&quot;
          </Button>
        </div>
        <div style={{ margin: 8 }}>
          <Button
            onClick={() => {
              /*
              you can also just craft a transaction and send it to the tx() transactor
              here we are sending value straight to the contract's address:
            */
              tx({
                to: writeContracts.RandomNumberConsumer.address,
                value: utils.parseEther("0.001"),
              });
              /* this should throw an error about "no fallback nor receive function" until you add it */
            }}
          >
            Send Value
          </Button>
        </div>
        <div style={{ margin: 8 }}>
          <Button
            onClick={() => {
              /* look how we call setPurpose AND send some value along */
              tx(
                writeContracts.RandomNumberConsumer.setPurpose("💵 Paying for this one!", {
                  value: utils.parseEther("0.001"),
                }),
              );
              /* this will fail until you make the setPurpose function payable */
            }}
          >
            Set Purpose With Value
          </Button>
        </div>
        <div style={{ margin: 8 }}>
          <Button
            onClick={() => {
              /* you can also just craft a transaction and send it to the tx() transactor */
              tx({
                to: writeContracts.RandomNumberConsumer.address,
                value: utils.parseEther("0.001"),
                data: writeContracts.RandomNumberConsumer.interface.encodeFunctionData("setPurpose(string)", [
                  "🤓 Whoa so 1337!",
                ]),
              });
              /* this should throw an error about "no fallback nor receive function" until you add it */
            }}
          >
            Another Example
          </Button>
        </div>
      </div>

      {/* <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
        <h2>Single Roll Events:</h2>
        <List
          bordered
          dataSource={rollEvents}
          renderItem={(item) => {
            return (
              <List.Item key={item.blockNumber}>
                {`Block::${item.blockNumber}| Roll1 => ${item[0]}| Roll2 => ${item[1]}| Roll3 => ${item[2]}| Roll4  =>${item[3]}| Roll5  =>${item[4]}| Roll6  =>${item[5]}`}
              </List.Item>
            )
          }}
        />
      </div>       */}

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}

      {/*<Events
        contracts={readContracts}
        contractName="RandomNumberConsumer"
        eventName="SetPurpose"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      /> */}

      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 256 }}>
        <Card>
          Check out all the{" "}
          <a
            href="https://github.com/austintgriffith/scaffold-eth/tree/master/packages/react-app/src/components"
            target="_blank"
            rel="noopener noreferrer"
          >
            📦 components
          </a>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <div>
            There are tons of generic components included from{" "}
            <a href="https://ant.design/components/overview/" target="_blank" rel="noopener noreferrer">
              🐜 ant.design
            </a>{" "}
            too!
          </div>

          <div style={{ marginTop: 8 }}>
            <Button type="primary">Buttons</Button>
          </div>

          <div style={{ marginTop: 8 }}>
            <SyncOutlined spin /> Icons
          </div>

          <div style={{ marginTop: 8 }}>
            Date Pickers?
            <div style={{ marginTop: 2 }}>
              <DatePicker onChange={() => {}} />
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Slider range defaultValue={[20, 50]} onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Switch defaultChecked onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Progress percent={50} status="active" />
          </div>

          <div style={{ marginTop: 32 }}>
            <Spin />
          </div>
        </Card>
      </div>
    </div>
  );
}
