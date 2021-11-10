import React, { useState } from "react";
import { Descriptions, Drawer, Skeleton, Button } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import { Percent } from '@uniswap/sdk'
import { parseUnits, formatUnits, formatEther } from "@ethersproject/units";
import { ethers } from "ethers";

function AccountSettings({ userAccountData, userConfiguration, userAssetList }) {

  const [settingsVisible, setSettingsVisible] = useState(false)

  let userSettingsDisplay
  if(userAccountData && userAssetList) {
    userSettingsDisplay = (
      <>
      <Button type="text" onClick={() => {setSettingsVisible(true)}}><SettingOutlined /></Button>
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
}

  return (<>
    {userSettingsDisplay}
  </>)
}

export default AccountSettings;
