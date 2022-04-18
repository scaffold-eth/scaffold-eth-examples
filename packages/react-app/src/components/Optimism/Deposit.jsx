import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../../constants";
import { Address, Balance } from "..";
import { Alert, Button, Card, Input, List } from "antd";
import { CrossChainMessenger, MessageStatus } from "@eth-optimism/sdk";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useBalance, useOnBlock } from "eth-hooks";
import { invalidSignerForTargetNetwork } from "./utils";

export default function Deposit({
  address,
  mainnetProvider,
  localProvider,
  targetNetwork,
  signer,
  crossChainMessenger,
  deposits,
  withdrawTxs,
  targetL1,
  targetL2,
  l1Provider,
  l2Provider,
}) {
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);
  const l2Balance = useBalance(l2Provider, address);

  const [withdrawMessages, setwithdrawMessages] = useState([]);
  useEffect(() => {
    if (invalidSignerForTargetNetwork(signer, NETWORKS.kovan)) return;

    const getMessages = async () => {
      const withdrawMessages = [];
      for (const wd of withdrawTxs) {
        const messages = await crossChainMessenger.getMessagesByTransaction(wd, { direction: 1 });
        const message = messages[0]; // assuming only 1 for now
        const status = await crossChainMessenger.getMessageStatus(message);
        withdrawMessages.push({
          id: wd.transactionHash,
          to: wd.to,
          amount: wd.amount,
          status,
          message,
        });
      }
      console.log("Withdraw Messages", withdrawMessages);
      setwithdrawMessages(withdrawMessages);
    };

    getMessages();
  }, [withdrawTxs]);

  const [depositAmount, setDepositAmount] = useState();
  const depositEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.depositETH(ethers.utils.parseEther(depositAmount));
      console.log("depositEth", result);
      setDepositAmount("");
    }
  };

  const finalizeMessage = async message => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.finalizeMessage(message);
      console.log("finalize result", result);
    }
  };

  let alert = "";
  if (invalidSignerForTargetNetwork(signer, NETWORKS.kovan)) {
    alert = (
      <Alert style={{ marginTop: "20px" }} message="Switch provider network to Kovan to deposit to L2" type="error" />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      {alert}
      <Card title={`From ${targetL1.name}`} style={{ width: 300, marginTop: "20px" }}>
        Current Balance:
        <Balance address={address} provider={l1Provider} price={price} />
        <Input
          style={{ width: "100px" }}
          placeholder="0.0"
          value={depositAmount}
          onChange={e => setDepositAmount(e.target.value)}
        />
        <Button style={{ margin: 5 }} type="primary" onClick={depositEth} disabled={!depositAmount}>
          Deposit
        </Button>
      </Card>
      ↓
      <Card title={`To ${targetL2.name}`} style={{ width: 300 }}>
        Current Balance:
        <Balance balance={l2Balance} price={price} />
      </Card>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h4 style={{ marginTop: 25 }}>Deposits:</h4>
          <div style={{ width: 450, paddingBottom: 32 }}>
            <List
              bordered
              dataSource={deposits}
              renderItem={item => {
                return (
                  <List.Item key={item.transactionHash}>
                    <Address address={item.to} ensProvider={mainnetProvider} fontSize={16} />
                    <Balance balance={item.amount} provider={localProvider} price={price} />
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h4 style={{ marginTop: 25 }}>Withdraws:</h4>
          <div style={{ width: 500, paddingBottom: 32 }}>
            <List
              bordered
              dataSource={withdrawMessages}
              renderItem={item => {
                return (
                  <List.Item key={item.id} style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Address address={item.to} ensProvider={mainnetProvider} fontSize={16} />
                      <Balance balance={item.amount} provider={localProvider} price={price} />
                    </div>
                    <div
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <span>{MessageStatus[item.status]}</span>
                      <Button type="primary" disabled={item.status !== 4} onClick={() => finalizeMessage(item.message)}>
                        Finalize
                      </Button>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
