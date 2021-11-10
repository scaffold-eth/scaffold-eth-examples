/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { AddressInput, Address, Balance } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";

export default function ExampleUI({ distributions, mainnetProvider, tx, writeContracts }) {

  const [ tokenAddress, setTokenAddress] = useState()

  return (
    <div>

    <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>
      <AddressInput
        autoFocus
        ensProvider={mainnetProvider}
        placeholder="to address"
        value={tokenAddress}
        onChange={setTokenAddress}
      />
      <Button style={{margin:8}} onClick={()=>{
        console.log("Distribute")
        /* look how you call setPurpose on your contract: */
        tx( writeContracts.Allocator.distribute(tokenAddress) )
      }}>Distribute</Button>
    </div>

    <div style={{ width:780, margin: "auto", marginTop:32, paddingBottom:32 }}>
      <List
        bordered
        dataSource={distributions}
        renderItem={(item) => {
          return (
            <List.Item key={item.wallet+"_"+item.token+"_"+item.blockNumber}>

              <Address
                value={item.wallet}
                ensProvider={mainnetProvider}
              />
              <div>
                <Balance
                  balance={item.amount}
                />
                <Address
                  minimized={true}
                  value={item.token}
                  ensProvider={mainnetProvider}
                />
              </div>

            </List.Item>
          )
        }}
      />
    </div>

    </div>
  );
}
