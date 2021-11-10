import React, { useState, useEffect } from "react";
import { Space, Row, Col, Radio, Card, Select, Statistic, InputNumber, notification, Descriptions, Typography, Button, Divider, Drawer, Table, Skeleton, Popover } from "antd";
import { SettingOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { ChainId, Token, WETH, Fetcher, Trade, TokenAmount, Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits, formatEther, parseEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "../hooks";
import { useBlockNumber, usePoller } from "eth-hooks";
import { abi as IAddressProvider } from './abis/LendingPoolAddressProvider.json'
import { abi as IDataProvider } from './abis/ProtocolDataProvider.json'
import { abi as ILendingPool } from './abis/LendingPool.json'
import { abi as IPriceOracle } from './abis/PriceOracle.json'
import { abi as IErc20 } from './abis/erc20.json'

const { Option } = Select;
const { Text } = Typography;

function AavEth({ selectedProvider }) {

  const writeContracts = useContractLoader(selectedProvider)
  let signer = selectedProvider.getSigner()
  let timeLimit = 6000

  console.log(writeContracts)

  const testIt = async () => {
    let address = await signer.getAddress()
    let deadline = Math.floor(Date.now() / 1000) + timeLimit
    let metadata = {
      value: parseEther("0.5")
    }
    console.log("1", ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","0x6B175474E89094C44Da98b954EedeAC495271d0F"], address, deadline, metadata)
    writeContracts.AavEth['depositEthForAToken']("1", ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","0x6B175474E89094C44Da98b954EedeAC495271d0F"], address, deadline, metadata)
  }

  return (
    <Card>
      <Button onClick={testIt}>Do it</Button>
    </Card>
  )

}

export default AavEth;
