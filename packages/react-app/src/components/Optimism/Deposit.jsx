import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../../constants";
import { Address, Balance } from "..";
import { Alert, Button, Card, Input, List } from "antd";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useBalance, useOnBlock } from "eth-hooks";
import { invalidSignerForTargetNetwork } from "./utils";

export default function Deposit({
  address,
  mainnetProvider,
  targetNetwork,
  crossChainMessenger,
  l1Provider,
  l2Provider,
}) {
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);
  const l1Balance = useBalance(l1Provider, address);
  const l2Balance = useBalance(l2Provider, address);

  const [depositAmount, setDepositAmount] = useState();
  const depositEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.depositETH(ethers.utils.parseEther(depositAmount));
      console.log("depositEth", result);
      setDepositAmount("");
    }
  };

  let alert = "";
  if (invalidSignerForTargetNetwork(crossChainMessenger, NETWORKS.kovan)) {
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
      <Card title="From Kovan" style={{ width: 300, marginTop: "20px" }}>
        Current Balance:
        <Balance balance={l1Balance} price={price} />
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
      <Card title="To Optimistic Kovan" style={{ width: 300 }}>
        Current Balance:
        <Balance balance={l2Balance} price={price} />
      </Card>
    </div>
  );
}
