import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../../constants";
import { Address, Balance } from "..";
import { Alert, Button, Card, Input, List } from "antd";
import { CrossChainMessenger, MessageStatus } from "@eth-optimism/sdk";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useBalance } from "eth-hooks";

const targetL2 = NETWORKS.kovanOptimism;
const l2Provider = new ethers.providers.StaticJsonRpcProvider(targetL2.rpcUrl);

const invalidSignerForTargetNetwork = signer => {
  return !signer || signer?.provider?._network?.chainId !== NETWORKS.kovan.chainId;
};

export default function Deposit({ address, balance, mainnetProvider, localProvider, targetNetwork, signer }) {
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  const [crossChainMessenger, setCrossChainMessenger] = useState();
  useEffect(() => {
    if (invalidSignerForTargetNetwork(signer)) {
      return;
    }

    try {
      const crossChainMessenger = new CrossChainMessenger({
        l1SignerOrProvider: signer,
        l2SignerOrProvider: l2Provider.getSigner(),
        l1ChainId: targetNetwork.chainId,
      });
      setCrossChainMessenger(crossChainMessenger);
    } catch (e) {
      console.log("error", e);
    }
  }, [signer]);

  const [deposits, setDeposits] = useState([]);
  useEffect(() => {
    if (!crossChainMessenger || !address) {
      return;
    }
    let isSubscribed = false;
    const getDeposits = async () => {
      isSubscribed = true;
      const deposits = await crossChainMessenger.getDepositsByAddress(address);
      console.log("Deposits", deposits);

      if (isSubscribed) {
        setDeposits(deposits);
      }
    };

    getDeposits();

    return () => (isSubscribed = false);
  }, [crossChainMessenger, balance]);

  const [withdrawTxs, setWithdrawTxs] = useState([]);
  useEffect(() => {
    if (!crossChainMessenger) {
      return;
    }

    let isSubscribed = false;
    const getWithdraws = async () => {
      isSubscribed = true;
      console.log("getting withdraws");
      const wd = await crossChainMessenger.getWithdrawalsByAddress(address);
      console.log("Withdraws", wd);
      if (isSubscribed) {
        setWithdrawTxs(wd);
      }
    };

    getWithdraws();

    return () => (isSubscribed = false);
  }, [crossChainMessenger, address]);

  const [withdrawMessages, setwithdrawMessages] = useState([]);
  useEffect(() => {
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
  if (invalidSignerForTargetNetwork(signer)) {
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
      <Card title={`From ${targetNetwork.name}`} style={{ width: 300, marginTop: "20px" }}>
        <Input
          style={{ width: "100px" }}
          placeholder="0.0"
          value={depositAmount}
          onChange={e => setDepositAmount(e.target.value)}
        />
        <Button type="primary" onClick={depositEth} disabled={!depositAmount}>
          Deposit
        </Button>
      </Card>
      ↓
      <Card title={`To ${targetL2.name}`} style={{ width: 300 }}>
        Current Balance:
        <Balance address={address} provider={l2Provider} price={price} />
      </Card>
      <h4 style={{ marginTop: 25 }}>Withdraws:</h4>
      <div style={{ width: 500, paddingBottom: 32 }}>
        <List
          bordered
          dataSource={withdrawMessages}
          renderItem={item => {
            return (
              <List.Item key={item.id}>
                <Address address={item.to} ensProvider={mainnetProvider} fontSize={16} />
                <Balance balance={item.amount} provider={localProvider} price={price} />
                <span>{item.status}</span>
                <Button type="primary" disabled={item.status !== 4} onClick={() => finalizeMessage(item.message)}>
                  Finalize
                </Button>
              </List.Item>
            );
          }}
        />
      </div>
      <h4 style={{ marginTop: 25 }}>Deposits:</h4>
      <div style={{ width: 500, paddingBottom: 32 }}>
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
  );
}
