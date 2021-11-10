import React, { useState, useEffect } from "react";
import { Space, Row, Col, Radio, Card, Select, Statistic, Descriptions, Typography, Button, Divider, Drawer, Table, Skeleton } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import { Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useBlockNumber, usePoller } from "eth-hooks";
import { abi as IAddressProvider } from './abis/LendingPoolAddressProvider.json'
import { abi as IDataProvider } from './abis/ProtocolDataProvider.json'
import { abi as ILendingPool } from './abis/LendingPool.json'
import { abi as IPriceOracle } from './abis/PriceOracle.json'
import AaveAction from "./AaveAction"

export const POOL_ADDRESSES_PROVIDER_ADDRESS = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'
const PROTOCOL_DATA_PROVIDER = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d'
const LENDING_POOL = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9'
const PRICE_ORACLE = '0xa50ba011c48153de246e5192c8f9258a2ba79ca9'

function Lend({ selectedProvider, ethPrice }) {

  const [settingsVisible, setSettingsVisible] = useState(false)

  const [userConfiguration, setUserConfiguration] = useState()
  const [userAccountData, setUserAccountData] = useState()
  const [userAssetData, setUserAssetData] = useState({})
  const [userAssetList, setUserAssetList] = useState({})

  const [reserveTokens, setReserveTokens] = useState()
  const [assetData, setAssetData] = useState({})
  const [assetPrices, setAssetPrices] = useState({})

  const [liveAsset, setLiveAsset] = useState("none")

  const [showActiveAssets, setShowActiveAssets] = useState(false)

  const [displayCurrency, setDisplayCurrency] = useState('native')

  let signer = selectedProvider.getSigner()
  let addressProviderContract = new ethers.Contract(POOL_ADDRESSES_PROVIDER_ADDRESS, IAddressProvider, signer);
  let dataProviderContract = new ethers.Contract(PROTOCOL_DATA_PROVIDER, IDataProvider, signer);
  let lendingPoolContract = new ethers.Contract(LENDING_POOL, ILendingPool, signer);
  let priceOracleContract = new ethers.Contract(PRICE_ORACLE, IPriceOracle, signer);

  const getReserveData = async () => {
    if(reserveTokens) {
      console.log('getting reserve data')
      reserveTokens.forEach(async (asset) => {
        if(["none",asset.symbol].includes(liveAsset)) {
        let _reserveData = await dataProviderContract.getReserveData(asset.tokenAddress)
        let _reserveConfigurationData = await dataProviderContract.getReserveConfigurationData(asset.tokenAddress)
        let _newAssetData = {}
        _newAssetData[asset.symbol] = {...asset, ..._reserveData, ..._reserveConfigurationData}
        setAssetData(assetData => {
          return {...assetData, ..._newAssetData}})
          }
      })
    }
  }


  useEffect(() => {
    getReserveData()
    getPriceData()
  }, [reserveTokens])


  const getPriceData = async () => {
    if(reserveTokens && liveAsset==="none") {
      console.log('getting price data')
      let assetAddresses = reserveTokens.map(a => a.tokenAddress)
      let prices = await priceOracleContract.getAssetsPrices(assetAddresses)
      console.log(prices)
      let _assetPrices = {}
      for (let i = 0; i < prices.length; i++) {
        let _symbol = reserveTokens[i]['symbol']
        _assetPrices[_symbol] = prices[i]
      }
      setAssetPrices(_assetPrices)
    }
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

  const getUserAssetData = async () => {
    if(userAssetList && reserveTokens) {
      let address = await signer.getAddress()

      Object.keys(userAssetList).forEach(async (asset) => {

        var _assetInfo = reserveTokens.filter(function (el) {
          return el.symbol === asset})

        console.log(asset, _assetInfo)

        let _asset = {}
        let _data
        _data = await dataProviderContract.getUserReserveData(_assetInfo[0].tokenAddress,address)
        _asset[asset] = _data

        setUserAssetData(userAssetData => {
          return {...userAssetData, ..._asset}})

      })
      }
    }

  useEffect(() => {
    getUserAssetData()
  },[userAssetList])

  const getLendingPoolContract = async () => {
    let lendingPoolAddress = await addressProviderContract.getLendingPool()//makeCall('getAddress', addressProviderContract, ["0x1"])
    console.log(lendingPoolAddress)
    return new ethers.Contract(lendingPoolAddress, ILendingPool, signer);
  }

  const getUserInfo = async () => {
    console.log('getting user info')
    let address = await signer.getAddress()
    let _accountData = await lendingPoolContract.getUserAccountData(address)
    setUserAccountData(_accountData)
    let _userConfiguration = await lendingPoolContract.getUserConfiguration(address)
    setUserConfiguration(_userConfiguration)
  }

  const getReserveTokens = async () => {
    if(!reserveTokens && dataProviderContract && selectedProvider) {
      console.log('getting Reserve Tokens')
      let _reserveTokens = await dataProviderContract.getAllReservesTokens()//.getReserveData("0x6B175474E89094C44Da98b954EedeAC495271d0F")//makeCall('getAddress', addressProviderContract, ["0x1"])
      console.log(_reserveTokens)
      setReserveTokens(_reserveTokens)
    }
  }

  usePoller(getReserveTokens, 3000)
  usePoller(getReserveData, 15000)
  usePoller(getPriceData, 25000)
  usePoller(getUserInfo, 6000)

  usePoller(()=>{console.log(assetData)} , 6000)

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

  const columns = [
  {
    title: 'Name',
    dataIndex: 'symbol',
    key: 'symbol',
    fixed: 'left',
    sorter: (a, b) => a.symbol.localeCompare(b.symbol),
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: 'Market size' + (convertNative?` (${displayCurrency})`:''),
    key: 'marketSize',
    render: value => formattedValue(value.availableLiquidity.add(value.totalStableDebt).add(value.totalVariableDebt), value.decimals, (assetPrices[value.symbol]&&convertNative)?formatEther(assetPrices[value.symbol]):1),
    sorter: (a, b) => convertValue(a.availableLiquidity.add(a.totalStableDebt).add(a.totalVariableDebt), a.decimals, (assetPrices[a.symbol]&&convertNative)?formatEther(assetPrices[a.symbol]):1) - convertValue(b.availableLiquidity.add(b.totalStableDebt).add(b.totalVariableDebt), b.decimals, (assetPrices[b.symbol]&&convertNative)?formatEther(assetPrices[b.symbol]):1),
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'Liquidity' + (convertNative?` (${displayCurrency})`:''),
    key: 'availableLiquidity',
    render: value => formattedValue(value.availableLiquidity, value.decimals, (assetPrices[value.symbol]&&convertNative)?formatEther(assetPrices[value.symbol]):1),
    sorter: (a, b) => convertValue(a.availableLiquidity, a.decimals, (assetPrices[a.symbol]&&convertNative)?formatEther(assetPrices[a.symbol]):1) - convertValue(b.availableLiquidity, b.decimals, (assetPrices[b.symbol]&&convertNative)?formatEther(assetPrices[b.symbol]):1),
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'Deposit rate',
    key: 'depositRate',
    render: value => parseFloat(formatUnits(value.liquidityRate, 25)).toFixed(2) + "%",
    sorter: (a,b) => parseFloat(formatUnits(a.liquidityRate, 25)) - parseFloat(formatUnits(b.liquidityRate, 25)),
    sortDirections:['descend', 'ascend']
  },
  {
    title: 'Variable rate',
    key: 'variableRate',
    render: value => parseFloat(formatUnits(value.variableBorrowRate, 25)).toFixed(2) + "%",
    sorter: (a,b) => parseFloat(formatUnits(a.variableBorrowRate, 25)) - parseFloat(formatUnits(b.variableBorrowRate, 25)),
    sortDirections:['descend', 'ascend']
  },
  {
    title: 'Stable rate',
    key: 'stableRate',
    render: value => parseFloat(formatUnits(value.stableBorrowRate, 25)).toFixed(2) + "%",
    sorter: (a,b) => parseFloat(formatUnits(a.stableBorrowRate, 25)) - parseFloat(formatUnits(b.stableBorrowRate, 25)),
    sortDirections:['descend', 'ascend']
  },
  {
    title: 'Deposited' + (convertNative?` (${displayCurrency})`:''),
    key: 'deposited',
    render: value => (userAssetData[value.symbol] && userAssetData[value.symbol]['currentATokenBalance'])&&formattedValue(userAssetData[value.symbol]['currentATokenBalance'], value.decimals, (assetPrices[value.symbol]&&convertNative)?formatEther(assetPrices[value.symbol]):1),
  },
  {
    title: 'Stable Debt' + (convertNative?` (${displayCurrency})`:''),
    key: 'stableDebt',
    render: value => (userAssetData[value.symbol] && userAssetData[value.symbol]['currentStableDebt'])&&formattedValue(userAssetData[value.symbol]['currentStableDebt'], value.decimals, (assetPrices[value.symbol]&&convertNative)?formatEther(assetPrices[value.symbol]):1),
  },
  {
    title: 'Variable Debt' + (convertNative?` (${displayCurrency})`:''),
    key: 'variableDebt',
    render: value => (userAssetData[value.symbol])&&formattedValue(userAssetData[value.symbol]['currentVariableDebt'], value.decimals, (assetPrices[value.symbol]&&convertNative)?formatEther(assetPrices[value.symbol]):1),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: value => {
      return (<>
      {value.isActive&&<AaveAction setLiveAsset={setLiveAsset} type="deposit" assetData={value} assetPrice={assetPrices[value.symbol]} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>}
      {(Object.keys(userAssetList).filter(asset => userAssetList[asset].includes('collateral')).includes(value.symbol)&&(
        <AaveAction setLiveAsset={setLiveAsset} type="withdraw" assetData={value} assetPrice={assetPrices[value.symbol]} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>
      ))}
      {(value.borrowingEnabled&&userAccountData&&userAccountData.availableBorrowsETH>0)&&<AaveAction setLiveAsset={setLiveAsset} type="borrow" assetData={value} assetPrice={assetPrices[value.symbol]} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>}
      {(Object.keys(userAssetList).filter(asset => userAssetList[asset].includes('debt')).includes(value.symbol)&&(
        <AaveAction setLiveAsset={setLiveAsset} type="repay" assetData={value} assetPrice={assetPrices[value.symbol]} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>
      ))}
      </>)
    }
  },
];

  let userAccountDisplay
  if(userAccountData) {
    userAccountDisplay = (
      <>
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
      <Drawer visible={settingsVisible} onClose={() => { setSettingsVisible(false) }} width={500}>
      <Descriptions title="Account Details" column={1} style={{textAlign: 'left'}}>
        <Descriptions.Item label={"currentLiquidationThreshold"}>{new Percent(userAccountData.currentLiquidationThreshold.toString(), "10000").toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label={"ltv"}>{new Percent(userAccountData.ltv.toString(), "10000").toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label={"healthFactor"}>{parseFloat(formatUnits(userAccountData.healthFactor,18)).toFixed(3)}</Descriptions.Item>
        {userConfiguration&&<Descriptions.Item label={`Account configuration`}>{parseInt(userConfiguration.toString(), 10).toString(2)}</Descriptions.Item>}
        <Descriptions.Item label={"activeAssets"}>{Object.keys(userAssetList).join(',')}</Descriptions.Item>
      </Descriptions>
      </Drawer>
      </>
  )
} else {
  userAccountDisplay = (<Skeleton active/>)
}

  let missingPrices = reserveTokens && Object.keys(assetPrices).length < reserveTokens.length

  return (
    <Card title={<Space><img src="https://ipfs.io/ipfs/QmWzL3TSmkMhbqGBEwyeFyWVvLmEo3F44HBMFnmTUiTfp1" width='40' alt='aaveLogo'/><Typography>Aave Lender</Typography></Space>}
      extra={
        <Space>
        <Radio.Group
          options={['native','ETH','USD']}
          onChange={(e)=>{setDisplayCurrency(e.target.value)}}
          value={displayCurrency}
          optionType="button"
          buttonStyle="solid"
          disabled={missingPrices}
        />
        <Radio.Group
          options={[
            { label: 'All', value: false },
            { label: 'Active', value: true }]}
          onChange={(e)=>{
            setShowActiveAssets(e.target.value)
          }}
          value={showActiveAssets}
          optionType="button"
          buttonStyle="solid"
        />
        <Button type="text" onClick={() => {setSettingsVisible(true)}}><SettingOutlined /></Button>
        </Space>}
      style={{ textAlign: 'left' }}
        >
    {userAccountDisplay}
    <Divider/>
    <Table dataSource={Object.values(assetData).filter(asset => (showActiveAssets&&userAssetList)?Object.keys(userAssetList).includes(asset.symbol):true)} columns={columns} pagination={false} scroll={{ x: 1300 }}/>
    </Card>
  )

}

export default Lend;
