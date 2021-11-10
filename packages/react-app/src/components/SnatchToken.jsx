import React, { useState, useCallback, useEffect } from "react";
import { Input, Button, Form, Tooltip, Select, InputNumber, Typography } from "antd";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";

import { useResolveName, useDebounce } from "../hooks";

import { DAI_ADDRESS, DAI_ABI } from "../constants";

const { Option } = Select;
const { Text } = Typography;

const SnatchToken = ({ mainnetProvider, localProvider, tx }) => {
  const [target, setTarget] = useState("ironsoul.eth");
  const [receiver, setReceiver] = useState("");
  const [targetBalance, setTargetBalance] = useState();
  const [targetEthBalance, setTargetEthBalance] = useState();
  const [receiverBalance, setReceiverBalance] = useState();
  const [token, setToken] = useState(DAI_ADDRESS)
  const [tokenList, setTokenList] = useState([])
  const [amount, setAmount] = useState(10)

  let defaultToken = 'DAI'
  let defaultDecimals = 18

  let tokenListUri = 'https://tokens.1inch.eth.link'

  useEffect(() => {
    const getTokenList = async () => {
      try {
      let tokenList = await fetch(tokenListUri)
      let tokenListJson = await tokenList.json()
      let filteredTokens = tokenListJson.tokens.filter(function (t) {
        return t.chainId === 1
      })
      setTokenList(filteredTokens)
    } catch (e) {
      console.log(e)
    }
    }
    getTokenList()
  },[])

  const debouncedTarget = useDebounce(target, 500);

  const { addressFromENS, loading, error } = useResolveName(mainnetProvider, debouncedTarget);

  const getTokenBalance = async () => {
      let tokenContract = new ethers.Contract(token, DAI_ABI, localProvider);
      if(addressFromENS) {
        let _targetBalance = await tokenContract.balanceOf(addressFromENS)
        setTargetBalance(_targetBalance)
        let _targetEthBalance = await localProvider.getBalance(addressFromENS)
        setTargetEthBalance(_targetEthBalance)
      }
      if(ethers.utils.isAddress(receiver) ) {
        let _receiverBalance = await tokenContract.balanceOf(receiver)
        setReceiverBalance(_receiverBalance)
      }
    }

  useEffect(() => {
    getTokenBalance()
  },[addressFromENS, receiver])

  let _token = tokenList.filter(function (el) {
    return el.address === token})

  let decimals
  let symbol
  if(_token.length === 0) {
    decimals = defaultDecimals
    symbol = defaultToken
  } else {
    decimals = _token[0].decimals
    symbol = _token[0].symbol
  }

  let targetBalanceFormatted = targetBalance ? parseFloat(formatUnits(targetBalance, decimals)).toFixed(2) : null
  let targetEthBalanceFormatted = targetEthBalance ? parseFloat(formatUnits(targetEthBalance, 18)).toFixed(2) : null
  let receiverBalanceFormatted = receiverBalance ? parseFloat(formatUnits(receiverBalance, decimals)).toFixed(2) : null

  const impersonateSend = useCallback(async () => {
    const accountToImpersonate = addressFromENS;

    await localProvider.send("hardhat_impersonateAccount", [accountToImpersonate]);
    const signer = await localProvider.getSigner(accountToImpersonate);

    const myTokenContract = new ethers.Contract(token, DAI_ABI, signer);
    console.log(receiver, amount, decimals)
    await tx(myTokenContract.transfer(receiver, parseUnits(amount.toString(), decimals)));
    getTokenBalance()
  }, [addressFromENS, receiver]);

  const getValidationProps = () => {
    if (loading) {
      return {
        validateStatus: "validating",
        help: "Resolving..",
      };
    } else if (error) {
      return {
        validateStatus: "error",
        help: error,
      };
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        textAlign: "left",
        marginTop: "30px",
      }}
    >
      <Form.Item label="ENS name or address of your target:" hasFeedback {...getValidationProps()}>
        <Tooltip placement="bottom" title="Account must have non-zero ETH balance">
          <Input value={target} onChange={e => setTarget(e.target.value)} />
          <Text type="secondary">{targetBalanceFormatted&&`${targetBalanceFormatted} ${symbol}, ${targetEthBalanceFormatted} ETH`}</Text>
        </Tooltip>
      </Form.Item>
      <Form.Item label="Token">
        <Select showSearch defaultValue={defaultToken} onChange={(value) => setToken(value)}
        filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } optionFilterProp="children">
          {tokenList.map(token => (
            <Option key={token.address} value={token.address}>{token.symbol}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Amount">
        <InputNumber defaultValue={amount} onChange={(value) => {
          console.log(value)
          setAmount(value)
        }
        } />
      </Form.Item>
      <Form style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Form.Item style={{ flexBasis: "75%" }}>
          <Input size="medium" onChange={e => setReceiver(e.target.value)} placeholder="Put receiver address" />
          <Text type="secondary">{receiverBalanceFormatted&&`${receiverBalanceFormatted} ${symbol}`}</Text>
        </Form.Item>
        <Form.Item style={{ flexBasis: "20%" }}>
          <Button onClick={impersonateSend} disabled={error || loading || !receiver}>
            Snatch!
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SnatchToken;
