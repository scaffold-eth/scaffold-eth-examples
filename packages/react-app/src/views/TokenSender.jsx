import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SendOutlined } from "@ant-design/icons";
import { Typography, Select, Form, notification, Button, InputNumber, Spin } from "antd";
import { AddressInput } from "../components";
import { Transactor } from "../helpers";
import { parseEther, formatEther, parseUnits, formatUnits } from "@ethersproject/units";
import { useTokenBalance } from "eth-hooks";
const { Text } = Typography;
const { Option } = Select;

function useSearchParams() {
return new URLSearchParams(useLocation().search);
}

function TokenSender({erc20s, address, network, networks, selectedProvider, mainnetProvider}) {

  let location = useLocation();
  let searchParams = useSearchParams()
  let currentToken = searchParams.get("token")
  let [token, setToken] = useState(currentToken?currentToken:"")

  let balance = useTokenBalance((erc20s&&erc20s[token])?erc20s[token]["contract"]:null, address, 3000)
  let formattedBalance = formatUnits(balance, (erc20s&&erc20s[token])?erc20s[token]['decimals']:null)

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
    if(network && networks[network] && networks[network].erc20s) {
    let erc20Names = networks[network].erc20s.map(a => a.name);
    if(token && !erc20Names.includes(token)) {
      console.log(erc20Names)
      window.history.replaceState({}, '', `${location.pathname}`);
      setToken(networks[network].erc20s[0].name)
      form.setFieldsValue({token: networks[network].erc20s[0].name});
    }
  }
  },[network])
  //let { token } = useParams();

  const [sending, setSending] = useState(false)
  const [form] = Form.useForm();

  let tokenSender

  if(network && erc20s && networks[network].erc20s) {
    tokenSender = (
            <Form
                    form={form}
                    initialValues={{ value: "0", token: token }}
                    onFinish={async (values) => {
                      console.log(values)
                      if(values.amount && values.toAddress) {
                      setSending(true)
                      const tx = Transactor(selectedProvider);

                      let value;
                      try {
                        value = parseUnits("" + values.amount, erc20s[values.token].decimals);
                      } catch (e) {
                        // failed to parseEther, try something else
                        value = parseUnits("" + parseFloat(values.amount, erc20s[values.token].decimals).toFixed(8));
                      }

                      try {
                      let erc20tx = await erc20s[values.token].contract.transfer(
                        values.toAddress,
                        value
                      );
                      notification.open({
                        message: '👋 Sending successful!',
                        description:
                        `👀 Sent ${values.amount} ${token} to ${values['toAddress']}`,
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
                  } else {
                    notification.open({
                      message: 'Missing information!',
                      description:
                      `Please enter an amount and a destination`,
                    });
                  }
                    }}
                    onFinishFailed={errorInfo => {
                      console.log('Failed:', errorInfo);
                      }}
                  >
                  <Form.Item name="token">
                  <Select size="large" onChange={handleTokenChange}>
                  {Object.values(networks[network].erc20s).map(n => (
                    <Option key={n.name}>{n.name + (n.name==token?" "+formattedBalance:"")}</Option>
                  ))}
                  </Select>
                  </Form.Item>
                    <Form.Item name="toAddress" required>
                    <AddressInput
                      autoFocus
                      ensProvider={mainnetProvider}
                      placeholder="to address"
                    />
                    </Form.Item>
                    <Form.Item name="amount" required>
                    <InputNumber size="large" min={0} max={(erc20s&&erc20s[token])?(formattedBalance):null}
                    />
                    </Form.Item>
                    <Form.Item >
                    <Button
                      htmlType="submit"
                      type="primary"
                      size="large"
                      loading={sending}
                    >
                      Send >
                    </Button>
                    </Form.Item>
                  </Form>
                )
      } else if (networks[network] && !networks[network].erc20s) {
        tokenSender = <Text>No erc20s on this network!</Text>
      }
      else {
        tokenSender = <Spin/>
      }

      return (tokenSender)

      }

export default TokenSender;
