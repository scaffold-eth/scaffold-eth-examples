import React, { useState, useEffect } from "react";
import { Space, Row, InputNumber, notification, Checkbox, Statistic, Select, Typography, Button, Divider, Modal } from "antd";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { abi as IErc20 } from './abis/erc20.json'

const { Option } = Select;
const { Text } = Typography;

function AaveAction({ assetData, userAssetData, userAccountData, signer, lendingPoolContract, type, assetPrice, setLiveAsset  }) {

  const [modalVisible, setModalVisible] = useState(false)
  const [transacting, setTransacting] = useState(false)
  const [approving, setApproving] = useState(false)

  const [amount, setAmount] = useState(0)
  const [useMax, setUseMax] = useState(false)
  const [balance, setBalance] = useState()
  const [poolAllowance, setPoolAllowance] = useState()

  const [borrowType, setBorrowType] = useState("2")

  const getTokenBalance = async () => {
    let tokenContract = new ethers.Contract(assetData.tokenAddress, IErc20, signer);
    let address = await signer.getAddress()
    let _balance = await tokenContract.balanceOf(address)
    setBalance(_balance)
    let _allowance = await tokenContract.allowance(address,lendingPoolContract.address)
    setPoolAllowance(_allowance)
  }

  useEffect(() => {
    if(modalVisible) {
    getTokenBalance()
  }
  },[amount, modalVisible])

  const approve = async (_amount) => {
    console.log("approving",_amount)
    try {
    setApproving(true)
    let tokenContract = new ethers.Contract(assetData.tokenAddress, IErc20, signer);
    let address = await signer.getAddress()
    let amountToApprove = _amount==="0"?ethers.constants.MaxUint256:parseUnits(_amount,assetData.decimals)
    let approval = await tokenContract.approve(lendingPoolContract.address, amountToApprove)
    console.log('approval', approval)
    setApproving(false)
    notification.open({
      message: 'Token transfer approved',
      description:
      `Aave can now move up to ${formatUnits(amountToApprove,assetData.decimals)} ${assetData.symbol}`,
    }) } catch (e) {
      console.log(e)
      setApproving(false)
      notification.open({
        message: 'Approval failed',
        description:
        `${assetData.symbol} approval did not take place`,
      })
    }
    getTokenBalance()
  }

  const deposit = async (_amount) => {
    console.log("depositing",_amount)
    let address = await signer.getAddress()
    let amountToDeposit = parseUnits(_amount,assetData.decimals)
    let deposit = await lendingPoolContract.deposit(assetData.tokenAddress, amountToDeposit, address, 0)
    console.log('deposit', deposit)
    return deposit
  }

  const withdraw = async (_amount) => {
    console.log("withdrawing")
    let address = await signer.getAddress()
    let amountToWithdraw = useMax?ethers.constants.MaxUint256:parseUnits(_amount,assetData.decimals)
    let withdraw = await lendingPoolContract.withdraw(assetData.tokenAddress, amountToWithdraw, address)
    console.log(withdraw)
    return withdraw
  }

  const borrow = async (_amount) => {
    console.log("borrowing")
    let address = await signer.getAddress()
    let amountToBorrow = parseUnits(_amount,assetData.decimals)
    let borrow = await lendingPoolContract.borrow(assetData.tokenAddress, amountToBorrow, borrowType, 0, address)
    console.log('borrow', borrow)
    return borrow
  }

  const repay = async (_amount) => {
    console.log("repaying")
    let address = await signer.getAddress()
    let amountToRepay = useMax?ethers.constants.MaxUint256:parseUnits(_amount,assetData.decimals)
    console.log(useMax,ethers.constants.MaxUint256, amountToRepay)
    let repay = await lendingPoolContract.repay(assetData.tokenAddress, amountToRepay, borrowType, address)
    console.log('repay', repay)
    return repay
  }

  const showModal = () => {
    setModalVisible(true);
    setLiveAsset(assetData.symbol)
  };

  const handleModalOk = async () => {
    try {
    setTransacting(true);
    let _amount = amount.toString()
    let _transaction
    if(type === "deposit") {
      _transaction = await deposit(_amount)
    } if(type==="withdraw") {
      _transaction = await withdraw(_amount)
    } if(type==="borrow") {
      _transaction = await borrow(_amount)
    } if(type==="repay") {
      _transaction = await repay(_amount)
    }
    notification.open({
      message: `${type} complete 👻`,
      description:
      <><Text>{`${type}: ${amount} ${assetData.symbol}, transaction: `}</Text><Text copyable>{_transaction.hash}</Text></>,
    });
    getTokenBalance()
    setModalVisible(false);
    setTransacting(false)
  } catch(e) {
    console.log(e)
    notification.open({
      message: `${type} failed 🙁`,
      description:
      <><Text>{`${type}: ${amount} ${assetData.symbol} did not take place`}</Text></>,
    });
    setTransacting(false)
  }
  };

  const updateMaxAmount = () => {
    if(useMax&&userAssetData&&type==="withdraw") {
      setAmount(parseFloat(formatUnits(userAssetData['currentATokenBalance'], assetData.decimals)))
    } if(useMax&&userAssetData&&type==="repay") {
      let _repayAmount = borrowType==="2" ? userAssetData['currentVariableDebt'] : userAssetData['currentStableDebt']
      setAmount(parseFloat(formatUnits(_repayAmount, assetData.decimals)))
    }
  }

  const handleModalCancel = () => {
    setModalVisible(false);
    setLiveAsset("none")
  };

  let poolNeedsAllowance = ['borrow','withdraw'].includes(type) ? false : (poolAllowance&&amount) ? parseFloat(formatUnits(poolAllowance, assetData.decimals)) < amount : true

  let maxBorrow = (userAccountData&&assetPrice) ? parseFloat(formatUnits(userAccountData.availableBorrowsETH)) / parseFloat(formatUnits(assetPrice)) : null
  let requiredCollateralETH = (userAccountData&&assetPrice) ? parseFloat(formatUnits(userAccountData.totalDebtETH)) / parseFloat(formatUnits(userAccountData.ltv, 4)) : 0.0
  let maxWithdrawETH = (userAccountData&&requiredCollateralETH) ? (parseFloat(formatUnits(userAccountData.totalCollateralETH)) - requiredCollateralETH) : 0.0
  let maxWithdraw = (assetPrice&&maxWithdrawETH) ? maxWithdrawETH / parseFloat(formatUnits(assetPrice)) : 0.0

  let maxValue = (type === 'borrow') ? maxBorrow : (type === 'withdraw') ? maxWithdraw : null

  let modal = (
    <Modal title={`${type.charAt(0).toUpperCase() + type.slice(1)} ${assetData&&assetData.symbol}`}
      visible={modalVisible}
      onCancel={handleModalCancel}
      width={800}
      footer={[
        <Button key="back" onClick={handleModalCancel}>
          cancel
        </Button>,
        <Button key="submit" type="primary" disabled={poolNeedsAllowance} loading={transacting} onClick={handleModalOk}>
          {type}
        </Button>,
      ]}
      >
      <Row>
        <Space>
          {(balance&&assetData)&&<Statistic title={`Wallet balance`} value={balance&&formatUnits(balance, assetData.decimals)} suffix={assetData.symbol}/>}
          {(assetData)&&<Statistic title={`Deposited`} value={(userAssetData&&userAssetData['currentATokenBalance'])?parseFloat(formatUnits(userAssetData['currentATokenBalance'], assetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={assetData.symbol}/>}
          {(assetData)&&<Statistic title={`Variable debt`} value={(userAssetData&&userAssetData['currentVariableDebt'])?parseFloat(formatUnits(userAssetData['currentVariableDebt'], assetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={assetData.symbol}/>}
          {(assetData)&&<Statistic title={`Stable debt`} value={(userAssetData&&userAssetData['currentStableDebt'])?parseFloat(formatUnits(userAssetData['currentStableDebt'], assetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={assetData.symbol}/>}
          {(poolAllowance&&poolNeedsAllowance&&assetData)&&<Statistic title={`Aave Pool allowance`} value={poolAllowance&&formatUnits(poolAllowance, assetData.decimals)} suffix={assetData.symbol} />}
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
      <Space>
      <InputNumber style={{width: '160px'}} min={0} size={'large'} value={amount} onChange={(e) => {
        setAmount(e)
        setUseMax(false)
      }}
        disabled={useMax}
      />
      <Typography>{assetData&&assetData.symbol}</Typography>
      {['withdraw','repay'].includes(type)&&<Checkbox checked={useMax} onChange={()=>{
        setUseMax(!useMax)
        updateMaxAmount()
      }}>Maximum</Checkbox>}
      {["borrow","repay"].includes(type)&&(
        <Select defaultValue="2" style={{ width: 120 }} onChange={(value) => {
          setBorrowType(value)
          updateMaxAmount()
        }}>
          {(assetData&&assetData.stableBorrowRateEnabled)&&<Option value="1">Stable</Option>}
          <Option value="2">Variable</Option>
        </Select>
      )}
      {(poolNeedsAllowance)?(
        <>
        <Button loading={approving} onClick={() => {approve(amount.toString())}}>Approve Amount</Button>
        <Button loading={approving} onClick={() => {approve("0")}}>Approve Max</Button>
        </>
      ):null}
      </Space>
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
