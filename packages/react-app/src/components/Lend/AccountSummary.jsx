import React from "react";
import { Row, Col, Statistic, Skeleton } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import { Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";
import { convertValue, formattedValue } from "./AaveHelpers"

function AccountSummary({ userAccountData, showUsdPrice, ethPrice }) {

  let userAccountDisplay
  if(userAccountData) {
    userAccountDisplay = (
      <>
      <Row gutter={16} justify="center" align="middle">
      <Col span={8}>
        <Statistic title={"collateral"} value={formattedValue(userAccountData.totalCollateralETH, 18, 1, showUsdPrice, ethPrice)} suffix={showUsdPrice ? "USD" : "ETH"}/>
      </Col>
      <Col span={8}>
        <Statistic title={"debt"} value={formattedValue(userAccountData.totalDebtETH, 18, 1, showUsdPrice, ethPrice)} suffix={showUsdPrice ? "USD" : "ETH"}/>
      </Col>
      <Col span={8}>
        <Statistic title={"allowance"} value={formattedValue(userAccountData.availableBorrowsETH, 18, 1, showUsdPrice, ethPrice)} suffix={showUsdPrice ? "USD" : "ETH"}/>
      </Col>
      </Row>
      </>
  )
} else {
  userAccountDisplay = (<Skeleton active/>)
}

  return (<>
    {userAccountDisplay}
    </>
  )
}

export default AccountSummary;
