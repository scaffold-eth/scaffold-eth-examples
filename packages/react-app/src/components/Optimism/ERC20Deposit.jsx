import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../../constants";
import { Address, Balance } from "..";
import { Alert, Button, Card, Input, List } from "antd";
import { CrossChainMessenger, MessageStatus } from "@eth-optimism/sdk";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useBalance, useOnBlock } from "eth-hooks";
import { invalidSignerForTargetNetwork } from "./utils";

export default function ERC20Deposit({
  balance,
  address,
  targetNetwork,
  mainnetProvider,
  signer,
  readContracts,
  crossChainMessenger,
  targetL1,
  targetL2,
}) {
  const [l1Balance, setL1Balance] = useState();
  useEffect(() => {
    const getTokenBalance = async () => {
      if (!readContracts.PGF) return;
      const balance = await readContracts.PGF?.balanceOf(address);
      setL1Balance(balance);
    };
    getTokenBalance();
  }, [balance, readContracts]);

  const [depositAmount, setDepositAmount] = useState();
  const depositToken = async () => {
    const l1Token = "0xE47ed24f39d5B0A0C6CCf77B5637Bf1d88218D29";
    const l2Token = "0xDb9888b842408B0b8eFa1f5477bD9F351754999E";
    if (crossChainMessenger) {
      await approveERC20(l1Token, l2Token);
      const result = await crossChainMessenger.depositERC20(l1Token, l2Token, ethers.utils.parseEther(depositAmount));
      console.log("deposit token", result);
      setDepositAmount("");
    }
  };

  const approveERC20 = async (l1Token, l2Token) => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.approveERC20(l1Token, l2Token, ethers.utils.parseEther(depositAmount));
      console.log("approveERC20", result);
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
        <div>{`Current Balance on ${targetL1.name}: ${ethers.utils.formatEther(l1Balance ?? 0)}`}</div>
        <Input
          style={{ width: "100px" }}
          placeholder="0.0"
          value={depositAmount}
          onChange={e => setDepositAmount(e.target.value)}
        />
        <Button style={{ margin: 5 }} type="primary" onClick={depositToken} disabled={!depositAmount}>
          Approve and Deposit
        </Button>
      </Card>
    </div>
  );
}
