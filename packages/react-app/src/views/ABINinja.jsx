import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch, useParams } from "react-router-dom";
import { Alert, Button, Col, Menu, Row, Input, Select, Tooltip } from "antd";
import { LinkOutlined, SaveOutlined } from "@ant-design/icons";
import { Contract, AddressInput } from "../components";
import { useExternalContractLoader } from "../hooks";

export default function ABINinja({ mainnetProvider, userSigner, userProviderAndSigner, selectedChainId }) {
  let { addr, abi } = useParams();

  const [contractAddress, setContractAddress] = useState(addr || "");
  const [contractABI, setContractABI] = useState(abi || "");
  const { TextArea } = Input;

  let externalContract = useExternalContractLoader(userProviderAndSigner.provider, contractAddress, contractABI);

  let externalContractDisplay = "";

  const copyURL = () => {
    const url = `${window.location.origin}/#/contract/${contractAddress}/${contractABI}`;
    navigator.clipboard.writeText(url);
  };

  if (contractAddress && contractABI && selectedChainId) {
    externalContractDisplay = (
      <div>
        <Contract
          customContract={externalContract}
          signer={userSigner}
          provider={userProviderAndSigner.provider}
          chainId={selectedChainId}
        />
      </div>
    );
  }

  console.log("==-- userSigner: ", userSigner);
  console.log("==-- selectedChainId: ", selectedChainId);
  console.log("==-- theExternalContract: ", externalContract);

  return (
    <div>
      <div
        className="side-menu"
        style={{
          position: "fixed",
          right: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        <Tooltip placement="left" title="copied!" trigger={contractAddress && contractABI ? "click" : ""}>
          <Button
            title="Copy current configuration as url"
            disabled={!(contractAddress && contractABI)}
            icon={<LinkOutlined />}
            size="large"
            onClick={copyURL}
          />
        </Tooltip>
        {/* <Button
          title="Save current configuration to local storage"
          disabled={!(contractAddress && contractABI)}
          icon={<SaveOutlined />}
          size="large"
        /> */}
      </div>
      <div>Paste the contract's address and ABI below:</div>
      <div className="center" style={{ width: "50%" }}>
        <div style={{ padding: 4 }}>
          <AddressInput
            placeholder="Enter Contract Address"
            ensProvider={mainnetProvider}
            value={contractAddress}
            onChange={setContractAddress}
          />
        </div>
        <div style={{ padding: 4 }}>
          <TextArea
            rows={6}
            placeholder="Enter Contract ABI JSON"
            value={contractABI}
            onChange={e => {
              setContractABI(e.target.value);
            }}
          />
        </div>
      </div>
      <div>{externalContractDisplay}</div>
    </div>
  );
}
