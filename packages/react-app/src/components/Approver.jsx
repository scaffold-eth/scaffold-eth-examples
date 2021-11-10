import React, { useState, useCallback, useEffect } from "react";
import { Input, Button, Form, Tooltip, Select, InputNumber, Typography, Switch } from "antd";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";

import { useDebounce } from "../hooks";

import { DAI_ADDRESS, DAI_ABI } from "../constants";

const { Option } = Select;
const { Text } = Typography;

const Approver = ({ userProvider, tx }) => {

  let signer = userProvider.getSigner()

  const [token, setToken] = useState(DAI_ADDRESS)
  const [tokenList, setTokenList] = useState([])
  const [amount, setAmount] = useState()
  const [senderAddress, setSenderAddress] = useState()
  const [senderAllowance, setSenderAllowance] = useState();
  const [useMax, setUseMax] = useState(false)
  const [manualToken, setManualToken] = useState(process.env.REACT_APP_NETWORK==='kovan')

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

  const getAllowance = async () => {

      let address = await signer.getAddress()
      let tokenContract = new ethers.Contract(token, DAI_ABI, userProvider);
      if(senderAddress&&token&&ethers.utils.isAddress(senderAddress)) {
        let _allowance = await tokenContract.allowance(address, senderAddress)
        setSenderAllowance(_allowance)
      }
    }

  useEffect(() => {
    getAllowance()
  },[token, senderAddress])

  const approve = useCallback(async () => {

    let _amount = useMax===true ? ethers.constants.MaxUint256 : (amount&&parseUnits(amount.toString(), decimals))

    const myTokenContract = new ethers.Contract(token, DAI_ABI, signer);

    console.log(useMax===true, useMax, senderAddress, _amount)

    let _tx = await tx(myTokenContract.approve(senderAddress, _amount))
    let receipt = await _tx.wait(1)
    console.log(_tx, receipt);
    getAllowance()
  }, [senderAddress, token, amount]);

  let allowanceFormatted = senderAllowance ? parseFloat(formatUnits(senderAllowance, decimals)).toFixed(2) : null

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        textAlign: "left",
        marginTop: "30px",
      }}
    >
      {process.env.REACT_APP_NETWORK!=='kovan'&&<Form.Item label={`Manual token entry`}>
      <Switch onChange={(e)=>{
                  console.log(`Set manual: ${e}`)
                  setManualToken(e)
                }} />
      </Form.Item>}
      <Form.Item label="Token">
        {manualToken === true ?
          <Input value={token} onChange={e => setToken(e.target.value)} /> :
          <Select showSearch defaultValue={defaultToken} onChange={(value) => setToken(value)}
        filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } optionFilterProp="children">
          {tokenList.map(token => (
            <Option key={token.address} value={token.address}>{token.symbol}</Option>
          ))}
        </Select>
        }
      </Form.Item>
      <Form.Item label="Address to approve:">
          <Input value={senderAddress} onChange={e => setSenderAddress(e.target.value)} />
          <Text type="secondary">{allowanceFormatted&&`${senderAllowance.gt(ethers.constants.MaxUint256.div(ethers.BigNumber.from("10")))?'Maximum':allowanceFormatted} ${symbol}`}</Text>
      </Form.Item>
      <Form.Item label={`Set maximum`}>
      <Switch onChange={(e)=>{
                  console.log(`Use max: ${e}`)
                  setUseMax(e)
                }} />
      </Form.Item>
      {(useMax===false)&&<Form.Item label="Amount">
        <InputNumber onChange={(value) => {
          setAmount(value)
        }
        } />
      </Form.Item>}
      <Form style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Form.Item style={{ flexBasis: "20%" }}>
          <Button onClick={approve} disabled={!senderAddress}>
            Approve!
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Approver;
