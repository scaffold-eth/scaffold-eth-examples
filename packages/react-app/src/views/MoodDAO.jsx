/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther } from "@ethersproject/units";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance, MoodProposal } from "../components";

export default function MoodDAO({
  purpose,
  setPurposeEvents,
  address,
  mainnetProvider,
  userProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newPurpose, setNewPurpose] = useState("loading...");

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}s
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <h2>Vote your MOOD!😚</h2>
        <Divider />
        <h3>Current proposals</h3>
         <MoodProposal 
           pollID={1}
           mainnetProvider={mainnetProvider}
           price={price}
           readContracts={readContracts}
           contractName={"Voting"}
         />
         <div style={{ marginTop: 32 }}>
            <Progress percent={50} status="active" />
          </div>
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setNewPurpose(e.target.value);
            }}
          />
          <Button
            onClick={() => {
              console.log("newPurpose", newPurpose);
              /* look how you call setPurpose on your contract: */
              tx(writeContracts.YourContract.setPurpose(newPurpose));
            }}
          >
            Set Purpose
          </Button>
        </div>
            </div>
            </div>
  );
}
