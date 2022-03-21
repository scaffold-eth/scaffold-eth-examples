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

// TODO: ERC20 deposit
const l2TokenAddress = "0x0671cA24c73806aB08961Fd97b51A87d12e121E0";

export default function Deposit({
  address,
  balance,
  mainnetProvider,
  localProvider,
  targetNetwork,
  readContracts,
  signer,
}) {
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  const [crossChainMessenger, setCrossChainMessenger] = useState();
  useEffect(() => {
    if (!signer) {
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

  const [tokenBalance, setTokenBalance] = useState(0);
  useEffect(() => {
    if (!readContracts) return;

    const getTokenBalance = async () => {
      const tokenBalance = await readContracts.PGF?.balanceOf(address);
      setTokenBalance(tokenBalance);
    };
    getTokenBalance();
  }, [address]);

  const [depositAmount, setDepositAmount] = useState();
  const depositEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.depositETH(ethers.utils.parseEther(depositAmount));
      console.log("depositEth", result);
      setDepositAmount("");
    }
  };

  const [tokenDepositAmount, setTokenDepositAmount] = useState();
  const depositERC20 = async () => {
    if (crossChainMessenger) {
      try {
        const l1TokenAddress = readContracts.PGF.address;
        const approveResult = await crossChainMessenger.approveERC20(
          l1TokenAddress,
          l2TokenAddress,
          ethers.utils.parseEther(tokenDepositAmount),
        );
        console.log(approveResult);

        const result = await crossChainMessenger.depositERC20(
          l1TokenAddress,
          l2TokenAddress,
          ethers.utils.parseEther(tokenDepositAmount),
        );
        console.log(approveResult);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const finalizeMessage = async message => {
    if (crossChainMessenger) {
      // const m = await crossChainMessenger.getMessagesByTransaction(message, { direction: 1 });
      // const status = await crossChainMessenger.getMessageStatus(m[0]);
      // console.log("status", status);
      const result = await crossChainMessenger.finalizeMessage(message);
      console.log(result);
    }
  };

  let alert = "";
  if (signer?.provider?._network?.chainId !== NETWORKS.kovan.chainId) {
    alert = <Alert style={{ marginTop: "20px" }} message="Switch to Kovan to deposit to L2" type="error" />;
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
