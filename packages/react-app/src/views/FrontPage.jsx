import React, { useCallback, useEffect, useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, AddressInput, Balance, Blockie } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useContractReader, useEventListener } from "../hooks";
import QR from "qrcode.react";
const axios = require('axios');

export default function FrontPage({ executeTransactionEvents, contractName, localProvider, readContracts, price, mainnetProvider, blockExplorer }) {

  return (
    <div style={{padding:32,maxWidth:750,margin:"auto"}}>

      <div style={{paddingBottom:32}}>

        <div>
          <Balance
            address={readContracts?readContracts[contractName].address:readContracts}
            provider={localProvider}
            dollarMultiplier={price}
            size={64}
          />
        </div>
        <div>
          <QR value={readContracts?readContracts[contractName].address:""} size={"180"} level={"H"} includeMargin={true} renderAs={"svg"} imageSettings={{excavate:false}}/>
        </div>
        <div>
          <Address
            address={readContracts?readContracts[contractName].address:readContracts}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            fontSize={32}
          />
        </div>
      </div>
      {


        <List
          bordered
          dataSource={executeTransactionEvents}
          renderItem={(item) => {
            //console.log("executeTransactionEvents ITEM",item)
            return (
              <List.Item style={{position:"relative"}}>
              <div style={{position:"absolute",top:55,fontSize:12,opacity:0.5}}>
                {item.data}
              </div>
              <b style={{padding:16}}>#{item.nonce.toNumber()}</b>
              <span>
                <Blockie size={4} scale={8} address={item.hash} /> {item.hash.substr(0,6)}
              </span>
              <Address
                address={item.to}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
                fontSize={16}
              />
              <Balance
                balance={item.value}
                dollarMultiplier={price}
              />
              </List.Item>
            )
          }}
        />


      }


    </div>
  );
}
