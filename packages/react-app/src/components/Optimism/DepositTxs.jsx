import { List } from "antd";
import { Address, Balance } from "..";
import { ethL2Token } from "./utils";

export default function DepositTxs({ deposits, mainnetProvider, localProvider, price }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h4 style={{ marginTop: 25 }}>Deposits:</h4>
      <div style={{ width: 450, paddingBottom: 32 }}>
        <List
          bordered
          dataSource={deposits}
          renderItem={item => {
            return (
              <List.Item key={item.transactionHash} style={{ display: "flex" }}>
                <Address address={item.to} ensProvider={mainnetProvider} fontSize={16} />
                <div style={{ marginLeft: "auto" }}>{item.l2Token === ethL2Token ? "Ξ" : ""}</div>
                <Balance balance={item.amount} provider={localProvider} price={price} />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
