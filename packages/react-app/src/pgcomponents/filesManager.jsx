import { useState } from "react";
import { Upload, Card, Row, Col, Alert, Modal, Form, Input, Button, Space } from "antd";
import { InboxOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { addToIPFS, urlFromCID } from "../helpers/ipfs";

const { Dragger } = Upload;

const FileManager = ({ filesMeta = [], setFilesMeta, deleteFile }) => {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState({}); // { key: 2, file: {} }
  const [confirmDelete, setConfirmDelete] = useState();

  const [form] = Form.useForm();

  const saveUpdates = async () => {
    try {
      // validate changes
      await form.validateFields();

      // get all updates
      const updates = await form.getFieldsValue();

      // clone filesMeta
      const updateMeta = [...filesMeta];

      // update clone with edits
      updateMeta[editing.key] = { ...updateMeta[editing.key], ...updates };

      // commit clone to state
      setFilesMeta(updateMeta);

      // reset editing
      setEditing({});
    } catch (error) {
      console.log(`An error occurred`, error);
    }
  };

  const deleteItem = key => {
    deleteFile(key);
    setConfirmDelete();
  };

  const uploaderProps = {
    name: "file",
    multiple: true,
    showUploadList: false,
    onDrop: async e => {
      try {
        const { files } = e.dataTransfer;
        console.log("Dropped files", files);

        const _filesMetaData = [];
        setUploading(true);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // upload to IPFS
          const { path } = await addToIPFS(file);

          // create JSON content and set to files
          _filesMetaData.push({
            name: file.name.split(".").slice(0, -1).join("."), // trim out the file extension??
            image: path,
            attributes: [],
          });
        }

        setUploading(false);

        // set meta data
        setFilesMeta([...filesMeta, ..._filesMetaData]);
      } catch (error) {
        console.log(`Uploading failed`, error);
        setUploading(false);
      }
    },
  };

  return (
    <div className="flex flex-col flex-1 mt-12">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Dragger {...uploaderProps}>
          <div className="mx-10 my-4">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. You can upload any file directly to IPFS from here.
            </p>
          </div>
        </Dragger>

        <div className="mt-4">
          {uploading && <Alert message="Please wait while your files are uploading..." type="warning" />}
        </div>
      </div>
      <div className="mt-8">
        <Row gutter={16}>
          {filesMeta.map((file, i) => (
            <Col className="mb-3" span={8} key={`${file.name}-${i}`}>
              <Card
                bordered
                title={
                  <div className="flex flex-1 justify-between items-center">
                    <span className="overflow-ellipsis overflow-hidden">{file.name}</span>
                    <span>
                      <span className="mr-4 cursor-pointer" onClick={() => setEditing({ key: i, file })}>
                        <EditOutlined />
                      </span>
                      <span className="cursor-pointer" onClick={() => setConfirmDelete(i)}>
                        <DeleteOutlined />
                      </span>
                    </span>
                  </div>
                }
                bodyStyle={{ padding: 0 }}
                cover={
                  <div className="rounded w-full overflow-hidden">
                    <img alt={file.name} className="object-cover" src={urlFromCID(file.image)} />
                  </div>
                }
              />
            </Col>
          ))}
        </Row>
      </div>

      <Modal
        title="Confirm Delete"
        visible={typeof confirmDelete !== "undefined"}
        onOk={() => deleteItem(confirmDelete)}
        onCancel={() => setConfirmDelete()}
        centered
      >
        Are you sure you want to delete {filesMeta[confirmDelete]?.name}?
      </Modal>

      <Modal
        width={900}
        visible={typeof editing?.key !== "undefined"}
        onOk={saveUpdates}
        title={editing?.file?.name}
        onCancel={() => setEditing({})}
        centered
      >
        {typeof editing?.key !== "undefined" && (
          <Row gutter={16}>
            <Col span={12}>
              <img alt={editing?.file.name} className="object-cover" src={urlFromCID(editing?.file.image)} />
            </Col>
            <Col span={12}>
              <Form
                form={form}
                className="w-full"
                name="basic"
                initialValues={{
                  name: editing?.file.name,
                }}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
                autoComplete="off"
              >
                {/* Name */}
                <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input a name" }]}>
                  <Input />
                </Form.Item>

                {/* Description */}
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[{ required: false, message: "Please input a description" }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>

                {/* Attributes */}
                <div className="flex flex-1 mb-3">Attributes:</div>
                <Form.List name="attributes">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            className="w-full"
                            wrapperCol={{ span: 24 }}
                            name={[name, "trait_type"]}
                            rules={[{ required: true, message: "Missing title" }]}
                          >
                            <Input className="w-full" placeholder="Attribute title" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            wrapperCol={{ span: 24 }}
                            name={[name, "value"]}
                            rules={[{ required: true, message: "Missing value" }]}
                          >
                            <Input className="w-full" placeholder="Attribute value" />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      ))}
                      <Form.Item wrapperCol={{ span: 24 }}>
                        <Button block type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                          Add Attribute
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Form>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default FileManager;
