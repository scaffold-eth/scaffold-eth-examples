import React from "react";
import { List } from "antd";
import { Address, Balance } from "../components";

export default function Donors({ mainnetProvider, localProvider, blockExplorer, price, donorAllowedEvents, donationsByAddress }) {


  return (
    <div style={{ width:600, margin: "auto", marginTop:32 }}>
      <List
        bordered
        header={(
          <h1>Donors</h1>
        )}
        dataSource={donorAllowedEvents}
        renderItem={item => {
          //console.log("donorAllowedEvents",item)
          return (
            <List.Item>
            <Address
              value={item.donor}
              ensProvider={mainnetProvider}
              blockExplorer={blockExplorer}
            />
            {item.allowed}

            <div style={{opacity:0.25}}>
              <Balance
                address={item.donor}
                provider={localProvider}
                dollarMultiplier={price}
              />
            </div>

            <Balance
              balance={donationsByAddress[item.donor]}
              dollarMultiplier={price}
            />

            </List.Item>
          )
        }}
      />
    </div>
  );
}
