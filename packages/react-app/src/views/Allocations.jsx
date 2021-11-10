/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";

export default function ExampleUI({ denominator, allocations, mainnetProvider }) {

  return (
    <div>

      <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
        <List
          bordered
          dataSource={allocations}
          renderItem={(item) => {
            return (
              <List.Item key={item.wallet}>
                <span style={{fontSize:24,padding:8,border:"1px solid #efefef"}}>
                  { Math.floor( item.ratio * 100 / denominator )+"%" }
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
