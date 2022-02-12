import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch, useParams } from "react-router-dom";
import { Alert, Button, Col, Menu, Row, Input, Select } from "antd";
import { Contract, AddressInput } from "../components";
import { useExternalContractLoader } from "../hooks";

export default function ABINinja({ mainnetProvider, userSigner, userProviderAndSigner, selectedChainId }) {
  let { addr, abi } = useParams();

  const [contractAddress, setContractAddress] = useState(addr || "");
  const [contractABI, setContractABI] = useState(abi || "");
  const { TextArea } = Input;

  //const [externalContract, setExternalContract] = useState(useExternalContractLoader(userProviderAndSigner.provider, contractAddress, contractABI));
  let externalContract = useExternalContractLoader(userProviderAndSigner.provider, contractAddress, contractABI);

  let externalContractDisplay = "";

  // if (chainId) {
  //   console.log("chainId", chainId);
  //   updateSelectedChain(chainId);
  // }

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
