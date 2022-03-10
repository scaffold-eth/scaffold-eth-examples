import { useEffect, useState } from "react";
import { utils, ethers } from "ethers";
import { NETWORKS } from "../constants";
import { Address, Balance } from "../components";
import { List } from "antd";
import { CrossChainMessenger } from "@eth-optimism/sdk";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useBalance } from "eth-hooks";

const targetL1 = NETWORKS.kovan;
const targetL2 = NETWORKS.kovanOptimism;

export default function OptimismBridge({ address, userSigner, mainnetProvider, localProvider }) {
  const price = useExchangeEthPrice(targetL1, mainnetProvider);

  const [l1Provider, setL1Provider] = useState();
  const [l2Provider, setL2Provider] = useState();
  useEffect(() => {
    setL1Provider(userSigner);
    setL2Provider(new ethers.providers.StaticJsonRpcProvider(targetL2.rpcUrl));
  }, [userSigner]);

  const [crossChainMessenger, setCrossChainMessenger] = useState();
  useEffect(() => {
    if (!l1Provider || !l2Provider) {
      return;
    }

    const crossChainMessenger = new CrossChainMessenger({
      l1SignerOrProvider: l1Provider,
      l2SignerOrProvider: l2Provider.getSigner(),
      l1ChainId: targetL1.chainId,
    });

    setCrossChainMessenger(crossChainMessenger);
  }, [l1Provider, l2Provider]);

  const [deposits, setDeposits] = useState([]);
  useEffect(() => {
    if (!crossChainMessenger || !address) {
      return;
    }

    const getDeposits = async () => {
      const deposits = await crossChainMessenger.getDepositsByAddress(address);
      console.log("deposits", deposits);
      setDeposits(deposits);
    };

    getDeposits();
  }, [crossChainMessenger, address]);

  const l2Balance = useBalance(l2Provider, address);
  const [withdrawals, setWithdrawals] = useState([]);
  useEffect(() => {
    if (!crossChainMessenger || !address) {
      return;
    }

    const getWithdrawals = async () => {
      const wd = await crossChainMessenger.getWithdrawalsByAddress(address);
      console.log("withdrawals", wd);
      setWithdrawals(wd);
    };

    getWithdrawals();
  }, [crossChainMessenger, l2Balance]);

  const depositEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.depositETH(ethers.utils.parseEther(".01"));
      console.log("depositEth", result);
    }
  };

  const withdrawEth = async () => {
    if (crossChainMessenger) {
      const result = await crossChainMessenger.withdrawETH(ethers.utils.parseEther(".01"));
      console.log("withdrawEth", result);
    }
  };

  return (
    <div>
      <button onClick={depositEth}>Deposit eth!</button>
      <button onClick={withdrawEth}>Withdraw eth!</button>
      <Balance address={address} provider={l2Provider} price={price} />
      <h2>Deposits:</h2>
      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <List
          bordered
          dataSource={deposits}
          renderItem={item => {
            return (
              <List.Item key={item.transactionHash}>
                <Address address={item.from} ensProvider={mainnetProvider} fontSize={16} />
                <Balance balance={item.amount} provider={localProvider} price={price} />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
