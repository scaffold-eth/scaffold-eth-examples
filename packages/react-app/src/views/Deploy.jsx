import React, { useState, useEffect } from "react";
import { Form, Input, Button, Alert } from "antd";
import { Line } from "@ant-design/charts";
// import { Link } from "react-router-dom";
// import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { FilesManager } from "../pgcomponents";
import { addToIPFS } from "../helpers/ipfs";

// const _totalSupply = 500;
// const _startPrice = 0.0033;
// const _inflation = 1.5;

const _startPrice = 0.05;
const _inflation = 30;

function Deploy({ tx, writeContracts, address, readContracts }) {
  const [prices, setPrices] = useState([]);
  const [selloutTotal, setSelloutTotal] = useState(0);
  const [files, setFiles] = useState([]);
  const [deploying, setDeploying] = useState(false);

  const deleteFile = key => {
    const update = [...files];
    update.splice(key, 1);

    setFiles(update);
  };

  const chartConfig = {
    data: prices,
    padding: "auto",
    xField: "count",
    yField: "price",
    xAxis: {
      tickCount: 50,
    },
  };

  const [form] = Form.useForm();

  const onFinish = async values => {
    setDeploying(true);
    try {
      const uris = [];

      for (let i = 0; i < files.length; i++) {
        // upload JSON files to IPFS and get CID
        const { path } = await addToIPFS(JSON.stringify(files[i]));

        uris.push(path);
      }

      await tx(
        writeContracts.RetFundERC721Deployer.deploy(
          address,
          values.name,
          values.symbol,
          files.length,
          ethers.utils.parseUnits(`${values.startPrice}`),
          parseFloat(values.inflationRate).toFixed(2) * 100,
          "https://ipfs.infura.io/ipfs/",
          uris,
        ),
      );

      // clear forms after
      await form.resetFields();
      setDeploying(false);
      setFiles([]);
      setPrices([]);
      setSelloutTotal(0);
    } catch (error) {
      console.log(`Deployment Error`, error);
      setDeploying(false);
    }
  };

  const onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  const inflator = (start, inflation, count) => {
    let currentPrice = start;
    let totalsellout = start;
    const prices = [{ price: start, count: 1 }];
    for (var i = 1; i <= count; i++) {
      const nextPrice = currentPrice + currentPrice * inflation;
      totalsellout += nextPrice;

      prices.push({ price: nextPrice, count: i + 1 });
      currentPrice = nextPrice;
    }

    return { prices, totalsellout };
  };

  const updateInfaltionChart = (price, inflation, totalSupply = files.length) => {
    const calculations = inflator(price, inflation, totalSupply);

    setPrices(calculations.prices);
    setSelloutTotal(calculations.totalsellout);
  };

  const onValuesChange = (x, { inflationRate, startPrice, totalSupply = files.length }) => {
    // do all the recalculations here
    if (startPrice && totalSupply && inflationRate) {
      const newStartPrice = parseFloat(startPrice);
      const inflation = inflationRate / 100;

      updateInfaltionChart(newStartPrice, inflation, parseInt(totalSupply));
    }
  };

  useEffect(() => {
    updateInfaltionChart(_startPrice, _inflation / 100, files.length);
  }, [files.length]);

  return (
    <div className="container mt-5 mx-auto mb-20">
      <div className="flex flex-1 mb-8 justify-center items-center">
        <h1 className="text-xl">Deploy new RetFund ERC-721 token</h1>
      </div>

      <div className="flex flex-1 flex-row">
        <div className="flex flex-1">
          <Form
            onValuesChange={onValuesChange}
            className="w-full"
            name="basic"
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 18,
            }}
            initialValues={{
              totalSupply: files.length,
              startPrice: _startPrice,
              inflationRate: _inflation,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            form={form}
            autoComplete="off"
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input your token name!",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>

            <div />

            <Form.Item
              label="Symbol"
              name="symbol"
              rules={[
                {
                  required: true,
                  message: "Please input your token symbol!",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="Start Price"
              name="startPrice"
              rules={[
                {
                  required: true,
                  message: "Please input your start price!",
                },
              ]}
            >
              <Input size="large" type="number" />
            </Form.Item>

            <Form.Item
              label="Inflation Rate"
              name="inflationRate"
              rules={[
                {
                  required: true,
                  message: "Please input your inflation rate!",
                },
              ]}
            >
              <Input size="large" type="number" min={1} max={100} addonAfter={<span>%</span>} />
            </Form.Item>

            {/* <Form.Item
              label="Total Supply"
              name="totalSupply"
              rules={[
                {
                  required: true,
                  message: "Please input your total supply!",
                },
              ]}
            >
              <Input size="large" type="number" />
            </Form.Item> */}

            {/* <Form.Item className="flex flex-1 items-center justify-center">
              <Button type="primary" htmlType="submit">
                Deploy
              </Button>
            </Form.Item> */}
          </Form>
        </div>
        <div className="w-4"></div>
        <div className="flex flex-1">
          <Line {...chartConfig} className="w-full h-14" />
        </div>
      </div>

      <div className="mt-8">
        <Alert
          className="flex flex-1 items-center justify-center text-center"
          message={`Estimated sellout value is Ξ ${parseFloat(selloutTotal).toFixed(2)}`}
        />
      </div>

      <div className="mt-3 w-full">
        <FilesManager filesMeta={files} setFilesMeta={setFiles} deleteFile={deleteFile} />
      </div>

      <div className="flex items-center justify-center mt-12 pb-20 w-full">
        <Button size="large" type="primary" loading={deploying} onClick={form.submit}>
          Deploy NFT
        </Button>
      </div>
    </div>
  );
}

export default Deploy;
