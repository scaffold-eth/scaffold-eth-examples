import React, { useState, useEffect } from "react";
import { Space, Row, Col, Radio, Card, Select, Statistic, InputNumber, notification, Descriptions, Typography, Button, Divider, Drawer, Table, Skeleton, Popover } from "antd";
import { SettingOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useBlockNumber, usePoller } from "eth-hooks";
import { abi as IAddressProvider } from './abis/LendingPoolAddressProvider.json'
import { abi as IDataProvider } from './abis/ProtocolDataProvider.json'
import { abi as ILendingPool } from './abis/LendingPool.json'
import { abi as IPriceOracle } from './abis/PriceOracle.json'
import { abi as IErc20 } from './abis/erc20.json'

const { Option } = Select;
const { Text } = Typography;

const POOL_ADDRESSES_PROVIDER_ADDRESS = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'
const PROTOCOL_DATA_PROVIDER = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d'
const LENDING_POOL = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
const PRICE_ORACLE = '0xa50ba011c48153de246e5192c8f9258a2ba79ca9'

function SimpleLend({ selectedProvider, ethPrice }) {

  const [settingsVisible, setSettingsVisible] = useState(false)

  const [userConfiguration, setUserConfiguration] = useState()
  const [userAccountData, setUserAccountData] = useState()
  const [userAssetData, setUserAssetData] = useState()
  const [userAssetList, setUserAssetList] = useState({})

  const [reserveTokens, setReserveTokens] = useState()
  const [assetData, setAssetData] = useState({})
  const [assetPrice, setAssetPrice] = useState()

  const [liveAsset, setLiveAsset] = useState("DAI")

  const [showActiveAssets, setShowActiveAssets] = useState(false)

  const [displayCurrency, setDisplayCurrency] = useState('native')

  const [balance, setBalance] = useState()
  const [poolAllowance, setPoolAllowance] = useState()
  const [amount, setAmount] = useState()
  const [transacting, setTransacting] = useState()
  const [approving, setApproving] = useState()

  let signer = selectedProvider.getSigner()
  let addressProviderContract = new ethers.Contract(POOL_ADDRESSES_PROVIDER_ADDRESS, IAddressProvider, signer);
  let dataProviderContract = new ethers.Contract(PROTOCOL_DATA_PROVIDER, IDataProvider, signer);
  let lendingPoolContract = new ethers.Contract(LENDING_POOL, ILendingPool, signer);
  let priceOracleContract = new ethers.Contract(PRICE_ORACLE, IPriceOracle, signer);

  const getReserveTokens = async () => {
    if(!reserveTokens && dataProviderContract && selectedProvider) {
      console.log('getting Reserve Tokens')
      let _reserveTokens = await dataProviderContract.getAllReservesTokens()//.getReserveData("0x6B175474E89094C44Da98b954EedeAC495271d0F")//makeCall('getAddress', addressProviderContract, ["0x1"])
      console.log(_reserveTokens)
      setReserveTokens(_reserveTokens)
    }
  }

  const getReserveData = async () => {
    if(reserveTokens && liveAsset) {
      console.log('getting reserve data')

      var asset = reserveTokens.filter(function (el) {
        return el.symbol === liveAsset})[0]

      let _reserveData = await dataProviderContract.getReserveData(asset.tokenAddress)
      let _reserveConfigurationData = await dataProviderContract.getReserveConfigurationData(asset.tokenAddress)
      let _newAssetData = {...asset, ..._reserveData, ..._reserveConfigurationData}
      setAssetData(_newAssetData)
    }
  }

  useEffect(() => {
    getReserveData()
  }, [reserveTokens])

  const getAssetPrice = async () => {
    if(reserveTokens && liveAsset) {
      console.log('getting price data')
      var asset = reserveTokens.filter(function (el) {
        return el.symbol === liveAsset})[0]
      let _price = await priceOracleContract.getAssetPrice(asset.tokenAddress)
      console.log(_price)
      setAssetPrice(_price)
    }
  }

  const getTokenBalance = async () => {
    if(assetData&&assetData.tokenAddress&&signer) {
      let tokenContract = new ethers.Contract(assetData.tokenAddress, IErc20, signer);
      let address = await signer.getAddress()
      console.log(assetData, address)
      let _balance = await tokenContract.balanceOf(address)
      setBalance(_balance)
      let _allowance = await tokenContract.allowance(address,lendingPoolContract.address)
      setPoolAllowance(_allowance)
    }
  }

  const getUserAssetData = async () => {
    if(signer && reserveTokens && liveAsset) {
      let address = await signer.getAddress()

      var asset = reserveTokens.filter(function (el) {
        return el.symbol === liveAsset})[0]

      let _data = await dataProviderContract.getUserReserveData(asset.tokenAddress,address)

      setUserAssetData(_data)

      }
    }

  const getUserInfo = async () => {
    console.log('getting user info')
    let address = await signer.getAddress()
    let _accountData = await lendingPoolContract.getUserAccountData(address)
    setUserAccountData(_accountData)
    let _userConfiguration = await lendingPoolContract.getUserConfiguration(address)
    setUserConfiguration(_userConfiguration)
  }

  const checkUserConfiguration = async (_configuration) => {
    if(_configuration && reserveTokens) {
      let _userActiveAssets = {}
      let configBits = parseInt(userConfiguration.toString(), 10).toString(2)
      let reversedBits = configBits.split("").reverse()
      let _userAssetList = {}
      for (let i = 0; i < reversedBits.length; i++) {
        let _assetIndex = Math.floor(i/2)
        if(reversedBits[i]==="1") {
          let _type = i%2===0?"debt":"collateral"
          let _symbol = reserveTokens[_assetIndex]['symbol']
          let _newAsset
          if(_userAssetList[_symbol]){
            _newAsset = [..._userAssetList[_symbol], _type]
          } else { _newAsset = [_type]}
          _userAssetList[_symbol] = _newAsset
        }
      }
      setUserAssetList(_userAssetList)
    }
  }

  useEffect(() => {
    checkUserConfiguration(userConfiguration)
  }, [userConfiguration])

  usePoller(getTokenBalance, 3000)
  usePoller(getReserveTokens, 3000)
  usePoller(getReserveData, 15000)
  usePoller(getUserAssetData, 6000)
  usePoller(getUserInfo, 6000)
  usePoller(getAssetPrice, 5500)

  useEffect(() => {
    getReserveData()
    getUserAssetData()
    getAssetPrice()
  },[liveAsset])

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

  const withdraw = async (_amount, _useMax=false) => {
    console.log("withdrawing", _useMax)
    let address = await signer.getAddress()
    let amountToWithdraw = _useMax?ethers.constants.MaxUint256:parseUnits(_amount,assetData.decimals)
    let withdraw = await lendingPoolContract.withdraw(assetData.tokenAddress, amountToWithdraw, address)
    console.log(withdraw)
    return withdraw
  }

  const makeTransaction = async (_type, _useMax=false) => {
    let type = _type
    try {
    setTransacting(true);
    let _amount = amount&&amount.toString()
    let _transaction
    if(type === "deposit") {
      _transaction = await deposit(_amount)
    } if(type==="withdraw") {
      _transaction = await withdraw(_amount,_useMax)
    }
    notification.open({
      message: `${type} complete 👻`,
      description:
      <><Text>{`${type}: ${_useMax?'maximum':amount} ${assetData.symbol}, transaction: `}</Text><Text copyable>{_transaction.hash}</Text></>,
    });
    getTokenBalance()
    getReserveData()
    getUserAssetData()
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

  let convertNative = ['USD','ETH'].includes(displayCurrency)
  let showUsdPrice = (ethPrice && displayCurrency === 'USD')

  const convertValue = (_amountInUnits, _decimals, _toEthMultiplier) => {
    let decimals = _decimals ? _decimals : 18
    let toEthMultiplier = _toEthMultiplier ? _toEthMultiplier : 1
    return (parseFloat(formatUnits(_amountInUnits,decimals)) * toEthMultiplier * (showUsdPrice ? ethPrice : 1))
  }

  const formattedValue = (_amountInUnits, _decimals, _toEthMultiplier) => {
    return convertValue(_amountInUnits, _decimals, _toEthMultiplier).toLocaleString()
  }

  let poolNeedsAllowance = (poolAllowance&&amount) ? parseFloat(formatUnits(poolAllowance, assetData.decimals)) < amount : false

  //let maxBorrow = (userAccountData&&assetPrice) ? parseFloat(formatUnits(userAccountData.availableBorrowsETH)) / parseFloat(formatUnits(assetPrice)) : null
  let requiredCollateralETH = (userAccountData&&assetPrice) ? parseFloat(formatUnits(userAccountData.totalDebtETH)) / parseFloat(formatUnits(userAccountData.ltv, 4)) : 0.0
  let maxWithdrawETH = (userAccountData&&requiredCollateralETH) ? (parseFloat(formatUnits(userAccountData.totalCollateralETH)) - requiredCollateralETH) : 0.0
  let maxWithdraw = (assetPrice&&maxWithdrawETH) ? maxWithdrawETH / parseFloat(formatUnits(assetPrice)) : 0.0

  let userAccountDisplay
  if(userAccountData&&assetData) {
    userAccountDisplay = (
      <Row justify="center">
      <Space direction="vertical">
      <Card>
        {(balance&&assetData)&&<Statistic title={`Wallet`} value={balance&&parseFloat(formatUnits(balance, assetData.decimals)).toLocaleString('en-US', {maximumFractionDigits: 3})}/>}
      </Card>
      <Row justify="center">
        <InputNumber style={{width: '160px'}} min={0} size={'large'} value={amount} onChange={(e) => {
          setAmount(e)
        }}
        />
        <Popover trigger="click" content={
          <Space direction="vertical">
            <Row justify="center">
            <Button loading={approving} onClick={() => {approve(amount.toString())}}>Approve Amount</Button>
            <Button loading={approving} onClick={() => {approve("0")}}>Approve Max</Button>
            </Row>
            <Row justify="center">
            <Button type="primary" loading={transacting} disabled={poolNeedsAllowance||!amount} onClick={() => {makeTransaction("deposit")}}>Deposit</Button>
            </Row>
          </Space>
        }>
        <Button size="large"><ArrowDownOutlined /></Button>
        </Popover>
        <Popover trigger="click" content={
          <Space direction="vertical">
            <Row justify="center">
            <Space>
            <Button type="primary" loading={transacting} disabled={!amount||!userAssetData||parseFloat(formatUnits(userAssetData['currentATokenBalance'], assetData.decimals))===0} onClick={() => {makeTransaction("withdraw")}}>Withdraw Amount</Button>
            <Button type="primary" loading={transacting} disabled={!userAssetData||parseFloat(formatUnits(userAssetData['currentATokenBalance'], assetData.decimals))===0} onClick={() => {makeTransaction("withdraw",true)}}>Withdraw All</Button>
            </Space>
            </Row>
          </Space>
        }>
        <Button size="large"><ArrowUpOutlined /></Button>
        </Popover>
      </Row>
      <Card>
      <Space>
        {(assetData&&userAssetData)&&<Statistic title={`Deposited`} value={(userAssetData&&userAssetData['currentATokenBalance'])?parseFloat(formatUnits(userAssetData['currentATokenBalance'], assetData.decimals)).toLocaleString('en-US', {maximumFractionDigits: 3}):"0"}/>}
        {(assetData&&userAssetData&&assetData.liquidityRate)&&<Statistic title={`Deposit rate`} value={parseFloat(formatUnits(assetData.liquidityRate, 25)).toFixed(2)} suffix={"%"}/>}
      </Space>
      </Card>
      <Drawer visible={settingsVisible} onClose={() => { setSettingsVisible(false) }} width={500}>
      <Row gutter={16} justify="center" align="middle">
      <Col span={8}>
        <Statistic title={"collateral"} value={formattedValue(userAccountData.totalCollateralETH)} suffix={showUsdPrice ? "USD" : "ETH"}/>
      </Col>
      <Col span={8}>
        <Statistic title={"debt"} value={formattedValue(userAccountData.totalDebtETH)} suffix={showUsdPrice ? "USD" : "ETH"}/>
      </Col>
      <Col span={8}>
        <Statistic title={"allowance"} value={formattedValue(userAccountData.availableBorrowsETH)} suffix={showUsdPrice ? "USD" : "ETH"}/>
      </Col>
      </Row>
      <Descriptions column={1} style={{textAlign: 'left'}}>
        <Descriptions.Item label={"currentLiquidationThreshold"}>{new Percent(userAccountData.currentLiquidationThreshold.toString(), "10000").toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label={"ltv"}>{new Percent(userAccountData.ltv.toString(), "10000").toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label={"healthFactor"}>{parseFloat(formatUnits(userAccountData.healthFactor,18)).toFixed(3)}</Descriptions.Item>
        {userConfiguration&&<Descriptions.Item label={`Account configuration`}>{parseInt(userConfiguration.toString(), 10).toString(2)}</Descriptions.Item>}
        <Descriptions.Item label={"activeAssets"}>{Object.keys(userAssetList).join(',')}</Descriptions.Item>
      </Descriptions>
      </Drawer>
      </Space>
      </Row>
  )
} else {
  userAccountDisplay = (<Skeleton active/>)
}

  return (
    <Card title={<Space><img src="https://ipfs.io/ipfs/QmWzL3TSmkMhbqGBEwyeFyWVvLmEo3F44HBMFnmTUiTfp1" width='40' alt='aaveLogo'/><Typography>Lender</Typography></Space>}

      extra={
        <Space>
        <Select showSearch value={liveAsset} style={{width: '120px'}} size={'large'} onChange={(value) => {
          console.log(value)
          setLiveAsset(value)
        }} filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        } optionFilterProp="children">
        {reserveTokens&&reserveTokens.map(token => (
          <Option key={token.symbol} value={token.symbol}>{token.symbol}</Option>
        ))}
        </Select>
        <Button type="text" onClick={() => {setSettingsVisible(true)}}><SettingOutlined /></Button>
        </Space>}
      style={{ textAlign: 'left' , width: '500px' }}
        >
    {userAccountDisplay}
    </Card>
  )

}

export default SimpleLend;
