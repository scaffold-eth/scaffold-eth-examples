import { Button, Modal, Form, Input, Typography } from "antd";
import React, { useMemo, useState } from "react";
import { ethers } from "ethers";
import { AddressInput, Contract } from "../components";
import gtc from "../data/gtc";

// contract meta { address, abi, name }

function Home({ address, mainnetProvider, blockExplorer, signer, provider }) {
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [contractMeta, setContractMeta] = useState({});
  const contractModule = useMemo(() => {
    if (!contractMeta.address) {
      return null;
    }

    return { name: contractMeta.name, contract: new ethers.Contract(contractMeta.address, contractMeta.abi, provider) };
  }, [provider, contractMeta]);

  const loadDemoContract = e => {
    e.preventDefault();
    setContractMeta(gtc);
    setOpenModal(false);
  };

  const loadContract = v => {
    console.log(v);

    setContractMeta(v);

    form.resetFields();
    setOpenModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1, justifyContent: "center", padding: "1.2rem" }}>
        <Button onClick={() => setOpenModal(true)}>Load Contract</Button>
      </div>
      <Modal
        title="Load contract"
        centered
        visible={openModal}
        onCancel={() => setOpenModal(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography.Link href="#" onClick={loadDemoContract}>
              Load sample contract
            </Typography.Link>
            <Button type="primary" onClick={() => form.submit()}>
              Load
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={loadContract} autoComplete="off">
          <Form.Item name="name" label="Contract Name" rules={[{ required: true }]}>
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item name="address" label="Contract Address" rules={[{ required: true }]}>
            <AddressInput ensProvider={mainnetProvider} placeholder="Enter contract address" />
          </Form.Item>
          <Form.Item name="abi" label="Contract ABI" rules={[{ required: true }]}>
            <Input.TextArea rows={5} placeholder="Contract ABI" />
          </Form.Item>
        </Form>
      </Modal>
      {contractModule && (
        <Contract
          signer={signer}
          address={address}
          provider={provider}
          name={contractModule.name}
          blockExplorer={blockExplorer}
          mainnetProvider={mainnetProvider}
          customContract={contractModule.contract}
        />
      )}
    </div>
  );
}

export default Home;
