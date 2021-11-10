import React, { useState } from "react";
import { SendOutlined } from "@ant-design/icons";
import { Form, notification, Button } from "antd";
import { AddressInput, EtherInput } from "../components";
import { Transactor } from "../helpers";
import { parseEther, formatEther } from "@ethersproject/units";

function Sender({userProvider, mainnetProvider, network, networks, price, gasPrice}) {

  const [form] = Form.useForm();
  const [sending, setSending] = useState(false)

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userProvider, gasPrice)

  return (
              <Form
                      form={form}
                      initialValues={{ value: "0" }}
                      onFinish={async (values) => {
                        console.log(values)
                        setSending(true)
                        const tx = Transactor(userProvider);

                        let value;
                        try {
                          value = parseEther("" + values.amount);
                        } catch (e) {
                          // failed to parseEther, try something else
                          value = parseEther("" + parseFloat(values.amount).toFixed(8));
                        }

                        let transaction = await tx({
                          to: values.toAddress,
                          value,
                        });
                        notification.open({
                          message: '👋 Sending successful!',
                          description:
                          `👀 Sent ${values.amount} ${networks[network].name} to ${values['toAddress']}`,
                        });
                        form.resetFields();
                        setSending(false)
                      }}
                      onFinishFailed={errorInfo => {
                        console.log('Failed:', errorInfo);
                        }}
                    >
                      <Form.Item name="toAddress">
                      <AddressInput
                        autoFocus
                        ensProvider={mainnetProvider}
                        placeholder="to address"
                      />
                      </Form.Item>
                      <Form.Item name="amount" id="etherInput">
                      <EtherInput
                        price={(network&&networks[network].price)?networks[network].price:null}
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
  );
}

export default Sender;
