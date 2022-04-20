import { useEffect, useState } from "react";
import { Alert, Button, List, Spin } from "antd";
import { Address, Balance } from "..";
import { MessageStatus } from "@eth-optimism/sdk";
import { ethL2Token } from "./utils";

export default function WithdrawTxs({ price, localProvider, mainnetProvider, withdrawTxs, crossChainMessenger }) {
  const [withdrawMessages, setwithdrawMessages] = useState([]);
  useEffect(() => {
    const getMessages = async () => {
      const withdrawMessages = [];
      try {
        console.log("getting message status...");
        for (const wd of withdrawTxs) {
          const messages = await crossChainMessenger.getMessagesByTransaction(wd, { direction: 1 });
          const message = messages[0]; // assuming only 1 for now
          const status = await crossChainMessenger.getMessageStatus(message);
          withdrawMessages.push({
            id: wd.transactionHash,
            to: wd.to,
            l2Token: wd.l2Token,
            amount: wd.amount,
            status,
            message,
          });
        }

        console.log("Withdraw Messages", withdrawMessages);
        setwithdrawMessages(withdrawMessages);
      } catch (e) {
        console.error(e);
      }
    };

    getMessages();
  }, [withdrawTxs]);

  const finalizeMessage = async message => {
    if (crossChainMessenger) {
      try {
        const result = await crossChainMessenger.finalizeMessage(message);
        console.log("finalize result", result);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const [invalidSigner, setInvalidSigner] = useState(false);
  useEffect(() => {
    if (!crossChainMessenger) return;

    try {
      crossChainMessenger.l1Signer; // will throw if there isn't an L1 signer
      setInvalidSigner(false);
    } catch (e) {
      setInvalidSigner(true);
    }
  }, [crossChainMessenger]);

  let alert = "";
  if (invalidSigner) {
    alert = <Alert message="Switch provider network to Kovan to finalize messages" type="error" />;
  }

  let messageView = <Spin />;
  if (withdrawMessages.length > 0) {
    messageView = (
      <List
        bordered
        dataSource={withdrawMessages}
        renderItem={item => {
          return (
            <List.Item key={item.id} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Address address={item.to} ensProvider={mainnetProvider} fontSize={16} />
                <div style={{ marginLeft: "auto" }}>{item.l2Token === ethL2Token ? "Ξ" : ""}</div>
                <Balance balance={item.amount} provider={localProvider} price={price} />
              </div>
              <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{MessageStatus[item.status]}</span>
                <Button type="primary" disabled={item.status !== 4} onClick={() => finalizeMessage(item.message)}>
                  Finalize
                </Button>
              </div>
            </List.Item>
          );
        }}
      />
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h4 style={{ marginTop: 25 }}>Withdraws:</h4>
      {alert}
      <div style={{ width: 500, paddingBottom: 32 }}>{messageView}</div>
    </div>
  );
}
