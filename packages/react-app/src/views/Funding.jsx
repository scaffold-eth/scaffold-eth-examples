import { useContractReader, useBalance } from "eth-hooks";
import React, { useState } from "react";
import { useEffect } from "react";
import { ethers } from "ethers";
import { Input, Button } from "antd";
import { useMemo } from "react";

const Funding = ({ readContracts, writeContracts, localProvider, signer, injectedProvider, tx, address }) => {
  const fundingAddress = readContracts.RetroactiveFunding && readContracts.RetroactiveFunding.address;
  const contractBalance = ethers.utils.formatEther(useBalance(localProvider, fundingAddress));
  const poolAddress = useContractReader(readContracts, "RetroactiveFunding", "getPool");
  const erc20Balance = useContractReader(readContracts, "RetroactiveFunding", "balanceOf", [address]);
  const erc20BalanceFormatted = (erc20Balance && ethers.utils.formatEther(erc20Balance)) || 0.0;
  const allowance = useContractReader(readContracts, "RetroactiveFunding", "allowance", [address, fundingAddress]);

  const [fund, setFund] = useState(null);
  const [sell, setSell] = useState(null);

  const fundProject = () => {
    tx(
      writeContracts.RetroactiveFunding.fundProject({
        value: ethers.utils.parseEther(fund),
      }),
    );
  };

  const approveTokens = () => {
    tx(writeContracts.RetroactiveFunding.approve(fundingAddress, ethers.utils.parseEther(sell)));
  };

  const sellTokens = () => {
    tx(writeContracts.RetroactiveFunding.sellToken(ethers.utils.parseEther(sell)));
  };

  const lowApproval = useMemo(() => {
    if (!allowance || !sell) return true;
    const sellAmount = ethers.utils.parseEther(sell);
    if (allowance.lt(sellAmount)) return true;
    return false;
  }, [allowance, sell]);

  return (
    <div style={{ margin: "0 auto", maxWidth: 560, paddingTop: 20, textAlign: "left" }}>
      <p style={{ margin: 0 }}>
        <b>Pool:</b> {poolAddress}
      </p>
      <p>
        <b>My ERC20 Balance:</b> {erc20BalanceFormatted} tokens
      </p>
      <div style={{ paddingTop: 15, paddingBottom: 15 }}>
        <p>
          <b>Whale Form</b>
        </p>
        <Input
          type="number"
          placeholder="1 ETH"
          style={{ marginBottom: 10 }}
          value={fund}
          onChange={e => setFund(e.target.value)}
        />
        <Button disabled={!fund || !injectedProvider} onClick={fundProject}>
          Fund project
        </Button>
      </div>
      <div style={{ paddingTop: 10, paddingBottom: 20 }}>
        <p>
          <b>Project owner form</b>
        </p>
        <Input
          type="number"
          placeholder="20 tokens"
          style={{ marginBottom: 10 }}
          value={sell}
          onChange={e => setSell(e.target.value)}
        />
        {lowApproval ? (
          <Button disabled={!sell} onClick={approveTokens}>
            Approve tokens
          </Button>
        ) : (
          <Button disabled={!sell} onClick={sellTokens}>
            Sell tokens
          </Button>
        )}
      </div>
    </div>
  );
};

export default Funding;
