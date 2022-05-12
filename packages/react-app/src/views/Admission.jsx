import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Button, Form, Input, notification, Typography } from "antd";
import React, { useState } from "react";
import { QRCodeSVG } from "qrReact";

// const zero = ethers.BigNumber.from("0");

function Home({ tx, address, typedSigner, readContracts }) {
  const [sig, setSig] = useState();

  // const balance = (useContractReader(readContracts, "YourContract", "balanceOf", [address]) || zero).toNumber();
  const size = "large";
  const [form] = Form.useForm();

  const generateAdmissionSignature = async value => {
    value = { owner: address, ...value };

    try {
      try {
        const tokenOwner = await readContracts?.YourContract?.ownerOf(value.tokenId);

        if (ethers.utils.getAddress(tokenOwner) !== ethers.utils.getAddress(address)) {
          throw new Error(null);
        }
      } catch (error) {
        throw new Error("You are not the owner of the ticket ID you specified");
      }

      const signature = await typedSigner(
        {
          Checkin: [
            { name: "owner", type: "address" },
            { name: "tokenId", type: "uint256" },
          ],
        },
        value,
      );

      console.log(value);
      console.log(signature);

      setSig(JSON.stringify({ signature, value }));
      form.resetFields();
    } catch (error) {
      return notification.error({
        message: "Ticket verification failed",
        description: error.message,
      });
    }
  };

  return (
    <section>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>Event Admission</div>

      {/* Generate Admission signature: start */}

      <div style={{ margin: "20px auto", maxWidth: "500px", border: "1px solid" }}>
        <div style={{ marginTop: "20px", padding: "10px" }}>
          {sig ? (
            <div style={{ width: "100%" }}>
              <QRCodeSVG value={sig} size={200} />
              <div style={{ marginTop: "10px" }}>
                <Typography.Text copyable={{ text: sig }}>Copy Signature</Typography.Text>
              </div>
            </div>
          ) : (
            <Form name="createBoard" layout="vertical" form={form} onFinish={generateAdmissionSignature}>
              <Form.Item name="tokenId" label="Ticket ID" rules={[{ required: true }]}>
                <Input type="text" size={size} placeholder="Your ticket ID..." />
              </Form.Item>

              <Button type="primary" onClick={() => form.submit()}>
                Generate admission code
              </Button>
            </Form>
          )}
        </div>
      </div>
      {/* Generate Admission signature: end */}
    </section>
  );
}

export default Home;
