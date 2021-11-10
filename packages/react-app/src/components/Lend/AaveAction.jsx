import React, { useState, useEffect } from "react";
import { Space, Row, InputNumber, notification, Checkbox, Statistic, Select, Typography, Button, Divider, Modal, Radio, Form, Switch } from "antd";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { abi as IErc20 } from './abis/erc20.json'

const { Option } = Select;
const { Text } = Typography;

function AaveAction({ assetData, userAssetData, userAccountData, signer, type, assetPrice, setLiveAsset, selectedProvider, lendingPool  }) {

  const [modalVisible, setModalVisible] = useState(false)
  const [transacting, setTransacting] = useState(false)
  const [approving, setApproving] = useState(false)

  const [amount, setAmount] = useState(0)
  const [useMax, setUseMax] = useState(false)
  const [balance, setBalance] = useState()

  const [runningTransactions, setRunningTransactions] = useState()

  let defaultInterestRateMode = "Variable"
  const [interestRateMode, setInterestRateMode] = useState(defaultInterestRateMode)

  const getTokenBalance = async () => {
    let tokenContract = new ethers.Contract(assetData.underlyingAsset, IErc20, signer);
    let address = await signer.getAddress()
    let _balance = await tokenContract.balanceOf(address)
    setBalance(_balance)
  }

  useEffect(() => {
    if(modalVisible) {
    getTokenBalance()
  }
  },[amount, modalVisible])

  const showModal = () => {
    setModalVisible(true);
    setLiveAsset([assetData.symbol])
  };

  const sendTransactions = async (_requests) => {
    let results = []
    for (const t in _requests) {
      let tx = await signer.sendTransaction(await _requests[t].tx())
      let receipt = await tx.wait(1)
      console.log(_requests[t].txType, tx, receipt);
      results.push(tx)
    }
    return results
  }

  const handleModalOk = async () => {
    try {
    setTransacting(true);
    let _amount = useMax?"-1":amount.toString()
    let _address = await signer.getAddress()
    let _requests
    let _transactions

    if(type === "deposit") {
      _requests = await lendingPool.deposit({user: _address, reserve: assetData.underlyingAsset, amount: _amount})
    } if(type==="withdraw") {
      _requests = await lendingPool.withdraw({user: _address, reserve: assetData.underlyingAsset, amount: _amount})
    } if(type==="borrow") {
      _requests = await lendingPool.borrow({user: _address, reserve: assetData.underlyingAsset, amount: _amount, interestRateMode: interestRateMode})
    } if(type==="repay") {
      _requests = await lendingPool.repay({user: _address, reserve: assetData.underlyingAsset, amount: _amount, interestRateMode: interestRateMode})
    }
    _transactions = await sendTransactions(_requests)
    console.log(_transactions)
    notification.open({
      message: `${type} complete 👻`,
      description:
      <><Text>{`${type}: ${useMax?'Maximum':amount} ${assetData.symbol}, transaction: `}</Text><Text copyable>{_transactions[_transactions.length - 1].hash}</Text></>,
    });
    getTokenBalance()
    setModalVisible(false);
    setTransacting(false)
  } catch(e) {
    console.log(e)
    notification.open({
      message: `${type} failed 🙁`,
      description:
      <><Text>{`${type}: ${useMax?'Maximum':amount} ${assetData.symbol} did not take place (${e.message})`}</Text></>,
    });
    setTransacting(false)
  }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setLiveAsset()
  };

  let maxBorrow = (userAccountData&&assetPrice) ? parseFloat(formatUnits(userAccountData.availableBorrowsETH)) / parseFloat(formatUnits(assetPrice)) : null
  let requiredCollateralETH = (userAccountData&&assetPrice) ? parseFloat(formatUnits(userAccountData.totalDebtETH)) / parseFloat(formatUnits(userAccountData.ltv, 4)) : 0.0
  let maxWithdrawETH = (userAccountData&&requiredCollateralETH) ? (parseFloat(formatUnits(userAccountData.totalCollateralETH)) - requiredCollateralETH) : 0.0
  let maxWithdraw = (assetPrice&&maxWithdrawETH) ? maxWithdrawETH / parseFloat(formatUnits(assetPrice)) : 0.0

  let maxValue = (type === 'borrow') ? maxBorrow : (type === 'withdraw') ? maxWithdraw : null

  let modal = (
    <Modal title={`${type.charAt(0).toUpperCase() + type.slice(1)} ${assetData&&assetData.symbol}`}
      visible={modalVisible}
      onCancel={handleModalCancel}

      footer={[
        <Button key="back" onClick={handleModalCancel}>
          cancel
        </Button>,
        <Button key="submit" type="primary" loading={transacting} onClick={handleModalOk} disabled={amount===0&&useMax===false}>
          {type}
        </Button>,
      ]}
      >
      <Row>
        <Space>
          {(balance&&assetData)&&<Statistic title={`Wallet balance`} value={balance&&parseFloat(formatUnits(balance, assetData.decimals)).toFixed(4)} suffix={assetData.symbol}/>}
          {(assetData)&&<Statistic title={`Deposited`} value={(userAssetData&&userAssetData['currentATokenBalance'])?parseFloat(formatUnits(userAssetData['currentATokenBalance'], assetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={assetData.symbol}/>}
          {(assetData)&&<Statistic title={`Variable debt`} value={(userAssetData&&userAssetData['currentVariableDebt'])?parseFloat(formatUnits(userAssetData['currentVariableDebt'], assetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={assetData.symbol}/>}
          {(assetData)&&<Statistic title={`Stable debt`} value={(userAssetData&&userAssetData['currentStableDebt'])?parseFloat(formatUnits(userAssetData['currentStableDebt'], assetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={assetData.symbol}/>}
          {(assetPrice&&['borrow'].includes(type))&&<Statistic title={`Maximum borrow`} value={maxBorrow?maxBorrow.toPrecision(6):"0"} suffix={assetData.symbol}/>}
          {(assetPrice&&['withdraw'].includes(type))&&<Statistic title={`Maximum withdraw`} value={maxWithdraw?maxWithdraw.toPrecision(6):"0"} suffix={assetData.symbol}/>}
        </Space>
      </Row>
      <Row>
        <Space>
          {(assetData&&['deposit','withdraw'].includes(type))&&<Statistic title={`Deposit rate`} value={parseFloat(formatUnits(assetData.liquidityRate, 25)).toFixed(2)} suffix={"%"}/>}
          {(assetData&&['borrow','repay'].includes(type))&&<Statistic title={`Variable rate`} value={parseFloat(formatUnits(assetData.variableBorrowRate, 25)).toFixed(2)} suffix={"%"}/>}
          {(assetData&&['borrow','repay'].includes(type)&&assetData.stableBorrowRateEnabled)&&<Statistic title={`Stable rate`} value={parseFloat(formatUnits(assetData.stableBorrowRate, 25)).toFixed(2)} suffix={"%"}/>}
        </Space>
      </Row>
      <Divider/>
      {['withdraw','repay'].includes(type)&&(<Form.Item label={`${type} entire balance`}>
      <Switch onChange={(e)=>{
                  setUseMax(e)
                }} />
      </Form.Item>)}
      {!useMax&&<Form.Item label="Amount">
      <InputNumber style={{width: '160px'}} min={0} size={'large'} value={amount} onChange={(e) => {
        setAmount(e)
        setUseMax(false)
      }}
        disabled={useMax}
      />
      </Form.Item>}
      {["borrow","repay"].includes(type)&&(
        <Form.Item label="Interest Rate Mode">
          <Select defaultValue="Variable" style={{ width: 120 }} onChange={(value) => {
            setInterestRateMode(value)
          }}>
            {(assetData&&assetData.stableBorrowRateEnabled)&&<Option value="Stable">Stable</Option>}
            <Option value="Variable">Variable</Option>
          </Select>
        </Form.Item>
      )}
    </Modal>
  )

  return (
    <>
    {modal}
    <Button loading={transacting} onClick={showModal}>{type}</Button>
    </>
  )

}

export default AaveAction;
