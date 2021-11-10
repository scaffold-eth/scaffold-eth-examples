import React, { useState } from "react";
import { Card, Space, Row, Col, notification, Statistic, Select, Typography, Button, Divider, Steps, Skeleton, Table, Radio } from "antd";
import { formatUnits } from "@ethersproject/units";
import { ethers } from "ethers";
import { abi as IErc20 } from '../components/Lend/abis/erc20.json'
import { Address } from "../components";
import { abi as IStableDebtToken } from '../components/Lend/abis/StableDebtToken.json'
import { useContractLoader, useEventListener } from "../hooks";
import { usePoller } from "eth-hooks";
import { useAaveData } from "../components/Lend/AaveData"
import AccountSummary from "../components/Lend/AccountSummary"
import AccountSettings from "../components/Lend/AccountSettings"

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function Ape({ selectedProvider }) {

  // use our custom Aave data hook to get protocol information
  const { reserveTokens, assetData, userAccountData, userConfiguration,  userAssetList, userAssetData } = useAaveData({ selectedProvider })

  const [apeAsset, setApeAsset] = useState('WETH')
  const [borrowAsset, setBorrowAsset] = useState('DAI')
  const [debtType, setDebtType] = useState('v')

  let debtLookup = {
    's': "1",
    'v': "2"
  }

  const [creditDelegated, setCreditDelegated] = useState()
  const [aTokenAllowance, setATokenAllowance] = useState()

  const [delegating, setDelegating] = useState(false)
  const [allowing, setAllowing] = useState(false)
  const [aping, setAping] = useState(false)
  const [unwinding, setUnwinding] = useState(false)

  const writeContracts = useContractLoader(selectedProvider)
  const [apeEvents, setApeEvents] = useState([]);

  const findAsset = (_asset) => {
    return assetData.find(obj => { return obj.underlyingAsset.toLowerCase() === _asset.toLowerCase()})
  }

  const eventRowKey = (value) => {
    return (value.ape + value.action + value.blockNumber + value.apeAsset + value.apeAmount + value.borrowAsset + value.borrowAmount)
  }

  const eventColumns = [
  {
    title: 'Ape',
    key: 'ape',
    render: value => value&&<Address value={value.args.ape}  fontSize={16}/>,
  },
  {
    title: 'Block',
    dataIndex: 'blockNumber',
  },
  {
    title: 'Action',
    key: 'action',
    render: value => value.args.action
  },
  {
    title: 'Long',
    key: 'apeAsset',
    render: value => `${parseFloat(formatUnits(value.args.apeAmount, findAsset(value.args.apeAsset).decimals)).toFixed(3)} ${findAsset(value.args.apeAsset).symbol}`,
  },
  {
    title: 'Short',
    key: 'borrowAsset',
    render: value => `${parseFloat(formatUnits(value.args.borrowAmount, findAsset(value.args.borrowAsset).decimals)).toFixed(3)} ${findAsset(value.args.borrowAsset).symbol}`,
  },
  {
    title: 'Price',
    key: 'price',
    render: value =>  (parseFloat(formatUnits(value.args.borrowAmount, findAsset(value.args.borrowAsset).decimals)) / parseFloat(formatUnits(value.args.apeAmount, findAsset(value.args.apeAsset).decimals))).toFixed(4),
  },
];

  let signer = selectedProvider.getSigner()

  let apeAssetData = assetData.find(obj => {
    return obj.symbol === apeAsset
  })

  let borrowAssetData = assetData.find(obj => {
    return obj.symbol === borrowAsset
  })

  const getCreditAllowance = async () => {
    if(reserveTokens&&borrowAssetData&&writeContracts&&writeContracts['AaveApe']) {
    //let borrowTokensAddresses = await dataProviderContract.getReserveTokensAddresses(borrowAssetData[`${debtType}Token`].id);
    let debtContract = new ethers.Contract(borrowAssetData[`${debtType}Token`].id, IStableDebtToken, signer);

    let address = await signer.getAddress()
    let aaveApeAddress = writeContracts['AaveApe'].address

    let _creditAllowance = await debtContract.borrowAllowance(address, aaveApeAddress)
    setCreditDelegated(_creditAllowance)

  }
  }

  usePoller(getCreditAllowance, 6000)

  const setFullCreditAllowance = async () => {
    if(reserveTokens&&assetData&&borrowAssetData&&writeContracts&&writeContracts['AaveApe']) {
    try {
      setDelegating(true)
      //let borrowTokensAddresses = await dataProviderContract.getReserveTokensAddresses(borrowAssetData.tokenAddress);
      let debtContract = new ethers.Contract(borrowAssetData[`${debtType}Token`].id, IStableDebtToken, signer);

      let aaveApeAddress = writeContracts['AaveApe'].address

      let _approveDelegation = await debtContract.approveDelegation(aaveApeAddress, ethers.constants.MaxUint256)
      console.log(_approveDelegation)
      notification.open({
        message: `You delegated credit! 🦍`,
        description:
        <><Text>{`The ape can now borrow ${borrowAssetData.symbol} on your behalf`}</Text></>,
      });
      setDelegating(false)
    }
    catch(e) {
      console.log(e)
      setDelegating(false)
    }
  }
  }


  const getATokenAllowance = async () => {
    if(reserveTokens&&assetData&&apeAssetData&&writeContracts&&writeContracts['AaveApe']) {

    //let apeTokensAddresses = await dataProviderContract.getReserveTokensAddresses(apeAssetData.tokenAddress);
    let aTokenContract = new ethers.Contract(apeAssetData.aToken.id, IErc20, signer);

    let address = await signer.getAddress()
    let aaveApeAddress = writeContracts['AaveApe'].address

    let _allowance = await aTokenContract.allowance(address, aaveApeAddress)
    setATokenAllowance(_allowance)
  }
  }

  usePoller(getATokenAllowance, 6000)

  const setFullATokenAllowance = async () => {
    if(reserveTokens&&assetData&&apeAssetData&&writeContracts&&writeContracts['AaveApe']) {
      try {
        setAllowing(true)
        //let apeTokensAddresses = await dataProviderContract.getReserveTokensAddresses(apeAssetData.tokenAddress);
        let aTokenContract = new ethers.Contract(apeAssetData.aToken.id, IErc20, signer);

        let aaveApeAddress = writeContracts['AaveApe'].address

        let _approve = await aTokenContract.approve(aaveApeAddress, ethers.constants.MaxUint256)
        console.log(_approve)
        notification.open({
          message: `You gave approval on your aToken! 🦍`,
          description:
          <><Text>{`The ape can now move ${apeAssetData.symbol} on your behalf`}</Text></>,
        });
        setAllowing(false)
      }
      catch (e) {
        console.log(e)
        setAllowing(false)
      }
  }
  }

  usePoller(async () => {
    if(writeContracts && writeContracts['AaveApe']) {
      let _apeEvents = await writeContracts['AaveApe'].queryFilter('Ape')
      setApeEvents(_apeEvents)
  }
  }, 5000)

  let hasDelegatedCredit = creditDelegated&&creditDelegated.gt(ethers.constants.MaxUint256.div(ethers.BigNumber.from("10"))) ? true : false
  let hasATokenAllowance = aTokenAllowance&&aTokenAllowance.gt(ethers.constants.MaxUint256.div(ethers.BigNumber.from("10"))) ? true : false

  return (
    <>
    <Row justify="center" align="middle" gutter={16}>
    <Card title={<Space>
                    <Text>{`🦍 Aave Ape`}</Text>{
                    (writeContracts&&writeContracts['AaveApe']) ?
                    <Address
                        value={writeContracts['AaveApe'].address}
                        fontSize={16}
                    /> :
                    <Text type="warning">Has the ape been deployed?</Text>}
                  </Space>}
          style={{ width: 600, textAlign: 'left'  }}
    extra={
      <AccountSettings userAccountData={userAccountData} userConfiguration={userConfiguration} userAssetList={userAssetList} />}
    >
    {(writeContracts&&writeContracts['AaveApe']) ?
      <>
      {userAccountData?<AccountSummary userAccountData={userAccountData}/>:<Skeleton active/>}
      <Divider/>
      {userAccountData&&formatUnits(userAccountData.availableBorrowsETH,18)==="0.0"?<Text>You need a borrow allowance to go Ape, have you deposited any bananas? 🍌</Text> :
      <>
            <Title level={4}>Select your ape asset 🙈</Title>
            <Text>This is the asset you are going Long</Text>
          <Row justify="center" align="middle" gutter={16}>
            <Col>
              <Select showSearch value={apeAsset} style={{width: '120px'}} size={'large'} onChange={(value) => {
                console.log(value)
                setApeAsset(value)
              }} filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              } optionFilterProp="children">
              {assetData&&assetData.filter(function(asset) { return asset.usageAsCollateralEnabled }).map(token => (
                <Option key={token.symbol} value={token.symbol}>{token.symbol}</Option>
              ))}
              </Select>
            </Col>
            <Col>
              {userAssetData&&userAssetData[apeAsset]&&<Statistic title={"Deposited"} value={parseFloat(ethers.utils.formatUnits(userAssetData[apeAsset]['currentATokenBalance'], userAssetData[apeAsset].decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5})} suffix={apeAsset}/>}
            </Col>
          </Row>
      <Divider/>
        <Title level={4}>Select your borrow asset 📉</Title>
        <Text>This is the asset you are going Short</Text>
        <Row justify="center" align="middle" gutter={16}>
        <Col>
          <Select showSearch value={borrowAsset} style={{width: '120px'}} size={'large'} onChange={(value) => {
            console.log(value)
            setBorrowAsset(value)
          }} filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          } optionFilterProp="children">
          {assetData&&assetData.filter(function(asset) {return asset.borrowingEnabled;}).map(token => (
            <Option key={token.symbol} value={token.symbol}>{token.symbol}</Option>
          ))}
          </Select>
        </Col>
        <Col>
        {(assetData&&userAssetData&&userAssetData[borrowAsset]&&borrowAssetData)&&<Statistic title={`Variable debt`} value={(userAssetData&&userAssetData[borrowAsset]['currentVariableDebt'])?parseFloat(formatUnits(userAssetData[borrowAsset]['currentVariableDebt'], borrowAssetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={borrowAssetData.symbol}/>}
        {(assetData&&userAssetData&&userAssetData[borrowAsset]&&borrowAssetData)&&<Statistic title={`Stable debt`} value={(userAssetData&&userAssetData[borrowAsset]['currentStableDebt'])?parseFloat(formatUnits(userAssetData[borrowAsset]['currentStableDebt'], borrowAssetData.decimals)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5}):"0"} suffix={borrowAssetData.symbol}/>}
        </Col>
        </Row>

        {(borrowAssetData&&apeAssetData)&&<><Divider/><Statistic title={`Current ${apeAsset} price`} value={parseFloat(ethers.utils.formatUnits(apeAssetData['price']['priceInEth'],18) / ethers.utils.formatUnits(borrowAssetData['price']['priceInEth'], 18)).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 5})} suffix={borrowAsset}/><Divider/></>}
        <Title level={4}>How to go ape 🦍</Title>
        <Steps>
          <Step status={hasDelegatedCredit?'finish':'wait'} title="Delegate credit" description={creditDelegated&&(hasDelegatedCredit?<p>You have delegated credit to the Aave Ape 🏦</p>:<Button loading={delegating} onClick={setFullCreditAllowance}>{"Delegate!"}</Button>)} />
          <Step status={hasDelegatedCredit?'finish':'wait'} title="Go ape!"
            description={creditDelegated&&(hasDelegatedCredit&&<>
              <Paragraph>{`Borrow ${borrowAsset}, swap to ${apeAsset} and deposit to Aave`}</Paragraph>
              <Button loading={aping} type="primary" onClick={async () => {
              try {
              setAping(true)
              console.log(apeAssetData.underlyingAsset, borrowAssetData.underlyingAsset, debtLookup[debtType])
              let _ape = await writeContracts.AaveApe['ape'](apeAssetData.underlyingAsset, borrowAssetData.underlyingAsset, debtLookup[debtType])
              console.log(_ape)
              notification.open({
                message: `You went ape! 🦍`,
                description:
                <><Text>{`Will you be king of the jungle?`}</Text></>,
              });
              setAping(false)
            } catch(e) {
              notification.open({
                message: `You didn't go ape :(`,
                description:
                <><Text>{`Some kind of monkey business: ${e.message}`}</Text></>,
              });
              console.log(e)
              setAping(false)
            }
          }}>{"Go Ape"}</Button></>)} />
        </Steps>
        <Divider/>
        <Title level={4}>Unwinding your ape 🍌</Title>
        <Steps>
          <Step status={hasATokenAllowance?'finish':'wait'} title={`Add a${apeAsset} allowance`} description={aTokenAllowance&&(hasATokenAllowance?<p>You have given an allowance to the Aave Ape 🏦</p>:<Button loading={allowing} onClick={setFullATokenAllowance}>{"Allow on the aToken!"}</Button>)} />
          <Step status={hasATokenAllowance?'finish':'wait'} title="Unwind your ape" description={aTokenAllowance&&(hasATokenAllowance&&<>
            <Paragraph>{`Flashloan ${borrowAsset} to repay your debt, then withdraw ${apeAsset} and swap it to settle up`}</Paragraph>
            <Button loading={unwinding} type="primary" onClick={async () => {
              try {
              setUnwinding(true)
              let _ape = await writeContracts.AaveApe['unwindApe'](apeAssetData.underlyingAsset, borrowAssetData.underlyingAsset, debtLookup[debtType])
              console.log(_ape)
              notification.open({
                message: `You unwound your ape 🦍`,
                description:
                <><Text>{`I hope you still have some bananas!`}</Text></>,
              });
              setUnwinding(false)
            } catch(e) {
              notification.open({
                message: `You didn't unwind your ape :(`,
                description:
                <><Text>{`Some kind of monkey business: ${e.message}`}</Text></>,
              });
              console.log(e)
              setUnwinding(false)
            }
          }}>{"Unwind Ape"}</Button>
            </>
          )} />
        </Steps></>}
        </>:<Skeleton avatar paragraph={{ rows: 4 }} />}
    </Card>
    </Row>
    <Row justify="center" align="middle" gutter={16}>
    <Card title={'Aave Ape Events'} style={{ width: 800 }}>
    <Table rowKey='key' dataSource={apeEvents} columns={eventColumns} pagination={false} />
    </Card>
    </Row>
    </>
  )

}

export default Ape;
