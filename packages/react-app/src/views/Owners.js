import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance, Blockie } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useContractReader, useEventListener } from "../hooks";
const axios = require('axios');

export default function Owners({ readContracts, localProvider, mainnetProvider, blockExplorer }) {

  //📟 Listen for broadcast events
  const ownerEvents = useEventListener(readContracts, "YourContract", "Owner", localProvider, 1);
  console.log("📟 ownerEvents:",ownerEvents)

  return (
    <div>
      <List
        style={{maxWidth:450,margin:"auto",marginTop:32}}
        bordered
        dataSource={ownerEvents}
        renderItem={(item) => {
          console.log("OWNERS ITEM",item)
          return (
            <List.Item>
            <Address
              value={item[0]}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              fontSize={32}
            />
            <div style={{padding:16}}>
              {item[1]?"👍":"👎"}
            </div>
            </List.Item>
          )
        }}
      />
    </div>
  );
}
