import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../../constants";
import { Address, Balance } from "..";
import { Alert, Button, Card, Input, List } from "antd";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { CrossChainMessenger } from "@eth-optimism/sdk";
import { useContractLoader } from "eth-hooks";

const targetL1 = NETWORKS.kovan;
const l1Provider = new ethers.providers.JsonRpcProvider(targetL1.rpcUrl);

const targetL2 = NETWORKS.kovanOptimism;
const l2Provider = new ethers.providers.StaticJsonRpcProvider(targetL2.rpcUrl);

const invalidSignerForTargetNetwork = signer => {
  return !signer || signer?.provider?._network?.chainId !== NETWORKS.kovanOptimism.chainId;
};

export default function ERC20Withdraw({ balance, address, userSigner, signer, contractConfig }) {
  const readContracts = useContractLoader(l2Provider, contractConfig);
  const [crossChainMessenger, setCrossChainMessenger] = useState();
  const [tokenBalance, setTokenBalance] = useState();
  useEffect(() => {
    const getTokenBalance = async () => {
      if (!readContracts.L2Token) return;
      const balance = await readContracts.L2Token.balanceOf(address);
      setTokenBalance(balance);
    };
    getTokenBalance();
  }, [balance, readContracts]);

  useEffect(() => {
    if (invalidSignerForTargetNetwork(signer)) {
      return;
    }

    try {
      const crossChainMessenger = new CrossChainMessenger({
        l1SignerOrProvider: l1Provider,
        l2SignerOrProvider: signer,
        l1ChainId: targetL1.chainId,
      });
      setCrossChainMessenger(crossChainMessenger);
    } catch (e) {
      console.log("error", e);
    }
  }, [userSigner]);

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
  if (invalidSignerForTargetNetwork(signer)) {
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
        <div>Current Balance: {ethers.utils.formatEther(tokenBalance ?? 0)}</div>
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
