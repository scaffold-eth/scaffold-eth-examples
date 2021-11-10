import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button, Spin, Space, Table, Descriptions, Card, Form, notification, InputNumber, Input, Divider, Popover } from "antd";
import { ethers } from "ethers";
const { Text, Title } = Typography;

function TokenManager({network, networks, erc20s, myErc20s, setMyErc20s, userProvider}) {
  const [myNetworkTokens, setMyNetworkTokens] = useState([])
  const [formVisible, setFormVisible] = useState(false)

  useEffect(() => {
    if(myErc20s && myErc20s[network]){
      console.log(myErc20s)
      setMyNetworkTokens([...myErc20s[network]])
  } else {
    setMyNetworkTokens([])
  }
},[myErc20s, network])

  const addMyErc20 = async (name, address, decimals) => {
    console.log(`Adding ${name} at ${address} with ${decimals} decimals`);

    const abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function transfer(address to, uint amount) returns (boolean)",
        "event Transfer(address indexed from, address indexed to, uint amount)"
    ];
    let userSigner = userProvider.getSigner()
    let signerAddress = await userSigner.getAddress()
    const erc20 = new ethers.Contract(address, abi, userSigner);
    try {
    let balance = await erc20.balanceOf(signerAddress)
    console.log(balance)
    } catch(e) {
      console.log(e)
      notification.open({
        message: '🤔 Contract is not an erc20!',
        description:
        `We could not get a token balance from this contract`,
      });
      return
    }

    let newMyErc20s = Object.assign({}, myErc20s);
    if(newMyErc20s[network]) {

      let matches = myErc20s[network].filter(function (el) {
      return el.address == address ||
             el.name == name
      });
      if(matches.length == 0) {
        newMyErc20s[network].push({name: name, address: address, decimals: decimals, mine: true})
      } else {
        notification.open({
          message: '🤔 Token not added!',
          description:
          `This token name or address has already been added`,
        });
      }

    } else {
      newMyErc20s[network] = []
      newMyErc20s[network].push({name: name, address: address, decimals: decimals, mine: true})
    }
    setMyErc20s(newMyErc20s)
    return true
  }

  function removeMyErc20(name, address, decimals) {
    console.log(`Removing ${name} at ${address} with ${decimals} decimals`);

    let newMyErc20s = Object.assign({}, myErc20s);
    if(newMyErc20s[network]) {

      let remaining = myErc20s[network].filter(function (el) {
      return el.address !== address
      });
      console.log(remaining)
      newMyErc20s[network] = remaining
      } else {
        notification.open({
          message: '🤔 Something went wrong!',
          description:
          `There were no tokens to remove`,
        });
      }

    setMyErc20s(newMyErc20s)
  }


  let tokenColumns = [{
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    ellipsis: true,

  },
  {
    title: 'Decimals',
    dataIndex: 'decimals',
    key: 'decimals',
  },
  {
    title: 'Action',
    key: 'action',
    fixed: 'right',
    render: (row) => (row.mine ?
      <Button
          type="primary"
          size="large" onClick={() => {removeMyErc20(row.name, row.address, row.decimals)}}
          danger>Remove</Button>
      : <Button
          type="primary"
          size="large"
          onClick={() => {addMyErc20(row.name, row.address, row.decimals)}}
        >Add</Button>)
  }]

  const [adding, setAdding] = useState(false)
  const [form] = Form.useForm();

  let tokenAdder

    tokenAdder = (
            <Form
                    form={form}
                    name="Add token"
                    onFinish={async (values) => {
                      console.log(values)
                      setAdding(true)
                      addMyErc20(values.name, values.address, values.decimals)
                      form.resetFields();
                      setAdding(false)
                      setFormVisible(false)
                    }
                    }
                    onFinishFailed={errorInfo => {
                      console.log('Failed:', errorInfo);
                      }}
                  >
                  <Form.Item name="name" required>
                    <Input size="large" placeholder="token name" maxLength={12} />
                  </Form.Item>
                    <Form.Item name="address" required>
                    <Input size="large" placeholder="contract address" maxLength={42} />
                    </Form.Item>
                    <Form.Item label="decimals" name="decimals" rules={[{ required: true, message: 'How many decimals does this token have?' }]}>
                    <InputNumber size="large" min={0} max={100}
                    />
                    </Form.Item>
                    <Form.Item >
                    <Button
                      htmlType="submit"
                      type="primary"
                      size="large"
                      loading={adding}
                    >
                      Add
                    </Button>
                    </Form.Item>
                  </Form>
                )


  return (
              <Card style={{ margin: 'auto', maxWidth: "100%"}}>
                <Table
                  title={() => <Title level={2} style={{color: network?networks[network].color1:"black"}}>My erc20 tokens</Title>}
                  rowKey="name"
                  scroll={{ x: 'max-content' }}
                  dataSource={myNetworkTokens}
                  columns={tokenColumns}
                  pagination={false}
                  />
                <Divider/>
                <Title level={2} style={{color: network?networks[network].color1:"black"}}>Add tokens +</Title>
                <Popover visible={formVisible} onVisibleChange={()=>{setFormVisible(true)}} content={tokenAdder} title="Add custom token" trigger="click">
                  <Button type="primary" style={{margin: 12}}>+ custom token</Button>
                </Popover>
                {(networks&&networks[network]&&networks[network].erc20s)?<Table
                  rowKey="name"
                  scroll={{ x: 'max-content' }}
                  dataSource={networks[network].erc20s}
                  columns={tokenColumns}
                  pagination={false}
                  />:null}
              </Card>

  );
}

export default TokenManager;
