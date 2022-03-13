import { Modal, Form, Input, Button, Select } from "antd";
import React, { useState } from "react";
import { MultiAddressInput } from "../components";
import { firebase } from "../utils";

export default function NewBoard({ typedSigner, mainnetProvider, closeModal, ...props }) {
  const [accessType, setAccessType] = useState("anyone");
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();
  const size = "large";

  const handleCreateBoard = async boardInfo => {
    setIsCreating(true);
    // console.log(boardInfo);

    try {
      // The data to sign
      const value = {
        accessControl: accessType,
        approvedContributors: [],
        ...boardInfo,
        createdAt: Date.now(),
      };

      const signature = await typedSigner(
        {
          Board: [
            { name: "name", type: "string" },
            { name: "description", type: "string" },
            { name: "accessControl", type: "string" },
            { name: "approvedContributors", type: "address[]" },
            { name: "createdAt", type: "uint256" },
          ],
        },
        value,
      );

      const createBoard = firebase.functions.httpsCallable("createBoard");

      // send value and signature to backend for validation
      await createBoard({ value, signature });

      // TODO : handle return value here
      form.resetFields();
      closeModal();
    } catch (error) {
      console.log(error);
    }

    setIsCreating(false);
  };

  return (
    <Modal
      title="Create a new board"
      centered
      {...props}
      onCancel={closeModal}
      onOk={() => form.submit()}
      confirmLoading={isCreating}
    >
      <Form name="createBoard" layout="vertical" form={form} onFinish={handleCreateBoard}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input type="text" size={size} placeholder="New board name..." />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea size={size} placeholder="Board description..." autoSize={{ minRows: 1, maxRows: 4 }} />
        </Form.Item>

        <Form.Item name="accessControl" label="Access Control for proposals and votes" rules={[{ required: true }]}>
          <Select size={size} onChange={setAccessType} placeholder="Select contributor access level...">
            <Select.Option value="anyone">Anyone can contribute</Select.Option>
            <Select.Option value="allowList">Specific addresses can contribute</Select.Option>
            <Select.Option value="token" disabled>
              Specific token holders <span className="italic">(coming soon)</span>
            </Select.Option>
          </Select>
        </Form.Item>

        {accessType === "allowList" && (
          <Form.Item name="approvedContributors" label="Approved contributors" rules={[{ required: true }]}>
            <MultiAddressInput
              size={size}
              placeholder="Approved contributor addresses..."
              ensProvider={mainnetProvider}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
