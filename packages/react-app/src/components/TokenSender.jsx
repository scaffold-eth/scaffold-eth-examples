import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import 'antd/dist/antd.css'
import { SettingOutlined, SendOutlined, InboxOutlined, FireOutlined } from "@ant-design/icons";
import { getDefaultProvider, InfuraProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Row, Col, List, Tabs, Menu, Typography, Select, Form, notification, Card, PageHeader, Button, InputNumber, Spin } from "antd";
import Web3Modal from "web3modal";
import { Address, AddressInput, EtherInput } from ".";
import { Transactor } from "../helpers";
import { parseEther, formatEther, parseUnits } from "@ethersproject/units";
import { ethers } from "ethers";
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DEBUG = true

function useSearchParams() {
return new URLSearchParams(useLocation().search);
}

function TokenSender(props) {

  let location = useLocation();
  let searchParams = useSearchParams()
  let currentToken = searchParams.get("token")
  let [token, setToken] = useState(currentToken?currentToken:"")

  const handleTokenChange = newToken => {
  setToken(newToken);
  searchParams.set("token", newToken)
  if(newToken == "") {
    window.history.replaceState({}, '', `${location.pathname}`);
  } else {
    window.history.replaceState({}, '', `${location.pathname}?${searchParams}`);
  }
  console.log(searchParams.getAll('token'))
};

  useEffect(() => {
    if(props.network && props.network.erc20s) {
    let erc20Names = props.network.erc20s.map(a => a.name);
    if(token && !erc20Names.includes(token)) {
      console.log(erc20Names)
      window.history.replaceState({}, '', `${location.pathname}`);
      form.resetFields();
    }
  }
  },[props.network])
  //let { token } = useParams();

  const [sending, setSending] = useState(false)
  const [form] = Form.useForm();

  let tokenSender

  if(props.network && props.network.erc20s) {
    tokenSender = (
            <Form
                    form={form}
                    initialValues={{ value: "0", token: token }}
                    onFinish={async (values) => {
                      console.log(values)
                      setSending(true)
                      const tx = Transactor(props.selectedProvider);

                      let value;
                      try {
                        value = parseUnits("" + values.amount, props.erc20s[values.token].decimals);
                      } catch (e) {
                        // failed to parseEther, try something else
                        value = parseUnits("" + parseFloat(values.amount, props.erc20s[values.token].decimals).toFixed(8));
                      }

                      try {
                      let erc20tx = await props.erc20s[values.token].contract.transfer(
                        values.toAddress,
                        value
                      );
                      notification.open({
                        message: '👋 Sending successful!',
                        description:
                        `👀 Sent ${value} to ${values['toAddress']}`,
                      });
                      form.resetFields();
                      setSending(false)
                    } catch(e){
                      console.log(e)
                      notification.open({
                        message: 'Sending unsuccessful!',
                        description:
                        `${e.message}`,
                      });
                      setSending(false)
                    }
                    }}
                    onFinishFailed={errorInfo => {
                      console.log('Failed:', errorInfo);
                      }}
                  >
                  <Form.Item name="token">
                  <Select style={{ width: 120 }} size="large" onChange={handleTokenChange}>
                  {Object.values(props.network.erc20s).map(n => (
                    <Option key={n.name}>{n.name}</Option>
                  ))}
                  </Select>
                  </Form.Item>
                    <Form.Item name="toAddress">
                    <AddressInput
                      autoFocus
                      ensProvider={props.mainnetProvider}
                      placeholder="to address"
                    />
                    </Form.Item>
                    <Form.Item name="amount">
                    <InputNumber min={0} max={(props.erc20s&&props.erc20s[token])?(props.erc20s[token]['balance'] / Math.pow(10, props.erc20s[token]['decimals'])):null}
                    />
                    </Form.Item>
                    <Form.Item >
                    <Button
                      htmlType="submit"
                      type="primary"
                      size="large"
                      loading={sending}
                    >
                      <SendOutlined /> Send
                    </Button>
                    </Form.Item>
                  </Form>
                )
      } else {
        tokenSender = <Spin/>
      }

      return (tokenSender)

      }

export default TokenSender;
