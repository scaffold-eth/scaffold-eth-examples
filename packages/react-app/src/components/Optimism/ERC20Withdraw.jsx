import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Alert, Button, Card, Input, List } from "antd";
import { useContractLoader } from "eth-hooks";
import { invalidSignerForTargetNetwork } from "./utils";
import { NETWORKS } from "../../constants";

export default function ERC20Withdraw({
  balance,
  address,
  signer,
  contractConfig,
  crossChainMessenger,
  l2Provider,
  targetL2,
}) {
  const readContracts = useContractLoader(l2Provider, contractConfig);
  const [tokenBalance, setTokenBalance] = useState();
  useEffect(() => {
    const getTokenBalance = async () => {
      if (!readContracts.L2Token) return;
      const balance = await readContracts.L2Token.balanceOf(address);
      setTokenBalance(balance);
    };
    getTokenBalance();
  }, [balance, readContracts]);

  const [withdrawAmount, setWithdrawAmount] = useState();
  const withdrawToken = async () => {
    const l1Token = "0xE47ed24f39d5B0A0C6CCf77B5637Bf1d88218D29";
    const l2Token = "0xDb9888b842408B0b8eFa1f5477bD9F351754999E";
    if (crossChainMessenger) {
      const result = await crossChainMessenger.withdrawERC20(l1Token, l2Token, ethers.utils.parseEther(withdrawAmount));
      console.log("withdrawEth", result);
      setWithdrawAmount("");
    }
  };

  let alert = "";
  if (invalidSignerForTargetNetwork(signer, NETWORKS.kovanOptimism)) {
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
      <Card title={`From ${targetL2.name}`} style={{ width: 300 }}>
        <div>{`Current Balance on ${targetL2.name}: ${ethers.utils.formatEther(tokenBalance ?? 0)}`}</div>
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
