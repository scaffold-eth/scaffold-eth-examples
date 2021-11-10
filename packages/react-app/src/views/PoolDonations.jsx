import React from "react";
import { List } from "antd";
import { Address, Balance } from "../components";

export default function PoolDonations({ mainnetProvider, blockExplorer, price, matchingPoolDonationEvents }) {

  return (
    <div style={{ width:600, margin: "auto", marginTop:32 }}>
      <List
        bordered
        header={(
          <h1>Pool Donations</h1>
        )}
        dataSource={matchingPoolDonationEvents}
        renderItem={item => {
          //console.log("matchingPoolDonationEvents",item)
          return (
            <List.Item>
              <Address
                value={item.sender}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              />
              {/*(+<Balance
                balance={item.value}
                dollarMultiplier={price}
              />)
              <Balance
                balance={item.total}
                dollarMultiplier={price}
              />*/}
              <Balance
                balance={item.value}
                dollarMultiplier={price}
              />
            </List.Item>
          )
        }}
      />
    </div>
  );
}
