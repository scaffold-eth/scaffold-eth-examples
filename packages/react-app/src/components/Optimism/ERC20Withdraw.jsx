import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Alert, Button, Card, Input, List } from "antd";
import { useContractLoader, useOnBlock } from "eth-hooks";
import { invalidSignerForTargetNetwork } from "./utils";
import { NETWORKS } from "../../constants";

export default function ERC20Withdraw({
  address,
  contractConfig,
  crossChainMessenger,
  l2Provider,
  l1TokenAddress,
  l2TokenAddress,
}) {
  const readContracts = useContractLoader(l2Provider, contractConfig);

  const [tokenBalance, setTokenBalance] = useState();
  useOnBlock(l2Provider, async () => {
    if (!readContracts.L2Token) return;
    const balance = await readContracts.L2Token.balanceOf(address);
    setTokenBalance(balance);
  });

  const [withdrawAmount, setWithdrawAmount] = useState();
  const withdrawToken = async () => {
    try {
      const result = await crossChainMessenger.withdrawERC20(
        l1TokenAddress,
        l2TokenAddress,
        ethers.utils.parseEther(withdrawAmount),
      );
      console.log("withdrawEth", result);
      setWithdrawAmount("");
    } catch (error) {
      console.error(error);
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
      <Card title="From Optimistic Kovan" style={{ width: 300, marginTop: "20px" }}>
        <div>{`Current Balance on Optimistic Kovan: ${ethers.utils.formatEther(tokenBalance ?? 0)}`}</div>
        <Input
          style={{ width: "100px" }}
          placeholder="0.0"
          value={withdrawAmount}
          onChange={e => setWithdrawAmount(e.target.value)}
        />
        <Button style={{ margin: 5 }} type="primary" onClick={withdrawToken} disabled={!withdrawAmount}>
          Withdraw
        </Button>
      </Card>
    </div>
  );
}
