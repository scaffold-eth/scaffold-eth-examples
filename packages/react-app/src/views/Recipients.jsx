import React, { useEffect, useState } from "react";
import { List } from "antd";
import { Address, Balance } from "../components";
import { useContractReader, useEventListener } from "../hooks";
const { utils } = require("ethers");

export default function Recipients({
  mainnetProvider, localProvider, readContracts, price, blockExplorer,
  recipients, totalMatchingWeight, matchingPool, currentTotalWeight
}) {

  return (
    <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:128 }}>
      <List
        bordered
        header={(
          <h1>Recipients</h1>
        )}
        dataSource={recipients}
        renderItem={item => {
          let percent = 0
          let matchingAmount = 0
          let opacity = 0.1
          if(totalMatchingWeight>0){
            percent = parseFloat(item.matchingWeight.mul(10000).div(totalMatchingWeight).toNumber())/100
            matchingAmount = item.matchingWeight.mul(matchingPool).div(totalMatchingWeight)
            opacity = 1
          }else if(currentTotalWeight&&currentTotalWeight.gt(0)){
            //it is trying to keep a current guess at weight
            //console.log("&&CALC",currentTotalWeight,item.currentWeight)
            percent = parseFloat(item.currentWeight.mul(10000).div(currentTotalWeight).toNumber())/100
            matchingAmount = item.currentWeight.mul(matchingPool).div(currentTotalWeight)
            opacity = 0.5
          }

          let matchDisplay = ""
          if(percent){
            matchDisplay = (
              <div style={{opacity}}>
                <div style={{opacity:0.7}}>
                   <Balance
                      balance={item.totalDonations}
                      provider={localProvider}
                      dollarMultiplier={price}
                   />+
                   <Balance
                     balance={matchingAmount}
                     dollarMultiplier={price}
                   />
                </div>
                <div>
                  <Balance
                    balance={item.totalDonations.add(matchingAmount)}
                    provider={localProvider}
                    dollarMultiplier={price}
                    size={32}
                  />
                </div>
                ({percent}%)
              </div>
            )
          }

          console.log("item.total",item.total)

          return (
            <List.Item>
              <div>
                <div style={{fontSize:24,padding:16}}>{utils.toUtf8String(item.title)}</div>
                <div>{utils.toUtf8String(item.desc)}</div>
                <Address
                  value={item.addr}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                />
              </div>
              {matchDisplay}
            </List.Item>
          )
        }}
      />
    </div>
  );
}
