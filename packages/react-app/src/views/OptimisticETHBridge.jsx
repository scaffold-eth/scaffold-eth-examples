import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Button, Menu, Alert, Space, Card, Radio, Input, List, Form, InputNumber, Modal } from "antd";
import { formatEther, parseEther } from "@ethersproject/units";
import { SendOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import { Balance, AddressInput } from "../components";

function OptimisticETHBridge({ address, l1Provider, l2Provider, l1Network, l2Network, L1ETHGatewayContract, L2ETHGatewayContract, l1Tx, l2Tx, mainnetProvider, chainIds }) {

    const [sendVisible, setSendVisible] = useState(false)
    const [sendLayer, setSendLayer] = useState()

    const closeSend = () => {
      setSendVisible(false)
      setSendLayer()
    };

    const onFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
    };

    function BridgeForm() {

    const [bridging, setBridging] = useState(false)

    const bridge = async (values) => {
      console.log('Submitted:', values);
      setBridging(true)
      try {
        if(values.action==='deposit'){
          await l1Tx(L1ETHGatewayContract.deposit({
            value: parseEther(values.amount.toString())
          }))
      } else {
          await l2Tx(L2ETHGatewayContract.withdraw(
            parseEther(values.amount.toString())
          ))
        }
        setBridging(false)
    } catch (e) {
      console.log(e.message)
      setBridging(false)
    }
    };

    return (
      <Form
        name="basic"
        layout="inline"
        initialValues={{action: 'deposit', amount: 0.1}}
        onFinish={bridge}
        onFinishFailed={onFinishFailed}
      >

        <Form.Item name="action" rules={[{ required: true, message: 'Please select an action!' }]}>
          <Radio.Group>
            <Radio.Button value="deposit">Deposit</Radio.Button>
            <Radio.Button value="withdraw">Withdraw</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="amount"
          rules={[{ required: true, message: 'Please enter an amount!' }]}
        >
          <InputNumber min={0}/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={bridging}>
            Bridge
          </Button>
        </Form.Item>
      </Form>
    );
  }

  function SendForm({ layer }) {

    const [sending, setSending] = useState(false)

    const send = async (values) => {
        console.log('Submitted:', values);
        setSending(true)
        try {
        if(values.layer==='1'){
          await l1Tx({
            value: parseEther(values.amount.toString()),
            to: values.to
          });
        } else if (values.layer==='2') {
            await l2Tx(L2ETHGatewayContract.transfer(
              values.to,
              parseEther(values.amount.toString())
            ))
          }
          closeSend()
      } catch (e) {
        setSending(false)
        console.log(e.message)
      }
      };

    return (
      <Form
        name="basic"
        layout="inline"
        initialValues={{layer: layer}}
        onFinish={send}
        onFinishFailed={onFinishFailed}
      >

      <Form.Item
        name="layer"
        hidden={true}
      >
      <Input/>
      </Form.Item>

      <Form.Item
        name="to"
        rules={[{ required: true, message: 'Please enter an amount!' }]}
      >
      <AddressInput
        autoFocus
        ensProvider={mainnetProvider}
        placeholder="to address"
      />
      </Form.Item>

        <Form.Item
          name="amount"
          rules={[{ required: true, message: 'Please enter an amount!' }]}
        >
          <InputNumber min={0}/>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={sending}>
            Send
          </Button>
        </Form.Item>
      </Form>
    )
    }

  let l1Balance = (<Balance address={address} provider={l1Provider} prefix={"L1"} color={l1Network.color}/>)
  let l2Balance = (<Balance address={address} provider={l2Provider} prefix={"L2"} color={l2Network.color}/>)

  let injectedNetworkDescription

  if (chainIds.injectedChainId && chainIds.injectedChainId === chainIds.l1ChainId) {
    injectedNetworkDescription = `Connected to L1 (chainId: ${chainIds.injectedChainId})`
  } else if (chainIds.injectedChainId && chainIds.injectedChainId === chainIds.l2ChainId) {
    injectedNetworkDescription = `Connected to L2 (chainId: ${chainIds.injectedChainId})`
  } else if (chainIds.injectedChainId) {
    injectedNetworkDescription = `Connected to another network! (chainId: ${chainIds.injectedChainId})`
  }

  return (
        <>
          <Row justify="center" align="middle" gutter={16}>
            <Card title={"Optimistic ETH Bridge"} style={{ width: 600}}>
              <Space direction="vertical">
                <Row align="middle" justify="center">
                  {l1Balance}
                  <SendOutlined style={{color: l1Network.color, fontSize: 18}} onClick={() => {
                    setSendLayer('1')
                    setSendVisible(true)
                  }}/>
                </Row>
                <Row justify="center">
                  <BridgeForm/>
                </Row>
                <Row align="middle" justify="center">
                  {l2Balance}
                  <SendOutlined style={{color: l2Network.color, fontSize: 18}} onClick={() => {
                    setSendLayer('2')
                    setSendVisible(true)
                  }}/>
                </Row>
              </Space>
            </Card>
          </Row>
          <Modal title={`Send ETH on L${sendLayer}`} visible={sendVisible} footer={null} onCancel={closeSend}>
            <Space direction='vertical'>
              <SendForm layer={sendLayer}/>
              <span>{injectedNetworkDescription}</span>
            </Space>
          </Modal>
        </>
  );

}

export default OptimisticETHBridge;
