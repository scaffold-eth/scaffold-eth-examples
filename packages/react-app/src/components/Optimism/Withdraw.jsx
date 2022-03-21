import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../../constants";
import { Address, Balance } from "..";
import { Alert, Button, Card, Input, List } from "antd";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { CrossChainMessenger } from "@eth-optimism/sdk";

const targetL1 = NETWORKS.kovan;
const l1Provider = new ethers.providers.JsonRpcProvider(targetL1.rpcUrl);

export default function Withdraw({
  address,
  balance,
  userSigner,
  mainnetProvider,
  localProvider,
  targetNetwork,
  signer,
}) {
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  const [crossChainMessenger, setCrossChainMessenger] = useState();
  useEffect(() => {
    if (!userSigner) {
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
  const withdrawEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.withdrawETH(ethers.utils.parseEther(withdrawAmount));
      console.log("withdrawEth", result);
    }
  };

  let alert = "";
  if (signer?.provider?._network?.chainId !== NETWORKS.kovanOptimism.chainId) {
    alert = (
      <Alert
        style={{ marginTop: "20px" }}
        message="Switch targetNetwork to kovanOptimism to withdraw to L2"
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
      <Card title={`To ${targetL1.name}`} style={{ width: 300, marginTop: "20px" }}>
        Current Balance:
        <Balance address={address} provider={l1Provider} price={price} />
      </Card>
      ↑
      <Card title={`From ${targetNetwork.name}`} style={{ width: 300 }}>
        <Input
          style={{ width: "100px" }}
          placeholder="0.0"
          value={withdrawAmount}
          onChange={e => setWithdrawAmount(e.target.value)}
        />
        <Button type="primary" onClick={withdrawEth} disabled={!withdrawAmount}>
          Withdraw
        </Button>
      </Card>
    </div>
  );
}
