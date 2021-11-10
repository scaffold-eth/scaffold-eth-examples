import React from "react";
import { List } from "antd";
import { Address, Balance } from "../components";

export default function Donations({ mainnetProvider, blockExplorer, price, donationEvents }) {

  return (
    <div style={{ width:600, margin: "auto", marginTop:32 }}>
      <List
        bordered
        header={(
          <h1>Donations</h1>
        )}
        dataSource={donationEvents}
        renderItem={item => {
          return (
            <List.Item>
              <Address
                value={item.sender}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              />
              {item.index.toNumber()}
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
