/* eslint-disable jsx-a11y/accessible-emoji */

import { SyncOutlined, InboxOutlined } from "@ant-design/icons";
import { formatEther, parseEther } from "@ethersproject/units";
import axios from "axios";

import {
  Space,
  Button,
  Card,
  DatePicker,
  Divider,
  Input,
  List,
  Progress,
  Slider,
  Spin,
  Switch,
  Steps,
  message,
  Radio,
  Upload,
} from "antd";
import React, { useState } from "react";
import { ContractFactory, ethers } from "ethers";
import LocaleProvider from "antd/lib/locale-provider";
import { local } from "web3modal";
import { Address, Balance } from "../components";
import { useContractReader } from "../hooks";

const DiamondLoupeFacetAbi = require("../contracts/DiamondLoupeFacet.abi");

const { Step } = Steps;

const steps = ["Choose action", "Upload ABI of facet", "Confirm"];

export default function DiamondUpgrade({
  purpose,
  setPurposeEvents,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const signer = localProvider.getSigner();
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const [abiFile, setAbiFile] = useState("loading...");
  const [facet, setFacet] = useState("loading...");
  const [current, setCurrent] = useState(0);
  const [singleSelctor, setSingleSelector] = useState();
  const [selectors, setSelectors] = useState([]);
  // const [diamondFacets, setDiamondFacets] = useState([]);

  let fileReader;
  function handleFileRead(e) {
    const content = fileReader.result;
    setAbiFile(JSON.parse(content));
  }
  function onFileChange(event) {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(event);
  }

  const getSelector = artifacts => {
    const facetSelectorHash = [];
    for (const selector of artifacts.abi) {
      let selectorHash;
      if (selector.type === "function") {
        if (selector.inputs.length === 0) {
          selectorHash = ethers.utils.id(selector.name + "()").slice(0, 10);
        } else {
          selectorHash = selector.name + "(";
          for (const input of selector.inputs) {
            if (input === selector.inputs[selector.inputs.length - 1]) {
              selectorHash += input.type + ")";
            } else {
              selectorHash += input.type + ",";
            }
          }
          selectorHash = ethers.utils.id(selectorHash).slice(0, 10);
        }
        facetSelectorHash.push(selectorHash);
      }
    }
    return facetSelectorHash;
  };

  const deployContract = async () => {
    const factory = new ContractFactory(abiFile.abi, abiFile.bytecode, localProvider.getSigner());
    const contract = await factory.deploy();
    await contract.deployed();
    message.success("Facet Deployed");
    setFacet(contract.address);
  };

  const getsingleSelector = async e => {
    const signature = ethers.utils.id(e).slice(0, 10);
    setSingleSelector(signature);
  };

  const getFragment = async hash => {
    const result = await axios.get(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${hash}`);
    if (result.data.results[0] && result.data.results.length > 0) {
      return result.data.results[0].text_signature;
    }
    return "";
  };
  const upgradeDiamond = async () => {
    let facetSelector;
    if (action === 1) {
      facetSelector = await getSelector(abiFile);
    } else {
      facetSelector = [singleSelctor];
    }
    let facetAddress;
    if (action === 2) {
      facetAddress = zeroAddress;
    } else {
      facetAddress = facet;
    }
    const data = writeContracts.DiamondCutFacet.interface.encodeFunctionData("diamondCut", [
      [[facetAddress, action, facetSelector]],
      zeroAddress,
      "0x",
    ]);

    tx(
      signer.sendTransaction({
        to: writeContracts.Diamond.address,
        data,
        value: parseEther("0"),
      }),
    );
    const diamondLoupeFacetContract = new ethers.Contract(
      readContracts.Diamond.address,
      DiamondLoupeFacetAbi,
      localProvider,
    );

    await getSelectors(diamondLoupeFacetContract);
  };

  const confirmAction = () => {
    message.success("Action picked");
    setCurrent(1);
  };

  const [action, setAction] = useState(0);
  const onActionChange = e => {
    setAction(e.target.value);
  };
  const [abi, setAbi] = useState(null);

  const beforeUpload = file => {
    if (file.type !== "application/json") {
      message.error("Only JSON files are allowed");
    }
    onFileChange(file);
    message.success("New ABI Uploaded");
    setCurrent(2);
  };

  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  async function getSelectors(contract) {
    setSelectors([]);
    const facetsPayload = [];
    const addresses = await contract.facetAddresses();
    console.log("Addresses:", addresses);
    const facets = await contract.facets();
    console.log("facets:", facets);
    for (const facetSelector of facets) {
      const facetDetails = {};
      facetDetails[facetSelector[0]] = [];
      for (const signature of facetSelector[1]) {
        const fragment = await getFragment(signature);
        if (fragment !== "") {
          facetDetails[facetSelector[0]].push(fragment);
        }
      }
      if (facetDetails[facetSelector[0]].length > 0) {
        facetsPayload.push(facetDetails);
      }
    }
    console.log('facet details', facetsPayload);
    setSelectors(facetsPayload);
  }

  React.useEffect(() => {
    if (!readContracts) return;

    const diamondLoupeFacetContract = new ethers.Contract(
      readContracts.Diamond.address,
      DiamondLoupeFacetAbi,
      localProvider,
    );

    getSelectors(diamondLoupeFacetContract);

    console.log("Loupe contract", diamondLoupeFacetContract);
  }, [readContracts]);

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, maxWidth: 850, margin: "auto", marginTop: 64 }}>
        <h2 style={{ marginBottom: 20 }}>Diamond Upgrade UI</h2>
        <Steps current={current}>
          {steps.map(text => (
            <Step key={text} title={text} />
          ))}
        </Steps>
        <Divider />
        {current === 0 && (
          <div style={{ textAlign: "left" }}>
            <h3 style={{ marginBottom: 20 }}>What you want to do with your diamond?</h3>
            <Radio.Group onChange={onActionChange} value={action}>
              <Space direction="vertical">
                <Radio value={0}>Add selector</Radio>
                <Radio value={1}>Replace selectors</Radio>
                <Radio value={2}>Remove selector</Radio>
              </Space>
            </Radio.Group>
            <br />
            <Button type="primary" style={{ marginTop: 15 }} onClick={confirmAction}>
              Confirm action
            </Button>
          </div>
        )}
        {current === 1 && (
          <div style={{ textAlign: "left" }}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Upload.Dragger
              name="file"
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={dummyRequest}
              multiple={false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Please provide ABI of a contract with function selectors you are interested in
              </p>
            </Upload.Dragger>
          </div>
        )}
        {current === 2 && (
          <div style={{ textAlign: "left" }}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Button type="primary" style={{ marginTop: 15 }} disabled={action === 2} onClick={deployContract}>
              Deploy Updated Facet
            </Button>
            <br />
            <br />
            {(action === 0 || action === 2) && (
              <Input
                placeHolder="Function Selector like sum(uint, uint)"
                onChange={e => {
                  getsingleSelector(e.target.value);
                }}
              />
            )}
            <br />
            <Button type="primary" style={{ marginTop: 15 }} onClick={upgradeDiamond}>
              Upgrade Diamond
            </Button>
          </div>
        )}
      </div>
      <div style={{ textAlign: "left", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ marginTop: "20px", marginBottom: "10px" }}>Available facets and its selectors</h2>
        {selectors.length === 0 && <p>Fetching selectors..</p>}
        {selectors.map(selector => {
          const facetAddress = Object.keys(selector)[0];
          const sels = selector[facetAddress];
          return (
            <div style={{ marginTop: "10px" }}>
              <h3>{facetAddress}</h3>
              {sels.map(sel => (
                <p style={{ margin: 0, padding: 0 }}>{sel}</p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
