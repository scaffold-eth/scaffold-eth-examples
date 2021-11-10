import React, { useState } from "react";
import { Space, Radio, Card, Typography, Divider, Table, Skeleton } from "antd";
import { formatUnits, formatEther } from "@ethersproject/units";
import { TxBuilderV2, Network, Market } from '@aave/protocol-js'
import { ethers } from "ethers";
import AaveAction from "./AaveAction"
import { useAaveData } from "./AaveData"
import { convertValue, formattedValue } from "./AaveHelpers"
import AccountSummary from "./AccountSummary"
import AccountSettings from "./AccountSettings"

var Web3 = require('web3');

function Lend({ selectedProvider, ethPrice }) {

  const httpProvider = new Web3.providers.HttpProvider(
      process.env.REACT_APP_PROVIDER ||
        "http://localhost:8545"
    );
  let customProvider = new ethers.providers.Web3Provider(httpProvider)

  let txBuilder
  let lendingPool

  if(customProvider) {
    let aaveNetwork = process.env.REACT_APP_NETWORK==='kovan' ? Network.kovan : Network.main
    txBuilder = new TxBuilderV2(aaveNetwork, customProvider);
    lendingPool = txBuilder.getLendingPool(Market.Proto); // get all lending pool methods
  }

  const [liveAsset, setLiveAsset] = useState()

  const { assetData, userAccountData, userConfiguration,  userAssetList, userAssetData, contracts } = useAaveData({ selectedProvider, liveAsset })
  const { lendingPoolContract } = contracts

  const [showActiveAssets, setShowActiveAssets] = useState(false)

  const [displayCurrency, setDisplayCurrency] = useState('native')

  let signer = selectedProvider.getSigner()

  let convertNative = ['USD','ETH'].includes(displayCurrency)
  let showUsdPrice = (ethPrice && displayCurrency === 'USD')

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
    render: value => formattedValue(value.totalLiquidity, value.decimals, convertNative?formatEther(value.price.priceInEth):1, showUsdPrice, ethPrice),
    sorter: (a, b) => convertValue(a.totalLiquidity, a.decimals, convertNative?formatEther(a.price.priceInEth):1) - convertValue(b.totalLiquidity, b.decimals, convertNative?formatEther(b.price.priceInEth):1),
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: 'Liquidity' + (convertNative?` (${displayCurrency})`:''),
    key: 'availableLiquidity',
    render: value => formattedValue(value.availableLiquidity, value.decimals, convertNative?formatEther(value.price.priceInEth):1, showUsdPrice, ethPrice),
    sorter: (a, b) => convertValue(a.availableLiquidity, a.decimals, convertNative?formatEther(a.price.priceInEth):1) - convertValue(b.availableLiquidity, b.decimals, convertNative?formatEther(b.price.priceInEth):1),
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
    render: value => (userAssetData[value.symbol] && userAssetData[value.symbol]['currentATokenBalance'])&&formattedValue(userAssetData[value.symbol]['currentATokenBalance'], value.decimals, convertNative?formatEther(value.price.priceInEth):1, showUsdPrice, ethPrice),
  },
  {
    title: 'Stable Debt' + (convertNative?` (${displayCurrency})`:''),
    key: 'stableDebt',
    render: value => (userAssetData[value.symbol] && userAssetData[value.symbol]['currentStableDebt'])&&formattedValue(userAssetData[value.symbol]['currentStableDebt'], value.decimals, convertNative?formatEther(value.price.priceInEth):1, showUsdPrice, ethPrice),
  },
  {
    title: 'Variable Debt' + (convertNative?` (${displayCurrency})`:''),
    key: 'variableDebt',
    render: value => (userAssetData[value.symbol])&&formattedValue(userAssetData[value.symbol]['currentVariableDebt'], value.decimals, convertNative?formatEther(value.price.priceInEth):1, showUsdPrice, ethPrice),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: value => {
      return (<>
      {value.isActive&&<AaveAction selectedProvider={selectedProvider} lendingPool={lendingPool} setLiveAsset={setLiveAsset} type="deposit" assetData={value} assetPrice={value.price.priceInEth} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>}
      {(Object.keys(userAssetList).filter(asset => userAssetList[asset].includes('collateral')).includes(value.symbol)&&(
        <AaveAction lendingPool={lendingPool} selectedProvider={selectedProvider} setLiveAsset={setLiveAsset} type="withdraw" assetData={value} assetPrice={value.price.priceInEth} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>
      ))}
      {(value.borrowingEnabled&&userAccountData&&userAccountData.availableBorrowsETH>0)&&<AaveAction lendingPool={lendingPool} selectedProvider={selectedProvider} setLiveAsset={setLiveAsset} type="borrow" assetData={value} assetPrice={value.price.priceInEth} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>}
      {(Object.keys(userAssetList).filter(asset => userAssetList[asset].includes('debt')).includes(value.symbol)&&(
        <AaveAction lendingPool={lendingPool} selectedProvider={selectedProvider} setLiveAsset={setLiveAsset} type="repay" assetData={value} assetPrice={value.price.priceInEth} signer={signer} lendingPoolContract={lendingPoolContract} userAccountData={userAccountData} userAssetData={userAssetData[value.symbol]}/>
      ))}
      </>)
    }
  },
];

  let userAccountDisplay
  if(userAccountData) {
    userAccountDisplay = (
      <AccountSummary userAccountData={userAccountData} showUsdPrice={showUsdPrice} ethPrice={ethPrice}/>
      )
    } else {
      userAccountDisplay = (<Skeleton active/>)
    }


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
        <AccountSettings userAccountData={userAccountData} userConfiguration={userConfiguration} userAssetList={userAssetList} />
        </Space>}
      style={{ textAlign: 'left' }}
        >
    {userAccountDisplay}
    <Divider/>
        <Table dataSource={assetData.filter(asset => (showActiveAssets&&userAssetList)?Object.keys(userAssetList).includes(asset.symbol):true)} columns={columns} pagination={false} scroll={{ x: 'max-content' }}/>
    </Card>
  )

}

export default Lend;
