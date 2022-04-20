import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../../constants";
import { Address, Balance } from "..";
import { Alert, Button, Card, Input, List } from "antd";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useBalance } from "eth-hooks";
import { invalidSignerForTargetNetwork } from "./utils";

export default function Withdraw({
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

  const [withdrawAmount, setWithdrawAmount] = useState();
  const withdrawEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.withdrawETH(ethers.utils.parseEther(withdrawAmount));
      console.log("withdrawEth", result);
      setWithdrawAmount("");
    }
  };

  let alert = "";
  if (invalidSignerForTargetNetwork(crossChainMessenger, NETWORKS.kovanOptimism)) {
    alert = (
      <Alert
        style={{ marginTop: "20px" }}
        message="Switch provider network to Optimistic Kovan to withdraw to L1"
        type="error"
      />
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
      <Card title="To Kovan" style={{ width: 300, marginTop: "20px" }}>
        Current Balance:
        <Balance balance={l1Balance} price={price} />
      </Card>
      ↑
      <Card title="From Optimistic Kovan" style={{ width: 300 }}>
        Current Balance:
        <Balance balance={l2Balance} price={price} />
        <Input
          style={{ width: "100px" }}
          placeholder="0.0"
          value={withdrawAmount}
          onChange={e => setWithdrawAmount(e.target.value)}
        />
        <Button style={{ margin: 5 }} type="primary" onClick={withdrawEth} disabled={!withdrawAmount}>
          Withdraw
        </Button>
      </Card>
    </div>
  );
}
