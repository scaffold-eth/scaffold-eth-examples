import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SendOutlined } from "@ant-design/icons";
import { Row, Typography, Spin } from "antd";
import { parseEther, formatEther, formatUnits } from "@ethersproject/units";
import { useTokenBalance } from "eth-hooks";
const { Text } = Typography;

function TokenBalance({name, contract, address, decimals, withSendButton, places}) {

  let balance = useTokenBalance(contract, address, 3000)
  let formattedBalance = balance?formatUnits(balance, decimals):null
  let placesBalance = formattedBalance?Number.parseFloat(formattedBalance).toFixed(places?places:3):"loading..."

  let sendButton = (balance>0&&withSendButton)?<Link to={"/send-token?token="+name}><button type="button" class="nes-btn is-primary">></button></Link>:null

  return (
    <>
    <Text
      class="nes-text"
      style={{
        verticalAlign: "middle",
        fontSize: 32,
        padding: 8,
      }}
    >
      {name}
    </Text>
    <Text style={{
      verticalAlign: "middle",
      fontSize: 32,
      padding: 8,
    }}>
      {placesBalance}
    </Text>
    {sendButton}
    </>
  )
}

export default TokenBalance;
