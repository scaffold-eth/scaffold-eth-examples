import React from "react";
import { List } from "antd";
import { Address, Balance } from "../components";

export default function Withdrawals({ mainnetProvider, blockExplorer, price, withdrawEvents }) {

  return (
    <div style={{ width:600, margin: "auto", marginTop:32 }}>
      <List
        bordered
        header={(
          <h1>Withdrawals</h1>
        )}
        dataSource={withdrawEvents}
        renderItem={item => {
          return (
            <List.Item>
              <h2>{item.index.toNumber()}</h2>
              <Address
                value={item.to}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              />
              <Balance
                balance={item.total}
                dollarMultiplier={price}
              />
              <div style={{opacity:0.5}}>
                <Balance
                  balance={item.matched}
                  dollarMultiplier={price}
                /> matched
              </div>
            </List.Item>
          )
        }}
      />
    </div>
  );
}
