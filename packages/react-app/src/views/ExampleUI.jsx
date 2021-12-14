import React, { useState } from "react";
import { Button, Divider, Spin } from "antd";
import { useContractReader } from "eth-hooks";
import EventsMultiDice from "../components/EventsMultiDice";

export default function ExampleUI({ address, mainnetProvider, localProvider, tx, readContracts, writeContracts }) {
  const eventQueryStartBlock = 28677000; // Better than to query from block 1, but still not optimal.

  // Improvement 1: use subgraph

  // Improvement 2:
  // Side quest! (nerdy/advanced) see if you can inject the latest DiceRolls deployment block number into your frontend
  // whenever a new hardhat deployment happens.
  // It can be done in a similar way to how the contract abis are injected.
  // You need to look in the hardhat/deployments/DiceRolls.sol file for the transactionReceipt.

  // ======= MULTI DICE ROLLS INIT ======= //

  const [pendingDiceRoll, setPendingDiceRoll] = useState(false);
  const hasRequestedRoll = useContractReader(readContracts, "MultiDiceRolls", "hasRequested", [address]);
  const hasRollResult = useContractReader(readContracts, "MultiDiceRolls", "hasRollResult", [address]);
  const rollResult = useContractReader(readContracts, "MultiDiceRolls", "rollResultFor", [address]);

  const rollResultDisplay = !hasRequestedRoll ? (
    "Not rolled yet"
  ) : !hasRollResult ? (
    <>
      <span style={{ marginRight: "1rem" }}>Waiting for oracle response</span>
      <Spin></Spin>
    </>
  ) : rollResult ? (
    rollResult.toString()
  ) : (
    ""
  );

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "1rem auto", marginTop: 64 }}>
        <h2 style={{ backgroundColor: "#eeffff" }}>Multi Dice Rolls</h2>
        <h4>
          Your Roll Result: <br />
          {rollResultDisplay}
        </h4>
        <div style={{ margin: 8 }}>
          <Button
            loading={pendingDiceRoll}
            onClick={async () => {
              setPendingDiceRoll(true);
              const result = tx(writeContracts.MultiDiceRolls.requestRandomRoll(), update => {
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
            Do Your Roll!
          </Button>
        </div>
        <Divider />
        <EventsMultiDice
          contracts={readContracts}
          contractName="MultiDiceRolls"
          eventName="Rolled"
          localProvider={localProvider}
          mainnetProvider={mainnetProvider}
          startBlock={eventQueryStartBlock}
        />
      </div>
    </div>
  );
}
