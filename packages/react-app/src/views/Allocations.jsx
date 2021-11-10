/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";

export default function ExampleUI({ denominator, allocations, mainnetProvider }) {

  let mostRecent = []
  for(let a in allocations){
    mostRecent = allocations[a]
    break;
  }


  let allocationList = []

  console.log("this allocation",mostRecent)
  for(let r in mostRecent.recipients){
    console.log("item.recipients[r]",r,mostRecent.recipients[r])
    console.log("RATIO",mostRecent.ratios[r],denominator&&denominator.toNumber())
    allocationList.push({wallet:mostRecent.recipients[r], ratio:mostRecent.ratios[r]})
  }

  return (
    <div>

      <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
        <List
          bordered
          dataSource={allocationList}
          renderItem={(item) => {
            console.log("item",item)
            return (
              <List.Item key={item.wallet}>
                <span style={{fontSize:24,padding:8,border:"1px solid #efefef"}}>
                  { Math.floor( item.ratio * 10000 / denominator )/100+"%" }
                </span>
                <Address
                  value={item.wallet}
                  ensProvider={mainnetProvider}
                />
              </List.Item>
            )
          }}
        />
      </div>

    </div>
  );
}
