import React from "react";
import { Button, Form, Input, notification } from "antd";
import axios from "axios";

function Admin({ tx, readContracts, writeContracts }) {
  const [form] = Form.useForm();
  const size = "large";

  const admitHolder = async ({ data }) => {
    // Todo : For testing on localhost, use LOOGIES contract
    const tokenAddress = readContracts?.YourContract?.address;

    try {
      const x = await axios.post("http://localhost:49832", { ...JSON.parse(data), tokenAddress });

      notification.success({ message: "Admission update", description: x?.data?.message });
    } catch (error) {
      let message = "An error occurred while admitting this ticket";

      if (error.response) {
        message = error.response.data?.message;
      }

      notification.error({ message: "Admission error", description: message });
    }
  };

  return (
    <section>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>Ticket Admission Admin</div>

      {/* Generate Admission signature: start */}

      <div style={{ margin: "20px auto", maxWidth: "500px", border: "1px solid" }}>
        <div style={{ marginTop: "20px", padding: "10px" }}>
          <Form name="createBoard" layout="vertical" form={form} onFinish={admitHolder}>
            <Form.Item name="data" label="Holder Signature" rules={[{ required: true }]}>
              <Input.TextArea type="text" size={size} rows={6} />
            </Form.Item>

            <div>
              <Button onClick={() => form.resetFields()}>Reset</Button>
              <span style={{ marginLeft: "10px" }} />
              <Button type="primary" onClick={() => form.submit()}>
                Admit Holder
              </Button>
            </div>
          </Form>
        </div>
      </div>
      {/* Generate Admission signature: end */}
    </section>
  );
}

export default Admin;
