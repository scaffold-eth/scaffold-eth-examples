import { useEffect, useState } from "react";
import { utils, ethers } from "ethers";
import { NETWORKS } from "../constants";
import { Address, Balance } from "../components";
import { Button, Card, Input, List } from "antd";
import { CrossChainMessenger } from "@eth-optimism/sdk";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useBalance } from "eth-hooks";

// const targetL1 = NETWORKS.kovan;
const targetL2 = NETWORKS.kovanOptimism;
const l2Provider = new ethers.providers.StaticJsonRpcProvider(targetL2.rpcUrl);

export default function OptimismBridge({
  address,
  balance,
  userSigner,
  mainnetProvider,
  localProvider,
  targetNetwork,
  readContracts,
}) {
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  const [crossChainMessenger, setCrossChainMessenger] = useState();
  useEffect(() => {
    if (!userSigner) {
      return;
    }

    const crossChainMessenger = new CrossChainMessenger({
      l1SignerOrProvider: userSigner,
      l2SignerOrProvider: l2Provider.getSigner(),
      l1ChainId: targetNetwork.chainId,
    });

    setCrossChainMessenger(crossChainMessenger);
  }, [userSigner]);

  const [deposits, setDeposits] = useState([]);
  useEffect(() => {
    if (!crossChainMessenger || !address) {
      return;
    }
    let isSubscribed = false;
    const getDeposits = async () => {
      isSubscribed = true;
      const deposits = await crossChainMessenger.getDepositsByAddress(address);

      if (isSubscribed) {
        setDeposits(deposits);
      }
    };

    getDeposits();

    return () => (isSubscribed = false);
  }, [crossChainMessenger, balance]);

  const [tokenBalance, setTokenBalance] = useState(0);
  useEffect(() => {
    if (!readContracts) return;

    const getTokenBalance = async () => {
      const tokenBalance = await readContracts.PGF?.balanceOf(address);
      setTokenBalance(tokenBalance);
    };
    getTokenBalance();
  }, [address]);

  // const l2Balance = useBalance(l2Provider, address);
  // const [withdrawals, setWithdrawals] = useState([]);
  // useEffect(() => {
  //   if (!crossChainMessenger || !address) {
  //     return;
  //   }

  //   const getWithdrawals = async () => {
  //     const wd = await crossChainMessenger.getWithdrawalsByAddress(address);
  //     console.log("withdrawals", wd);
  //     setWithdrawals(wd);
  //   };

  //   getWithdrawals();
  // }, [crossChainMessenger, l2Balance]);

  const [depositAmount, setDepositAmount] = useState();
  const depositEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.depositETH(ethers.utils.parseEther(depositAmount));
      console.log("depositEth", result);
      setDepositAmount("");
    }
  };

  const [depositTokenAmount, setDeposittokenAmount] = useState();
  const depositToken = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.approveERC20(readContracts.PGF.Address);
    }
  };

  const withdrawEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.withdrawETH(ethers.utils.parseEther(".01"));
      console.log("withdrawEth", result);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Card title={`From ${targetNetwork.name}`} style={{ width: 300 }}>
        <Input
          style={{ width: "100px" }}
          placeholder="0.0"
          value={depositAmount}
          onChange={e => setDepositAmount(e.target.value)}
        />
        <Button type="primary" onClick={depositEth} disabled={!depositAmount}>
          Deposit
        </Button>
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
