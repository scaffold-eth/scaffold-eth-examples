import React from "react";
import { formatEther } from "@ethersproject/units";
import { useEventListener } from "../hooks";
import { List } from "antd";
import { Address, Balance } from "../components";
import { ethers } from "ethers";


export default function Activity({ address, recipientAddedEvents, mainnetProvider, blockExplorer, readContracts, localProvider, price }) {
  //Donate(address sender, uint256 value, uint256 index)
  const supportEvents = useEventListener(readContracts, "MVPCLR", "Donate", localProvider, 1);
  console.log("📟 supportEvents:",supportEvents)

  //event MatchingPoolDonation(address sender, uint256 value);
  const matchingPoolDonationEvents = useEventListener(readContracts, "MVPCLR", "MatchingPoolDonation", localProvider, 1);
  console.log("📟 matchingPoolDonationEvents:",matchingPoolDonationEvents)


  let recipientIndexToData = {}
  for(let r in recipientAddedEvents){
    recipientIndexToData[recipientAddedEvents[r].index.toNumber()] = recipientAddedEvents[r].data
  }

  let extraCount = 0
  return (
    <div style={{marginTop:64}}>
    <div style={{width:600,margin:"auto",paddingBottom:32}}>

      <List
        size="large"
        dataSource={matchingPoolDonationEvents}
        renderItem={(item)=>{
          console.log("item",item)

          return (
            <List.Item
              key={item.sender+"_"+extraCount++}
              style={{backgroundColor:item.sender&&address&&address==item.sender?"#f2fff2":"#ffffff"}}
            >
              <div style={{textAlign:"left"}}>
                <Balance
                  balance={item.value}
                  dollarMultiplier={price}
                />
                 to the matching pool
              </div>

              <div style={{float:"right"}}>
                <Address
                  value={item.sender}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  fontSize={16}
                />
              </div>

            </List.Item>
          )
        }}
      />
    </div>
    <div style={{width:600,margin:"auto",paddingBottom:128}}>

      <List
        size="large"
        dataSource={supportEvents}
        renderItem={(item)=>{
          console.log("item",item)
          const index = item.index.toNumber()
          let project = recipientIndexToData[index]?ethers.utils.parseBytes32String(recipientIndexToData[index]):""

          return (
            <List.Item
              key={index+"_"+item.sender}
              style={{backgroundColor:item.sender&&address&&address==item.sender?"#f2fff2":"#ffffff"}}
            >
              <div style={{textAlign:"left"}}>
                <Balance
                  balance={item.value}
                  dollarMultiplier={price}
                />
                 to   <span style={{letterSpacing:1.1,fontWeight:"bold"}}> {project}</span>
              </div>

              <div style={{float:"right"}}>
                <Address
                  value={item.origin} /* item.sender */
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  fontSize={16}
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
